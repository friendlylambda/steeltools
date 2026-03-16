/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react"
import { useDebounce } from "react-use"
import { Input } from "@base-ui/react/input"
import type { OutcomeRow } from "../types/negotiation"
import { colors, spacing, radius, typography } from "../../theme"

interface OutcomesTableProps {
  readonly value: readonly OutcomeRow[]
  readonly onChange: (rows: readonly OutcomeRow[]) => void
}

interface OutcomeRowEditorProps {
  readonly row: OutcomeRow
  readonly onChange: (updated: OutcomeRow) => void
}

const OutcomeRowEditor = ({ row, onChange }: OutcomeRowEditorProps): React.ReactElement => {
  const [localDetails, setLocalDetails] = useState(row.details)

  useEffect(() => {
    setLocalDetails(row.details)
  }, [row.details])

  useDebounce(
    () => {
      if (localDetails !== row.details) {
        onChange({ ...row, details: localDetails })
      }
    },
    300,
    [localDetails],
  )

  return (
    <tr>
      <td
        css={{
          padding: spacing.small,
          borderBottom: `1px solid ${colors.secondary30}`,
          fontWeight: 600,
          color: colors.text,
          whiteSpace: "nowrap",
          width: 0,
        }}
      >
        Interest {row.interestLevel}
      </td>
      <td
        css={{
          padding: spacing.small,
          borderBottom: `1px solid ${colors.secondary30}`,
          color: row.interestLevel >= 3 ? colors.success : colors.danger,
          fontWeight: 500,
          whiteSpace: "nowrap",
          width: 0,
        }}
      >
        {row.label}
      </td>
      <td
        css={{
          padding: spacing.small,
          borderBottom: `1px solid ${colors.secondary30}`,
        }}
      >
        <Input
          value={localDetails}
          onChange={(event) => setLocalDetails(event.target.value)}
          placeholder="Describe this outcome..."
          css={{
            width: "100%",
            padding: spacing.small,
            fontSize: typography.fontSize.small,
            border: `1px solid ${colors.secondary30}`,
            borderRadius: radius.small,
            backgroundColor: colors.backgroundLight,
            color: colors.text,
            "&::placeholder": {
              color: colors.textDim,
            },
            "&:focus": {
              borderColor: colors.primary,
            },
          }}
        />
      </td>
    </tr>
  )
}

export const OutcomesTable = ({ value, onChange }: OutcomesTableProps): React.ReactElement => {
  const handleRowChange = (index: number, updated: OutcomeRow): void => {
    const newRows = value.map((row, rowIndex) => (rowIndex === index ? updated : row))
    onChange(newRows)
  }

  return (
    <section css={{ marginBottom: spacing.large }}>
      <h3
        css={{
          fontSize: typography.fontSize.large,
          color: colors.primary,
          marginBottom: spacing.medium,
        }}
      >
        Negotiation Outcomes
      </h3>
      <table
        css={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: typography.fontSize.small,
        }}
      >
        <thead>
          <tr css={{ color: colors.secondary }}>
            <th
              css={{
                padding: spacing.small,
                textAlign: "left",
                borderBottom: `1px solid ${colors.secondary30}`,
              }}
            >
              Interest
            </th>
            <th
              css={{
                padding: spacing.small,
                textAlign: "left",
                borderBottom: `1px solid ${colors.secondary30}`,
              }}
            >
              Outcome
            </th>
            <th
              css={{
                padding: spacing.small,
                textAlign: "left",
                borderBottom: `1px solid ${colors.secondary30}`,
              }}
            >
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {value.map((row, index) => (
            <OutcomeRowEditor
              key={row.interestLevel}
              row={row}
              onChange={(updated) => handleRowChange(index, updated)}
            />
          ))}
        </tbody>
      </table>
    </section>
  )
}
