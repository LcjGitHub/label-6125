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
      <button
        v-for="(item, index) in history"
        :key="item.timestamp"
        type="button"
        class="history-item"
        :aria-label="`播放 ${item.note.name}，${item.note.frequency.toFixed(2)} 赫兹`"
        @click="handleItemClick(item)"
      >
        <v-avatar size="32" color="primary" class="text-white font-weight-bold mr-3">
          {{ index + 1 }}
        </v-avatar>
        <div class="history-item-info">
          <span class="text-subtitle-2 font-weight-bold">{{ item.note.name }}</span>
          <span class="text-body-2 text-medium-emphasis">{{ item.note.frequency.toFixed(2) }} Hz</span>
        </div>
        <div class="history-item-time text-caption text-medium-emphasis">
          {{ formatTime(item.timestamp) }}
        </div>
      </button>
    </div>

    <div v-else class="text-body-1 text-medium-emphasis text-center py-6">
      暂无播放记录
    </div>
  </v-card>
</template>

<style scoped>
.history-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: inherit;
}

.history-item:hover {
  border-color: var(--v-theme-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-item:focus-visible {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
  border-color: var(--v-theme-primary);
}

.history-item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.history-item-time {
  flex-shrink: 0;
  margin-left: 8px;
}

.history-list {
  max-height: 320px;
  overflow-y: auto;
}
</style>
