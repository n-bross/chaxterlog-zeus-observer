import { Script } from "scripting"
import { OBSERVER_SCRIPT, normalizeObservation, type Observation } from "./observer"

const URL = "https://zeiterfassung.grafing.de/ZeusX/content/workspace.aspx?id=ac6ee697-ebcd-4323-9acb-cafb0303a9ff"
const KEY = "zeus-observer.records.v1"
const LIMIT = 100

async function copy(records: Observation[]) {
  await Pasteboard.setString(JSON.stringify({ schema: "zeus-observation/v1", records }, null, 2))
  await Dialog.alert({ title: "Aufzeichnung kopiert", message: "Du kannst sie jetzt im Chat einfügen. Sie enthält die sichtbare Terminal-Rückmeldung, aber keine Login-Eingaben oder Cookies." })
}

async function main() {
  const saved = Storage.get<Observation[]>(KEY) ?? []
  if (saved.length) {
    const choice = await Dialog.actionSheet({ title: "ZeusX beobachten", message: `${saved.length} Einträge lokal gespeichert.`, actions: [
      { label: "Neue Beobachtung starten" }, { label: "Letzte Aufzeichnung kopieren" }, { label: "Aufzeichnung löschen" },
    ] })
    if (choice === 1) return copy(saved)
    if (choice === 2) { Storage.remove(KEY); return }
    if (choice !== 0) return
  }
  const records: Observation[] = []
  const browser = new WebViewController({ ephemeral: true })
  let timer: ReturnType<typeof setTimeout> | undefined
  let installing = false
  let closed = false
  try {
    await browser.addScriptMessageHandler("zeusObservation", (input: unknown) => {
      if (closed || records.length >= LIMIT) return
      const record = normalizeObservation(input)
      if (!record) return
      records.push(record)
      // Save immediately, so closing Scripting does not discard an already captured response.
      Storage.set(KEY, records.slice())
    })
    browser.shouldAllowRequest = async ({ url }) => url.startsWith("https://zeiterfassung.grafing.de/")
    if (!await browser.loadURL(URL)) {
      await Dialog.alert({ title: "ZeusX nicht erreichbar", message: "Es wurde nichts aufgezeichnet." })
      return
    }
    const install = async () => {
      if (closed || installing) return
      installing = true
      try { await browser.evaluateJavaScript(OBSERVER_SCRIPT) } catch { /* navigation replaces the document */ }
      finally { installing = false }
    }
    // Login and navigation replace the document; reinstall in the new page without interacting.
    await install()
    // Scripting guarantees setTimeout/clearTimeout, but does not provide setInterval.
    const tick = async () => {
      await install()
      if (!closed) timer = setTimeout(() => { void tick() }, 250)
    }
    timer = setTimeout(() => { void tick() }, 250)
    await browser.present({ fullscreen: true, navigationTitle: "ZeusX · Beobachtung" })
  } finally {
    closed = true
    if (timer !== undefined) clearTimeout(timer)
    browser.dispose()
  }
  if (!records.length) {
    await Dialog.alert({ title: "Keine Stempelung beobachtet", message: "Es wurde kein eigener Tipp auf Kommt/Geht erfasst. Eine frühere Aufzeichnung bleibt gespeichert." })
    return
  }
  const choice = await Dialog.actionSheet({ title: "Beobachtung gespeichert", message: `${records.length} Einträge liegen nur auf diesem iPhone.`, actions: [
    { label: "Aufzeichnung kopieren" }, { label: "Später kopieren" },
  ] })
  if (choice === 0) await copy(records)
}

main().catch(() => Dialog.alert({
  title: "Beobachtung unterbrochen",
  message: "Bereits erfasste Einträge bleiben lokal gespeichert. Starte das Skript erneut, um sie zu kopieren.",
})).finally(() => Script.exit())
