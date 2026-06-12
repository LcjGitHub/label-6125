<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes'

const notesStore = useNotesStore()
const { baseFrequency, notes } = storeToRefs(notesStore)

const inputValue = ref(baseFrequency.value)
const inputError = ref('')

const c4 = computed(() => notes.value.find(n => n.midi === 60))
const a4 = computed(() => notes.value.find(n => n.midi === 69))
const c5 = computed(() => notes.value.find(n => n.midi === 72))

watch(baseFrequency, (newVal) => {
  inputValue.value = newVal
})

function validateAndSet(val: number) {
  if (isNaN(val) || !isFinite(val)) {
    inputError.value = '请输入有效的数字'
    inputValue.value = baseFrequency.value
    return
  }
  if (val < 380 || val > 500) {
    inputError.value = '频率需在 380 – 500 Hz 范围内'
    inputValue.value = baseFrequency.value
    return
  }
  inputError.value = ''
  notesStore.setBaseFrequency(val)
}

function handleInput() {
  validateAndSet(Number(inputValue.value))
}

function handleSlider(val: number) {
  inputError.value = ''
  inputValue.value = val
  notesStore.setBaseFrequency(val)
}
</script>

<template>
  <v-container fluid class="py-6">
    <v-row justify="center">
      <v-col cols="12" lg="8">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon start>
              mdi-cog
            </v-icon>
            设置
          </v-card-title>
          <v-card-subtitle class="mb-4">
            调整标准音高（A4），系统将实时重算全部音名的频率值
          </v-card-subtitle>

          <v-row align="center" class="mb-6">
            <v-col cols="12" md="8">
              <v-slider
                v-model="inputValue"
                :min="380"
                :max="500"
                :step="0.1"
                label="标准音高 A4"
                thumb-label
                show-ticks
                tick-size="2"
                @update:model-value="handleSlider"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="inputValue"
                type="number"
                label="频率 (Hz)"
                suffix="Hz"
                :min="380"
                :max="500"
                step="0.1"
                :error="!!inputError"
                :error-messages="inputError"
                @change="handleInput"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end mb-6">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-restore"
              :disabled="baseFrequency === 440"
              @click="notesStore.resetBaseFrequency(); inputValue = 440"
            >
              恢复标准 440Hz
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <v-card variant="tonal" color="info" class="pa-4">
            <div class="text-subtitle-1 font-weight-bold mb-3">
              实时频率预览
            </div>
            <v-row dense>
              <v-col cols="12" sm="4">
                <div class="text-body-2 text-medium-emphasis">
                  中央 C (C4)
                </div>
                <div class="text-h5">
                  {{ c4?.frequency }} Hz
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-body-2 text-medium-emphasis">
                  标准音 (A4)
                </div>
                <div class="text-h5">
                  {{ a4?.frequency }} Hz
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-body-2 text-medium-emphasis">
                  高音 C (C5)
                </div>
                <div class="text-h5">
                  {{ c5?.frequency }} Hz
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-divider class="my-4" />

          <v-card variant="outlined" class="pa-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">
              关于十二平均律
            </div>
            <div class="text-body-2 text-medium-emphasis">
              十二平均律将一个八度分为 12 个均等的半音，每个半音的频率比为 2^(1/12) ≈ 1.05946。
              <br />
              计算公式：f(n) = f₀ × 2^(n/12)，其中 f₀ 为 A4 基准频率，n 为与 A4 的半音差。
            </div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
