<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import WaveformSelector from '@/components/WaveformSelector.vue'
import AudioSettings from '@/components/AudioSettings.vue'
import NoteHistoryList from '@/components/NoteHistoryList.vue'
import { useNotesStore } from '@/stores/notes'
import { useNoteHistoryStore } from '@/stores/noteHistory'
import type { Note, NoteHistoryItem } from '@/types/note'
import { playTone } from '@/utils/audio'
import {
  DEFAULT_BASE_MIDI,
  getLowerOctaveKeys,
  getUpperOctaveKeys,
  getShortcutNoteNames,
} from '@/data/keyMapping'

const notesStore = useNotesStore()
const noteHistoryStore = useNoteHistoryStore()
const { notes, activeNote, waveform, volume, duration } = storeToRefs(notesStore)

const baseMidi = ref(DEFAULT_BASE_MIDI)

async function handleKeyClick(note: Note) {
  notesStore.setActiveNote(note)
  noteHistoryStore.addToHistory(note)
  await playTone(note.frequency, duration.value, waveform.value, volume.value)
}

async function handleHistoryItemClick(item: NoteHistoryItem) {
  const note = notes.value.find(n => n.midi === item.note.midi)
  if (note) {
    notesStore.setActiveNote(note)
    await playTone(note.frequency, duration.value, waveform.value, volume.value)
  }
}

function handleOctaveChange(newBaseMidi: number) {
  baseMidi.value = newBaseMidi
  notesStore.setActiveNote(null)
}

const currentOctaveRange = computed(() => {
  const base = baseMidi.value
  const lowOctave = Math.floor(base / 12) - 1
  const highOctave = Math.floor((base + 12) / 12) - 1
  return `C${lowOctave} – B${highOctave}`
})

const shortcutNoteNames = computed(() =>
  getShortcutNoteNames(baseMidi.value, notes.value),
)

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
            点击琴键查看音名与频率，并通过 Web Audio API 播放单音（C2 – B5）。支持电脑键盘快捷键演奏。
          </v-card-subtitle>

          <WaveformSelector class="mb-3" />

          <AudioSettings class="mb-3" />

          <v-card variant="outlined" class="pa-3 mb-3">
            <div class="d-flex align-center mb-2 flex-wrap">
              <v-icon size="18" class="mr-1">
                mdi-keyboard
              </v-icon>
              <span class="text-subtitle-2 font-weight-bold">键盘快捷键</span>
              <v-chip size="x-small" variant="tonal" color="primary" class="ml-2">
                {{ currentOctaveRange }}
              </v-chip>
              <v-spacer />
              <span class="text-caption text-medium-emphasis">
                ← / → 切换八度
              </span>
            </div>

            <v-row dense>
              <v-col cols="12" md="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  下排八度（低）
                </div>
                <div class="kb-row mb-1">
                  <div class="kb-black-row">
                    <span class="kb-spacer" />
                    <span
                      v-for="k in lowerBlackKeys.slice(0, 2)"
                      :key="k.key"
                      class="kb-key kb-key--black"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                    <span class="kb-spacer kb-spacer--double" />
                    <span
                      v-for="k in lowerBlackKeys.slice(2)"
                      :key="k.key"
                      class="kb-key kb-key--black"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                    <span class="kb-spacer" />
                  </div>
                </div>
                <div class="kb-row">
                  <div class="kb-white-row">
                    <span
                      v-for="k in lowerWhiteKeys"
                      :key="k.key"
                      class="kb-key"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="text-caption text-medium-emphasis mb-1">
                  上排八度（高）
                </div>
                <div class="kb-row mb-1">
                  <div class="kb-black-row">
                    <span class="kb-spacer" />
                    <span
                      v-for="k in upperBlackKeys.slice(0, 2)"
                      :key="k.key"
                      class="kb-key kb-key--black"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                    <span class="kb-spacer kb-spacer--double" />
                    <span
                      v-for="k in upperBlackKeys.slice(2)"
                      :key="k.key"
                      class="kb-key kb-key--black"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                    <span class="kb-spacer" />
                  </div>
                </div>
                <div class="kb-row">
                  <div class="kb-white-row">
                    <span
                      v-for="k in upperWhiteKeys"
                      :key="k.key"
                      class="kb-key"
                    >
                      {{ k.key.toUpperCase() }}
                      <span class="kb-note">{{ shortcutNoteNames[k.key]?.replace(/\d+$/, '') }}</span>
                    </span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <PianoKeyboard
            :notes="notes"
            :active-midi="activeNote?.midi ?? null"
            :base-midi="baseMidi"
            :enable-keyboard="true"
            @key-click="handleKeyClick"
            @octave-change="handleOctaveChange"
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
  gap: 3px;
}

.kb-black-row {
  display: flex;
  gap: 3px;
  margin-bottom: 2px;
}

.kb-key {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 2px 4px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 600;
  background: linear-gradient(180deg, #fafafa 0%, #eee 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.7);
  line-height: 1;
}

.kb-note {
  font-size: 0.55rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 1px;
  font-family: sans-serif;
}

.kb-key--black {
  background: linear-gradient(180deg, #444 0%, #222 100%);
  border-color: #111;
  color: rgba(255, 255, 255, 0.9);
  min-width: 28px;
  height: 28px;
  font-size: 0.65rem;
}

.kb-key--black .kb-note {
  color: rgba(255, 255, 255, 0.6);
}

.kb-spacer {
  width: 18px;
}

.kb-spacer--double {
  width: 41px;
}
</style>
