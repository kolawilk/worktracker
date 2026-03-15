# Feature: Projekt-Setup

**Status:** 📋 Backlog  
**Priority:** P0 (Blocker für alles andere)  
**Assignee:** ACP-Subagent

---

## Beschreibung
Initialer Aufbau des Worktracker-Projekts mit Vite, React, TypeScript und shadcn/ui.

## Akzeptanzkriterien

- [ ] Vite-Projekt mit React + TypeScript erstellt
- [ ] TypeScript strict mode aktiviert
- [ ] shadcn/ui initialisiert und konfiguriert
- [ ] Tailwind CSS eingerichtet
- [ ] Ordnerstruktur gemäß architecture.md angelegt
- [ ] ESLint + Prettier konfiguriert
- [ ] Git-Repo initialisiert mit .gitignore
- [ ] Erster Commit mit "feat: initial project setup"

## Technische Details

```bash
# Vite Projekt erstellen
npm create vite@latest worktracker -- --template react-ts

# shadcn/ui initialisieren
npx shadcn@latest init

# Basis-Komponenten installieren
npx shadcn add button card
```

## Definition of Done
- [ ] `npm run dev` startet ohne Fehler
- [ ] Keine TypeScript-Fehler
- [ ] Code in GitHub gepusht

---

**Created:** 2026-03-15  
**Story Points:** 3
