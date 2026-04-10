const MODEL_ID = "Xenova/modnet"
const CACHE_NAME = "transformers-cache"

type RawImageLike = {
  readonly toBlob: (type?: string, quality?: number) => Promise<Blob>
}

type PipelineInstance = (image: string) => Promise<RawImageLike>

let cachedPipeline: PipelineInstance | null = null

/**
 * Thrown when the model downloads successfully but the WebGPU inference
 * backend refuses to initialize. The user's browser technically exposes
 * WebGPU, but the ONNX runtime shipped by @huggingface/transformers can't
 * actually run on it (observed on Safari: transformers.js hardcodes a
 * non-JSEP WASM variant for Safari, and the `webgpuInit` symbol it then
 * looks for doesn't exist, so session creation throws). Surfacing this as
 * a distinct error lets the UI show a "your browser is close but not
 * there yet" message rather than a raw stack trace.
 */
export class WebGpuInitError extends Error {
  constructor(cause: unknown) {
    super("The browser's WebGPU backend could not initialize the background removal model.", {
      cause,
    })
    this.name = "WebGpuInitError"
  }
}

type NavigatorWithGpu = Navigator & {
  readonly gpu?: { readonly requestAdapter: () => Promise<unknown | null> }
}

export const checkWebGpuSupport = async (): Promise<boolean> => {
  const gpu = (navigator as NavigatorWithGpu).gpu
  if (!gpu) return false
  try {
    const adapter = await gpu.requestAdapter()
    return adapter !== null
  } catch {
    return false
  }
}

export const isModelCached = async (): Promise<boolean> => {
  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    return keys.some((request) => request.url.includes("modnet"))
  } catch {
    return false
  }
}

// Wipe any cached model files so the next attempt re-runs the full modal
// flow instead of silently skipping the download when the cached file
// came from a broken previous attempt (e.g. a Safari session where the
// download finished but WebGPU init failed).
export const clearCachedModel = async (): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    await Promise.all(
      keys
        .filter((request) => request.url.includes("modnet"))
        .map((request) => cache.delete(request)),
    )
  } catch {
    // Best-effort; if cleanup fails there's nothing useful we can do.
  }
}

const initPipeline = async (
  onProgress?: (progress: number) => void,
): Promise<PipelineInstance> => {
  const { pipeline } = await import("@huggingface/transformers")
  try {
    const instance = await pipeline("background-removal", MODEL_ID, {
      device: "webgpu",
      progress_callback: onProgress
        ? (info: { status: string; progress?: number }) => {
            if (info.status === "progress_total" && info.progress !== undefined) {
              onProgress(info.progress)
            }
          }
        : undefined,
    })
    return instance as unknown as PipelineInstance
  } catch (error) {
    throw new WebGpuInitError(error)
  }
}

export const loadModel = async (onProgress: (progress: number) => void): Promise<void> => {
  cachedPipeline = await initPipeline(onProgress)
}

export const removeBackground = async (objectUrl: string): Promise<Blob> => {
  if (!cachedPipeline) {
    cachedPipeline = await initPipeline()
  }

  const result = await cachedPipeline(objectUrl)
  return result.toBlob("image/png")
}
