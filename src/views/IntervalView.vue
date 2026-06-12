<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/types/note'
import { playTone } from '@/utils/audio'
import { formatCents } from '@/utils/interval'

const notesStore = useNotesStore()
const { notes, selectedNote1, selectedNote2, centsDifference } =
  storeToRefs(notesStore)

const selectedMidis = computed(() => {
  const midis: number[] = []
  if (selectedNote1.value) midis.push(selectedNote1.value.midi)
  if (selectedNote2.value) midis.push(selectedNote2.value.midi)
  return midis
})

/**
 * 选择音并播放预览
 * @param note 被选中的音
 */
async function handleKeyClick(note: Note) {
  notesStore.selectIntervalNote(note)
  await playTone(note.frequency, 0.4)
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon start>
              mdi-tune-vertical
            </v-icon>
            音程计算
          </v-card-title>
          <v-card-subtitle class="mb-4">
            依次选择两个音，计算音程差（cents）：1200 × log₂(f₂ / f₁)
          </v-card-subtitle>

          <PianoKeyboard
            :notes="notes"
            :selected-midis="selectedMidis"
            @key-click="handleKeyClick"
          />

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="pa-4 h-100">
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音 1（f₁）
                </div>
                <template v-if="selectedNote1">
                  <div class="text-h5">
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

            <v-col cols="12" md="4">
              <v-card variant="outlined" class="pa-4 h-100">
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音 2（f₂）
                </div>
                <template v-if="selectedNote2">
                  <div class="text-h5">
                    {{ selectedNote2.name }}
                  </div>
                  <div class="text-body-2">
                    {{ selectedNote2.frequency }} Hz
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  未选择
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                variant="tonal"
                color="secondary"
                class="pa-4 h-100"
              >
                <div class="text-subtitle-2 text-medium-emphasis mb-1">
                  音程差
                </div>
                <template v-if="centsDifference !== null">
                  <div class="text-h5">
                    {{ formatCents(centsDifference) }}
                  </div>
                  <div class="text-caption mt-2">
                    log₂({{ selectedNote2?.frequency }} / {{ selectedNote1?.frequency }})
                    × 1200
                  </div>
                </template>
                <div v-else class="text-body-2 text-medium-emphasis">
                  请选择两个音
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-4 d-flex justify-end">
            <v-btn
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
