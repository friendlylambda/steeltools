import dedent from "dedent"

/**
 * Convert HTML from a rich text editor to Codex VTT markdown.
 * Handles: headings (h2, h4), bold, italic, bullet lists, victory buttons. Strips other tags.
 */
export const htmlToMarkdown = (html: string): string => {
  if (!html || html === "<p></p>") {
    return ""
  }

  return (
    html
      // Convert victory button spans to markdown syntax (before stripping tags)
      .replace(
        /<span[^>]*data-victory-button="true"[^>]*data-victory-count="(\d+)"[^>]*>[^<]*<\/span>/g,
        (_match, count: string) => {
          const parsed = parseInt(count, 10)
          const label = parsed === 1 ? "Award Heroes 1 Victory" : `Award Heroes ${parsed} Victories`
          return `[[/awardvp ${parsed}|${label}]]`
        },
      )
      // Also handle the reverse attribute order
      .replace(
        /<span[^>]*data-victory-count="(\d+)"[^>]*data-victory-button="true"[^>]*>[^<]*<\/span>/g,
        (_match, count: string) => {
          const parsed = parseInt(count, 10)
          const label = parsed === 1 ? "Award Heroes 1 Victory" : `Award Heroes ${parsed} Victories`
          return `[[/awardvp ${parsed}|${label}]]`
        },
      )
      // Convert h2 headings to ## headers
      .replace(/<h2>([\s\S]*?)<\/h2>/g, "## $1\n")
      // Convert h4 headings to #### subheaders
      .replace(/<h4>([\s\S]*?)<\/h4>/g, "#### $1\n")
      // Convert bullet lists (before stripping tags)
      .replace(/<ul>([\s\S]*?)<\/ul>/g, (_match, content: string) => {
        const items = content.match(/<li>([\s\S]*?)<\/li>/g) ?? []
        const listItems = items
          .map((item) => {
            const text = item.replace(/<\/?li>/g, "").trim()
            return `* ${text}`
          })
          .join("\n")
        return `\n${listItems}`
      })
      // Convert bold
      .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
      .replace(/<b>([\s\S]*?)<\/b>/g, "**$1**")
      // Convert italic
      .replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
      .replace(/<i>([\s\S]*?)<\/i>/g, "*$1*")
      // Convert paragraphs to double newlines (for markdown paragraph breaks)
      .replace(/<\/p><p>/g, "\n\n")
      // Strip remaining p tags
      .replace(/<\/?p>/g, "")
      // Strip any other remaining HTML tags
      .replace(/<[^>]+>/g, "")
      // Clean up extra whitespace
      .trim()
  )
}

interface ContentSection {
  readonly content: string
  readonly isHidden: boolean
}

/**
 * Split HTML into visible and hidden sections.
 * Hidden sections are wrapped in <div data-hidden="true">...</div>
 */
const splitIntoSections = (html: string): readonly ContentSection[] => {
  if (!html || html === "<p></p>") {
    return []
  }

  // Split by hidden blocks, capturing the inner content
  // Results in alternating [visible, hiddenContent, visible, hiddenContent, ...]
  const hiddenBlockRegex = /<div data-hidden="true">([\s\S]*?)<\/div>/g
  const segments = html.split(hiddenBlockRegex)

  return segments
    .map((segment, index) => ({
      content: htmlToMarkdown(segment),
      isHidden: index % 2 === 1, // Odd indices are captured hidden content
    }))
    .filter((section) => section.content !== "")
}

/**
 * Convert HTML with hidden blocks to wrapped markdown sections.
 * Visible content is wrapped in {! }, hidden content in { }.
 * The newlines must be present after the opening brace or Codex will display
 * it as censored spoiler text rather than actually hiding it.
 */
export const htmlToWrappedMarkdown = (html: string): string => {
  const sections = splitIntoSections(html)

  if (sections.length === 0) {
    return ""
  }

  return sections
    .map((section) => {
      const opener = section.isHidden ? "{" : "{!"
      return dedent`
        ${opener}
        ${section.content}
        }`
    })
    .join("\n")
}
