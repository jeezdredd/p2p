import { useEffect, useMemo, useRef, useState } from "react"

type Role = "user" | "assistant" | "system"

type ChatMessage = {
  id: string
  role: Exclude<Role, "system">
  content: string
  createdAt: number
}

type ChatResponse = {
  answer: string
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function loadHistory(key: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(Boolean)
  } catch {
    return []
  }
}

function saveHistory(key: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-50)))
  } catch {}
}

export default function AssistantChat() {
  const storageKey = "p2p_assistant_chat_v1"
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(storageKey))
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const siteContext = useMemo(() => {
    return {
      productName: "P2P",
      purpose: "Collaborative learning platform for students.",
      whatItCanHelpWith: [
        "How to use pages and features",
        "Where to find things (navigation)",
        "Explaining rules or flows",
        "Troubleshooting common issues",
      ],
      navigation: [
        { path: "/", title: "Home", description: "Landing / overview" },
        { path: "/dashboard", title: "Dashboard", description: "Your learning overview" },
        { path: "/courses", title: "Courses", description: "Browse and join courses" },
        { path: "/groups", title: "Groups", description: "Study groups and collaboration" },
        { path: "/profile", title: "Profile", description: "Account and preferences" },
      ],
      guidelines: [
        "Answer only about the website and its usage.",
        "If the user asks something not on the website, ask a short clarifying question or say it’s outside the site.",
        "Be concise and give step-by-step instructions when relevant.",
      ],
    }
  }, [])

  useEffect(() => {
    saveHistory(storageKey, messages)
  }, [messages])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    })
  }, [open, messages.length])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, createdAt: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          pageUrl: window.location.href,
          siteContext,
          history: messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        throw new Error(errText || `HTTP ${res.status}`)
      }

      const data = (await res.json()) as ChatResponse
      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.answer || "Sorry — I didn’t get a response. Try again.",
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (e: any) {
      const botMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "I couldn’t reach the assistant server. Please try again in a moment.",
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setLoading(false)
    }
  }

  function clear() {
    setMessages([])
    saveHistory(storageKey, [])
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 9999,
          borderRadius: 999,
          padding: "12px 14px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(20,20,20,0.9)",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
        }}
        aria-label="Open assistant"
      >
        🦝 Assistant
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 18,
            bottom: 72,
            width: 360,
            maxWidth: "calc(100vw - 36px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            zIndex: 9999,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(14,14,16,0.95)",
            color: "white",
            boxShadow: "0 16px 60px rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 18 }}>🦝</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>P2P Assistant</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>Ask me about this website</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={clear}
                style={{
                  borderRadius: 10,
                  padding: "8px 10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  borderRadius: 10,
                  padding: "8px 10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            style={{
              padding: 12,
              overflow: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                Hi! Ask me things like:
                <div style={{ marginTop: 8, opacity: 0.9 }}>
                  • “How do I join a group?”<br />
                  • “Where can I see my courses?”<br />
                  • “What does the dashboard show?”
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user"
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: isUser ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                      whiteSpace: "pre-wrap",
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 13,
                    opacity: 0.85,
                  }}
                >
                  Typing…
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask about P2P…"
              style={{
                flex: 1,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                padding: "10px 12px",
                outline: "none",
                fontSize: 13,
              }}
            />
            <button
              onClick={send}
              disabled={loading || input.trim().length === 0}
              style={{
                borderRadius: 12,
                padding: "10px 12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: loading || input.trim().length === 0 ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.35)",
                color: "white",
                cursor: loading || input.trim().length === 0 ? "not-allowed" : "pointer",
                fontSize: 13,
                minWidth: 70,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
