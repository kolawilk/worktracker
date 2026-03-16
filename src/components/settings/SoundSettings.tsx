import { useSettingsStore } from '@/stores/settingsStore'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, VolumeX, Bell } from 'lucide-react'

const SoundSettings = () => {
  const { soundEnabled, setSoundEnabled } = useSettingsStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5" />
          Sound-Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {soundEnabled ? <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
            </div>
            <div>
              <Label className="font-medium text-base">Sound bei Aktionen</Label>
              <p className="text-sm text-muted-foreground">
                Spiele dezente Sounds bei Start, Pause und Ende der Arbeitszeit
              </p>
            </div>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
            aria-label="Sound-Feedback aktivieren"
          />
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="mt-0.5">ℹ️</span>
            <span>
              Die Sounds sind sehr dezent (ca. 10% Lautstärke) und nicht aufdringlich. 
              Du kannst sie jederzeit in den Einstellungen aktivieren oder deaktivieren.
            </span>
          </p>
        </div>

        <div className="pt-2 border-t">
          <Label className="text-xs text-muted-foreground mb-2 block">
            Sound-Typen
          </Label>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Start: Arcade-Blip</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Pause: Kurzes Blip</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Weiter: Blip</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Ende: Chime</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { SoundSettings }
