/** @jsxImportSource @emotion/react */
import { Link, useParams } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { colors, spacing, radius, typography } from "../../theme"
import { codexMods, modSlug } from "../mods"

export const CodexModPage = (): React.ReactElement => {
  const { modSlug: slug } = useParams({ strict: false })
  const mod = codexMods.find((mod) => modSlug(mod) === slug)

  if (!mod) {
    return (
      <div css={{ padding: spacing.xlarge, maxWidth: 900, margin: "0 auto" }}>
        <Link to="/" css={{ color: colors.primary, textDecoration: "none" }}>
          &larr; Back
        </Link>
        <h1 css={{ fontSize: typography.fontSize.xlarge, color: colors.danger, marginTop: spacing.large }}>
          Mod not found
        </h1>
      </div>
    )
  }

  return (
    <div css={{ padding: spacing.xlarge, maxWidth: 640, margin: "0 auto" }}>
      <Link
        to="/"
        css={{
          color: colors.primary,
          textDecoration: "none",
          fontSize: typography.fontSize.small,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        &larr; Back to Steel Tools
      </Link>

      <h1
        css={{
          fontSize: typography.fontSize.xlarge,
          color: colors.primary,
          marginTop: spacing.large,
          marginBottom: spacing.small,
        }}
      >
        {mod.name}
      </h1>

      <p
        css={{
          color: colors.textDim,
          marginBottom: spacing.medium,
        }}
      >
        {mod.description}
      </p>

      <p
        css={{
          color: colors.textDim,
          marginBottom: spacing.xlarge,
          fontSize: typography.fontSize.small,
        }}
      >
        <strong css={{ color: colors.text }}>How to Install:</strong> open your game as a director
        in Codex, then go to the Codex menu and click &ldquo;Download Module&rdquo; and search for
        &ldquo;{mod.name}&rdquo;, then click on {mod.name} and click the Install button.
      </p>

      {mod.images.length > 0 && <ImageCarousel images={mod.images} name={mod.name} />}
    </div>
  )
}

const ImageCarousel = ({
  images,
  name,
}: {
  readonly images: readonly string[]
  readonly name: string
}): React.ReactElement => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const navigateWithDirection = (nextIndex: number, dir: number): void => {
    setDirection(dir)
    setSelectedIndex(nextIndex)
  }

  const navigate = (nextIndex: number): void => {
    navigateWithDirection(nextIndex, nextIndex > selectedIndex ? 1 : -1)
  }

  const goToPrevious = (): void => {
    const nextIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
    navigateWithDirection(nextIndex, -1)
  }

  const goToNext = (): void => {
    const nextIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
    navigateWithDirection(nextIndex, 1)
  }

  return (
    <div>
      <div
        css={{
          position: "relative",
          borderRadius: radius.medium,
          overflow: "hidden",
          border: `1px solid ${colors.secondary30}`,
          backgroundColor: colors.backgroundCard,
          marginBottom: spacing.medium,
        }}
      >
        <div
          css={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            height: 400,
            padding: "3rem",
          }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={`${name} screenshot ${selectedIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              css={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous image"
              css={arrowButtonStyle("left")}
            >
              &#8249;
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              css={arrowButtonStyle("right")}
            >
              &#8250;
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            gap: spacing.small,
          }}
        >
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => navigate(index)}
              aria-label={`Go to image ${index + 1}`}
              css={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                backgroundColor: index === selectedIndex ? colors.primary : colors.secondary30,
                transition: "background-color 0.2s, transform 0.2s",
                transform: index === selectedIndex ? "scale(1.3)" : "scale(1)",
                "&:hover": {
                  backgroundColor: index === selectedIndex ? colors.primary : colors.secondary,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const slideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
}

const arrowButtonStyle = (side: "left" | "right") =>
  ({
    position: "absolute" as const,
    top: "50%",
    [side]: spacing.small,
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: colors.text,
    fontSize: "1.5rem",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    transition: "opacity 0.15s, background-color 0.15s",
    "&:hover": {
      opacity: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  }) as const
