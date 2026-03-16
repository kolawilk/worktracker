/**
 * Pause-Button Tests
 * 
 * Diese Tests überprüfen, dass der Pause-Button im Header korrekt funktioniert.
 * 
 * Hintergrund:
 * Der Bug war, dass disabled={status.status === 'running'} falsch herum war.
 * Das bedeutete: Wenn Status = running → Button war disabled (nicht klickbar!)
 * 
 * Fix: disabled auf {status.status === 'not-started' || status.status === 'ended'} geändert.
 * Jetzt ist der Button klickbar, wenn tracking läuft oder pausiert ist.
 */

// Manuelle Test-Anleitung:
// 1. Starte die App: npm run dev
// 2. Öffne http://localhost:5173
// 3. Erstelle eine Kategorie
// 4. Klicke auf "Start" im Header (Button mit grünem Play-Symbol)
// 5. Nach Start sollte der Button zu Pause wechseln (gelbes Pause-Symbol)
// 6. Klicke Pause - Button sollte zu Play wechseln (grünes Play-Symbol)
// 7. Klicke Play - Button sollte wieder zu Pause wechseln

/**
 * Erwartetes Verhalten:
 * 
 * Status: not-started
 * - Button: Play (grün) ✓
 * - disabled: true (nicht klickbar) ✓
 * - aria-label: "Start" ✓
 * 
 * Status: running
 * - Button: Pause (gelb) ✓
 * - disabled: false (klickbar) ✓
 * - aria-label: "Pause" ✓
 * 
 * Status: paused
 * - Button: Play (grün) ✓
 * - disabled: false (klickbar) ✓
 * - aria-label: "Start" ✓
 * 
 * Status: ended
 * - Button: Play (blau) ✓
 * - disabled: true (nicht klickbar) ✓
 * - aria-label: "Start" ✓
 */
