<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'

const notesStore = useNotesStore()
const { volume, duration } = storeToRefs(notesStore)

const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  set: (val: number) => notesStore.setVolume(val / 100),
})

const durationOptions = computed(() => {
  return notesStore.validDurations.map(d => ({
    value: d,
    title: `${d} 秒`,
  }))
})
</script>

<template>
  <div class="audio-settings">
    <div class="audio-settings__row">
      <v-icon size="20" class="text-medium-emphasis">
        mdi-volume-high
      </v-icon>
      <span class="audio-settings__label text-subtitle-2 text-medium-emphasis">
        音量
      </span>
      <v-slider
        v-model="volumePercent"
        class="audio-settings__slider"
        min="0"
        max="100"
        step="1"
        thumb-label
        hide-details
        density="comfortable"
        aria-label="音量调节"
      />
      <span class="audio-settings__value text-caption text-medium-emphasis">
        {{ volumePercent }}%
      </span>
    </div>

    <div class="audio-settings__row">
      <v-icon size="20" class="text-medium-emphasis">
        mdi-clock-outline
      </v-icon>
      <span class="audio-settings__label text-subtitle-2 text-medium-emphasis">
        持续时间
      </span>
      <v-select
        v-model="duration"
        class="audio-settings__select"
        :items="durationOptions"
        item-title="title"
        item-value="value"
        density="comfortable"
        variant="outlined"
        hide-details
        aria-label="持续时间选择"
      />
    </div>
  </div>
</template>

<style scoped>
.audio-settings {
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-settings__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.audio-settings__label {
  margin: 0 12px 0 8px;
  min-width: 64px;
}

.audio-settings__slider {
  flex: 1;
  min-width: 120px;
  max-width: 280px;
}

.audio-settings__value {
  margin-left: 12px;
  min-width: 40px;
}

.audio-settings__select {
  flex: 1;
  min-width: 140px;
  max-width: 200px;
}
</style>
