<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Books fetched from /api/mybooks
const books = ref<any[]>([])
const userEmail = ref('')
const loading = ref(true)
const errorMsg = ref('')

// Table columns
const columns = [
  { id: 'title', accessorKey: 'title', header: 'Book Title' },
  { id: 'author', accessorKey: 'author', header: 'Author' },
  { id: 'category', accessorKey: 'category', header: 'Category' },
  { id: 'uri', accessorKey: 'id', header: 'URI' }
]

onMounted(async () => {
  try {
    const data: any = await $fetch('/api/mybooks')
    books.value = data.books || []
    userEmail.value = data.user || ''
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'Failed to load your books.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UContainer class="py-8">
    <!-- Page header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-gray-100">My Books</h1>
        <p v-if="userEmail" class="text-gray-500 text-sm mt-1">
          Books added by <span class="font-semibold text-primary">{{ userEmail }}</span>
        </p>
      </div>
      <UButton to="/add" color="primary" icon="i-lucide-plus">Add New Book</UButton>
    </div>

    <!-- Error -->
    <UAlert
      v-if="errorMsg"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="errorMsg"
      class="mb-6"
    />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-40">
      <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!books.length" class="flex flex-col items-center justify-center py-20 text-gray-400">
      <UIcon name="i-lucide-book-open" class="w-16 h-16 mb-4 opacity-40" />
      <p class="text-lg font-medium">No books found.</p>
      <p class="text-sm mt-1">Start by adding a book using the button above.</p>
    </div>

    <!-- Table -->
    <UCard v-else>
      <UTable :data="books" :columns="columns">
        <!-- Title cell -->
        <template #title-cell="{ row }">
          <span class="font-semibold text-primary">{{ row.original.title }}</span>
        </template>
        <!-- Author cell -->
        <template #author-cell="{ row }">
          <UBadge color="warning" variant="soft">{{ row.original.author }}</UBadge>
        </template>
        <!-- Category cell -->
        <template #category-cell="{ row }">
          <UBadge color="success" variant="soft">{{ row.original.category }}</UBadge>
        </template>
        <!-- URI cell — shortened -->
        <template #uri-cell="{ row }">
          <span class="text-xs text-gray-400 font-mono">{{ row.original.id.split('#')[1] }}</span>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>
