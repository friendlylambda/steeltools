const MODEL_ID = "Xenova/modnet"
const CACHE_NAME = "transformers-cache"

type RawImageLike = {
  readonly toBlob: (type?: string, quality?: number) => Promise<Blob>
}

type PipelineInstance = (image: string) => Promise<RawImageLike>

let cachedPipeline: PipelineInstance | null = null

export const checkWebGpuSupport = (): boolean => "gpu" in navigator

export const isModelCached = async (): Promise<boolean> => {
  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    return keys.some((request) => request.url.includes("modnet"))
  } catch {
    return false
  }
}

export const loadModel = async (onProgress: (progress: number) => void): Promise<void> => {
  const { pipeline } = await import("@huggingface/transformers")
  const instance = await pipeline("background-removal", MODEL_ID, {
    device: "webgpu",
    progress_callback: (info: { status: string; progress?: number }) => {
      if (info.status === "progress_total" && info.progress !== undefined) {
        onProgress(info.progress)
      }
    },
  })
  cachedPipeline = instance as unknown as PipelineInstance
}

export const removeBackground = async (objectUrl: string): Promise<Blob> => {
  if (!cachedPipeline) {
    const { pipeline } = await import("@huggingface/transformers")
    const instance = await pipeline("background-removal", MODEL_ID, {
      device: "webgpu",
    })
    cachedPipeline = instance as unknown as PipelineInstance
  }

  const result = await cachedPipeline(objectUrl)
  return result.toBlob("image/png")
}
