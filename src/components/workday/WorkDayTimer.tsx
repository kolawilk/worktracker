import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkDayStore } from '@/stores/workDayStore'
import { Clock, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeFormat {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

const formatTime = (ms: number): TimeFormat => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = ms % 1000

  return { hours, minutes, seconds, milliseconds }
}

const padNumber = (num: number, digits: number = 2): string => {
  return num.toString().padStart(digits, '0')
}

const formatDuration = (ms: number): string => {
  const { hours, minutes, seconds } = formatTime(ms)

  if (hours > 0) {
    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`
  }
  return `${padNumber(minutes)}:${padNumber(seconds)}`
}

const formatPauseDuration = (ms: number): string => {
  const { minutes, seconds } = formatTime(ms)
  return `${padNumber(minutes)}:${padNumber(seconds)}`
}

const WorkDayTimer = () => {
  const { currentWorkDay, getTotalWorkTime, getPauseTime } = useWorkDayStore()
  const [displayTime, setDisplayTime] = useState(0)
  const [displayPause, setDisplayPause] = useState(0)

  useEffect(() => {
    // Update immediately on mount or when store changes
    setDisplayTime(getTotalWorkTime())
    setDisplayPause(getPauseTime())

    // If workday is running, update every second
    const updateInterval = setInterval(() => {
      setDisplayTime(getTotalWorkTime())
      setDisplayPause(getPauseTime())
    }, 1000)

    return () => clearInterval(updateInterval)
  }, [currentWorkDay, getTotalWorkTime, getPauseTime])

  // Check if currently paused
  const isPaused = currentWorkDay?.isPaused ?? false

  if (!currentWorkDay) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/20 opacity-75">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl text-muted-foreground flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Arbeitszeit
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-3xl font-mono text-muted-foreground">
            00:00:00
          </p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Coffee className="w-4 h-4" />
            Pause: 00:00
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto shadow-lg border-primary ring-1 ring-primary/20 transition-all duration-300",
      isPaused && "opacity-90"
    )}>
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Aktuelle Arbeitszeit
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-8 space-y-6">
        {/* Main Work Time Display */}
        <div className={cn(
          "text-center transition-all duration-300",
          isPaused ? "opacity-75 blur-[0.5px]" : ""
        )}>
          <div className="flex items-center justify-center gap-2 mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Gesamt Arbeitszeit
          </div>
          <div className={cn(
            "font-mono text-7xl sm:text-8xl font-bold tracking-tighter transition-colors duration-300",
            isPaused 
              ? "text-yellow-600 dark:text-yellow-400" 
              : "text-primary"
          )}>
            {formatDuration(displayTime)}
          </div>
          <div className="mt-2 text-sm text-muted-foreground font-medium">
            {isPaused ? "Zeit pausiert" : "Zeit läuft..."}
          </div>
        </div>

        {/* Pause Time Display */}
        {isPaused && (
          <div className="pt-4 border-t border-dashed border-primary/10">
            <div className="flex items-center justify-center gap-2 mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
              <Coffee className="w-4 h-4" />
              Pausenzeit
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-bold text-yellow-600 dark:text-yellow-400 tracking-tighter">
              {formatPauseDuration(displayPause)}
            </div>
          </div>
        )}

        {/* Total Time Info */}
        {!isPaused && (
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider opacity-75">Pausen</span>
              <span className="font-mono">{formatPauseDuration(displayPause)}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider opacity-75">Restzeit</span>
              <span className="font-mono">
                {displayTime > 28800000 
                  ? "Über 8h" 
                  : "Unter 8h"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { WorkDayTimer }
