import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Note, NoteHistoryItem } from '@/types/note'
import { getStorageItem, setStorageItem } from '@/utils/storage'

const MAX_HISTORY_ITEMS = 10
const STORAGE_KEY = 'noteHistory'

export const useNoteHistoryStore = defineStore('noteHistory', () => {
  const history = ref<NoteHistoryItem[]>(getStorageItem<NoteHistoryItem[]>(STORAGE_KEY, []))

  watch(history, (newHistory) => {
    setStorageItem(STORAGE_KEY, newHistory)
  }, { deep: true })

  function addToHistory(note: Note) {
    const item: NoteHistoryItem = {
      note: { ...note },
      timestamp: Date.now(),
    }
    history.value.unshift(item)
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }
  }

  function clearHistory() {
    history.value = []
  }

  function updateHistoryNoteReferences(notes: Note[]) {
    history.value = history.value.map(item => {
      const found = notes.find(n => n.midi === item.note.midi)
      if (found) {
        return {
          ...item,
          note: { ...found },
        }
      }
      return item
    })
  }

  return {
    history,
    addToHistory,
    clearHistory,
    updateHistoryNoteReferences,
  }
})
