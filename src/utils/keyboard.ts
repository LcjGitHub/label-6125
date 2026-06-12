import type { Note, OctaveLayout } from '@/types/note'

const WHITE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** 黑键在八度内的相对位置（0–1，对应 7 个白键宽度） */
const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 1,
  'D#': 2,
  'F#': 4,
  'G#': 5,
  'A#': 6,
}

/**
 * 从音名解析八度号，如 "C#4" → 4
 * @param name 音名
 */
function parseOctave(name: string): number {
  const match = name.match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

/**
 * 从音名解析音高类，如 "C#4" → "C#"
 * @param name 音名
 */
function parsePitchClass(name: string): string {
  return name.replace(/\d+$/, '')
}

/**
 * 将 C2–B5 音名列表组织为钢琴键盘八度布局
 * @param notes 音名数据
 */
export function buildOctaveLayouts(notes: Note[]): OctaveLayout[] {
  const byOctave = new Map<number, Note[]>()

  for (const note of notes) {
    const octave = parseOctave(note.name)
    const group = byOctave.get(octave) ?? []
    group.push(note)
    byOctave.set(octave, group)
  }

  return [...byOctave.entries()]
    .sort(([a], [b]) => a - b)
    .map(([octave, octaveNotes]) => {
      const whiteKeys = WHITE_ORDER.map((pitch) =>
        octaveNotes.find((n) => parsePitchClass(n.name) === pitch),
      ).filter((n): n is Note => Boolean(n))

      const blackKeys = octaveNotes
        .filter((n) => n.isBlack)
        .map((n) => {
          const pitch = parsePitchClass(n.name)
          const slot = BLACK_KEY_POSITIONS[pitch] ?? 0
          return {
            ...n,
            position: ((slot - 0.5) / 7) * 100,
          }
        })

      return { octave, whiteKeys, blackKeys }
    })
}
