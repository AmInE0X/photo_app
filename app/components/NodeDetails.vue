<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  nodeId: string | null
}>()

const emit = defineEmits(['refresh'])

const details = ref<any>(null)
const loading = ref(false)

watch(() => props.nodeId, async (newId) => {
  if (!newId) {
    details.value = null
    return
  }

  loading.value = true
  try {
    const data = await $fetch(`/api/node`, {
      query: { id: newId }
    })
    details.value = data
  } catch (error) {
    console.error('Error fetching node details:', error)
  } finally {
    loading.value = false
  }
})

function formatKey(key: string | number) {
  return String(key).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const editingName = ref(false)
const newTitle = ref('')
const updating = ref(false)

async function saveTitle() {
  if (!newTitle.value || !details.value?.id) return
  updating.value = true
  try {
    await $fetch('/api/book', {
      method: 'PUT' as any,
      body: {
        id: details.value.id,
        newTitle: newTitle.value
      }
    })
    editingName.value = false
    emit('refresh')
  } catch (error) {
    console.error('Failed to update title', error)
  } finally {
    updating.value = false
  }
}

const indirectAuthors = ref<any[]>([])
const loadingIndirect = ref(false)

async function fetchIndirect() {
  if (!details.value?.id) return
  loadingIndirect.value = true
  try {
    const data: any = await $fetch('/api/indirect', {
      query: { categoryId: details.value.id }
    })
    indirectAuthors.value = data.results || []
  } catch (error) {
    console.error('Failed to fetch indirect relations', error)
  } finally {
    loadingIndirect.value = false
  }
}

watch(() => props.nodeId, () => {
  editingName.value = false
  indirectAuthors.value = []
})

</script>
<template>
  <UCard class="w-full h-full overflow-auto">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="w-5 h-5 text-primary" />
        <h3 class="font-bold text-lg">Node Details</h3>
      </div>
    </template>

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else-if="details && details.id" class="space-y-4">
      <div class="break-all font-mono text-xs text-gray-500 bg-gray-100 p-2 rounded">
        {{ details.id }}
      </div>

      <div class="space-y-3">
        <div v-for="(values, key) in details.details" :key="key">
          <span class="text-sm font-semibold text-gray-700 block mb-1">{{ formatKey(key) }}:</span>
          <div class="flex flex-col gap-1">
            <template v-for="(val, index) in values" :key="index">
              <div v-if="key === 'title' && index === 0" class="flex gap-2 items-center">
                <span v-if="!editingName" class="text-sm text-gray-800">{{ val }}</span>
                <UInput v-if="editingName" v-model="newTitle" size="sm" class="grow" />
                <UButton v-if="!editingName" size="xs" variant="ghost" icon="i-lucide-pencil" @click="editingName = true; newTitle = val" />
                <div v-if="editingName" class="flex gap-1">
                  <UButton size="xs" color="primary" @click="saveTitle" :loading="updating">Save</UButton>
                  <UButton size="xs" color="neutral" variant="ghost" @click="editingName = false">Cancel</UButton>
                </div>
              </div>
              <span v-else-if="val.startsWith('http')" class="text-sm text-primary break-all">
                <NuxtLink :to="val" target="_blank">{{ val.split('#').pop() || val.split('/').pop() }}</NuxtLink>
              </span>
              <span v-else class="text-sm text-gray-800">{{ val }}</span>
            </template>
          </div>
        </div>
      </div>
      
      <!-- Indirect Query Section for Categories -->
      <div v-if="details.details?.type?.includes('Category') || details.id.includes('Category')" class="mt-4 pt-4 border-t">
        <UButton block color="neutral" variant="soft" @click="fetchIndirect" :loading="loadingIndirect">
          Find Authors (Indirect)
        </UButton>
        <div v-if="indirectAuthors.length > 0" class="mt-2 space-y-1">
          <UBadge v-for="auth in indirectAuthors" :key="auth.id" color="primary" variant="subtle" class="mr-1">
            {{ auth.name }}
          </UBadge>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-400">
      <UIcon name="i-lucide-mouse-pointer-click" class="w-12 h-12 mb-2 opacity-50" />
      <p>Click on a node in the graph</p>
    </div>
  </UCard>
</template>
