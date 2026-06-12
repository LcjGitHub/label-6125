import type { Note } from '@/types/note'
import notesData from '@/mock/notes.json'

const A4_MIDI = 69

export function calculateFrequency(midi: number, baseFreq: number): number {
  const semitones = midi - A4_MIDI
  return baseFreq * Math.pow(2, semitones / 12)
}

export function recalculateAllFrequencies(baseFreq: number): Note[] {
  return notesData.map((note) => ({
    ...note,
    frequency: Math.round(calculateFrequency(note.midi, baseFreq) * 100) / 100,
  }))
}
