/** @jsxImportSource @emotion/react */
import { useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@base-ui/react/button'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { useMontageStore } from '../store/montageStore'
import type { Montage } from '../types/montage'
import { colors, spacing, radius, typography } from '../../theme'

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export const SplashScreen = (): React.ReactElement => {
  const navigate = useNavigate()
  const montages = useMontageStore((state) => state.montages)
  const createMontage = useMontageStore((state) => state.createMontage)
  const deleteMontage = useMontageStore((state) => state.deleteMontage)

  const sortedMontages = Object.values(montages).toSorted(
    (a: Montage, b: Montage) => b.updatedAt - a.updatedAt
  )

  const handleCreate = (): void => {
    const id = createMontage()
    navigate({ to: '/montagemaker/$montageId', params: { montageId: id } })
  }

  const handleOpen = (id: string): void => {
    navigate({ to: '/montagemaker/$montageId', params: { montageId: id } })
  }

  const handleDelete = (id: string): void => {
    deleteMontage(id)
  }

  return (
    <div css={{ padding: spacing.xlarge, maxWidth: 900, margin: '0 auto' }}>
      <header
        css={{
          marginBottom: spacing.xlarge,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.medium,
        }}
      >
        <Link
          to="/"
          css={{
            display: 'inline-block',
            padding: `${spacing.small} ${spacing.medium}`,
            fontSize: typography.fontSize.medium,
            border: `1px solid ${colors.secondary30}`,
            borderRadius: radius.small,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: colors.text,
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: colors.backgroundCard,
            },
          }}
        >
          Back
        </Link>
        <h1 css={{ fontSize: typography.fontSize.xlarge, margin: 0, flex: 1, color: colors.primary }}>
          Montage Maker
        </h1>
        <Button
          onClick={handleCreate}
          css={{
            padding: `${spacing.small} ${spacing.medium}`,
            fontSize: typography.fontSize.medium,
            border: 'none',
            borderRadius: radius.small,
            cursor: 'pointer',
            backgroundColor: colors.secondary,
            color: colors.background,
            '&:hover': {
              backgroundColor: colors.secondaryLight,
            },
          }}
        >
          New Montage
        </Button>
      </header>

      {sortedMontages.length === 0 ? (
        <p css={{ color: colors.textDim, textAlign: 'center', marginTop: spacing.xlarge }}>
          Click the New Montage button to create your first montage.
        </p>
      ) : (
        <ul css={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sortedMontages.map((montage) => (
            <li
              key={montage.id}
              css={{
                display: 'flex',
                alignItems: 'center',
                padding: spacing.medium,
                borderBottom: `1px solid ${colors.secondary30}`,
                '&:hover': {
                  backgroundColor: colors.backgroundCard,
                },
              }}
            >
              <button
                onClick={() => handleOpen(montage.id)}
                css={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                <div css={{ fontSize: typography.fontSize.medium, color: colors.text }}>
                  {montage.title || 'Untitled'}
                </div>
                <div css={{ fontSize: typography.fontSize.small, color: colors.textDim }}>
                  {formatDate(montage.updatedAt)}
                </div>
              </button>
              <AlertDialog.Root>
                <AlertDialog.Trigger
                  css={{
                    padding: `${spacing.xsmall} ${spacing.small}`,
                    fontSize: typography.fontSize.small,
                    border: 'none',
                    borderRadius: radius.small,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: colors.danger,
                    '&:hover': {
                      backgroundColor: colors.backgroundCard,
                    },
                  }}
                >
                  Delete
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Backdrop
                    css={{
                      position: 'fixed',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                  />
                  <AlertDialog.Popup
                    css={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: colors.backgroundLight,
                      padding: spacing.large,
                      borderRadius: radius.medium,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
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
                      This action cannot be undone. The montage "{montage.title || 'Untitled'}" will be permanently deleted.
                    </AlertDialog.Description>
                    <div css={{ display: 'flex', gap: spacing.small, justifyContent: 'flex-end' }}>
                      <AlertDialog.Close
                        css={{
                          padding: `${spacing.small} ${spacing.medium}`,
                          fontSize: typography.fontSize.medium,
                          border: `1px solid ${colors.secondary30}`,
                          borderRadius: radius.small,
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          color: colors.text,
                          '&:hover': {
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
                          border: 'none',
                          borderRadius: radius.small,
                          cursor: 'pointer',
                          backgroundColor: colors.danger,
                          color: colors.text,
                          '&:hover': {
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
            </li>
          ))}
        </ul>
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
          Please submit any questions, bugs, or comments to{' '}
          <strong css={{ color: colors.secondary }}>FriendlyLambda</strong> on Discord.
        </p>
      </div>
    </div>
  )
}
