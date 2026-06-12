import {
  INTERVAL_NAMES,
  INTERVAL_NAME_TOLERANCE,
  CENTS_PER_SEMITONE,
  type IntervalNameEntry,
} from '@/data/intervalNames'

export interface IntervalMatchResult {
  entry: IntervalNameEntry | null
  deviationCents: number
  isExact: boolean
  withinTolerance: boolean
}

export function matchIntervalByCents(
  cents: number,
  tolerance: number = INTERVAL_NAME_TOLERANCE,
): IntervalMatchResult {
  const absCents = Math.abs(cents)

  if (INTERVAL_NAMES.length === 0) {
    return {
      entry: null,
      deviationCents: absCents,
      isExact: false,
      withinTolerance: false,
    }
  }

  const roundedSemitones = Math.round(absCents / CENTS_PER_SEMITONE)
  const targetCents = roundedSemitones * CENTS_PER_SEMITONE
  const deviation = absCents - targetCents

  const entry =
    INTERVAL_NAMES.find((e) => e.cents === targetCents) ??
    INTERVAL_NAMES[INTERVAL_NAMES.length - 1]

  const isExact = Math.abs(deviation) < 0.001
  const withinTolerance = Math.abs(deviation) <= tolerance

  return {
    entry,
    deviationCents: Number(deviation.toFixed(2)),
    isExact,
    withinTolerance,
  }
}

export function getIntervalName(cents: number | null): string {
  if (cents === null) return '—'
  const result = matchIntervalByCents(cents)
  return result.entry?.name ?? '未匹配'
}

export function formatIntervalDeviation(deviationCents: number): string {
  if (Math.abs(deviationCents) < 0.001) return '标准'
  const sign = deviationCents > 0 ? '+' : ''
  return `${sign}${deviationCents.toFixed(2)} 音分`
}
