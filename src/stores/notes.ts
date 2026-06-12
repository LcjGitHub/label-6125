import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Note, ReverseLookupResult, WaveformType } from '@/types/note'
import { calculateCents, calculateSemitones, getIntervalDirection } from '@/utils/interval'
import { reverseLookupNote } from '@/utils/reverseLookup'
import { recalculateAllFrequencies } from '@/utils/frequency'
import { getStorageItem, setStorageItem } from '@/utils/storage'
import { useNoteHistoryStore } from './noteHistory'

const DEFAULT_BASE_FREQUENCY = 440
const DEFAULT_WAVEFORM: WaveformType = 'sine'
const DEFAULT_VOLUME = 0.35
const DEFAULT_DURATION = 0.6
const DEFAULT_START_OCTAVE = 2
const DEFAULT_END_OCTAVE = 5
const WAVEFORM_STORAGE_KEY = 'waveform'
const VOLUME_STORAGE_KEY = 'volume'
const DURATION_STORAGE_KEY = 'duration'
const START_OCTAVE_STORAGE_KEY = 'startOctave'
const END_OCTAVE_STORAGE_KEY = 'endOctave'
const VALID_WAVEFORMS: readonly WaveformType[] = ['sine', 'square', 'triangle']
const VALID_DURATIONS: readonly number[] = [0.2, 0.4, 0.6, 1.0, 1.5, 2.0]
const AVAILABLE_OCTAVES: readonly number[] = [2, 3, 4, 5]

function isValidWaveform(value: unknown): value is WaveformType {
  return typeof value === 'string' && VALID_WAVEFORMS.includes(value as WaveformType)
}

function getStoredWaveform(): WaveformType {
  const stored = getStorageItem<unknown>(WAVEFORM_STORAGE_KEY, DEFAULT_WAVEFORM)
  return isValidWaveform(stored) ? stored : DEFAULT_WAVEFORM
}

function isValidVolume(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 1
}

function getStoredVolume(): number {
  const stored = getStorageItem<unknown>(VOLUME_STORAGE_KEY, DEFAULT_VOLUME)
  return isValidVolume(stored) ? stored : DEFAULT_VOLUME
}

function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && VALID_DURATIONS.includes(value)
}

function getStoredDuration(): number {
  const stored = getStorageItem<unknown>(DURATION_STORAGE_KEY, DEFAULT_DURATION)
  return isValidDuration(stored) ? stored : DEFAULT_DURATION
}

function isValidOctave(value: unknown): value is number {
  return typeof value === 'number' && AVAILABLE_OCTAVES.includes(value)
}

function getStoredStartOctave(): number {
  const stored = getStorageItem<unknown>(START_OCTAVE_STORAGE_KEY, DEFAULT_START_OCTAVE)
  return isValidOctave(stored) ? stored : DEFAULT_START_OCTAVE
}

function getStoredEndOctave(): number {
  const stored = getStorageItem<unknown>(END_OCTAVE_STORAGE_KEY, DEFAULT_END_OCTAVE)
  return isValidOctave(stored) ? stored : DEFAULT_END_OCTAVE
}

