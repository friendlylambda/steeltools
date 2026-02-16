/** @jsxImportSource @emotion/react */
import { useEffect, useState, useMemo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Menu } from "@base-ui/react/menu"
import { HiddenBlock } from "../extensions/HiddenBlock"
import { VictoryButton } from "../extensions/VictoryButton"
import { colors, spacing, radius, typography } from "../../theme"

interface RichTextEditorProps {
  readonly value: string
  readonly onChange: (html: string) => void
  readonly placeholder?: string
  readonly showSubheader?: boolean
  readonly showVictoryButton?: boolean
}

const BulletListIcon = (): React.ReactElement => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4-1h14v-2H8v2zm-4 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4-1h14v-2H8v2zm-4 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4-1h14v-2H8v2z" />
  </svg>
)

interface ToolbarButtonProps {
  readonly onClick: () => void
  readonly isActive: boolean
  readonly children: React.ReactNode
  readonly title: string
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: ToolbarButtonProps): React.ReactElement => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    css={{
      padding: spacing.xsmall,
      border: "none",
      borderRadius: radius.small,
      backgroundColor: isActive ? colors.secondary30 : "transparent",
      color: isActive ? colors.text : colors.textDim,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        backgroundColor: colors.secondary30,
        color: colors.text,
      },
    }}
  >
    {children}
  </button>
)

const menuTriggerStyles = {
  padding: spacing.xsmall,
  border: "none",
  borderRadius: radius.small,
  backgroundColor: "transparent",
  color: colors.textDim,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: colors.secondary30,
    color: colors.text,
  },
}

const menuPopupStyles = {
  backgroundColor: colors.backgroundLight,
  border: `1px solid ${colors.secondary30}`,
  borderRadius: radius.small,
  padding: spacing.xsmall,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
}

const menuItemStyles = {
  padding: `${spacing.small} ${spacing.medium}`,
  cursor: "pointer",
  borderRadius: radius.small,
  fontSize: typography.fontSize.small,
  color: colors.text,
  "&[data-highlighted]": {
    backgroundColor: colors.secondary30,
  },
}

interface ToolbarState {
  readonly bold: boolean
  readonly italic: boolean
  readonly heading: boolean
  readonly subheading: boolean
  readonly bulletList: boolean
  readonly hidden: boolean
}

const initialToolbarState: ToolbarState = {
  bold: false,
  italic: false,
  heading: false,
  subheading: false,
  bulletList: false,
  hidden: false,
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "",
  showSubheader = false,
  showVictoryButton = false,
}: RichTextEditorProps): React.ReactElement => {
  const [toolbarState, setToolbarState] = useState<ToolbarState>(initialToolbarState)

  const extensions = useMemo(() => {
    const headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[] = showSubheader ? [2, 4] : [2]

    const baseExtensions = [
      StarterKit.configure({
        heading: { levels: headingLevels },
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        orderedList: false,
        dropcursor: false,
        gapcursor: false,
      }),
      HiddenBlock,
    ]

    if (showVictoryButton) {
      baseExtensions.push(VictoryButton)
    }

    return baseExtensions
  }, [showSubheader, showVictoryButton])

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    onTransaction: ({ editor: ed }) => {
      setToolbarState({
        bold: ed.isActive("bold"),
        italic: ed.isActive("italic"),
        heading: ed.isActive("heading", { level: 2 }),
        subheading: ed.isActive("heading", { level: 4 }),
        bulletList: ed.isActive("bulletList"),
        hidden: ed.isActive("hiddenBlock"),
      })
    },
  })

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) {
    return <div>Loading...</div>
  }

  const handleInsertVictory = (count: number) => {
    editor.chain().focus().insertVictoryButton(count).run()
  }

  return (
    <div
      css={{
        border: `1px solid ${colors.secondary30}`,
        borderRadius: radius.small,
        backgroundColor: colors.backgroundLight,
        "&:focus-within": {
          borderColor: colors.primary,
        },
      }}
    >
      {/* Toolbar */}
      <div
        css={{
          display: "flex",
          gap: spacing.xsmall,
          padding: spacing.xsmall,
          borderBottom: `1px solid ${colors.secondary30}`,
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={toolbarState.heading}
          title="Heading"
        >
          Header
        </ToolbarButton>
        {showSubheader && (
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            isActive={toolbarState.subheading}
            title="Subheader"
          >
            Subheader
          </ToolbarButton>
        )}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={toolbarState.bold}
          title="Bold (Cmd+B)"
        >
          <strong>Bold</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={toolbarState.italic}
          title="Italic (Cmd+I)"
        >
          <em>Italics</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={toolbarState.bulletList}
          title="Bullet List"
        >
          <span css={{ display: "flex", alignItems: "center", gap: spacing.xsmall }}>
            <BulletListIcon /> List
          </span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHiddenBlock().run()}
          isActive={toolbarState.hidden}
          title="Hidden (Cmd+Shift+H)"
        >
          Hidden
        </ToolbarButton>
        {showVictoryButton && (
          <Menu.Root modal={false}>
            <Menu.Trigger css={menuTriggerStyles}>Victory Buttons</Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner>
                <Menu.Popup css={menuPopupStyles}>
                  <Menu.Item css={menuItemStyles} onClick={() => handleInsertVictory(1)}>
                    1 Victory
                  </Menu.Item>
                  <Menu.Item css={menuItemStyles} onClick={() => handleInsertVictory(2)}>
                    2 Victories
                  </Menu.Item>
                  <Menu.Item css={menuItemStyles} onClick={() => handleInsertVictory(3)}>
                    3 Victories
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        )}
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        css={{
          ".tiptap": {
            padding: spacing.small,
            minHeight: "3rem",
            outline: "none",
            fontSize: typography.fontSize.medium,
            color: colors.text,
            "& p": {
              margin: 0,
            },
            "& h2": {
              margin: `${spacing.xsmall} 0`,
              fontSize: typography.fontSize.large,
              fontWeight: 600,
              color: colors.primary,
            },
            "& h4": {
              margin: `${spacing.xsmall} 0`,
              fontSize: typography.fontSize.medium,
              fontWeight: 600,
              color: colors.secondary,
            },
            "& ul": {
              margin: `${spacing.xsmall} 0`,
              paddingLeft: spacing.large,
            },
            "& li": {
              margin: 0,
            },
            "& div[data-hidden]": {
              backgroundColor: "rgba(128, 128, 128, 0.15)",
              borderRadius: radius.small,
              padding: spacing.small,
              margin: `${spacing.xsmall} 0`,
            },
            "& span[data-victory-button]": {
              display: "inline-block",
              backgroundColor: colors.success,
              color: colors.text,
              padding: `2px ${spacing.small}`,
              borderRadius: "12px",
              fontSize: typography.fontSize.small,
              fontWeight: 500,
              verticalAlign: "middle",
              userSelect: "all",
            },
            "&.is-empty::before": {
              content: `"${placeholder}"`,
              color: colors.textDim,
              float: "left",
              height: 0,
              pointerEvents: "none",
            },
          },
        }}
      />
    </div>
  )
}
