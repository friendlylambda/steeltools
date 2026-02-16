import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    hiddenBlock: {
      toggleHiddenBlock: () => ReturnType
    }
  }
}

export const HiddenBlock = Node.create({
  name: "hiddenBlock",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [
      {
        tag: "div[data-hidden]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-hidden": "true" }), 0]
  },

  addCommands() {
    return {
      toggleHiddenBlock:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.commands.toggleHiddenBlock(),
    }
  },
})
