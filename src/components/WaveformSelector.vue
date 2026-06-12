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

function selectWaveform(type: WaveformType) {
  notesStore.setWaveform(type)
}
</script>

<template>
  <div class="waveform-selector">
    <div class="d-flex align-center gap-2 flex-wrap">
      <v-icon size="20" class="text-medium-emphasis">
        mdi-waveform
      </v-icon>
      <span class="text-subtitle-2 text-medium-emphasis">
        音色波形
      </span>
      <v-btn-toggle
        :model-value="waveform"
        density="comfortable"
        mandatory
        @update:model-value="selectWaveform"
      >
        <v-btn
          v-for="option in waveformOptions"
          :key="option.value"
          :value="option.value"
          :prepend-icon="option.icon"
          size="small"
          variant="tonal"
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
</style>
