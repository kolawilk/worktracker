import * as React from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  selectedEmoji?: string
}

const EmojiPickerComponent = React.forwardRef<HTMLDivElement, EmojiPickerProps>(
  ({ onSelect }, ref) => {
    const handleEmojiClick = (emojiData: any) => {
      onSelect(emojiData.emoji)
    }

    return (
      <div
        ref={ref}
        className="h-64 w-80 rounded-lg border bg-popover shadow-lg"
        aria-label="Emoji Picker"
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
      </div>
    )
  }
)

EmojiPickerComponent.displayName = 'EmojiPicker'

export { EmojiPickerComponent }
