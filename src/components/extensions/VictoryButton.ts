import { Node, mergeAttributes } from "@tiptap/core"

export interface VictoryButtonOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    victoryButton: {
      insertVictoryButton: (count: number) => ReturnType
    }
  }
}

export const VictoryButton = Node.create<VictoryButtonOptions>({
  name: "victoryButton",
  group: "inline",
  inline: true,
  atom: true, // Treated as a single unit, can't place cursor inside

  addAttributes() {
    return {
      count: {
        default: 1,
        parseHTML: (element) => parseInt(element.getAttribute("data-victory-count") ?? "1", 10),
        renderHTML: (attributes) => ({
          "data-victory-count": attributes["count"],
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "span[data-victory-button]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const count = HTMLAttributes["data-victory-count"] ?? 1
    const label = count === 1 ? "1 Victory" : `${count} Victories`

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-victory-button": "true",
        "data-victory-count": count,
        contenteditable: "false",
      }),
      label,
    ]
  },

  addCommands() {
    return {
      insertVictoryButton:
        (count: number) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { count },
          })
        },
    }
  },
})
