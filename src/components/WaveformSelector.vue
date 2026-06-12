<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'
import type { WaveformType } from '@/types/note'

const notesStore = useNotesStore()
const { waveform } = storeToRefs(notesStore)

interface WaveformOption {
  value: WaveformType
  label: string
  icon: string
}

const waveformOptions: WaveformOption[] = [
  { value: 'sine', label: '正弦波', icon: 'mdi-sine-wave' },
  { value: 'square', label: '方波', icon: 'mdi-square-wave' },
  { value: 'triangle', label: '三角波', icon: 'mdi-triangle-wave' },
]
</script>

<template>
  <div class="waveform-selector">
    <div class="waveform-selector__row">
      <v-icon size="20" class="text-medium-emphasis">
        mdi-waveform
      </v-icon>
      <span class="waveform-selector__label text-subtitle-2 text-medium-emphasis">
        音色波形
      </span>
      <v-btn-toggle
        v-model="waveform"
        class="waveform-selector__toggle"
        density="comfortable"
        mandatory
        role="radiogroup"
        aria-label="选择波形音色"
      >
        <v-btn
          v-for="option in waveformOptions"
          :key="option.value"
          :value="option.value"
          :prepend-icon="option.icon"
          size="small"
          variant="tonal"
          role="radio"
          :aria-checked="waveform === option.value"
          :aria-label="`${option.label}波形`"
        >
          {{ option.label }}
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<style scoped>
.waveform-selector {
  user-select: none;
}

.waveform-selector__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.waveform-selector__label {
  margin: 0 12px 0 8px;
}

.waveform-selector__toggle {
  margin-left: 4px;
}
</style>
