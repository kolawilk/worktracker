# 🚀 Projekt-Kickoff: Worktracker

---

## Projekt-Übersicht

### Was ist das Problem, was gelöst werden soll?
Ich weiß nicht wo meine ganze Arbeitszeit hin ist. Ich möchte genauere Einblicke darin haben, womit ich meine Arbeitszeit verbringe. Und damit meine ich nicht (!) bezüglich welcher Projekte. Sondern eher auf einer Meta-Ebene: Produktive Projektarbeit, Unterstützung Vertrieb, Produktweiterentwicklungen, ...

### Wer sind die Nutzer?
Ich im Home-Office. Mit ständig und schnell wechselnden Tasks. Werde viel angerufen, muss häufig im Kopf springen, wenig Zeit kontinuierlich an einer Aufgabe zu arbeiten.

### Was ist das MVP?

- Web-App, optimiert für iPad mit AlwaysOn-Funktion
- Soll permanent in Tipp-Reichweite am Schreibtisch sein, um auch während des Meetings eine ehrliche und granulare Tracking-Funktion zu ermöglichen
- Anlage von Kategorien, die getrackt werden sollen. Kategorien haben einen Namen und können mit einem Emoji repräsentiert werden.
- Dashboard mit (großen) Kacheln die Kategorien anzeigen (Name + Emoji)
- Wenn eine Kachel gedrückt wird, wird die Zeit getrackt, die in der Kategorie verbracht wird.
- Extra Button(s), um Arbeitstag zu starten, pausieren und zu beenden.
- Auswertung je Woche mit der verbrachten Zeit in den Kategorien


### Was kommt später?

- Interaktivere Auswertemöglichkeiten:
 - definierbare Zeitfenster
 - Auswertung je Wochentag
 - Auswertung je Monat
 - Trends
 - ...
- Login-Funktion, damit Web-App veröffentlicht werden kann und nicht nur von mir als Einzelnutzer genutzt
- "Cloud"-Funktionalität, Datensynchronität zwischen Geräten über Login und Datenbank
- Mood-Tracking am Ende des Arbeitstages: Soll Korrelation zwischen Empfindung des Tages und tatsächlichen Aufgaben ermöglichen. 


---

## Technische Anforderungen

### Hard-Requirements

- Muss auf dem iPad laufen: Für Safari und Chrome optimiert
- AlwaysOn
- Möglichst wenig Energieverbrauch trotz AlwaysOn

### Tech-Stack Präferenzen

- UI bitte mit shadcn/ui Komponenten bauen.

---

## Design & UX

### Look & Feel

Ich denke shadcn/ui gibt schon eine gute Idee vor, wie Look & Feel sein soll.
Bitte melde dich am Anfang regelmäßig mit Screenshots aus dem Headless Browser, damit ich das Design approven kann. Ich möchte dass das von Anfang an in die richtige Richtung läuft.


### Mobile-first?
Ja, optimiert für iPads


### Dark Mode?
Ja! Auswählbar: Hell, Dunkel, System


---
## Priorisierung

### Must-Have (für MVP)
MVP ist oben definiert.

### Should-Have (kurz nach MVP)
Interaktivere Auswertemöglichkeiten
Mood-Tracking

### Nice-to-Have (später)
"Roll-out" Möglichkeit mit Login etc., um Produkt vermarkten zu können.

---

## Sonstiges

### Risiken
<!-- Was könnte schiefgehen? -->

### Abhängigkeiten
<!-- Externe APIs, Genehmigungen, andere Teams -->


### Kommunikation

Updates nur nach größeren Änderungen: Feature/Bugfix ist ausgerollt, ist gefailed, ist geblockt.
Ansonsten Rückfragen erlaubt, aber auf autonome Abarbeitung Achten. Maya ist Projektleiterin und darf selbstständig über Backlog-Abarbeitung entscheiden.

---

## ✅ Checkliste für Agent
Nachdem du dieses Template ausgefüllt hast:

- [x] Agent liest SOUL.md + USER.md
- [x] Agent erstellt Projektstruktur inkl. GitHub Repo
- [x] Agent speichert das als KICKOFF.md im Projekt-Root (darf nicht ins Repo!)
- [x] Agent erstellt README.md mit Vision
- [x] Agent erstellt docs/architecture.md
- [x] Agent erstellt Feature-Backlog in tasks/backlog/
- [x] Agent startet die autonome Bearbeitung mit Subagents.

---

**Projekt gestartet am:** 2026-03-15
**Projektleiterin:** Maya 💻
