import type { Note, ReverseLookupResult } from '@/types/note'
import { calculateCents } from '@/utils/interval'

const A4_FREQUENCY = 440
const A4_MIDI = 69

/**
 * 根据频率计算对应的 MIDI 编号（可能为小数）
 * 公式：midi = 69 + 12 × log₂(f / 440)
 * @param frequency 输入频率（Hz）
 */
export function frequencyToMidi(frequency: number): number {
  if (frequency <= 0) {
    return 0
  }
  return A4_MIDI + 12 * Math.log2(frequency / A4_FREQUENCY)
}

/**
 * 从音名列表中查找最接近给定 MIDI 编号的音
 * @param notes 音名列表
 * @param midi 目标 MIDI 编号（可为小数）
 */
function findClosestNote(notes: Note[], midi: number): Note {
  const roundedMidi = Math.round(midi)

  let closest = notes[0]
  let minDistance = Math.abs(closest.midi - roundedMidi)

  for (const note of notes) {
    const distance = Math.abs(note.midi - roundedMidi)
    if (distance < minDistance) {
      minDistance = distance
      closest = note
    }
  }

  return closest
}

/**
 * 根据输入的赫兹频率，反查最接近的标准音名，并计算偏差音分数
 * @param inputFrequency 用户输入的频率（Hz）
 * @param notes 十二平均律标准音名列表
 */
export function reverseLookupNote(
  inputFrequency: number,
  notes: Note[],
): ReverseLookupResult | null {
  if (!inputFrequency || inputFrequency <= 0 || !notes.length) {
    return null
  }

  const midi = frequencyToMidi(inputFrequency)
  const closestNote = findClosestNote(notes, midi)

  const centsDeviation = calculateCents(closestNote.frequency, inputFrequency)

  return {
    note: closestNote,
    inputFrequency,
    centsDeviation,
  }
}

/**
 * 格式化偏差音分数显示文本
 * @param cents 偏差音分数
 */
export function formatDeviationCents(cents: number): string {
  const sign = cents >= 0 ? '+' : ''
  return `${sign}${cents.toFixed(2)} 音分`
}

/**
 * 获取偏差描述（偏高/偏低/准确）
 * @param cents 偏差音分数
 */
export function getDeviationDescription(cents: number): string {
  const threshold = 5
  if (Math.abs(cents) < threshold) {
    return '音高准确'
  }
  return cents > 0 ? '偏高' : '偏低'
}
