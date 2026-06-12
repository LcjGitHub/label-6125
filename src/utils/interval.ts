/**
 * 计算两个频率之间的音程差（cents）
 * 公式：cents = 1200 × log₂(f₂ / f₁)
 * @param f1 较低或基准频率（Hz）
 * @param f2 较高或对比频率（Hz）
 */
export function calculateCents(f1: number, f2: number): number {
  if (f1 <= 0 || f2 <= 0) {
    return 0
  }
  return 1200 * Math.log2(f2 / f1)
}

/**
 * 格式化 cents 显示文本
 * @param cents 音程差（cents）
 */
export function formatCents(cents: number): string {
  const sign = cents >= 0 ? '+' : ''
  return `${sign}${cents.toFixed(2)} 音分`
}

/**
 * 根据音分差计算半音数目
 * 公式：半音数 = 音分差 / 100
 * @param cents 音程差（cents）
 */
export function calculateSemitones(cents: number): number {
  return cents / 100
}

/**
 * 格式化半音数显示文本
 * @param semitones 半音数目
 */
export function formatSemitones(semitones: number): string {
  const sign = semitones >= 0 ? '+' : ''
  return `${sign}${semitones.toFixed(2)} 半音`
}

/**
 * 判断音程方向
 * @param cents 音程差（cents）
 * @returns 'ascending'（升高）| 'descending'（降低）| 'unison'（同度）
 */
export function getIntervalDirection(cents: number): 'ascending' | 'descending' | 'unison' {
  if (cents > 0) return 'ascending'
  if (cents < 0) return 'descending'
  return 'unison'
}

/**
 * 格式化音程方向说明文本
 * @param direction 音程方向
 */
export function formatDirection(direction: 'ascending' | 'descending' | 'unison'): string {
  switch (direction) {
    case 'ascending':
      return '音程升高'
    case 'descending':
      return '音程降低'
    case 'unison':
      return '同度（无升降）'
  }
}
