import type { WaveformType } from '@/types/note'

let audioContext: AudioContext | null = null

/**
 * 获取或创建 Web Audio API 上下文（需用户交互后解锁）
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/**
 * 使用指定波形振荡器播放单音
 * @param frequency 频率（Hz）
 * @param duration 持续时间（秒）
 * @param waveform 波形类型（sine / square / triangle），默认 sine
 */
export async function playTone(
  frequency: number,
  duration = 0.6,
  waveform: WaveformType = 'sine',
): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = waveform
  oscillator.frequency.value = frequency

  const now = ctx.currentTime
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.35, now + 0.02)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}
