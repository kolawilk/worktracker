import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { Category } from '@/types'

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, emoji: string, color?: string) => void
  initialCategory?: Category
  mode?: 'create' | 'edit'
}

const CategoryDialog = React.forwardRef<HTMLDivElement, CategoryDialogProps>(
  ({ isOpen, onClose, onSubmit, initialCategory, mode = 'create' }, ref) => {
    const [name, setName] = React.useState('')
    const [emoji, setEmoji] = React.useState('')
    const [color, setColor] = React.useState('')

    React.useEffect(() => {
      if (isOpen) {
        if (initialCategory) {
          setName(initialCategory.name)
          setEmoji(initialCategory.emoji)
          setColor(initialCategory.color || '')
        } else {
          setName('')
          setEmoji('')
          setColor('')
        }
      }
    }, [isOpen, initialCategory])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (name.trim() && emoji.trim()) {
        onSubmit(name.trim(), emoji.trim(), color.trim() || undefined)
        onClose()
      }
    }

    const handleEmojiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // Allow only the first emoji character
      if (value.length <= 2) {
        setEmoji(value)
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent ref={ref} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Neue Kategorie' : 'Kategorie bearbeiten'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Erstelle eine neue Kategorie für deine Zeiterfassung.'
                : 'Passe die Kategorie an deine Bedürfnisse an.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" z.B. Arbeit, Privat, Projekt X"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-emoji">Emoji</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="category-emoji"
                    value={emoji}
                    onChange={handleEmojiInput}
                    placeholder=" z.B. 💼, 🏠, 📊"
                    maxLength={2}
                    required
                  />
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-md border bg-accent text-2xl"
                    aria-hidden="true"
                  >
                    {emoji || '❓'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-color">Farbe (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  title="Kategorie-Farbe wählen"
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  id="category-color-text"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#FF5733"
                  className="flex-1"
                />
              </div>
            </div>

            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={!name.trim() || !emoji.trim()}>
                {mode === 'create' ? 'Speichern' : 'Änderungen speichern'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

CategoryDialog.displayName = 'CategoryDialog'

export { CategoryDialog }
