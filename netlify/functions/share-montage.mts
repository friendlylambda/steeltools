import { getStore } from "@netlify/blobs"
import { nanoid } from "nanoid"
import { sharePayloadSchema } from "../../src/montagemaker/utilities/share"

// Montages are ~2-10KB of JSON; anything near this cap is not a real montage.
const MAX_PAYLOAD_BYTES = 100_000

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

export default async (request: Request): Promise<Response> => {
  const store = getStore({ name: "montage-shares", consistency: "strong" })

  if (request.method === "POST") {
    const bodyText = await request.text()
    if (bodyText.length <= MAX_PAYLOAD_BYTES) {
      const payload = ((): unknown => {
        try {
          return JSON.parse(bodyText)
        } catch {
          return null
        }
      })()
      const parsed = sharePayloadSchema.safeParse(payload)
      if (parsed.success) {
        const shareId = nanoid(10)
        // Stored as the sender's original JSON (not the parsed/normalized form)
        // so blobs stay human-readable and faithful when looked up via the
        // Netlify UI or `netlify blobs:get montage-shares <id>`.
        await store.set(shareId, bodyText, {
          metadata: {
            title: parsed.data.montage.title.slice(0, 100),
            sharedAt: new Date().toISOString(),
          },
        })
        return jsonResponse(200, { id: shareId })
      } else {
        return jsonResponse(400, { error: "Not a valid montage share payload" })
      }
    } else {
      return jsonResponse(413, { error: "Montage too large to share" })
    }
  } else if (request.method === "GET") {
    const shareId = new URL(request.url).searchParams.get("id")
    if (shareId) {
      const stored = await store.get(shareId)
      if (stored !== null) {
        return new Response(stored, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            // Shares are immutable once created, so let the CDN keep them.
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      } else {
        return jsonResponse(404, { error: "Share not found" })
      }
    } else {
      return jsonResponse(400, { error: "Missing id" })
    }
  } else {
    return jsonResponse(405, { error: "Method not allowed" })
  }
}
