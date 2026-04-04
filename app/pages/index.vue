<script setup lang="ts">
import { ref, onMounted } from 'vue'

const elements = ref<any[]>([])
const selectedNodeId = ref<string | null>(null)
const errorMsg = ref('')
const loading = ref(true)

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)

const isMocked = ref(false)
const stats = ref<any[]>([])

async function fetchGraph() {
  try {
    loading.value = true
    const data: any = await $fetch('/api/graph')
    elements.value = data.elements || []
    isMocked.value = !!data.isMocked
  } catch (err: any) {
    errorMsg.value = 'Failed to load Knowledge Graph data.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const data: any = await $fetch('/api/stats')
    stats.value = data.results || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchGraph()
  fetchStats()
})

function handleNodeSelect(id: string) {
  selectedNodeId.value = id
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    selectedNodeId.value = null
    return
  }
  searching.value = true
  try {
    const data: any = await $fetch('/api/search', {
      query: { text: searchQuery.value.trim() }
    })
    searchResults.value = data.results || []
    if (searchResults.value.length > 0) {
      selectedNodeId.value = searchResults.value[0].id
    }
  } catch(e) {
    console.error('Search failed', e)
  } finally {
    searching.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 h-full">
    <div class="flex flex-col md:flex-row mb-6 justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100">
          Library Knowledge Graph
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Explore semantic relationships between Books, Authors, and Categories.
        </p>
      </div>

      <div class="flex flex-col items-end gap-3">
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <UInput v-model="searchQuery" placeholder="Search Books by Title..." icon="i-lucide-search" />
          <UButton type="submit" color="primary" :loading="searching">Search</UButton>
        </form>
        <div class="flex gap-2 items-center">
          <UBadge color="primary" variant="soft">Book (Blue)</UBadge>
          <UBadge color="warning" variant="soft">Author (Orange)</UBadge>
          <UBadge color="success" variant="soft">Category (Green)</UBadge>
        </div>
      </div>
    </div>

    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="errorMsg"
      class="mb-6"
    />

    <UAlert
      v-if="isMocked"
      color="warning"
      variant="soft"
      icon="i-lucide-info"
      title="Running with Mock Data"
      description="Could not connect to Apache Fuseki. Showing sample nodes."
      class="mb-6"
    />

    <div v-if="loading" class="w-full h-[600px] flex items-center justify-center border rounded-lg bg-gray-50 border-gray-200">
      <div class="flex flex-col items-center gap-2">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary" />
        <span class="text-gray-500 font-medium">Loading Semantic Graph...</span>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-3">
        <ClientOnly>
          <GraphView :elements="elements" :highlightId="selectedNodeId" @nodeClick="handleNodeSelect" />
        </ClientOnly>
      </div>
      
      <div class="lg:col-span-1 h-[600px] flex flex-col gap-4 overflow-y-auto">
        <div v-if="searchResults.length > 0 && searchQuery" class="mb-4">
          <h3 class="font-bold text-sm text-gray-600 uppercase mb-2">Search Results</h3>
          <UButton v-for="res in searchResults" :key="res.id" block variant="soft" color="primary" class="mb-2 text-left justify-start" @click="handleNodeSelect(res.id)">
            {{ res.title }}
          </UButton>
        </div>
        <NodeDetails :nodeId="selectedNodeId" @refresh="fetchGraph" />

        <UCard v-if="stats.length > 0">
          <template #header>
            <h3 class="font-bold text-sm text-gray-600 uppercase">Category Statistics</h3>
            <p class="text-xs text-gray-500">From /api/stats (GROUP BY)</p>
          </template>
          <div class="space-y-2">
            <div v-for="stat in stats" :key="stat.category" class="flex justify-between items-center text-sm">
              <span class="text-gray-700">{{ stat.category }}</span>
              <UBadge color="gray">{{ stat.count }} books</UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
