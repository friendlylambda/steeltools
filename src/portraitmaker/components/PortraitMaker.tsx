/** @jsxImportSource @emotion/react */
import { useCallback, useState } from "react"
import { Link } from "@tanstack/react-router"
import { colors, spacing, radius, typography } from "../../theme"
import { usePortraitState } from "../hooks/usePortraitState"
import { isModelCached, removeBackground } from "../utils/backgroundRemoval"
import { ImageUploader } from "./ImageUploader"
import { PortraitCanvas } from "./PortraitCanvas"
import { ExportButton } from "./ExportButton"
import { BackgroundRemovalToggle } from "./BackgroundRemovalToggle"
import { BackgroundRemovalModal } from "./BackgroundRemovalModal"

const backButtonStyles = {
  display: "inline-block",
  padding: `${spacing.small} ${spacing.medium}`,
  fontSize: typography.fontSize.medium,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  cursor: "pointer",
  backgroundColor: "transparent",
  color: colors.text,
  textDecoration: "none",
  "&:hover": {
    backgroundColor: colors.backgroundCard,
  },
} as const

export const PortraitMaker = (): React.ReactElement => {
  const [state, actions] = usePortraitState()
  const [bgRemovalEnabled, setBgRemovalEnabled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleToggleChange = useCallback(async (checked: boolean) => {
    if (!checked) {
      setBgRemovalEnabled(false)
      return
    }

    const cached = await isModelCached()
    if (cached) {
      setBgRemovalEnabled(true)
    } else {
      setShowModal(true)
    }
  }, [])

  const handleModalComplete = useCallback(() => {
    setShowModal(false)
    setBgRemovalEnabled(true)
  }, [])

  const handleModalCancel = useCallback(() => {
    setShowModal(false)
  }, [])

  const handleFileSelected = useCallback(
    async (file: File) => {
      if (bgRemovalEnabled) {
        setProcessing(true)
        try {
          const objectUrl = URL.createObjectURL(file)
          const processedBlob = await removeBackground(objectUrl)
          URL.revokeObjectURL(objectUrl)
          actions.loadImage(processedBlob)
        } catch {
          actions.loadImage(file)
        } finally {
          setProcessing(false)
        }
      } else {
        actions.loadImage(file)
      }
    },
    [actions, bgRemovalEnabled],
  )

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: spacing.xlarge,
        gap: spacing.large,
      }}
    >
      <header
        css={{
          display: "flex",
          alignItems: "center",
          gap: spacing.medium,
          alignSelf: "stretch",
          maxWidth: 900,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Link to="/" css={backButtonStyles}>
          Back
        </Link>
        <h1
          css={{
            fontSize: typography.fontSize.xlarge,
            color: colors.primary,
            margin: 0,
            flex: 1,
            textAlign: "center",
          }}
        >
          Popout Avatar Maker
        </h1>
        <span aria-hidden css={{ ...backButtonStyles, visibility: "hidden" }}>
          Back
        </span>
      </header>

      <p
        css={{
          color: colors.textDim,
          margin: 0,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 600,
        }}
      >
        Scroll up/down to resize, drag the image to reposition, and drag the handles to determine
        where to crop and where to pop your image out over the token ring.
      </p>
      <p
        css={{
          color: colors.textDim,
          margin: 0,
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: 600,
        }}
      >
        The reference gray token ring won't be included in your image.
      </p>

      {state.imageState ? (
        <>
          <PortraitCanvas
            image={state.imageState.image}
            transform={state.transform}
            arc={state.arc}
            onTransformChange={actions.setTransform}
            onArcChange={actions.setArc}
          />
          <div css={{ display: "flex", gap: spacing.medium, alignItems: "center" }}>
            <ExportButton
              image={state.imageState.image}
              transform={state.transform}
              arc={state.arc}
            />
            <button
              type="button"
              onClick={actions.reset}
              css={{
                padding: `${spacing.small} ${spacing.large}`,
                backgroundColor: "transparent",
                color: colors.textDim,
                border: `1px solid ${colors.secondary30}`,
                borderRadius: "0.5rem",
                fontSize: typography.fontSize.medium,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
                "&:hover": {
                  borderColor: colors.danger,
                  color: colors.danger,
                },
              }}
            >
              Reset
            </button>
          </div>
        </>
      ) : processing ? (
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: 512,
            aspectRatio: "1",
            border: `2px dashed ${colors.secondary30}`,
            borderRadius: radius.medium,
            backgroundColor: colors.backgroundCard,
            gap: spacing.medium,
          }}
        >
          <div
            css={{
              width: 32,
              height: 32,
              border: `3px solid ${colors.primary30}`,
              borderTopColor: colors.primary,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              "@keyframes spin": {
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <p css={{ color: colors.textDim, margin: 0 }}>Removing background...</p>
        </div>
      ) : (
        <>
          <ImageUploader onFileSelected={handleFileSelected} />
          <BackgroundRemovalToggle
            checked={bgRemovalEnabled}
            onCheckedChange={handleToggleChange}
          />
          {!bgRemovalEnabled && (
            <p
              css={{
                color: colors.textDim,
                margin: 0,
                textAlign: "center",
                lineHeight: 1.5,
                maxWidth: 600,
                fontStyle: "italic",
              }}
            >
              Tip: For best results, remove your image's background first. On macOS, right-click an
              image in Finder and use Quick Actions &gt; Remove Background. On Windows 11, open the
              image in Paint and click Remove Background.
            </p>
          )}
        </>
      )}

      {showModal && (
        <BackgroundRemovalModal onComplete={handleModalComplete} onCancel={handleModalCancel} />
      )}
    </div>
  )
}
