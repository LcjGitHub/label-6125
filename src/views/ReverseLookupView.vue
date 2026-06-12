<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import WaveformSelector from '@/components/WaveformSelector.vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/types/note'
import {
  formatDeviationCents,
  getDeviationDescription,
} from '@/utils/reverseLookup'
import { playTone } from '@/utils/audio'

const notesStore = useNotesStore()
const { notes, reverseLookupResult, reverseLookupHighlightMidi, waveform } =
  storeToRefs(notesStore)

const frequencyInput = ref<string>('')
const inputError = ref<string>('')

const presetFrequencies = computed(() => [
  { label: 'A4 标准音', value: notes.value.find(n => n.midi === 69)?.frequency ?? 440 },
  { label: 'C4 中央C', value: notes.value.find(n => n.midi === 60)?.frequency ?? 261.63 },
  { label: 'E4', value: notes.value.find(n => n.midi === 64)?.frequency ?? 329.63 },
  { label: 'G4', value: notes.value.find(n => n.midi === 67)?.frequency ?? 392 },
])

/**
 * 验证并执行反查
 */
function handleLookup() {
  inputError.value = ''
  const value = parseFloat(frequencyInput.value.trim())

  if (isNaN(value) || !isFinite(value)) {
    inputError.value = '请输入有效的数字'
    notesStore.clearReverseLookup()
    return
  }

  if (value <= 0) {
    inputError.value = '频率必须大于 0 Hz'
    notesStore.clearReverseLookup()
    return
  }

  notesStore.doReverseLookup(value)
}

/**
 * 使用预设频率
 * @param freq 预设频率值
 */
function usePreset(freq: number) {
  frequencyInput.value = String(freq)
  handleLookup()
}

/**
 * 清空结果
 */
function handleClear() {
  frequencyInput.value = ''
  inputError.value = ''
  notesStore.clearReverseLookup()
}

/**
 * 点击琴键时：填入该音的频率并执行反查
 * @param note 被点击的音
 */
async function handleKeyClick(note: Note) {
  frequencyInput.value = String(note.frequency)
  notesStore.doReverseLookup(note.frequency)
  await playTone(note.frequency, 0.4, waveform.value)
}

/**
 * 获取偏差颜色类
 */
function getDeviationColor(): string {
  const cents = reverseLookupResult.value?.centsDeviation ?? 0
  const abs = Math.abs(cents)
  if (abs < 5) return 'success'
  if (abs < 30) return 'primary'
  if (abs < 100) return 'warning'
  return 'error'
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon start>
              mdi-magnify
            </v-icon>
            音名反查
          </v-card-title>
          <v-card-subtitle class="mb-3">
            输入频率（赫兹），根据十二平均律反查最接近的标准音名，并显示与标准音高的偏差音分数
          </v-card-subtitle>

          <WaveformSelector class="mb-4" />

          <v-row align="end">
            <v-col cols="12" sm="8" md="6">
              <v-text-field
                v-model="frequencyInput"
                label="输入频率 (Hz)"
                type="number"
                step="0.01"
                min="0"
                placeholder="例如：440"
                :error="!!inputError"
                :error-messages="inputError"
                prepend-inner-icon="mdi-sine-wave"
                suffix="Hz"
                @keyup.enter="handleLookup"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3" class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-magnify"
                @click="handleLookup"
              >
                反查
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-close"
                @click="handleClear"
              >
                清空
              </v-btn>
            </v-col>
          </v-row>

          <div class="mb-4">
            <span class="text-caption text-medium-emphasis me-2">快捷频率：</span>
            <v-btn
              v-for="preset in presetFrequencies"
              :key="preset.value"
              size="small"
              variant="tonal"
              class="me-2 mb-1"
              @click="usePreset(preset.value)"
            >
              {{ preset.label }} ({{ preset.value }} Hz)
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <template v-if="reverseLookupResult">
            <v-row>
              <v-col cols="12" md="4">
                <v-card
                  variant="tonal"
                  color="primary"
                  class="pa-4 h-100"
                >
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">
                    最接近的音名
                  </div>
                  <div class="text-h4 font-weight-bold">
                    {{ reverseLookupResult.note.name }}
                  </div>
                  <div class="text-body-2 mt-2">
                    MIDI 编号：{{ reverseLookupResult.note.midi }}
                  </div>
                  <div class="text-body-2">
                    {{ reverseLookupResult.note.isBlack ? '黑键' : '白键' }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-4 h-100">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">
                    频率对照
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-medium-emphasis">
                      输入频率
                    </div>
                    <div class="text-h6">
                      {{ reverseLookupResult.inputFrequency.toFixed(2) }} Hz
                    </div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      标准频率
                    </div>
                    <div class="text-h6">
                      {{ reverseLookupResult.note.frequency.toFixed(2) }} Hz
                    </div>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card
                  variant="tonal"
                  :color="getDeviationColor()"
                  class="pa-4 h-100"
                >
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">
                    音高偏差
                  </div>
                  <div class="text-h4 font-weight-bold">
                    {{ formatDeviationCents(reverseLookupResult.centsDeviation) }}
                  </div>
                  <div class="text-body-2 mt-2">
                    {{ getDeviationDescription(reverseLookupResult.centsDeviation) }}
                  </div>
                  <div class="text-caption mt-3 opacity-75">
                    100 音分 = 1 半音
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <v-card variant="outlined" class="pa-6 text-center">
              <v-icon size="48" color="medium-emphasis">
                mdi-music-note-search
              </v-icon>
              <div class="text-body-1 text-medium-emphasis mt-3">
                请在上方输入频率值，然后点击「反查」按钮
              </div>
            </v-card>
          </template>

          <v-divider class="my-4" />

          <div class="reverse-keyboard-preview">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">
              键盘预览（点击琴键查看对应音）
            </div>
            <div class="keyboard-scroll">
              <PianoKeyboard
                :notes="notes"
                :active-midi="reverseLookupHighlightMidi"
                @key-click="handleKeyClick"
              />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.reverse-keyboard-preview {
  max-height: 160px;
  overflow: hidden;
}

.keyboard-scroll {
  max-height: 130px;
  overflow-y: hidden;
  overflow-x: auto;
}

.keyboard-scroll :deep(.piano-keyboard) {
  gap: 2px;
  padding: 4px 2px 8px;
}

.keyboard-scroll :deep(.octave) {
  min-width: 140px;
}

.keyboard-scroll :deep(.white-keys) {
  height: 90px;
}

.keyboard-scroll :deep(.key-label) {
  font-size: 0.55rem;
  bottom: 3px;
}

.keyboard-scroll :deep(.black-keys) {
  height: 56px;
}

.keyboard-scroll :deep(.octave-label) {
  font-size: 0.6rem;
  margin-bottom: 2px;
}
</style>
