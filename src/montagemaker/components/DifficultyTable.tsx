/** @jsxImportSource @emotion/react */
import { Fragment } from "react"
import type {
  DifficultyTable as DifficultyTableType,
  HeroCount,
  Difficulty,
} from "../types/montage"
import { colors, spacing, typography } from "../../theme"
import { Stepper } from "./Stepper"

interface CellProps {
  readonly align?: "left" | "center"
  readonly children: React.ReactNode
}

const Cell = ({ align = "center", children }: CellProps): React.ReactElement => (
  <td
    css={{
      padding: spacing.small,
      textAlign: align,
      borderBottom: `1px solid ${colors.secondary30}`,
    }}
  >
    {children}
  </td>
)

const HeaderCell = ({
  align = "center",
  children,
  colSpan,
}: CellProps & { colSpan?: number }): React.ReactElement => (
  <th
    colSpan={colSpan}
    css={{
      padding: spacing.small,
      textAlign: align,
      borderBottom: `1px solid ${colors.secondary30}`,
    }}
  >
    {children}
  </th>
)

interface DifficultyTableProps {
  readonly value: DifficultyTableType
  readonly onChange: (value: DifficultyTableType) => void
}

const heroCountLabels: Record<HeroCount, string> = {
  three: "Three",
  four: "Four",
  five: "Five",
  six: "Six",
}

const heroCountOrder: readonly HeroCount[] = ["three", "four", "five", "six"]
const difficultyOrder: readonly Difficulty[] = ["easy", "medium", "hard"]

export const DifficultyTable = ({ value, onChange }: DifficultyTableProps): React.ReactElement => {
  const handleCellChange = (
    heroCount: HeroCount,
    difficulty: Difficulty,
    field: "success" | "failure",
    delta: number,
  ): void => {
    const currentValue = value[heroCount][difficulty][field]
    const newValue = Math.max(0, currentValue + delta)
    onChange({
      ...value,
      [heroCount]: {
        ...value[heroCount],
        [difficulty]: {
          ...value[heroCount][difficulty],
          [field]: newValue,
        },
      },
    })
  }

  return (
    <div css={{ marginBottom: spacing.large }}>
      <h3
        css={{
          fontSize: typography.fontSize.large,
          color: colors.primary,
          marginBottom: spacing.medium,
        }}
      >
        Montage Test Difficulty
      </h3>
      <table
        css={{ width: "100%", borderCollapse: "collapse", fontSize: typography.fontSize.small }}
      >
        <thead>
          <tr css={{ color: colors.secondary }}>
            <HeaderCell align="left">Heroes</HeaderCell>
            <HeaderCell colSpan={2}>Easy</HeaderCell>
            <HeaderCell colSpan={2}>Medium</HeaderCell>
            <HeaderCell colSpan={2}>Hard</HeaderCell>
          </tr>
          <tr css={{ color: colors.textDim }}>
            <HeaderCell align="left">Limits</HeaderCell>
            <HeaderCell>Success</HeaderCell>
            <HeaderCell>Failure</HeaderCell>
            <HeaderCell>Success</HeaderCell>
            <HeaderCell>Failure</HeaderCell>
            <HeaderCell>Success</HeaderCell>
            <HeaderCell>Failure</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {heroCountOrder.map((heroCount) => (
            <tr key={heroCount}>
              <Cell align="left">
                <span css={{ fontWeight: 600, color: colors.text }}>
                  {heroCountLabels[heroCount]}
                </span>
              </Cell>
              {difficultyOrder.map((difficulty) => (
                <Fragment key={difficulty}>
                  <Cell>
                    <Stepper
                      value={value[heroCount][difficulty].success}
                      onChange={(newValue) =>
                        handleCellChange(
                          heroCount,
                          difficulty,
                          "success",
                          newValue - value[heroCount][difficulty].success,
                        )
                      }
                      min={1}
                    />
                  </Cell>
                  <Cell>
                    <Stepper
                      value={value[heroCount][difficulty].failure}
                      onChange={(newValue) =>
                        handleCellChange(
                          heroCount,
                          difficulty,
                          "failure",
                          newValue - value[heroCount][difficulty].failure,
                        )
                      }
                      min={1}
                    />
                  </Cell>
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
