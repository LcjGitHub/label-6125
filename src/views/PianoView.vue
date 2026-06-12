<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import WaveformSelector from '@/components/WaveformSelector.vue'
import NoteHistoryList from '@/components/NoteHistoryList.vue'
import { useNotesStore } from '@/stores/notes'
import { useNoteHistoryStore } from '@/stores/noteHistory'
import type { Note, NoteHistoryItem } from '@/types/note'
import { playTone } from '@/utils/audio'
import { useKeyboardPlay } from '@/utils/keyShortcut'
import { getLowerOctaveKeys, getUpperOctaveKeys } from '@/data/keyMapping'

const notesStore = useNotesStore()
const noteHistoryStore = useNoteHistoryStore()
const { notes, activeNote, waveform } = storeToRefs(notesStore)

async function handleKeyClick(note: Note) {
  notesStore.setActiveNote(note)
  noteHistoryStore.addToHistory(note)
  await playTone(note.frequency, 0.6, waveform.value)
}

async function handleHistoryItemClick(item: NoteHistoryItem) {
  const note = notes.value.find(n => n.midi === item.note.midi)
  if (note) {
    notesStore.setActiveNote(note)
    await playTone(note.frequency, 0.6, waveform.value)
  }
}

const { baseMidi, shortcutLabels, activeMidiList } = useKeyboardPlay({
  notes,
  onNotePlay: handleKeyClick,
})

const currentOctaveRange = computed(() => {
  const base = baseMidi.value
  const lowOctave = Math.floor(base / 12) - 1
  const highOctave = Math.floor((base + 12) / 12) - 1
  return `C${lowOctave} – B${highOctave}`
})

const lowerKeys = getLowerOctaveKeys()
const upperKeys = getUpperOctaveKeys()
const lowerWhiteKeys = lowerKeys.filter(k => !k.isBlack)
const lowerBlackKeys = lowerKeys.filter(k => k.isBlack)
const upperWhiteKeys = upperKeys.filter(k => !k.isBlack)
const upperBlackKeys = upperKeys.filter(k => k.isBlack)
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
            点击琴键查看音名与频率，并通过 Web Audio API 播放单音（C2 – B5）。可在上方切换音色波形后再点击琴键播放。也支持电脑键盘快捷键演奏。
          </v-card-subtitle>

          <WaveformSelector class="mb-3" />

          <PianoKeyboard
            :notes="notes"
            :active-midi="activeNote?.midi ?? null"
            :selected-midis="activeMidiList"
            :shortcut-labels="shortcutLabels"
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
                请点击上方琴键或使用键盘快捷键
              </div>
            </template>
          </v-card>

          <v-divider class="my-3" />

          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-icon size="18" class="mr-1">
                mdi-keyboard
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold">键盘快捷键</span>
              <v-chip size="x-small" variant="tonal" color="primary" class="ml-2">
                {{ currentOctaveRange }}
              </v-chip>
            </div>

            <div class="text-caption text-medium-emphasis mb-2">
              下排八度
            </div>
            <div class="kb-row mb-1">
              <div class="kb-black-row">
                <span class="kb-spacer" />
                <span
                  v-for="k in lowerBlackKeys.slice(0, 2)"
                  :key="k.key"
                  class="kb-key kb-key--black"
                >{{ k.key.toUpperCase() }}</span>
                <span class="kb-spacer kb-spacer--double" />
                <span
                  v-for="k in lowerBlackKeys.slice(2)"
                  :key="k.key"
                  class="kb-key kb-key--black"
                >{{ k.key.toUpperCase() }}</span>
                <span class="kb-spacer" />
              </div>
            </div>
            <div class="kb-row mb-3">
              <div class="kb-white-row">
                <span
                  v-for="k in lowerWhiteKeys"
                  :key="k.key"
                  class="kb-key"
                >{{ k.key.toUpperCase() }}</span>
              </div>
            </div>

            <div class="text-caption text-medium-emphasis mb-2">
              上排八度
            </div>
            <div class="kb-row mb-1">
              <div class="kb-black-row">
                <span class="kb-spacer" />
                <span
                  v-for="k in upperBlackKeys.slice(0, 2)"
                  :key="k.key"
                  class="kb-key kb-key--black"
                >{{ k.key.toUpperCase() }}</span>
                <span class="kb-spacer kb-spacer--double" />
                <span
                  v-for="k in upperBlackKeys.slice(2)"
                  :key="k.key"
                  class="kb-key kb-key--black"
                >{{ k.key.toUpperCase() }}</span>
                <span class="kb-spacer" />
              </div>
            </div>
            <div class="kb-row mb-3">
              <div class="kb-white-row">
                <span
                  v-for="k in upperWhiteKeys"
                  :key="k.key"
                  class="kb-key"
                >{{ k.key.toUpperCase() }}</span>
              </div>
            </div>

            <v-divider class="mb-2" />

            <div class="d-flex align-center flex-wrap ga-2">
              <span class="kb-key kb-key--action">←</span>
              <span class="kb-key kb-key--action">→</span>
              <span class="text-caption text-medium-emphasis">切换八度范围</span>
            </div>
          </v-card>

          <v-divider class="my-3" />

          <NoteHistoryList @item-click="handleHistoryItemClick" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.kb-row {
  display: flex;
  justify-content: center;
}

.kb-white-row {
  display: flex;
  gap: 4px;
}

.kb-black-row {
  display: flex;
  gap: 4px;
  margin-bottom: 3px;
}

.kb-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
  background: linear-gradient(180deg, #fafafa 0%, #eee 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.7);
  line-height: 1;
}

.kb-key--black {
  background: linear-gradient(180deg, #444 0%, #222 100%);
  border-color: #111;
  color: rgba(255, 255, 255, 0.85);
  min-width: 26px;
  height: 24px;
  font-size: 0.7rem;
}

.kb-key--action {
  min-width: 28px;
  height: 26px;
  background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #90caf9;
  color: #1565c0;
}

.kb-spacer {
  width: 17px;
}

.kb-spacer--double {
  width: 38px;
}
</style>
