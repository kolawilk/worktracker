import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Häufige Emojis für diePicker
const commonEmojis = [
  '😀', '😄', '😊', '😎', '😍', '🥰', '🤩', '😂',
  '😎', '🚀', '💻', '📞', '🍕', '🍔', '🍟',
  '🚗', '✈️', '🏠', '💼', '🎮', '📚', '🎨', '🎵',
  '🏃', '🧘', '🍳', '🧹', '💤', '🔥', '⭐', '❤️',
  '✅', '⚠️', '❌', '🛑', '🔔', '📱', '📷', '📺'
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  selectedEmoji?: string
}

const EmojiPicker = React.forwardRef<HTMLDivElement, EmojiPickerProps>(
  ({ onSelect, selectedEmoji }, ref) => {
    const [hoveredEmoji, setHoveredEmoji] = React.useState<string | null>(null)

    const handleEmojiClick = (emoji: string) => {
      onSelect(emoji)
    }

    // Gruppiere Emojis in Reihen zu je 8 Emojis
    const rows = []
    for (let i = 0; i < commonEmojis.length; i += 8) {
      rows.push(commonEmojis.slice(i, i + 8))
    }

    return (
      <div
        ref={ref}
        className="flex flex-col gap-2 rounded-lg border bg-popover p-2"
        aria-label="Emoji Picker"
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap justify-center gap-1.5">
            {row.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 p-0 text-2xl rounded-md transition-all duration-150',
                  'hover:scale-110 hover:bg-accent',
                  selectedEmoji === emoji && 'ring-2 ring-primary bg-accent',
                  hoveredEmoji === emoji && 'scale-110'
                )}
                onClick={() => handleEmojiClick(emoji)}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                onMouseLeave={() => setHoveredEmoji(null)}
                aria-label={`Wähle Emoji ${emoji}`}
                aria-pressed={selectedEmoji === emoji}
              >
                {emoji}
              </Button>
            ))}
          </div>
        ))}
      </div>
    )
  }
)

EmojiPicker.displayName = 'EmojiPicker'

export { EmojiPicker }
