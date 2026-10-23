# ZeusX beobachten

Passiver Beobachter für die ZeusX-Seite der Stadt Grafing in der iOS-App [Scripting](https://scriptingapp.github.io/). Er zeichnet die sichtbare Rückmeldung nach einem selbst ausgeführten Tipp auf **Kommt/Geht** auf. Das hilft, Buchungsbestätigung und Saldo später zuverlässig in der ChaxterLog Live Activity anzuzeigen.

## Benutzen

1. In Scripting **Import Remote Scripts** öffnen und `https://github.com/n-bross/chaxterlog-zeus-observer` importieren. Das ist ein separates Skript; ChaxterLog bleibt wie bisher.
2. Beim nächsten regulären Einstempeln dieses Skript starten. Es öffnet ZeusX innerhalb von Scripting.
3. Selbst anmelden und **nur dann Kommt/Geht drücken, wenn du tatsächlich stempeln möchtest**. Der Beobachter löst keine Buchung aus.
4. Warten, bis die Rückmeldung oberhalb des Knopfs vollständig angezeigt wird. Dann die eingeblendete Webseite schließen.
5. **Aufzeichnung kopieren** wählen und den Text zur Auswertung im Chat einfügen. Du kannst ihn auch später kopieren: Skript erneut starten und **Letzte Aufzeichnung kopieren** wählen.

Die Beobachtung funktioniert nur in der Webseite, die dieses Skript geöffnet hat. Sie überwacht keine andere App und keinen separaten Safari-Tab.

## Was aufgezeichnet wird

- Zeitpunkt deines eigenen Kommt/Geht-Tipps.
- Text und ausgewählte Feldklassen aus dem Bereich `TerminalResult` direkt oberhalb des Knopfs, zunächst vor und dann nach deinem Tipp.
- Bis zu 100 Einträge, gespeichert ausschließlich in diesem Scripting-Projekt auf dem iPhone. Keine automatische Übertragung; das Teilen erfolgt erst durch Kopieren.

Login-Eingaben, Kennwörter, Cookies, Sitzungsschlüssel und Netzwerk-Anfragen werden nicht gelesen oder aufgezeichnet. Der Beobachter klickt nichts an, sendet keine Stempel-Anfrage und ändert keine Formulare. Der WebView lädt nur die von dir bediente Website. Eine neue Beobachtung ersetzt die vorige erst, wenn ein neuer Stempelklick erfasst wurde. Die letzte Aufzeichnung kann im Startmenü gelöscht werden.

Das JSON ist ein Diagnoseprotokoll. Es wertet eine Buchung noch nicht als erfolgreich und aktiviert keine automatische Stempelung. Es kann persönliche Angaben enthalten, soweit ZeusX sie in der sichtbaren Buchungsrückmeldung anzeigt.

## Prüfen

Mit Node.js und installiertem TypeScript: `node --test tests/*.test.cjs`.

Die Tests prüfen unter anderem, dass programmatisch ausgelöste Klickereignisse ignoriert werden, normale Seitennavigation/Mutation nichts aufzeichnet, die echte Terminal-Rückmeldung nach einem eigenen Tipp erfasst wird und zusätzliche Datenfelder verworfen werden. Auf einem iPhone ist der Beobachter noch zu prüfen.
