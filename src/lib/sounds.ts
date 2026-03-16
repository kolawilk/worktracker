// Web Audio API für dezente Sound-Feedback
// Sounds sind dezent, kurz und leise - ideal für UI-Feedback

interface SoundOptions {
  volume?: number
  type?: 'blip' | 'click' | 'chime' | 'arcade'
  frequency?: number
  duration?: number
}

// Erstelle einen einfachen AudioContext
// Dies wird lazy initialisiert bei first playback
let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Play a simple tone using Web Audio API
const playTone = (options: SoundOptions = {}): void => {
  const { volume = 0.1, type = 'blip', frequency = 440, duration = 0.1 } = options
  
  const ctx = getAudioContext()
  
  // Resume context if suspended (iPad requirement)
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  // Sound-Shape basierend auf type
  switch (type) {
    case 'click':
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency * 1.5, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.05)
      break
    case 'chime':
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + 0.3)
      break
    case 'arcade':
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      oscillator.frequency.linearRampToValueAtTime(frequency * 1.2, ctx.currentTime + 0.1)
      break
    case 'blip':
    default:
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      break
  }
  
  // Volume control - dezente Lautstärke
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

// Sound-Configurations für verschiedene Events
const soundConfigs = {
  start: {
    type: 'arcade',
    frequency: 523.25, // C5
    volume: 0.08,
    duration: 0.2,
  } as SoundOptions,
  pause: {
    type: 'blip',
    frequency: 349.23, // F4
    volume: 0.06,
    duration: 0.15,
  } as SoundOptions,
  resume: {
    type: 'blip',
    frequency: 392.00, // G4
    volume: 0.06,
    duration: 0.15,
  } as SoundOptions,
  end: {
    type: 'chime',
    frequency: 261.63, // C4
    volume: 0.1,
    duration: 0.4,
  } as SoundOptions,
}

// Main API - Play sounds by event type
export const playStartSound = (options?: SoundOptions): void => {
  playTone({ ...soundConfigs.start, ...options })
}

export const playPauseSound = (options?: SoundOptions): void => {
  playTone({ ...soundConfigs.pause, ...options })
}

export const playResumeSound = (options?: SoundOptions): void => {
  playTone({ ...soundConfigs.resume, ...options })
}

export const playEndSound = (options?: SoundOptions): void => {
  playTone({ ...soundConfigs.end, ...options })
}

// Play all sounds with one function
export const playSound = (type: 'start' | 'pause' | 'resume' | 'end', options?: SoundOptions): void => {
  switch (type) {
    case 'start':
      playStartSound(options)
      break
    case 'pause':
      playPauseSound(options)
      break
    case 'resume':
      playResumeSound(options)
      break
    case 'end':
      playEndSound(options)
      break
  }
}

// Helper: Check if audio context is available
export const isAudioAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext)
}

// Helper: Check if sound is enabled via localStorage
export const isSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem('worktracker-sound-enabled')
  if (saved === null) return true // Default: sound enabled
  return saved === 'true'
}
