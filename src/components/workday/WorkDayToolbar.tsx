import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useWorkDayStore } from '@/stores/workDayStore'
import { Play, Pause, Square } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * ⚠️ DEPRECATED - Diese Komponente wird nicht mehr verwendet!
 * 
 * Die Arbeitstag-Steuerung ist nun direkt in App.tsx im Header integriert.
 * Diese Datei wird nur für Referenzzwecke aufbewahrt.
 */
const WorkDayToolbar = () => {
  const { currentWorkDay, startWorkDay, pauseWorkDay, resumeWorkDay, endWorkDay } = useWorkDayStore()
  const [showEndDialog, setShowEndDialog] = useState(false)

  // Determine current status
  const getStatus = () => {
    if (!currentWorkDay) {
      return {
        status: 'not-started' as const,
        label: 'Arbeitstag nicht gestartet',
        colorClass: 'text-muted-foreground',
      }
    }
    
    if (currentWorkDay.endTime) {
      return {
        status: 'ended' as const,
        label: 'Arbeitstag beendet',
        colorClass: 'text-gray-500 dark:text-gray-400',
      }
    }
    
    if (currentWorkDay.isPaused) {
      return {
        status: 'paused' as const,
        label: 'Pausiert',
        colorClass: 'text-yellow-600 dark:text-yellow-400',
      }
    }
    
    return {
      status: 'running' as const,
      label: 'Arbeitstag läuft',
      colorClass: 'text-green-600 dark:text-green-400',
    }
  }

  const status = getStatus()

  // Format duration display
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    // IMMER HH:MM:SS formatieren (nie MM:SS für Gesamtzeit!)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    // Wenn keine Stunden, aber Minuten > 0: 00:MM:SS
    return `${0}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total work time
  const getTotalWorkTime = () => {
    if (!currentWorkDay) {
      return 0
    }

    const start = new Date(currentWorkDay.startTime).getTime()
    const end = currentWorkDay.endTime 
      ? new Date(currentWorkDay.endTime).getTime() 
      : Date.now()
    
    const grossTime = end - start
    const pauseTimeMs = currentWorkDay.totalPauseMinutes * 60000
    
    return grossTime - pauseTimeMs
  }

  const workTime = getTotalWorkTime()

  // Handlers
  const handleStartPause = () => {
    if (status.status === 'not-started') {
      startWorkDay()
    } else if (status.status === 'running') {
      pauseWorkDay()
    } else if (status.status === 'paused') {
      resumeWorkDay()
    }
  }

  const handleEndWorkDay = () => {
    setShowEndDialog(true)
  }

  const confirmEndWorkDay = () => {
    endWorkDay()
    setShowEndDialog(false)
  }

  return (
    <>
      {/* Toolbar Component - DEPRECATED, siehe App.tsx für aktuelle Implementierung */}
      <div className="flex items-center gap-2">
        {/* Left: Start/Pause Button */}
        <div className="flex items-center">
          <Button
            variant="default"
            size="sm"
            className={cn(
              'h-8 px-3 rounded-lg transition-all duration-200',
              status.status === 'not-started' || status.status === 'paused'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : status.status === 'running'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-muted text-muted-foreground'
            )}
            onClick={handleStartPause}
            disabled={status.status === 'ended'}
            aria-label={status.status === 'running' ? 'Pause' : 'Start'}
          >
            {status.status === 'running' ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="sr-only">
              {status.status === 'running' ? 'Pause' : status.status === 'paused' ? 'Weiter' : 'Start'}
            </span>
          </Button>
        </div>

        {/* Center: Time Display */}
        <div className="flex items-center justify-center px-2">
          <div className="text-center">
            <div className={cn(
              'font-mono font-bold text-sm transition-all duration-300',
              status.status === 'ended'
                ? 'text-muted-foreground'
                : status.status === 'paused'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-primary'
            )}>
              {formatDuration(workTime)}
            </div>
          </div>
        </div>

        {/* Right: End Button */}
        <div className="flex items-center">
          <Button
            variant="destructive"
            size="sm"
            className={cn(
              'h-8 px-3 rounded-lg transition-all duration-200',
              'hover:bg-red-700'
            )}
            onClick={handleEndWorkDay}
            disabled={status.status === 'not-started' || status.status === 'ended'}
            aria-label="Arbeitstag beenden"
          >
            <Square className="h-4 w-4" />
            <span className="sr-only">Arbeitstag beenden</span>
          </Button>
        </div>
      </div>

      {/* End Workday Confirmation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Arbeitstag beenden</DialogTitle>
            <DialogDescription>
              Möchtest du den Arbeitstag wirklich beenden? Dieser Vorgang kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              className="mt-2 sm:mt-0"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmEndWorkDay}
              className="ml-2"
            >
              Ja, beenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { WorkDayToolbar }
