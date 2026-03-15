import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrackingStore } from '@/stores/trackingStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { cn } from '@/lib/utils'

interface ActiveTrackerProps {
  className?: string
}

const ActiveTracker = ({ className }: ActiveTrackerProps) => {
  const { session, stopTracking, getCurrentDuration } = useTrackingStore()
  const { categories } = useCategoryStore()
  
  const activeCategory = categories.find(cat => cat.id === session.categoryId)
  const duration = getCurrentDuration()
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!session.isRunning || !session.categoryId) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground text-lg">
          🟢 Keine Kategorie getrackt
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Klicke auf eine Kategorie, um das Tracking zu starten
        </p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary ring-1 ring-primary/20">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-foreground">
            🎯 Aktives Tracking
          </CardTitle>
          {activeCategory && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-2xl" role="img" aria-label={activeCategory.name}>
                {activeCategory.emoji}
              </span>
              <span className="text-sm font-medium text-primary">
                {activeCategory.name}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative text-7xl font-mono font-bold text-foreground tracking-tight">
              {formatDuration(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className="px-8 py-6 text-lg bg-destructive hover:bg-destructive/90"
              onClick={() => stopTracking()}
            >
             ⏹️ Stop Tracking
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {activeCategory?.name} • {new Date(session.startTime!).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ActiveTracker }
