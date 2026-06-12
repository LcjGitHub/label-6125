<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Note } from '@/types/note'
import { buildOctaveLayouts } from '@/utils/keyboard'
import {
  getMidiForKey,
  getShortcutLabels,
  DEFAULT_BASE_MIDI,
  MIN_BASE_MIDI,
  MAX_BASE_MIDI,
} from '@/data/keyMapping'

const props = defineProps<{
  notes: Note[]
  activeMidi?: number | null
  selectedMidis?: number[]
  compact?: boolean
  baseMidi?: number
  enableKeyboard?: boolean
  startOctave?: number
  endOctave?: number
}>()

const emit = defineEmits<{
  keyClick: [note: Note]
  octaveChange: [baseMidi: number]
}>()

const octaves = computed(() =>
  buildOctaveLayouts(props.notes, props.startOctave, props.endOctave),
)

function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1
}

function isMidiInVisibleRange(midi: number): boolean {
  const octave = midiToOctave(midi)
  if (props.startOctave !== undefined && octave < props.startOctave) return false
  if (props.endOctave !== undefined && octave > props.endOctave) return false
  return true
}

const currentBaseMidi = computed(() => props.baseMidi ?? DEFAULT_BASE_MIDI)
const shortcutLabels = computed(() => {
  const all = getShortcutLabels(currentBaseMidi.value)
  const filtered: Record<number, string> = {}
  for (const [midiStr, label] of Object.entries(all)) {
    const midi = Number(midiStr)
    if (isMidiInVisibleRange(midi)) {
      filtered[midi] = label
    }
  }
  return filtered
})

const pressedMidis = ref<Set<number>>(new Set())
const pressedKeys = ref<Set<string>>(new Set())

function isPressed(note: Note): boolean {
  return pressedMidis.value.has(note.midi)
}

function isActive(note: Note): boolean {
  if (props.activeMidi != null && note.midi === props.activeMidi) {
    return true
  }
  return props.selectedMidis?.includes(note.midi) ?? false
}

function handleKeyClick(note: Note) {
  emit('keyClick', note)
}

function stopPropagation(e: Event) {
  e.stopPropagation()
}

function getShortcutLabel(midi: number): string | undefined {
  return shortcutLabels.value[midi]
}

function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.enableKeyboard) return
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

  const midi = getMidiForKey(key, currentBaseMidi.value)
  if (midi === null) return
  if (!isMidiInVisibleRange(midi)) return

  e.preventDefault()
  pressedKeys.value = new Set([...pressedKeys.value, key])
  pressedMidis.value = new Set([...pressedMidis.value, midi])

  const note = props.notes.find(n => n.midi === midi)
  if (note) {
    emit('keyClick', note)
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (!props.enableKeyboard) return

  const key = e.key.toLowerCase()
  if (!pressedKeys.value.has(key)) return

  const midi = getMidiForKey(key, currentBaseMidi.value)

  const newPressedKeys = new Set(pressedKeys.value)
  newPressedKeys.delete(key)
  pressedKeys.value = newPressedKeys

  if (midi !== null) {
    const newPressedMidis = new Set(pressedMidis.value)
    newPressedMidis.delete(midi)
    pressedMidis.value = newPressedMidis
  }
}

function shiftOctave(direction: number) {
  const newBaseMidi = currentBaseMidi.value + direction * 12
  if (newBaseMidi < MIN_BASE_MIDI || newBaseMidi > MAX_BASE_MIDI) return

  const lowestShortcutMidi = newBaseMidi
  const highestShortcutMidi = newBaseMidi + 23
  if (!isMidiInVisibleRange(lowestShortcutMidi) || !isMidiInVisibleRange(highestShortcutMidi)) {
    return
  }

  pressedMidis.value = new Set()
  pressedKeys.value = new Set()
  emit('octaveChange', newBaseMidi)
}

function handleWindowBlur() {
  pressedMidis.value = new Set()
  pressedKeys.value = new Set()
}

