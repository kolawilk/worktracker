import { SoundSettings } from '@/components/settings/SoundSettings'

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚙️</span>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
      </div>
      
      <div className="grid gap-6 max-w-2xl">
        <SoundSettings />
      </div>
    </div>
  )
}

export default SettingsPage
