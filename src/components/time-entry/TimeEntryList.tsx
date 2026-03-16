import { useMemo } from 'react'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatDurationHHMM } from '@/lib/week'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Clock4, Trash2 } from 'lucide-react'

interface TimeEntryListProps {
  date?: string
  showEditActions?: boolean
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
}

function TimeEntryList({ 
  date = new Date().toISOString().split('T')[0],
  showEditActions = true,
  onEdit,
  onDelete
}: TimeEntryListProps) {
  const { timeEntries } = useTimeEntryStore()
  const { categories } = useCategoryStore()

  // Filter und Sortierung: Heutige Einträge, chronologisch sortiert (älteste zuerst)
  const todaysEntries = useMemo(() => {
    const filtered = timeEntries
      .filter(entry => entry.date === date)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    return filtered
  }, [timeEntries, date])

  // Zeit berechnen
  const calculateDuration = (entry: typeof timeEntries[0]): number => {
    const start = new Date(entry.startTime).getTime()
    const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
    return Math.floor((end - start) / 1000)
  }

  const getCategory = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  if (todaysEntries.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground text-lg">Keine Zeit-Einträge für heute</p>
        <p className="text-muted-foreground text-sm mt-2">
          Starte das Tracking für eine Kategorie, um hier Einträge zu sehen
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todaysEntries.map((entry) => {
        const category = getCategory(entry.categoryId)
        const durationSeconds = calculateDuration(entry)
        const durationDisplay = formatDurationHHMM(durationSeconds)
        
        return (
          <Card 
            key={entry.id} 
            className="hover:shadow-md transition-shadow group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                {/* Kategorie-Emoji und Name */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0">
                    {category?.emoji || '📁'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {category?.name || 'Unbekannte Kategorie'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {new Date(entry.startTime).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <span className="opacity-50">—</span>
                      {entry.endTime ? (
                        <>
                          <span>
                            {new Date(entry.endTime).toLocaleTimeString('de-DE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span className="opacity-50">({durationDisplay})</span>
                        </>
                      ) : (
                        <span className="text-primary font-medium">laufend</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {showEditActions && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(entry.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        title="Bearbeiten"
                      >
                        <Clock4 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(entry.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { TimeEntryList }
