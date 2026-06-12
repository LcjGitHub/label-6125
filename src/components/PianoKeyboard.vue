<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '@/types/note'
import { buildOctaveLayouts } from '@/utils/keyboard'

const props = defineProps<{
  notes: Note[]
  activeMidi?: number | null
  selectedMidis?: number[]
}>()

const emit = defineEmits<{
  keyClick: [note: Note]
}>()

const octaves = computed(() => buildOctaveLayouts(props.notes))

/**
 * 判断琴键是否为高亮状态
 * @param note 音名数据
 */
function isHighlighted(note: Note): boolean {
  if (props.activeMidi != null && note.midi === props.activeMidi) {
    return true
  }
  return props.selectedMidis?.includes(note.midi) ?? false
}

/**
 * 处理琴键点击
 * @param note 被点击的音
 */
function handleKeyClick(note: Note) {
  emit('keyClick', note)
}
</script>

<template>
  <div class="piano-keyboard">
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
            :class="{ 'key--active': isHighlighted(note) }"
            :aria-label="note.name"
            @click="handleKeyClick(note)"
          >
            <span class="key-label">{{ note.name }}</span>
          </button>
        </div>
        <div class="black-keys">
          <button
            v-for="note in layout.blackKeys"
            :key="note.midi"
            type="button"
            class="key black-key"
            :class="{ 'key--active': isHighlighted(note) }"
            :style="{ left: `${note.position}%` }"
            :aria-label="note.name"
            @click="handleKeyClick(note)"
          />
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

.octave {
  flex: 1;
  min-width: 210px;
}

.octave-label {
  text-align: center;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 6px;
}

.octave-keys {
  position: relative;
}

.white-keys {
  display: flex;
  height: 140px;
}

.key {
  border: none;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.08s ease;
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
}

.white-key:first-child {
  border-radius: 4px 0 4px 4px;
}

.white-key:last-child {
  border-radius: 0 4px 4px 4px;
}

.white-key.key--active {
  background: linear-gradient(180deg, #bbdefb 0%, #90caf9 100%);
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

.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 88px;
  pointer-events: none;
}

.black-key {
  position: absolute;
  width: 58%;
  max-width: 28px;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
  z-index: 1;
}

.black-key.key--active {
  background: linear-gradient(180deg, #1565c0 0%, #0d47a1 100%);
}
</style>
