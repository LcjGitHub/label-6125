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
const WAVEFORM_STORAGE_KEY = 'waveform'
const VOLUME_STORAGE_KEY = 'volume'
const DURATION_STORAGE_KEY = 'duration'
const VALID_WAVEFORMS: readonly WaveformType[] = ['sine', 'square', 'triangle']
const VALID_DURATIONS: readonly number[] = [0.2, 0.4, 0.6, 1.0, 1.5, 2.0]

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

  watch(waveform, (newWaveform) => {
    setStorageItem(WAVEFORM_STORAGE_KEY, newWaveform)
  })

  watch(volume, (newVolume) => {
    setStorageItem(VOLUME_STORAGE_KEY, newVolume)
  })

  watch(duration, (newDuration) => {
    setStorageItem(DURATION_STORAGE_KEY, newDuration)
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
    validDurations: VALID_DURATIONS,
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
  }
})
