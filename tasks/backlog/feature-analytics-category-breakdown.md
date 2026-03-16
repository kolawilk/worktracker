# Feature: Analytics Dashboard - Kategorie-basierte Detail-Auswertungen

**Status:** 📋 Backlog  
**Priority:** P2  
**Type:** Feature Enhancement

---

## Beschreibung
Erweiterung des Analytics Dashboards um kategorie-basierte Auswertungen.

## Gewünschte Funktionen

### 1. Wochentags-Auswertung (Bar Chart)
- **Stacked Bars** nach Kategorien
- Jede Kategorie hat eigene Farbe
- **Legende** zeigt Kategorien an
- Summe = Gesamtzeit pro Wochentag

### 2. Monatlicher Trend (Line Chart)
- **Separate Linie** für jede Kategorie
- Nicht nur Gesamtzeit
- Farbcodiert nach Kategorie

### 3. Wöchentlicher Trend (Line Chart)
- **Separate Linie** für jede Kategorie
- Farbcodiert nach Kategorie

### 4. Dynamische Anzeige basierend auf Zeitbereich
- **Wochentags-Auswertung**: Nur wenn Zeitbereich > 2 volle Wochen
- **Monatliche Auswertung**: Nur wenn Zeitbereich > 2 Monate
- **Wöchentliche Auswertung**: Nur wenn Zeitbereich > 2 Wochen
- Anzeigen ausblenden wenn nicht relevant

### 5. Kategorie-Filter
- Filter wirkt sich auf ALLE Charts aus
- Nur gewählte Kategorien werden angezeigt
- "Alle" = alle Kategorien sichtbar

## Betroffene Komponenten
- `src/pages/AnalyticsPage.tsx`
- `src/lib/analytics.ts` - Neue Berechnungsfunktionen
- Chart-Komponenten (Recharts)

## Akzeptanzkriterien
- [ ] Wochentags-Bar-Chart ist gestapelt mit Kategorie-Farben
- [ ] Legende zeigt alle Kategorien an
- [ ] Monatlicher Trend zeigt Linien pro Kategorie
- [ ] Wöchentlicher Trend zeigt Linien pro Kategorie
- [ ] Charts werden dynamisch ein-/ausgeblendet basierend auf Zeitbereich
- [ ] Kategorie-Filter wirkt auf alle Charts
- [ ] Design ist übersichtlich und nicht überladen

---

**Created:** 2026-03-16
**Reporter:** larskrachen
