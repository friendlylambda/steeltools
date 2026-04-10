/** @jsxImportSource @emotion/react */
import { useState, useCallback, useEffect } from "react"
import { colors, spacing, radius, typography } from "../../theme"
import {
  checkWebGpuSupport,
  clearCachedModel,
  isModelCached,
  loadModel,
  WebGpuInitError,
} from "../utils/backgroundRemoval"

type ModalPhase =
  | { readonly step: "checking" }
  | { readonly step: "unsupported" }
  | { readonly step: "incompatible" }
  | { readonly step: "ready" }
  | { readonly step: "downloading"; readonly progress: number }
  | { readonly step: "complete" }
  | { readonly step: "error"; readonly message: string }

type BackgroundRemovalModalProps = {
  readonly onComplete: () => void
  readonly onCancel: () => void
}

export const BackgroundRemovalModal = ({
  onComplete,
  onCancel,
}: BackgroundRemovalModalProps): React.ReactElement => {
  const [phase, setPhase] = useState<ModalPhase>({ step: "checking" })
  // True while a post-failure cache cleanup is in flight. The OK/Retry
  // buttons in the incompatible/error screens stay disabled until this
  // flips back to false, so the user can't dismiss the modal (and have
  // the next toggle skip the download) before the stale cache is gone.
  const [cacheCleanupIsPending, setCacheCleanupIsPending] = useState(false)

  useEffect(() => {
    const check = async (): Promise<void> => {
      const supported = await checkWebGpuSupport()
      if (!supported) {
        setPhase({ step: "unsupported" })
        return
      }

      const cached = await isModelCached()
      if (cached) {
        onComplete()
        return
      }

      setPhase({ step: "ready" })
    }
    check()
  }, [onComplete])

  const handleDownload = useCallback(async () => {
    setPhase({ step: "downloading", progress: 0 })
    setCacheCleanupIsPending(false)
    try {
      await loadModel((progress) => {
        setPhase({ step: "downloading", progress })
      })
      setPhase({ step: "complete" })
    } catch (error) {
      console.error("[BackgroundRemoval] loadModel failed", error)
      if (error instanceof WebGpuInitError) {
        setPhase({ step: "incompatible" })
      } else {
        setPhase({
          step: "error",
          message: error instanceof Error ? error.message : "An unexpected error occurred.",
        })
      }
      // Wipe any partially-cached model so a future attempt re-runs the
      // full flow.
      setCacheCleanupIsPending(true)
      try {
        await clearCachedModel()
      } finally {
        setCacheCleanupIsPending(false)
      }
    }
  }, [])

  return (
    <div
      css={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 1000,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        css={{
          backgroundColor: colors.backgroundLight,
          borderRadius: radius.medium,
          padding: spacing.xlarge,
          maxWidth: 480,
          width: "90%",
          border: `1px solid ${colors.secondary30}`,
          display: "flex",
          flexDirection: "column",
          gap: spacing.large,
        }}
      >
        {phase.step === "checking" && (
          <p css={{ color: colors.textDim, margin: 0, textAlign: "center" }}>
            Checking compatibility...
          </p>
        )}

        {phase.step === "unsupported" && (
          <>
            <h2 css={{ color: colors.primary, margin: 0, fontSize: typography.fontSize.large }}>
              Not Supported
            </h2>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              Your browser or computer does not support the features needed for automatic background
              removal yet. You can still remove your image's background yourself before uploading:
            </p>
            <ul
              css={{
                color: colors.textDim,
                margin: 0,
                paddingLeft: spacing.large,
                lineHeight: 1.8,
              }}
            >
              <li>
                <strong css={{ color: colors.text }}>macOS:</strong> Right-click an image in Finder
                and use Quick Actions &gt; Remove Background
              </li>
              <li>
                <strong css={{ color: colors.text }}>Windows 11:</strong> Open the image in Paint
                and click Remove Background
              </li>
            </ul>
            <button type="button" onClick={onCancel} css={buttonStyle}>
              OK
            </button>
          </>
        )}

        {phase.step === "incompatible" && (
          <>
            <h2 css={{ color: colors.primary, margin: 0, fontSize: typography.fontSize.large }}>
              Your Browser is Not Quite There!
            </h2>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              Your browser is close to supporting this feature, but it is still missing some things
              that are required for background removal to work well.
            </p>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              For now, try a different browser like Firefox or Chrome for automatic background
              removal, or remove the background yourself before uploading:
            </p>
            <ul
              css={{
                color: colors.textDim,
                margin: 0,
                paddingLeft: spacing.large,
                lineHeight: 1.8,
              }}
            >
              <li>
                <strong css={{ color: colors.text }}>macOS:</strong> Right-click an image in Finder
                and use Quick Actions &gt; Remove Background
              </li>
              <li>
                <strong css={{ color: colors.text }}>Windows 11+:</strong> Open the image in Paint
                and click Remove Background
              </li>
            </ul>
            <button
              type="button"
              onClick={onCancel}
              disabled={cacheCleanupIsPending}
              css={buttonStyle}
            >
              OK
            </button>
          </>
        )}

        {phase.step === "ready" && (
          <>
            <h2 css={{ color: colors.primary, margin: 0, fontSize: typography.fontSize.large }}>
              Download Required
            </h2>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              To remove backgrounds automatically, this tool needs to download a special background
              removal tool so it can attempt background removal in your browser. The data is about
              50 MB and may take a few minutes depending on your connection, but only needs to
              happen once — it will be saved in your browser for future use after that.
            </p>
            <p
              css={{
                color: colors.textDim,
                margin: 0,
                lineHeight: 1.6,
                fontSize: typography.fontSize.small,
              }}
            >
              Everything runs entirely in your browser. Your image is not sent anywhere and you
              don't need to install anything on your computer.
            </p>
            <div css={{ display: "flex", gap: spacing.medium, justifyContent: "flex-end" }}>
              <button type="button" onClick={onCancel} css={secondaryButtonStyle}>
                Cancel
              </button>
              <button type="button" onClick={handleDownload} css={buttonStyle}>
                Add BG Removal Tool
              </button>
            </div>
          </>
        )}

        {phase.step === "downloading" && (
          <>
            <h2 css={{ color: colors.primary, margin: 0, fontSize: typography.fontSize.large }}>
              Downloading...
            </h2>
            <div css={{ display: "flex", flexDirection: "column", gap: spacing.small }}>
              <div
                css={{
                  width: "100%",
                  height: 8,
                  backgroundColor: colors.primary10,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  css={{
                    height: "100%",
                    width: `${Math.min(phase.progress, 100)}%`,
                    backgroundColor: colors.primary,
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p
                css={{
                  color: colors.textDim,
                  margin: 0,
                  fontSize: typography.fontSize.small,
                  textAlign: "right",
                }}
              >
                {Math.round(phase.progress)}%
              </p>
            </div>
          </>
        )}

        {phase.step === "complete" && (
          <>
            <h2 css={{ color: colors.primary, margin: 0, fontSize: typography.fontSize.large }}>
              Ready
            </h2>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              The background removal tool has been downloaded and is ready to use. Images you upload
              can now automatically have their backgrounds removed.
            </p>
            <button type="button" onClick={onComplete} css={buttonStyle}>
              OK
            </button>
          </>
        )}

        {phase.step === "error" && (
          <>
            <h2 css={{ color: colors.danger, margin: 0, fontSize: typography.fontSize.large }}>
              Error
            </h2>
            <p css={{ color: colors.text, margin: 0, lineHeight: 1.6 }}>
              Something went wrong while downloading the tool:
            </p>
            <p
              css={{
                color: colors.textDim,
                margin: 0,
                fontFamily: typography.fontMono,
                fontSize: typography.fontSize.small,
                backgroundColor: colors.backgroundCard,
                padding: spacing.small,
                borderRadius: radius.small,
                wordBreak: "break-word",
              }}
            >
              {phase.message}
            </p>
            <div css={{ display: "flex", gap: spacing.medium, justifyContent: "flex-end" }}>
              <button type="button" onClick={onCancel} css={secondaryButtonStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={cacheCleanupIsPending}
                css={buttonStyle}
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const buttonStyle = {
  padding: `${spacing.small} ${spacing.large}`,
  backgroundColor: colors.primary,
  color: colors.background,
  border: "none",
  borderRadius: radius.small,
  fontSize: typography.fontSize.medium,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
  "&:hover": {
    opacity: 0.85,
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
} as const

const secondaryButtonStyle = {
  padding: `${spacing.small} ${spacing.large}`,
  backgroundColor: "transparent",
  color: colors.textDim,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  fontSize: typography.fontSize.medium,
  cursor: "pointer",
  transition: "border-color 0.2s, color 0.2s",
  "&:hover": {
    borderColor: colors.primary30,
    color: colors.text,
  },
} as const
