/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { Button } from "@base-ui/react/button"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Tooltip } from "@base-ui/react/tooltip"
import { useMontageStore } from "../store/montageStore"
import type { Montage } from "../types/montage"
import {
  createMontageShareLink,
  fetchSharedMontage,
  readShareIdFromLocation,
  clearShareFromLocation,
} from "../utilities/share"
import { colors, spacing, radius, typography } from "../../theme"

interface ShareFeedback {
  readonly montageId: string
  readonly status: "copied" | "error"
}

const shareTooltipStyles = {
  backgroundColor: colors.backgroundLight,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.medium,
  padding: `${spacing.medium} ${spacing.large}`,
  fontSize: typography.fontSize.medium,
  color: colors.text,
  maxWidth: 280,
  lineHeight: 1.5,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  opacity: 1,
  transform: "translateY(0) scale(1)",
  transition: "opacity 200ms ease, transform 200ms ease",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: 0,
    transform: "translateY(4px) scale(0.95)",
  },
} as const

const rowActionButtonStyles = {
  padding: `${spacing.xsmall} ${spacing.small}`,
  fontSize: typography.fontSize.small,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  cursor: "pointer",
  backgroundColor: "transparent",
  color: colors.secondary,
  "&:hover": {
    borderColor: colors.secondary,
  },
} as const

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export const SplashScreen = (): React.ReactElement => {
  const navigate = useNavigate()
  const montages = useMontageStore((state) => state.montages)
  const createMontage = useMontageStore((state) => state.createMontage)
  const deleteMontage = useMontageStore((state) => state.deleteMontage)
  const duplicateMontage = useMontageStore((state) => state.duplicateMontage)
  const importMontage = useMontageStore((state) => state.importMontage)

  const [pendingImport, setPendingImport] = useState<Montage | null>(null)
  const [importFailed, setImportFailed] = useState(false)

  useEffect(() => {
    const shareId = readShareIdFromLocation()
    if (shareId) {
      clearShareFromLocation()
      fetchSharedMontage(shareId).then((sharedMontage) => {
        if (sharedMontage) {
          setPendingImport(sharedMontage)
        } else {
          setImportFailed(true)
        }
      })
    }
  }, [])

  const handleImportDialogChange = (open: boolean): void => {
    if (!open) {
      setPendingImport(null)
      setImportFailed(false)
    }
  }

  const handleImportConfirm = (): void => {
    if (pendingImport) {
      importMontage(pendingImport)
      setPendingImport(null)
    }
  }

  const [shareFeedback, setShareFeedback] = useState<ShareFeedback | null>(null)
  const [sharingMontageId, setSharingMontageId] = useState<string | null>(null)
  const shareTimeoutRef = useRef<number | null>(null)

  const handleShare = async (montage: Montage): Promise<void> => {
    setSharingMontageId(montage.id)
    const status = await createMontageShareLink(montage)
      .then(async (url) => {
        await navigator.clipboard.writeText(url)
        return "copied" as const
      })
      .catch(() => "error" as const)
    setSharingMontageId(null)
    if (shareTimeoutRef.current) {
      window.clearTimeout(shareTimeoutRef.current)
    }
    setShareFeedback({ montageId: montage.id, status })
    shareTimeoutRef.current = window.setTimeout(() => {
      setShareFeedback(null)
    }, 5000)
  }

  const sortedMontages = Object.values(montages).toSorted(
    (a: Montage, b: Montage) => b.updatedAt - a.updatedAt,
  )

  const handleCreate = (): void => {
    const id = createMontage()
    navigate({ to: "/montagemaker/$montageId", params: { montageId: id } })
  }

  const handleOpen = (id: string): void => {
    navigate({ to: "/montagemaker/$montageId", params: { montageId: id } })
  }

  const handleDelete = (id: string): void => {
    deleteMontage(id)
  }

  const handleDuplicate = (id: string): void => {
    duplicateMontage(id)
  }

  return (
    <div css={{ padding: spacing.xlarge, maxWidth: 900, margin: "0 auto" }}>
      <header
        css={{
          marginBottom: spacing.xlarge,
          display: "flex",
          alignItems: "center",
          gap: spacing.medium,
        }}
      >
        <Link
          to="/"
          css={{
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
          }}
        >
          Back
        </Link>
        <h1
          css={{ fontSize: typography.fontSize.xlarge, margin: 0, flex: 1, color: colors.primary }}
        >
          Montage Maker
        </h1>
        <Button
          onClick={handleCreate}
          css={{
            padding: `${spacing.small} ${spacing.medium}`,
            fontSize: typography.fontSize.medium,
            border: "none",
            borderRadius: radius.small,
            cursor: "pointer",
            backgroundColor: colors.secondary,
            color: colors.background,
            "&:hover": {
              backgroundColor: colors.secondaryLight,
            },
          }}
        >
          New Montage
        </Button>
      </header>

      {sortedMontages.length === 0 ? (
        <p css={{ color: colors.textDim, textAlign: "center", marginTop: spacing.xlarge }}>
          Click the New Montage button to create your first montage.
        </p>
      ) : (
        <Tooltip.Provider>
          <ul css={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sortedMontages.map((montage) => (
              <li
                key={montage.id}
                css={{
                  display: "flex",
                  alignItems: "center",
                  padding: spacing.medium,
                  borderBottom: `1px solid ${colors.secondary30}`,
                  "&:hover": {
                    backgroundColor: colors.backgroundCard,
                  },
                }}
              >
                <button
                  onClick={() => handleOpen(montage.id)}
                  css={{
                    flex: 1,
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  <div css={{ fontSize: typography.fontSize.medium, color: colors.text }}>
                    {montage.title || "Untitled"}
                  </div>
                  <div css={{ fontSize: typography.fontSize.small, color: colors.textDim }}>
                    {formatDate(montage.updatedAt)}
                  </div>
                </button>
                <div
                  onClick={(event) => event.stopPropagation()}
                  css={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.small,
                    paddingLeft: spacing.large,
                  }}
                >
                  <Tooltip.Root open={shareFeedback?.montageId === montage.id}>
                    <Tooltip.Trigger
                      render={
                        <Button
                          onClick={() => handleShare(montage)}
                          disabled={sharingMontageId === montage.id}
                          css={{
                            ...rowActionButtonStyles,
                            "&:disabled": {
                              opacity: 0.6,
                              cursor: "default",
                              borderColor: colors.secondary30,
                            },
                          }}
                        >
                          {sharingMontageId === montage.id ? "Sharing…" : "Share"}
                        </Button>
                      }
                    />
                    <Tooltip.Portal>
                      <Tooltip.Positioner side="top" sideOffset={8}>
                        <Tooltip.Popup css={shareTooltipStyles}>
                          {shareFeedback?.status === "error"
                            ? "Sharing failed — please try again"
                            : "Copied a link to the current version of this montage to your clipboard"}
                        </Tooltip.Popup>
                      </Tooltip.Positioner>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                  <Button onClick={() => handleDuplicate(montage.id)} css={rowActionButtonStyles}>
                    Duplicate
                  </Button>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger
                      css={{
                        ...rowActionButtonStyles,
                        color: colors.danger,
                        "&:hover": {
                          borderColor: colors.danger,
                        },
                      }}
                    >
                      Delete
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                      <AlertDialog.Backdrop
                        css={{
                          position: "fixed",
                          inset: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                        }}
                      />
                      <AlertDialog.Popup
                        css={{
                          position: "fixed",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: colors.backgroundLight,
                          padding: spacing.large,
                          borderRadius: radius.medium,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                          minWidth: 300,
                          border: `1px solid ${colors.secondary30}`,
                        }}
                      >
                        <AlertDialog.Title
                          css={{
                            fontSize: typography.fontSize.large,
                            margin: 0,
                            marginBottom: spacing.medium,
                            color: colors.primary,
                          }}
                        >
                          Delete Montage?
                        </AlertDialog.Title>
                        <AlertDialog.Description
                          css={{
                            fontSize: typography.fontSize.medium,
                            color: colors.textDim,
                            marginBottom: spacing.large,
                          }}
                        >
                          This action cannot be undone. The montage "{montage.title || "Untitled"}"
                          will be permanently deleted.
                        </AlertDialog.Description>
                        <div
                          css={{ display: "flex", gap: spacing.small, justifyContent: "flex-end" }}
                        >
                          <AlertDialog.Close
                            css={{
                              padding: `${spacing.small} ${spacing.medium}`,
                              fontSize: typography.fontSize.medium,
                              border: `1px solid ${colors.secondary30}`,
                              borderRadius: radius.small,
                              cursor: "pointer",
                              backgroundColor: "transparent",
                              color: colors.text,
                              "&:hover": {
                                backgroundColor: colors.backgroundCard,
                              },
                            }}
                          >
                            Cancel
                          </AlertDialog.Close>
                          <AlertDialog.Close
                            onClick={() => handleDelete(montage.id)}
                            css={{
                              padding: `${spacing.small} ${spacing.medium}`,
                              fontSize: typography.fontSize.medium,
                              border: "none",
                              borderRadius: radius.small,
                              cursor: "pointer",
                              backgroundColor: colors.danger,
                              color: colors.text,
                              "&:hover": {
                                opacity: 0.9,
                              },
                            }}
                          >
                            Delete
                          </AlertDialog.Close>
                        </div>
                      </AlertDialog.Popup>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </div>
              </li>
            ))}
          </ul>
        </Tooltip.Provider>
      )}

      <div
        css={{
          marginTop: spacing.xlarge,
          padding: spacing.large,
          backgroundColor: colors.backgroundCard,
          borderRadius: radius.medium,
          border: `1px solid ${colors.secondary30}`,
        }}
      >
        <p
          css={{
            margin: 0,
            marginBottom: spacing.medium,
            fontSize: typography.fontSize.small,
            color: colors.textDim,
            lineHeight: 1.6,
          }}
        >
          The montages you make on this site are automatically saved in your browser. None of your
          data is sent to anyone. This also means if you clear all your browser data your montages
          here will be gone, so download the files for them if you want to keep a backup. Better
          backup/restore functionality may be added in the future.
        </p>
        <p
          css={{
            margin: 0,
            fontSize: typography.fontSize.small,
            color: colors.textDim,
          }}
        >
          Please submit any questions, bugs, or comments to{" "}
          <strong css={{ color: colors.secondary }}>FriendlyLambda</strong> on Discord.
        </p>
      </div>

      <AlertDialog.Root
        open={pendingImport !== null || importFailed}
        onOpenChange={handleImportDialogChange}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop
            css={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          />
          <AlertDialog.Popup
            css={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: colors.backgroundLight,
              padding: spacing.large,
              borderRadius: radius.medium,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              minWidth: 300,
              maxWidth: 440,
              border: `1px solid ${colors.secondary30}`,
            }}
          >
            <AlertDialog.Title
              css={{
                fontSize: typography.fontSize.large,
                margin: 0,
                marginBottom: spacing.medium,
                color: colors.primary,
              }}
            >
              {pendingImport ? "Copy Shared Montage?" : "Invalid Share Link"}
            </AlertDialog.Title>
            <AlertDialog.Description
              css={{
                fontSize: typography.fontSize.medium,
                color: colors.textDim,
                marginBottom: spacing.large,
              }}
            >
              {pendingImport
                ? `Someone shared the montage "${pendingImport.title || "Untitled"}" (${
                    pendingImport.challenges.length
                  } challenge${pendingImport.challenges.length === 1 ? "" : "s"}) with you. Copy this montage to your collection?`
                : "This shared montage could not be loaded. The link may be incomplete, or something else might have gone wrong."}
            </AlertDialog.Description>
            <div css={{ display: "flex", gap: spacing.small, justifyContent: "flex-end" }}>
              <AlertDialog.Close
                css={{
                  padding: `${spacing.small} ${spacing.medium}`,
                  fontSize: typography.fontSize.medium,
                  border: `1px solid ${colors.secondary30}`,
                  borderRadius: radius.small,
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: colors.text,
                  "&:hover": {
                    backgroundColor: colors.backgroundCard,
                  },
                }}
              >
                {pendingImport ? "Cancel" : "Close"}
              </AlertDialog.Close>
              {pendingImport && (
                <AlertDialog.Close
                  onClick={handleImportConfirm}
                  css={{
                    padding: `${spacing.small} ${spacing.medium}`,
                    fontSize: typography.fontSize.medium,
                    border: "none",
                    borderRadius: radius.small,
                    cursor: "pointer",
                    backgroundColor: colors.secondary,
                    color: colors.background,
                    "&:hover": {
                      backgroundColor: colors.secondaryLight,
                    },
                  }}
                >
                  Copy
                </AlertDialog.Close>
              )}
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
