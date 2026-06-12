import type { Note } from '@/types/note'

export interface KeyMapEntry {
  key: string
  semitoneOffset: number
  isBlack: boolean
}

export const KEY_MAP: KeyMapEntry[] = [
  { key: 'z', semitoneOffset: 0, isBlack: false },
  { key: 's', semitoneOffset: 1, isBlack: true },
  { key: 'x', semitoneOffset: 2, isBlack: false },
  { key: 'd', semitoneOffset: 3, isBlack: true },
  { key: 'c', semitoneOffset: 4, isBlack: false },
  { key: 'v', semitoneOffset: 5, isBlack: false },
  { key: 'g', semitoneOffset: 6, isBlack: true },
  { key: 'b', semitoneOffset: 7, isBlack: false },
  { key: 'h', semitoneOffset: 8, isBlack: true },
  { key: 'n', semitoneOffset: 9, isBlack: false },
  { key: 'j', semitoneOffset: 10, isBlack: true },
  { key: 'm', semitoneOffset: 11, isBlack: false },
  { key: 'q', semitoneOffset: 12, isBlack: false },
  { key: '2', semitoneOffset: 13, isBlack: true },
  { key: 'w', semitoneOffset: 14, isBlack: false },
  { key: '3', semitoneOffset: 15, isBlack: true },
  { key: 'e', semitoneOffset: 16, isBlack: false },
  { key: 'r', semitoneOffset: 17, isBlack: false },
  { key: '5', semitoneOffset: 18, isBlack: true },
  { key: 't', semitoneOffset: 19, isBlack: false },
  { key: '6', semitoneOffset: 20, isBlack: true },
  { key: 'y', semitoneOffset: 21, isBlack: false },
  { key: '7', semitoneOffset: 22, isBlack: true },
  { key: 'u', semitoneOffset: 23, isBlack: false },
]

export const DEFAULT_BASE_MIDI = 48
export const MIN_BASE_MIDI = 36
export const MAX_BASE_MIDI = 60
export const MIDI_MIN = 36
export const MIDI_MAX = 83

export function getMidiForKey(key: string, baseMidi: number): number | null {
  const entry = KEY_MAP.find(e => e.key === key)
  if (!entry) return null
  const midi = baseMidi + entry.semitoneOffset
  if (midi < MIDI_MIN || midi > MIDI_MAX) return null
  return midi
}

export function getShortcutLabels(baseMidi: number): Record<number, string> {
  const labels: Record<number, string> = {}
  for (const entry of KEY_MAP) {
    const midi = baseMidi + entry.semitoneOffset
    if (midi >= MIDI_MIN && midi <= MIDI_MAX) {
      labels[midi] = entry.key.toUpperCase()
    }
  }
  return labels
}

export function getShortcutNoteNames(baseMidi: number, notes: Note[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const entry of KEY_MAP) {
    const midi = baseMidi + entry.semitoneOffset
    if (midi >= MIDI_MIN && midi <= MIDI_MAX) {
      const note = notes.find(n => n.midi === midi)
      if (note) {
        map[entry.key] = note.name
      }
    }
  }
  return map
}

export function getLowerOctaveKeys(): KeyMapEntry[] {
  return KEY_MAP.filter(e => e.semitoneOffset < 12)
}

export function getUpperOctaveKeys(): KeyMapEntry[] {
  return KEY_MAP.filter(e => e.semitoneOffset >= 12)
}
