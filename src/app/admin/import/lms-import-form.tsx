"use client"

import { useState } from "react"

export function LmsImportForm() {
  const [tab, setTab] = useState<"openedx" | "moodle">("openedx")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const [openedxConfig, setOpenedxConfig] = useState({ baseUrl: "", clientId: "", clientSecret: "" })
  const [moodleConfig, setMoodleConfig] = useState({ baseUrl: "", token: "" })

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const endpoint = tab === "openedx" ? "/api/import/openedx" : "/api/import/moodle"
    const config = tab === "openedx" ? openedxConfig : moodleConfig

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      setResult(await res.json())
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("openedx")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "openedx" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Open edX
        </button>
        <button
          onClick={() => setTab("moodle")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "moodle" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Moodle
        </button>
      </div>

      <form onSubmit={handleImport} className="space-y-3 max-w-md">
        {tab === "openedx" ? (
          <>
            <div>
              <label className="text-sm font-medium">Base URL</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                placeholder="https://lms.example.com"
                value={openedxConfig.baseUrl}
                onChange={(e) => setOpenedxConfig({ ...openedxConfig, baseUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Client ID</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                value={openedxConfig.clientId}
                onChange={(e) => setOpenedxConfig({ ...openedxConfig, clientId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Client Secret</label>
              <input
                type="password"
                className="w-full border rounded-md p-2 text-sm"
                value={openedxConfig.clientSecret}
                onChange={(e) => setOpenedxConfig({ ...openedxConfig, clientSecret: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium">Moodle URL</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                placeholder="https://moodle.example.com"
                value={moodleConfig.baseUrl}
                onChange={(e) => setMoodleConfig({ ...moodleConfig, baseUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Web Service Token</label>
              <input
                type="password"
                className="w-full border rounded-md p-2 text-sm"
                value={moodleConfig.token}
                onChange={(e) => setMoodleConfig({ ...moodleConfig, token: e.target.value })}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
        >
          {loading ? "Importing..." : "Import Courses"}
        </button>
      </form>

      {result && (
        <div className={`rounded-md p-3 text-sm ${result.error ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-800"}`}>
          {result.error ? result.error : `Imported: ${result.imported}, Skipped: ${result.skipped}`}
        </div>
      )}
    </div>
  )
}
