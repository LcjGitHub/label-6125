<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/types/note'
import { playTone } from '@/utils/audio'
import { formatCents } from '@/utils/interval'
import {
  matchIntervalByCents,
  formatIntervalDeviation,
} from '@/utils/intervalName'

const notesStore = useNotesStore()
const { notes, selectedNote1, selectedNote2, centsDifference, volume, duration, waveform } =
  storeToRefs(notesStore)

const selectedMidis = computed(() => {
  const midis: number[] = []
  if (selectedNote1.value) midis.push(selectedNote1.value.midi)
  if (selectedNote2.value) midis.push(selectedNote2.value.midi)
  return midis
})

const intervalMatchResult = computed(() => {
  if (centsDifference.value === null) return null
  return matchIntervalByCents(centsDifference.value)
})

const isDescending = computed(() => {
  if (centsDifference.value === null) return false
  return centsDifference.value < 0
})

const selectionState = computed(() => {
  if (selectedNote1.value && selectedNote2.value) return 'both'
  if (selectedNote1.value || selectedNote2.value) return 'one'
  return 'none'
})

onMounted(() => {
  notesStore.clearIntervalSelection()
})

onUnmounted(() => {
  notesStore.clearIntervalSelection()
})

async function handleKeyClick(note: Note) {
  notesStore.selectIntervalNote(note)
  await playTone(note.frequency, duration.value, waveform.value, volume.value)
}
</script>

<template>
  <v-container fluid class="py-4">
    <v-row justify="center">
      <v-col cols="12" lg="11">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h6 font-weight-medium mb-1">
            <v-icon start size="20">
              mdi-music-note-search
            </v-icon>
            音程名称
          </v-card-title>
          <v-card-subtitle class="mb-2 text-body-2">
            依次选择两个音，计算音分差并匹配对应的中文音程名称
          </v-card-subtitle>

          <PianoKeyboard
            :notes="notes"
            :selected-midis="selectedMidis"
            compact
            @key-click="handleKeyClick"
          />

          <v-divider class="my-3" />

          <v-row dense>
            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 h-100">
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音 1（f₁）
                </div>
                <template v-if="selectedNote1">
                  <div class="text-h6">
                    {{ selectedNote1.name }}
                  </div>
                  <div class="text-body-2">
                    {{ selectedNote1.frequency }} Hz
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  未选择
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card variant="outlined" class="pa-3 h-100">
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音 2（f₂）
                </div>
                <template v-if="selectedNote2">
                  <div class="text-h6">
                    {{ selectedNote2.name }}
                  </div>
                  <div class="text-body-2">
                    {{ selectedNote2.frequency }} Hz
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  {{ selectionState === 'one' ? '请再选一个音' : '未选择' }}
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card
                variant="tonal"
                color="secondary"
                class="pa-3 h-100"
              >
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音分差
                </div>
                <template v-if="centsDifference !== null">
                  <div class="text-h6">
                    {{ formatCents(centsDifference) }}
                  </div>
                  <div class="text-caption mt-1">
                    log₂({{ selectedNote2?.frequency }} / {{ selectedNote1?.frequency }})
                    × 1200
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  {{ selectionState === 'one' ? '请再选一个音' : '请选择两个音' }}
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card
                variant="tonal"
                :color="
                  intervalMatchResult?.withinTolerance
                    ? 'success'
                    : intervalMatchResult
                      ? 'warning'
                      : 'info'
                "
                class="pa-3 h-100"
              >
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音程名称
                </div>
                <template v-if="intervalMatchResult && intervalMatchResult.entry">
                  <div class="text-h6 d-flex align-center gap-1">
                    {{ intervalMatchResult.entry.name }}
                    <v-chip
                      v-if="isDescending"
                      size="x-small"
                      color="deep-orange"
                      variant="tonal"
                    >
                      下行
                    </v-chip>
                  </div>
                  <div class="text-body-2 mt-1">
                    {{ intervalMatchResult.entry.category }}
                  </div>
                  <div class="text-caption mt-1">
                    偏差：{{ formatIntervalDeviation(intervalMatchResult.deviationCents) }}
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  {{ selectionState === 'one' ? '请再选一个音' : '请选择两个音' }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-3 d-flex justify-end">
            <v-btn
              size="small"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="notesStore.clearIntervalSelection()"
            >
              清空选择
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
