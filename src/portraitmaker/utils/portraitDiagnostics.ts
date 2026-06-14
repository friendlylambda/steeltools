// ---------------------------------------------------------------------------
// Background Removal diagnostics
//
// When the model download flow flags a browser as unsupported/incompatible or
// the download itself fails, we gather everything that might explain *why* into
// a single report and offer it as a downloadable file. The user can hand that
// file back to us for debugging — it's the only window we have into a remote
// machine we can't see.
// ---------------------------------------------------------------------------

import { CACHE_NAME, isModelCached, loadModel, MODEL_ID } from "./backgroundRemoval"

export type DiagnosticFlag = "unsupported" | "incompatible" | "error"

type DiagnosticContext = {
  readonly flaggedAs: DiagnosticFlag
  readonly capturedError?: unknown
}

type SerializedError = {
  readonly name: string
  readonly message: string
  readonly stack?: string
  readonly extra?: Record<string, unknown>
  readonly cause?: SerializedError | string
}

const STANDARD_ERROR_KEYS = new Set(["name", "message", "stack", "cause"])

// Recursively serialize an error, preserving the full `cause` chain (a
// WebGpuInitError wraps the raw transformers.js/ONNX error as its cause) and
// any non-standard own-properties the underlying error carries (ONNX runtime
// errors often attach extra fields beyond name/message/stack).
const serializeError = (error: unknown): SerializedError | string => {
  if (error instanceof Error) {
    const extraEntries = Object.getOwnPropertyNames(error)
      .filter((key) => !STANDARD_ERROR_KEYS.has(key))
      .map((key) => [key, (error as unknown as Record<string, unknown>)[key]] as const)
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      extra: extraEntries.length > 0 ? Object.fromEntries(extraEntries) : undefined,
      cause: error.cause !== undefined ? serializeError(error.cause) : undefined,
    }
  }
  if (typeof error === "string") return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

const safeStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

const renderSerializedError = (error: SerializedError | string, indent = ""): string => {
  if (typeof error === "string") return `${indent}${error}`
  const headline = `${indent}${error.name}: ${error.message}`
  const stackBlock = error.stack
    ? error.stack
        .split("\n")
        .map((line) => `${indent}  ${line}`)
        .join("\n")
    : undefined
  const extraBlock =
    error.extra !== undefined ? `${indent}  extra: ${safeStringify(error.extra)}` : undefined
  const causeBlock =
    error.cause !== undefined
      ? `${indent}  caused by:\n${renderSerializedError(error.cause, `${indent}    `)}`
      : undefined
  return [headline, stackBlock, extraBlock, causeBlock].filter(Boolean).join("\n")
}

type GpuDeviceLike = {
  readonly features?: Iterable<string>
  readonly destroy?: () => void
}

type GpuAdapterLike = {
  readonly info?: Record<string, unknown>
  readonly requestAdapterInfo?: () => Promise<Record<string, unknown>>
  readonly features?: Iterable<string>
  readonly limits?: Record<string, unknown>
  readonly requestDevice: () => Promise<GpuDeviceLike>
}

type GpuLike = {
  readonly requestAdapter: (options?: unknown) => Promise<GpuAdapterLike | null>
}

type NavigatorWithGpu = Navigator & {
  readonly gpu?: GpuLike
}

type WebGpuProbe = {
  readonly hasGpuObject: boolean
  readonly requestAdapterError?: SerializedError | string
  readonly adapterIsNull?: boolean
  readonly adapterInfo?: Record<string, unknown>
  readonly adapterFeatures?: readonly string[]
  readonly adapterLimits?: Record<string, unknown>
  readonly requestDeviceError?: SerializedError | string
  readonly deviceAcquired?: boolean
  readonly deviceFeatures?: readonly string[]
}

const readIterable = (value: Iterable<string> | undefined): readonly string[] | undefined => {
  if (!value) return undefined
  try {
    return Array.from(value).sort()
  } catch {
    return undefined
  }
}

// A small, hand-picked slice of GPUSupportedLimits. The full object has ~30
// numeric fields; these few are the ones most likely to explain a model that
// won't initialize on otherwise-WebGPU-capable hardware.
const readAdapterLimits = (
  limits: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  if (!limits) return undefined
  const keys = [
    "maxBufferSize",
    "maxStorageBufferBindingSize",
    "maxComputeWorkgroupStorageSize",
    "maxComputeInvocationsPerWorkgroup",
  ]
  try {
    const entries = keys
      .filter((key) => limits[key] !== undefined)
      .map((key) => [key, limits[key]] as const)
    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  } catch {
    return undefined
  }
}

