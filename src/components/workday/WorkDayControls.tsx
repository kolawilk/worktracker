import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkDayStore } from '@/stores/workDayStore'
import { Play, Pause, Square, Coffee, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkDayStatus {
  status: 'not-started' | 'running' | 'paused' | 'ended'
  label: string
  colorClass: string
  icon: React.ReactNode
}

const WorkDayControls = () => {
  const { currentWorkDay, startWorkDay, pauseWorkDay, resumeWorkDay, resumeEndedWorkDay, endWorkDay } = useWorkDayStore()

  // Determine current status
  const getStatus = (): WorkDayStatus => {
    if (!currentWorkDay) {
      return {
        status: 'not-started',
        label: 'Arbeitstag nicht gestartet',
        colorClass: 'text-muted-foreground',
        icon: <Clock className="w-6 h-6" />,
      }
    }
    
    if (currentWorkDay.endTime) {
      return {
        status: 'ended',
        label: 'Arbeitstag beendet',
        colorClass: 'text-gray-500 dark:text-gray-400',
        icon: <Square className="w-6 h-6" />,
      }
    }
    
    if (currentWorkDay.isPaused) {
      return {
        status: 'paused',
        label: 'Pausiert',
        colorClass: 'text-yellow-600 dark:text-yellow-400',
        icon: <Pause className="w-6 h-6" />,
      }
    }
    
    return {
      status: 'running',
      label: 'Arbeitstag läuft',
      colorClass: 'text-green-600 dark:text-green-400',
      icon: <Play className="w-6 h-6" />,
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
    const { currentWorkDay } = useWorkDayStore.getState()
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary ring-1 ring-primary/20">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', 
              status.status === 'running' ? 'bg-green-100 dark:bg-green-900/30' :
              status.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              status.status === 'ended' ? 'bg-gray-100 dark:bg-gray-800' :
              'bg-muted'
            )}>
              {status.icon}
            </div>
            <div>
              <CardTitle className={cn('text-xl', status.colorClass)}>
                {status.label}
              </CardTitle>
              {status.status === 'running' || status.status === 'paused' || status.status === 'ended' ? (
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  ⏱️ {formatDuration(workTime)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Start Button - Only when not started */}
          {status.status === 'not-started' && (
            <Button
              variant="default"
              size="lg"
              className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
              onClick={startWorkDay}
            >
              <Play className="w-6 h-6 mr-2" />
              Arbeitstag starten
            </Button>
          )}

          {/* Pause Button - Only when running */}
          {status.status === 'running' && (
            <Button
              variant="default"
              size="lg"
              className="h-16 text-lg font-semibold bg-yellow-600 hover:bg-yellow-700 shadow-md hover:shadow-lg"
              onClick={pauseWorkDay}
            >
              <Pause className="w-6 h-6 mr-2" />
              Pause
            </Button>
          )}

          {/* Resume Button - Only when paused */}
          {status.status === 'paused' && (
            <Button
              variant="default"
              size="lg"
              className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
              onClick={resumeWorkDay}
            >
              <Play className="w-6 h-6 mr-2" />
              Weiter
            </Button>
          )}

          {/* Resume Button - When day was ended */}
          {status.status === 'ended' && (
            <Button
              variant="default"
              size="lg"
              className="h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
              onClick={resumeEndedWorkDay}
            >
              <Play className="w-6 h-6 mr-2" />
              Tag fortsetzen
            </Button>
          )}

          {/* End Button - Always when started (running or paused) */}
          {(status.status === 'running' || status.status === 'paused') && (
            <Button
              variant="destructive"
              size="lg"
              className="h-16 text-lg font-semibold shadow-md hover:shadow-lg"
              onClick={endWorkDay}
            >
              <Square className="w-6 h-6 mr-2" />
              Arbeitstag beenden
            </Button>
          )}

          {/* Coffee Break hint when paused */}
          {status.status === 'paused' && (
            <div className="flex items-center justify-center">
              <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Kaffeepause?
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { WorkDayControls }
