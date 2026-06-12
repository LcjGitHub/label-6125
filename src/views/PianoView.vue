<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import NoteHistoryList from '@/components/NoteHistoryList.vue'
import { useNotesStore } from '@/stores/notes'
import { useNoteHistoryStore } from '@/stores/noteHistory'
import type { Note, NoteHistoryItem } from '@/types/note'
import { playTone } from '@/utils/audio'

const notesStore = useNotesStore()
const noteHistoryStore = useNoteHistoryStore()
const { notes, activeNote } = storeToRefs(notesStore)

/**
 * 点击琴键：更新当前音并播放
 * @param note 被选中的音
 */
async function handleKeyClick(note: Note) {
  notesStore.setActiveNote(note)
  noteHistoryStore.addToHistory(note)
  await playTone(note.frequency)
}

/**
 * 点击历史记录：播放并高亮对应琴键
 * @param item 历史记录项
 */
async function handleHistoryItemClick(item: NoteHistoryItem) {
  const note = notes.value.find(n => n.midi === item.note.midi)
  if (note) {
    notesStore.setActiveNote(note)
    await playTone(note.frequency)
  }
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon start>
              mdi-piano
            </v-icon>
            钢琴键盘
          </v-card-title>
          <v-card-subtitle class="mb-4">
            点击琴键查看音名与频率，并通过 Web Audio API 播放单音（C2 – B5）
          </v-card-subtitle>

          <PianoKeyboard
            :notes="notes"
            :active-midi="activeNote?.midi ?? null"
            @key-click="handleKeyClick"
          />

          <v-divider class="my-4" />

          <v-card
            variant="tonal"
            color="primary"
            class="pa-4"
          >
            <template v-if="activeNote">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                当前选中
              </div>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-medium-emphasis">
                    音名
                  </div>
                  <div class="text-h4">
                    {{ activeNote.name }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-medium-emphasis">
                    频率
                  </div>
                  <div class="text-h4">
                    {{ activeNote.frequency }} Hz
                  </div>
                </v-col>
                <v-col cols="12">
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

          <v-divider class="my-4" />

          <NoteHistoryList @item-click="handleHistoryItemClick" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
