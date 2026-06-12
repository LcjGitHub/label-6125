import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Note, ReverseLookupResult } from '@/types/note'
import { calculateCents } from '@/utils/interval'
import { reverseLookupNote } from '@/utils/reverseLookup'
import { recalculateAllFrequencies } from '@/utils/frequency'

const DEFAULT_BASE_FREQUENCY = 440

export const useNotesStore = defineStore('notes', () => {
  const baseFrequency = ref<number>(DEFAULT_BASE_FREQUENCY)
  const notes = ref<Note[]>(recalculateAllFrequencies(baseFrequency.value))
  const activeNote = ref<Note | null>(null)
  const selectedNote1 = ref<Note | null>(null)
  const selectedNote2 = ref<Note | null>(null)
  const reverseLookupResult = ref<ReverseLookupResult | null>(null)

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

  const reverseLookupHighlightMidi = computed(() => {
    return reverseLookupResult.value?.note.midi ?? null
  })

  /** 设置钢琴页当前点击的音 */
  function setActiveNote(note: Note) {
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

  return {
    baseFrequency,
    notes,
    activeNote,
    selectedNote1,
    selectedNote2,
    centsDifference,
    reverseLookupResult,
    reverseLookupHighlightMidi,
    setActiveNote,
    selectIntervalNote,
    clearIntervalSelection,
    isNoteSelected,
    doReverseLookup,
    clearReverseLookup,
    setBaseFrequency,
    resetBaseFrequency,
  }
})
