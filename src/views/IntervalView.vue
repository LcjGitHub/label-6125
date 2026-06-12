<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import WaveformSelector from '@/components/WaveformSelector.vue'
import AudioSettings from '@/components/AudioSettings.vue'
import { useNotesStore } from '@/stores/notes'
import type { Note } from '@/types/note'
import { playTone } from '@/utils/audio'
import { formatCents, formatSemitones, formatDirection } from '@/utils/interval'

const notesStore = useNotesStore()
const { notes, selectedNote1, selectedNote2, centsDifference, semitoneCount, intervalDirection, waveform, volume, duration, startOctave, endOctave, availableOctaves } =
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
  await playTone(note.frequency, duration.value, waveform.value, volume.value)
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
          <v-card-subtitle class="mb-3">
            依次选择两个音，计算音程差（cents）：1200 × log₂(f₂ / f₁)，同时显示半音数目与升高/降低/同度方向
          </v-card-subtitle>

          <WaveformSelector class="mb-4" />

          <AudioSettings class="mb-4" />

          <v-card variant="outlined" class="pa-3 mb-4">
            <div class="d-flex align-center flex-wrap ga-2">
              <v-icon size="18">
                mdi-filter-outline
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold">八度范围</span>
              <v-select
                v-model="startOctave"
                :items="availableOctaves"
                label="起始"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 90px;"
                @update:model-value="notesStore.setStartOctave($event)"
              />
              <span class="text-body-2 text-medium-emphasis">—</span>
              <v-select
                v-model="endOctave"
                :items="availableOctaves"
                label="结束"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 90px;"
                @update:model-value="notesStore.setEndOctave($event)"
              />
              <v-chip size="small" variant="tonal" color="primary">
                C{{ startOctave }} – B{{ endOctave }}
              </v-chip>
              <v-spacer />
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-refresh"
                @click="notesStore.resetOctaveRange()"
              >
                重置
              </v-btn>
            </div>
          </v-card>

          <PianoKeyboard
            :notes="notes"
            :selected-midis="selectedMidis"
            :start-octave="startOctave"
            :end-octave="endOctave"
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
                class="pa-3 h-100"
              >
                <v-row dense>
                  <v-col cols="12" md="4">
                    <div class="text-subtitle-2 text-medium-emphasis mb-1">
                      音分差
                    </div>
                    <template v-if="centsDifference !== null">
                      <div class="text-h6 font-weight-medium">
                        {{ formatCents(centsDifference) }}
                      </div>
                      <div class="text-caption mt-1 text-medium-emphasis">
                        log₂(f₂/f₁)×1200
                      </div>
                    </template>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      —
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <div class="text-subtitle-2 text-medium-emphasis mb-1">
                      半音数
                    </div>
                    <template v-if="semitoneCount !== null">
                      <div class="text-h6 font-weight-medium">
                        {{ formatSemitones(semitoneCount) }}
                      </div>
                      <div class="text-caption mt-1 text-medium-emphasis">
                        音分差 ÷ 100
                      </div>
                    </template>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      —
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <div class="text-subtitle-2 text-medium-emphasis mb-1">
                      方向
                    </div>
                    <template v-if="intervalDirection !== null">
                      <div
                        class="text-h6 font-weight-medium d-flex align-center"
                        :class="
                          intervalDirection === 'ascending'
                            ? 'text-success'
                            : intervalDirection === 'descending'
                              ? 'text-error'
                              : 'text-info'
                        "
                      >
                        <v-icon start size="20">
                          {{
                            intervalDirection === 'ascending'
                              ? 'mdi-trending-up'
                              : intervalDirection === 'descending'
                                ? 'mdi-trending-down'
                                : 'mdi-minus'
                          }}
                        </v-icon>
                        {{ formatDirection(intervalDirection) }}
                      </div>
                      <div class="text-caption mt-1 text-medium-emphasis">
                        {{
                          intervalDirection === 'ascending'
                            ? '音 2 高于音 1'
                            : intervalDirection === 'descending'
                              ? '音 2 低于音 1'
                              : '两音相同'
                        }}
                      </div>
                    </template>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      —
                    </div>
                  </v-col>
                </v-row>
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