function clearPressed() {
  pressedMidis.value = new Set()
  pressedKeys.value = new Set()
}

defineExpose({
  clearPressed,
})

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
</script>

<template>
  <div class="piano-keyboard" :class="{ 'piano-keyboard--compact': compact }">
    <div
      v-for="layout in octaves"
      :key="layout.octave"
      class="octave"
    >
      <div class="octave-label">
        {{ layout.octave }}
      </div>
      <div class="octave-keys">
        <div class="white-keys">
          <button
            v-for="note in layout.whiteKeys"
            :key="note.midi"
            type="button"
            class="key white-key"
            :class="{
              'key--active': isActive(note),
              'key--pressed': isPressed(note),
            }"
            :aria-label="note.name"
            @click="handleKeyClick(note)"
          >
            <span v-if="getShortcutLabel(note.midi)" class="shortcut-label">{{ getShortcutLabel(note.midi) }}</span>
            <span class="key-label">{{ note.name }}</span>
          </button>
        </div>
        <div class="black-keys">
          <button
            v-for="note in layout.blackKeys"
            :key="note.midi"
            type="button"
            class="key black-key"
            :class="{
              'key--active': isActive(note),
              'key--pressed': isPressed(note),
            }"
            :style="{ left: `${note.position}%` }"
            :aria-label="note.name"
            @click.stop="stopPropagation($event); handleKeyClick(note)"
          >
            <span v-if="getShortcutLabel(note.midi)" class="shortcut-label shortcut-label--black">{{ getShortcutLabel(note.midi) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.piano-keyboard {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 4px 16px;
}

.piano-keyboard--compact {
  padding: 4px 2px 8px;
}

.octave {
  flex: 1;
  min-width: 210px;
}

.piano-keyboard--compact .octave {
  min-width: 180px;
}

.octave-label {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 6px;
}

.piano-keyboard--compact .octave-label {
  font-size: 0.7rem;
  margin-bottom: 4px;
}

.octave-keys {
  position: relative;
}

.white-keys {
  display: flex;
  height: 140px;
}

.piano-keyboard--compact .white-keys {
  height: 90px;
}

.key {
  border: none;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.08s ease;
  user-select: none;
  -webkit-user-select: none;
}

.key:active {
  transform: translateY(1px);
}

.white-key {
  flex: 1;
  background: linear-gradient(180deg, #fafafa 0%, #e8e8e8 100%);
  border: 1px solid #bbb;
  border-radius: 0 0 4px 4px;
  box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.white-key:first-child {
  border-radius: 4px 0 4px 4px;
}

.white-key:last-child {
  border-radius: 0 4px 4px 4px;
}

.white-key.key--active {
  background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
}

.white-key.key--pressed {
  background: linear-gradient(180deg, #64b5f6 0%, #42a5f5 100%);
}

.shortcut-label {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6rem;
  font-family: monospace;
  color: rgba(0, 0, 0, 0.4);
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  padding: 0 3px;
  pointer-events: none;
  white-space: nowrap;
  line-height: 1.4;
}

.shortcut-label--black {
  bottom: 4px;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.12);
}

.piano-keyboard--compact .shortcut-label {
  font-size: 0.55rem;
  bottom: 18px;
}

.key-label {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: rgba(0, 0, 0, 0.45);
  pointer-events: none;
  white-space: nowrap;
}

.piano-keyboard--compact .key-label {
  font-size: 0.6rem;
  bottom: 4px;
}

.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  pointer-events: none;
}

.piano-keyboard--compact .black-keys {
  height: 55%;
}

.black-key {
  position: absolute;
  width: 32%;
  max-width: 18px;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
  z-index: 2;
}

.piano-keyboard--compact .black-key {
  width: 28%;
  max-width: 15px;
}

.black-key.key--active {
  background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%);
}

.black-key.key--pressed {
  background: linear-gradient(180deg, #0d47a1 0%, #0a3a82 100%);
}
</style>
