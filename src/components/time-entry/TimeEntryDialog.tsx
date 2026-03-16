import { useState, useEffect } from 'react'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface TimeEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (categoryId: string, startTime: string, endTime: string | null) => void
  initialEntryId?: string
}

function TimeEntryDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEntryId 
}: TimeEntryDialogProps) {
  const { categories } = useCategoryStore()
  const { timeEntries } = useTimeEntryStore()

  const [selectedCategory, setSelectedCategory] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isOngoing, setIsOngoing] = useState(false)

  // Vorausfüllen bei Bearbeitung
  useEffect(() => {
    if (initialEntryId && isOpen) {
      const entry = timeEntries.find(e => e.id === initialEntryId)
      if (entry) {
        setSelectedCategory(entry.categoryId)
        setStartTime(entry.startTime.slice(11, 16)) // HH:MM
        setEndTime(entry.endTime ? entry.endTime.slice(11, 16) : '')
        setIsOngoing(!entry.endTime)
      }
    } else if (isOpen) {
      // Neueinträge: Heute, aktuelle Uhrzeit als Start
      const now = new Date()
      setStartTime(now.toTimeString().slice(0, 5))
      setSelectedCategory(categories[0]?.id || '')
    }
  }, [initialEntryId, isOpen, timeEntries, categories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const today = new Date().toISOString().split('T')[0]
    const fullStartTime = `${today}T${startTime}:00`
    const fullEndTime = isOngoing ? null : `${today}T${endTime}:00`
    
    onSubmit(selectedCategory, fullStartTime, fullEndTime)
  }

  const activeCategories = categories.filter(cat => !cat.isDeleted)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialEntryId ? 'Zeit-Eintrag bearbeiten' : 'Neuer Zeit-Eintrag'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategorie auswählen */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {activeCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                    ${selectedCategory === cat.id 
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'}
                  `}
                >
                  <span className="text-2xl mb-1">{cat.emoji}</span>
                  <span className="text-xs font-medium truncate w-full text-center px-1">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Startzeit */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Startzeit</Label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {/* Endzeit (nicht bei laufenden Einträgen) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="endTime">Endzeit</Label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isOngoing}
                  onChange={(e) => {
                    setIsOngoing(e.target.checked)
                    if (e.target.checked) {
                      setEndTime('')
                    }
                  }}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
               laufend
              </label>
            </div>
            
            {!isOngoing && (
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required={!isOngoing}
              />
            )}
          </div>

          <DialogFooter className="flex-row gap-2 sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              {initialEntryId ? 'Speichern' : 'Hinzufügen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { TimeEntryDialog }
