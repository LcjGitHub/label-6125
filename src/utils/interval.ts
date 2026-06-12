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