const readAdapterInfo = async (
  adapter: GpuAdapterLike,
): Promise<Record<string, unknown> | undefined> => {
  try {
    const info = adapter.info ?? (await adapter.requestAdapterInfo?.())
    if (!info) return undefined
    return {
      vendor: info["vendor"],
      architecture: info["architecture"],
      device: info["device"],
      description: info["description"],
    }
  } catch {
    return undefined
  }
}

// Walk the WebGPU acquisition path the model needs, recording exactly which
// step fails. This is the most useful signal for the "unsupported" screen,
// where we bailed on a boolean check and never produced a real error.
const probeWebGpu = async (): Promise<WebGpuProbe> => {
  const gpu = (navigator as NavigatorWithGpu).gpu
  if (!gpu) return { hasGpuObject: false }

  const adapter = await (async (): Promise<GpuAdapterLike | null | SerializedError | string> => {
    try {
      return await gpu.requestAdapter()
    } catch (error) {
      return serializeError(error)
    }
  })()

  if (adapter !== null && (typeof adapter === "string" || !("requestDevice" in adapter))) {
    return { hasGpuObject: true, requestAdapterError: adapter }
  }
  if (adapter === null) {
    return { hasGpuObject: true, adapterIsNull: true }
  }

  const adapterInfo = await readAdapterInfo(adapter)
  const adapterFeatures = readIterable(adapter.features)
  const adapterLimits = readAdapterLimits(adapter.limits)

  const deviceResult = await (async (): Promise<Partial<WebGpuProbe>> => {
    try {
      const device = await adapter.requestDevice()
      const deviceFeatures = readIterable(device.features)
      device.destroy?.()
      return { deviceAcquired: true, deviceFeatures }
    } catch (error) {
      return { requestDeviceError: serializeError(error) }
    }
  })()

  return { hasGpuObject: true, adapterInfo, adapterFeatures, adapterLimits, ...deviceResult }
}

type NavigatorWithDiagnostics = Navigator & {
  readonly deviceMemory?: number
  readonly hardwareConcurrency?: number
}

const collectEnvironment = (): Record<string, unknown> => {
  const nav = navigator as NavigatorWithDiagnostics
  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    logicalCores: nav.hardwareConcurrency,
    deviceMemoryGb: nav.deviceMemory,
  }
}

// Optionally re-run the real model load and capture whatever it throws — this
// is the deepest possible signal. Gated behind an existing cache so generating
// a report can never silently kick off a fresh ~50MB download.
const attemptActiveReproduction = async (flag: DiagnosticFlag): Promise<string> => {
  if (flag === "error") {
    return "Skipped — the original download error is already captured above."
  }
  const cached = await isModelCached()
  if (!cached) {
    return "Skipped — model is not cached, so a re-attempt would trigger a fresh ~50MB download."
  }
  try {
    await loadModel(() => {})
    return "Re-attempt of the model load unexpectedly SUCCEEDED (no error thrown)."
  } catch (error) {
    return renderSerializedError(serializeError(error))
  }
}

export const gatherDiagnosticReport = async (context: DiagnosticContext): Promise<string> => {
  const [probe, activeAttempt] = await Promise.all([
    probeWebGpu(),
    attemptActiveReproduction(context.flaggedAs),
  ])

  const capturedErrorBlock =
    context.capturedError !== undefined
      ? renderSerializedError(serializeError(context.capturedError))
      : "(none — this state was flagged by a compatibility check, not a thrown error)"

  return [
    "=== Steel Tools — Background Removal Diagnostic Report ===",
    `Flagged as: ${context.flaggedAs}`,
    "",
    "--- Environment ---",
    safeStringify(collectEnvironment()),
    "",
    "--- WebGPU Probe ---",
    safeStringify(probe),
    "",
    "--- Captured Error (from the flagged state) ---",
    capturedErrorBlock,
    "",
    "--- Active Re-Attempt ---",
    activeAttempt,
    "",
    "--- Model / Config ---",
    safeStringify({ modelId: MODEL_ID, cacheName: CACHE_NAME, requestedDevice: "webgpu" }),
  ].join("\n")
}

const triggerTextDownload = (filename: string, contents: string): void => {
  const blob = new Blob([contents], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// Gather the report and hand it to the user as a downloaded text file. A file
// avoids overflowing the clipboard with a long stack-trace dump, and it's
// easier for the user to attach when reporting the problem back to us.
export const downloadDiagnosticReport = async (context: DiagnosticContext): Promise<string> => {
  const report = await gatherDiagnosticReport(context)
  triggerTextDownload(`steeltools-bg-removal-diagnostic-${context.flaggedAs}.txt`, report)
  return report
}