export const useNotesStore = defineStore('notes', () => {
  const baseFrequency = ref<number>(DEFAULT_BASE_FREQUENCY)
  const notes = ref<Note[]>(recalculateAllFrequencies(baseFrequency.value))
  const activeNote = ref<Note | null>(null)
  const selectedNote1 = ref<Note | null>(null)
  const selectedNote2 = ref<Note | null>(null)
  const reverseLookupResult = ref<ReverseLookupResult | null>(null)
  const waveform = ref<WaveformType>(getStoredWaveform())
  const volume = ref<number>(getStoredVolume())
  const duration = ref<number>(getStoredDuration())
  const startOctave = ref<number>(getStoredStartOctave())
  const endOctave = ref<number>(getStoredEndOctave())

  watch(waveform, (newWaveform) => {
    setStorageItem(WAVEFORM_STORAGE_KEY, newWaveform)
  })

  watch(volume, (newVolume) => {
    setStorageItem(VOLUME_STORAGE_KEY, newVolume)
  })

  watch(duration, (newDuration) => {
    setStorageItem(DURATION_STORAGE_KEY, newDuration)
  })

  watch(startOctave, (newStartOctave) => {
    setStorageItem(START_OCTAVE_STORAGE_KEY, newStartOctave)
    if (endOctave.value < newStartOctave) {
      endOctave.value = newStartOctave
    }
  })

  watch(endOctave, (newEndOctave) => {
    setStorageItem(END_OCTAVE_STORAGE_KEY, newEndOctave)
    if (startOctave.value > newEndOctave) {
      startOctave.value = newEndOctave
    }
  })

  function updateNoteReferences() {
    if (activeNote.value) {
      activeNote.value = notes.value.find(n => n.midi === activeNote.value!.midi) ?? null
    }
    if (selectedNote1.value) {
      selectedNote1.value = notes.value.find(n => n.midi === selectedNote1.value!.midi) ?? null
    }
    if (selectedNote2.value) {
      selectedNote2.value = notes.value.find(n => n.midi === selectedNote2.value!.midi) ?? null
    }
    if (reverseLookupResult.value) {
      const found = notes.value.find(n => n.midi === reverseLookupResult.value!.note.midi)
      if (found) {
        reverseLookupResult.value.note = found
      }
    }
    const noteHistoryStore = useNoteHistoryStore()
    noteHistoryStore.updateHistoryNoteReferences(notes.value)
  }

  watch(baseFrequency, (newFreq) => {
    notes.value = recalculateAllFrequencies(newFreq)
    updateNoteReferences()
  })

  const centsDifference = computed(() => {
    if (!selectedNote1.value || !selectedNote2.value) {
      return null
    }
    return calculateCents(
      selectedNote1.value.frequency,
      selectedNote2.value.frequency,
    )
  })

  const semitoneCount = computed(() => {
    if (centsDifference.value === null) {
      return null
    }
    return calculateSemitones(centsDifference.value)
  })

  const intervalDirection = computed(() => {
    if (centsDifference.value === null) {
      return null
    }
    return getIntervalDirection(centsDifference.value)
  })

  const reverseLookupHighlightMidi = computed(() => {
    return reverseLookupResult.value?.note.midi ?? null
  })

  /** 设置钢琴页当前点击的音 */
  function setActiveNote(note: Note | null) {
    activeNote.value = note
  }

  /**
   * 音程页选择音：依次填入音 1、音 2；已满则重置后从音 1 开始
   * @param note 被选中的音
   */
  function selectIntervalNote(note: Note) {
    if (!selectedNote1.value) {
      selectedNote1.value = note
      return
    }
    if (!selectedNote2.value) {
      selectedNote2.value = note
      return
    }
    selectedNote1.value = note
    selectedNote2.value = null
  }

  /** 清空音程选择 */
  function clearIntervalSelection() {
    selectedNote1.value = null
    selectedNote2.value = null
  }

  /** 判断某音是否已被选中（音程页） */
  function isNoteSelected(note: Note): boolean {
    return (
      selectedNote1.value?.midi === note.midi ||
      selectedNote2.value?.midi === note.midi
    )
  }

  /**
   * 音名反查：根据频率查找最接近的标准音
   * @param frequency 输入频率（Hz）
   */
  function doReverseLookup(frequency: number) {
    reverseLookupResult.value = reverseLookupNote(frequency, notes.value)
  }

  /** 清空反查结果 */
  function clearReverseLookup() {
    reverseLookupResult.value = null
  }

  /**
   * 设置基准音高（A4 的频率，单位 Hz）
   * @param freq 基准频率，默认 440Hz
   */
  function setBaseFrequency(freq: number) {
    baseFrequency.value = freq
  }

  /** 重置基准音高为标准值 440Hz */
  function resetBaseFrequency() {
    baseFrequency.value = DEFAULT_BASE_FREQUENCY
  }

  /**
   * 设置波形音色
   * @param type 波形类型（sine / square / triangle）
   */
  function setWaveform(type: WaveformType) {
    waveform.value = type
  }

  /**
   * 设置音量
   * @param value 音量值（0-1）
   */
  function setVolume(value: number) {
    volume.value = Math.max(0, Math.min(1, value))
  }

  /**
   * 设置持续时间
   * @param value 持续时间（秒）
   */
  function setDuration(value: number) {
    if (VALID_DURATIONS.includes(value)) {
      duration.value = value
    }
  }

  /**
   * 设置起始八度
   * @param value 起始八度值
   */
  function setStartOctave(value: number) {
    if (AVAILABLE_OCTAVES.includes(value)) {
      startOctave.value = value
    }
  }

  /**
   * 设置结束八度
   * @param value 结束八度值
   */
  function setEndOctave(value: number) {
    if (AVAILABLE_OCTAVES.includes(value)) {
      endOctave.value = value
    }
  }

  /**
   * 重置八度范围为默认值（全部四个八度）
   */
  function resetOctaveRange() {
    startOctave.value = DEFAULT_START_OCTAVE
    endOctave.value = DEFAULT_END_OCTAVE
  }

  return {
    baseFrequency,
    notes,
    activeNote,
    selectedNote1,
    selectedNote2,
    centsDifference,
    semitoneCount,
    intervalDirection,
    reverseLookupResult,
    reverseLookupHighlightMidi,
    waveform,
    volume,
    duration,
    startOctave,
    endOctave,
    validDurations: VALID_DURATIONS,
    availableOctaves: AVAILABLE_OCTAVES,
    setActiveNote,
    selectIntervalNote,
    clearIntervalSelection,
    isNoteSelected,
    doReverseLookup,
    clearReverseLookup,
    setBaseFrequency,
    resetBaseFrequency,
    setWaveform,
    setVolume,
    setDuration,
    setStartOctave,
    setEndOctave,
    resetOctaveRange,
  }
})
