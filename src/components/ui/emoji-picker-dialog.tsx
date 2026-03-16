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
      <DialogContent 
        ref={ref} 
        className="max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] p-0 overflow-hidden border-white/20 bg-black/40 backdrop-blur-xl"
      >
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-xl sm:text-2xl text-white/90">Emoji wählen</DialogTitle>
        </DialogHeader>

        <div className="w-full overflow-hidden emoji-picker-container">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme={Theme.DARK}
            width="100%" 
            height="400px"
            searchPlaceholder="Emojis durchsuchen..."
            lazyLoadEmojis={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
})

EmojiPickerDialog.displayName = 'EmojiPickerDialog'

export { EmojiPickerDialog }
