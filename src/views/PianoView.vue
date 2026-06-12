<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import WaveformSelector from '@/components/WaveformSelector.vue'
import NoteHistoryList from '@/components/NoteHistoryList.vue'
import { useNotesStore } from '@/stores/notes'
import { useNoteHistoryStore } from '@/stores/noteHistory'
import type { Note, NoteHistoryItem } from '@/types/note'
import { playTone } from '@/utils/audio'

const notesStore = useNotesStore()
const noteHistoryStore = useNoteHistoryStore()
const { notes, activeNote, waveform } = storeToRefs(notesStore)

/**
 * 点击琴键：更新当前音并播放
 * @param note 被选中的音
 */
async function handleKeyClick(note: Note) {
  notesStore.setActiveNote(note)
  noteHistoryStore.addToHistory(note)
  await playTone(note.frequency, 0.6, waveform.value)
}

/**
 * 点击历史记录：播放并高亮对应琴键
 * @param item 历史记录项
 */
async function handleHistoryItemClick(item: NoteHistoryItem) {
  const note = notes.value.find(n => n.midi === item.note.midi)
  if (note) {
    notesStore.setActiveNote(note)
    await playTone(note.frequency, 0.6, waveform.value)
  }
}
</script>

<template>
  <v-container fluid class="pa-4 pb-16">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon start>
              mdi-piano
            </v-icon>
            钢琴键盘
          </v-card-title>
          <v-card-subtitle class="mb-3">
            点击琴键查看音名与频率，并通过 Web Audio API 播放单音（C2 – B5）。可在上方切换音色波形后再点击琴键播放。
          </v-card-subtitle>

          <WaveformSelector class="mb-3" />

          <PianoKeyboard
            :notes="notes"
            :active-midi="activeNote?.midi ?? null"
            @key-click="handleKeyClick"
          />

          <v-divider class="my-3" />

          <v-card
            variant="tonal"
            color="primary"
            class="pa-3"
          >
            <template v-if="activeNote">
              <div class="text-subtitle-1 font-weight-bold mb-1">
                当前选中
              </div>
              <v-row dense>
                <v-col cols="6" sm="4">
                  <div class="text-body-2 text-medium-emphasis">
                    音名
                  </div>
                  <div class="text-h5">
                    {{ activeNote.name }}
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-body-2 text-medium-emphasis">
                    频率
                  </div>
                  <div class="text-h5">
                    {{ activeNote.frequency.toFixed(2) }} Hz
                  </div>
                </v-col>
                <v-col cols="6" sm="4">
                  <div class="text-body-2 text-medium-emphasis">
                    MIDI
                  </div>
                  <div class="text-body-1">
                    {{ activeNote.midi }}
                  </div>
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <div class="text-body-1 text-medium-emphasis">
                请点击上方琴键
              </div>
            </template>
          </v-card>

          <v-divider class="my-3" />

          <NoteHistoryList @item-click="handleHistoryItemClick" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
