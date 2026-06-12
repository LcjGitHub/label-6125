import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'
import type { Note } from '@/types/note'
import {
  DEFAULT_BASE_MIDI,
  MIN_BASE_MIDI,
  MAX_BASE_MIDI,
  getMidiForKey,
  getShortcutLabels,
} from '@/data/keyMapping'

export function useKeyboardPlay(options: {
  notes: Ref<Note[]>
  onNotePlay: (note: Note) => void
}) {
  const octaveOffset = ref(0)
  const pressedKeys = ref(new Set<string>())
  const activeMidis = ref(new Set<number>())

  const baseMidi = computed(() => DEFAULT_BASE_MIDI + octaveOffset.value * 12)
  const shortcutLabels = computed(() => getShortcutLabels(baseMidi.value))
  const activeMidiList = computed(() => [...activeMidis.value])

  function isInputElement(element: EventTarget | null): boolean {
    if (!element || !(element instanceof HTMLElement)) return false
    const tag = element.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (isInputElement(e.target)) return
    if (e.repeat) return

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      shiftOctave(-1)
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      shiftOctave(1)
      return
    }

    const key = e.key.toLowerCase()
    if (pressedKeys.value.has(key)) return

    const midi = getMidiForKey(key, baseMidi.value)
    if (midi === null) return

    e.preventDefault()
    pressedKeys.value = new Set([...pressedKeys.value, key])
    activeMidis.value = new Set([...activeMidis.value, midi])

    const note = options.notes.value.find(n => n.midi === midi)
    if (note) {
      options.onNotePlay(note)
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase()
    if (!pressedKeys.value.has(key)) return

    const midi = getMidiForKey(key, baseMidi.value)

    const newPressed = new Set(pressedKeys.value)
    newPressed.delete(key)
    pressedKeys.value = newPressed

    if (midi !== null) {
      const newActive = new Set(activeMidis.value)
      newActive.delete(midi)
      activeMidis.value = newActive
    }
  }

  function shiftOctave(direction: number) {
    const newBaseMidi = baseMidi.value + direction * 12
    if (newBaseMidi >= MIN_BASE_MIDI && newBaseMidi <= MAX_BASE_MIDI) {
      octaveOffset.value += direction
      activeMidis.value = new Set()
      pressedKeys.value = new Set()
    }
  }

  function handleWindowBlur() {
    activeMidis.value = new Set()
    pressedKeys.value = new Set()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleWindowBlur)
  })

  return {
    octaveOffset: computed(() => octaveOffset.value),
    baseMidi,
    shortcutLabels,
    activeMidiList,
  }
}
