<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNoteHistoryStore } from '@/stores/noteHistory'
import type { NoteHistoryItem } from '@/types/note'

const emit = defineEmits<{
  itemClick: [item: NoteHistoryItem]
}>()

const historyStore = useNoteHistoryStore()
const { history } = storeToRefs(historyStore)

const hasHistory = computed(() => history.value.length > 0)

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function handleItemClick(item: NoteHistoryItem) {
  emit('itemClick', item)
}
</script>

<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 font-weight-medium d-flex align-center">
      <v-icon start>
        mdi-history
      </v-icon>
      播放历史
      <v-spacer />
      <v-btn
        v-if="hasHistory"
        size="small"
        variant="text"
        @click="historyStore.clearHistory()"
      >
        清空
      </v-btn>
    </v-card-title>
    <v-card-subtitle class="mb-2">
      最近十次点击的音符，点击可重播
    </v-card-subtitle>

    <div v-if="hasHistory" class="history-list">
      <v-card
        v-for="(item, index) in history"
        :key="item.timestamp"
        class="history-item mb-2"
        variant="outlined"
        @click="handleItemClick(item)"
      >
        <v-card-text class="py-2 px-3">
          <v-row align="center" dense>
            <v-col cols="auto">
              <v-avatar size="36" color="primary" class="text-white font-weight-bold">
                {{ index + 1 }}
              </v-avatar>
            </v-col>
            <v-col>
              <div class="text-subtitle-1 font-weight-bold">
                {{ item.note.name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ item.note.frequency.toFixed(2) }} Hz
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="text-caption text-medium-emphasis">
                {{ formatTime(item.timestamp) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <div v-else class="text-body-1 text-medium-emphasis text-center py-6">
      暂无播放记录
    </div>
  </v-card>
</template>

<style scoped>
.history-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: var(--v-theme-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-list {
  max-height: 320px;
  overflow-y: auto;
}
</style>
