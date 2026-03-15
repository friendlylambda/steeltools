/** @jsxImportSource @emotion/react */
import { Fragment } from "react"
import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import type {
  DifficultyTable as DifficultyTableType,
  HeroCount,
  Difficulty,
} from "../types/montage"
import { colors, spacing, typography } from "../../theme"
import { Stepper } from "../../components/Stepper"
import { toggleButtonStyle, toggleGroupStyle } from "./sharedStyles"

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
  readonly difficulty: Difficulty | null
  readonly heroCount: HeroCount | null
  readonly onDifficultyChange: (value: Difficulty | null) => void
  readonly onHeroCountChange: (value: HeroCount | null) => void
}

const heroCountLabels: Record<HeroCount, string> = {
  three: "Three",
  four: "Four",
  five: "Five",
  six: "Six",
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

const allHeroCounts: readonly HeroCount[] = ["three", "four", "five", "six"]
const allDifficulties: readonly Difficulty[] = ["easy", "medium", "hard"]


export const DifficultyTable = ({
  value,
  onChange,
  difficulty,
  heroCount,
  onDifficultyChange,
  onHeroCountChange,
}: DifficultyTableProps): React.ReactElement => {
  const visibleDifficulties = difficulty ? [difficulty] : allDifficulties
  const visibleHeroCounts = heroCount ? [heroCount] : allHeroCounts

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

  const handleDifficultyToggle = (toggleValue: string[]): void => {
    const selected =
      toggleValue.length > 0 && toggleValue[0] !== "any" ? (toggleValue[0] as Difficulty) : null
    onDifficultyChange(selected)
  }

  const handleHeroCountToggle = (toggleValue: string[]): void => {
    const selected =
      toggleValue.length > 0 && toggleValue[0] !== "any" ? (toggleValue[0] as HeroCount) : null
    onHeroCountChange(selected)
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
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: spacing.medium,
          marginBottom: spacing.small,
        }}
      >
        <span css={{ fontSize: typography.fontSize.medium, color: colors.text }}>Difficulty:</span>
        <ToggleGroup
          value={[difficulty ?? "any"]}
          onValueChange={handleDifficultyToggle}
          css={toggleGroupStyle}
        >
          {(["any", "easy", "medium", "hard"] as const).map((val, index, arr) => (
            <Toggle key={val} value={val} css={toggleButtonStyle(index === arr.length - 1)}>
              {val === "any" ? "Choose During Session" : difficultyLabels[val as Difficulty]}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
      <div
        css={{
          display: "flex",
          alignItems: "center",
          gap: spacing.medium,
          marginBottom: spacing.medium,
        }}
      >
        <span css={{ fontSize: typography.fontSize.medium, color: colors.text }}>Hero count:</span>
        <ToggleGroup
          value={[heroCount ?? "any"]}
          onValueChange={handleHeroCountToggle}
          css={toggleGroupStyle}
        >
          {(["any", "three", "four", "five", "six"] as const).map((val, index, arr) => (
            <Toggle key={val} value={val} css={toggleButtonStyle(index === arr.length - 1)}>
              {val === "any" ? "Choose During Session" : heroCountLabels[val as HeroCount]}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
      <table
        css={{ width: "100%", borderCollapse: "collapse", fontSize: typography.fontSize.small }}
      >
        <thead>
          <tr css={{ color: colors.secondary }}>
            <HeaderCell align="left">Heroes</HeaderCell>
            {visibleDifficulties.map((difficulty) => (
              <HeaderCell key={difficulty} colSpan={2}>
                {difficultyLabels[difficulty]}
              </HeaderCell>
            ))}
          </tr>
          <tr css={{ color: colors.textDim }}>
            <HeaderCell align="left">Limits</HeaderCell>
            {visibleDifficulties.map((difficulty) => (
              <Fragment key={difficulty}>
                <HeaderCell>Success</HeaderCell>
                <HeaderCell>Failure</HeaderCell>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleHeroCounts.map((heroCount) => (
            <tr key={heroCount}>
              <Cell align="left">
                <span css={{ fontWeight: 600, color: colors.text }}>
                  {heroCountLabels[heroCount]}
                </span>
              </Cell>
              {visibleDifficulties.map((difficulty) => (
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
