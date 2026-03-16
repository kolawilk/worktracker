import { useState } from 'react'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { TimeEntryList } from '@/components/time-entry/TimeEntryList'
import { TimeEntryDialog } from '@/components/time-entry/TimeEntryDialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatDurationHHMM } from '@/lib/week'

function DayPage() {
  const { timeEntries, updateTimeEntry, deleteTimeEntry } = useTimeEntryStore()
  const { categories } = useCategoryStore()
  
  const [editingEntry, setEditingEntry] = useState<string | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Heutiges Datum (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0]

  // Berechne Gesamtzeit für heute (in Sekunden für formatDurationHHMM)
  const totalSeconds = timeEntries
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => {
      const start = new Date(entry.startTime).getTime()
      const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
      return sum + Math.floor((end - start) / 1000)
    }, 0)

  // Öffne Dialog zum Bearbeiten
  const handleEdit = (entryId: string) => {
    setEditingEntry(entryId)
    setIsDialogOpen(true)
  }

  // Schließe Dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEntry(undefined)
  }

  // Dialog Submit Handler (wird von TimeEntryDialog aufgerufen)
  const handleDialogSubmit = (categoryId: string, startTime: string, endTime: string | null) => {
    if (editingEntry) {
      updateTimeEntry(editingEntry, { categoryId, startTime, endTime })
    }
    handleCloseDialog()
  }

  // Entry löschen
  const handleDelete = (entryId: string) => {
    if (confirm('Zeit-Eintrag wirklich löschen?')) {
      deleteTimeEntry(entryId)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl">
                📅 Tages-Übersicht
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {new Date(today).toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Gesamtzeit</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {formatDurationHHMM(totalSeconds)}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Aktivitäten</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {timeEntries.filter(e => e.date === today).length}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Alle Zeit-Einträge des Tages in chronologischer Reihenfolge
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Einträge */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Zeit-Einträge
          </h2>
          
          <TimeEntryList 
            date={today}
            showEditActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Aktuell laufende Einträge */}
        {timeEntries.some(entry => entry.date === today && !entry.endTime) && (
          <div className="pt-4 border-t">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              🟢 Laufende Einträge
            </h2>
            <div className="space-y-2">
              {timeEntries
                .filter(entry => entry.date === today && !entry.endTime)
                .map(entry => {
                  const category = categories.find(cat => cat.id === entry.categoryId)
                  const start = new Date(entry.startTime)
                  const now = new Date()
                  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000)
                  const durationDisplay = formatDurationHHMM(seconds)  // ✅ Konsistent: Sekunden an formatDurationHHMM übergeben
                  
                  return (
                    <div 
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <span className="text-2xl animate-pulse">🟢</span>
                      <span className="font-medium flex-1">
                        {category?.name || 'Unbekannte Kategorie'}
                      </span>
                      <span className="text-sm font-mono text-primary">
                        {durationDisplay}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Tippe auf die Kacheln unten, um neue Zeit-Einträge zu starten
          </p>
        </div>
      </div>

      {/* Bearbeitungs-Dialog */}
      <TimeEntryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleDialogSubmit}
        initialEntryId={editingEntry}
      />
    </div>
  )
}

export default DayPage
