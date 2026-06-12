import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import notesData from '@/mock/notes.json'
import type { Note, ReverseLookupResult } from '@/types/note'
import { calculateCents } from '@/utils/interval'
import { reverseLookupNote } from '@/utils/reverseLookup'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>(notesData as Note[])
  const activeNote = ref<Note | null>(null)
  const selectedNote1 = ref<Note | null>(null)
  const selectedNote2 = ref<Note | null>(null)
  const reverseLookupResult = ref<ReverseLookupResult | null>(null)

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

  return {
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
  }
})
