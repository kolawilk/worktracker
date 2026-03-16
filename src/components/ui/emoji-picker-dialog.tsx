import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface EmojiPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onEmojiSelect: (emoji: string) => void
}

const EmojiPickerDialog = React.forwardRef<
  HTMLDivElement,
  EmojiPickerDialogProps
>(({ isOpen, onClose, onEmojiSelect }, ref) => {
  const onEmojiClick = (emojiData: { emoji: string }) => {
    onEmojiSelect(emojiData.emoji)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={ref} className="max-w-4xl sm:max-w-5xl md:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl">Emoji wählen</DialogTitle>
        </DialogHeader>

        <div className="h-[60vh] w-full overflow-hidden rounded-lg border sm:h-[50vh] md:h-[60vh]">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme={Theme.DARK} 
            width="100%" 
            height="100%"
            searchPlaceholder="Emojis durchsuchen..."
          />
        </div>
      </DialogContent>
    </Dialog>
  )
})

EmojiPickerDialog.displayName = 'EmojiPickerDialog'

export { EmojiPickerDialog }
