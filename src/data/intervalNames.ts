export interface IntervalNameEntry {
  semitones: number
  cents: number
  name: string
  category: '单音程' | '复音程'
}

const CENTS_PER_SEMITONE = 100
const CENTS_PER_OCTAVE = 1200

const simpleIntervals: Omit<IntervalNameEntry, 'cents'>[] = [
  { semitones: 0, name: '纯一度', category: '单音程' },
  { semitones: 1, name: '小二度', category: '单音程' },
  { semitones: 2, name: '大二度', category: '单音程' },
  { semitones: 3, name: '小三度', category: '单音程' },
  { semitones: 4, name: '大三度', category: '单音程' },
  { semitones: 5, name: '纯四度', category: '单音程' },
  { semitones: 6, name: '增四度 / 减五度', category: '单音程' },
  { semitones: 7, name: '纯五度', category: '单音程' },
  { semitones: 8, name: '小六度', category: '单音程' },
  { semitones: 9, name: '大六度', category: '单音程' },
  { semitones: 10, name: '小七度', category: '单音程' },
  { semitones: 11, name: '大七度', category: '单音程' },
  { semitones: 12, name: '纯八度', category: '单音程' },
]

const compoundPrefixMap: Record<number, string> = {
  13: '小九度',
  14: '大九度',
  15: '小十度',
  16: '大十度',
  17: '纯十一度',
  18: '增十一度 / 减十二度',
  19: '纯十二度',
  20: '小十三度',
  21: '大十三度',
  22: '小十四度',
  23: '大十四度',
  24: '两个八度',
}

function generateAllIntervals(maxSemitones = 24): IntervalNameEntry[] {
  const result: IntervalNameEntry[] = []

  for (const s of simpleIntervals) {
    result.push({
      ...s,
      cents: s.semitones * CENTS_PER_SEMITONE,
    })
  }

  for (let semitones = 13; semitones <= maxSemitones; semitones++) {
    const name =
      compoundPrefixMap[semitones] ??
      generateGenericCompoundName(semitones)
    result.push({
      semitones,
      cents: semitones * CENTS_PER_SEMITONE,
      name,
      category: '复音程',
    })
  }

  return result
}

function generateGenericCompoundName(semitones: number): string {
  const octaves = Math.floor(semitones / 12)
  const remainder = semitones % 12
  const base = simpleIntervals.find((s) => s.semitones === remainder)
  if (!base) return `${octaves}个八度 + 未知`
  return `${octaves}个八度 + ${base.name}`
}

export const INTERVAL_NAMES: IntervalNameEntry[] = generateAllIntervals(36)

export const INTERVAL_NAME_TOLERANCE = 50

export { CENTS_PER_SEMITONE, CENTS_PER_OCTAVE }
