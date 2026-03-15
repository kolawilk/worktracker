import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          ⏱️ Worktracker
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Willkommen!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Das Projekt-Setup ist abgeschlossen. shadcn/ui Komponenten sind bereit.
            </p>
            
            <div className="flex gap-4">
              <Button onClick={() => setCount(c => c + 1)}>
                Count: {count}
              </Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>React 18 + TypeScript (strict mode)</li>
              <li>Vite (fast builds)</li>
              <li>Tailwind CSS</li>
              <li>shadcn/ui Komponenten</li>
              <li>ESLint + Prettier</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
