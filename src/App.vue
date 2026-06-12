<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { title: '钢琴键盘', to: '/', icon: 'mdi-piano' },
  { title: '音程计算', to: '/interval', icon: 'mdi-tune-vertical' },
  { title: '反查', to: '/reverse', icon: 'mdi-magnify' },
]

const activeTab = computed(() => route.path)
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable" elevation="2">
      <v-app-bar-title class="font-weight-medium">
        <v-icon start>
          mdi-music-circle
        </v-icon>
        十二平均律
      </v-app-bar-title>
      <v-spacer />
      <v-btn
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :variant="activeTab === item.to ? 'flat' : 'text'"
        :color="activeTab === item.to ? 'white' : undefined"
        class="mx-1"
        :prepend-icon="item.icon"
      >
        {{ item.title }}
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>

    <v-footer app class="text-center text-caption text-medium-emphasis">
      十二平均律音名与频率对照 · Vue 3 + Vuetify 3
    </v-footer>
  </v-app>
</template>
