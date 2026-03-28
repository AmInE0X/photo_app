<script setup lang="ts">
import { ref } from 'vue'

const title = ref('')
const author = ref('')
const category = ref('')
const isUploading = ref(false)
const toast = useToast()

async function onSubmit() {
  if (!title.value.trim() || !author.value.trim() || !category.value.trim()) {
    toast.add({ title: 'Error', description: 'Please fill out all fields.', color: 'error' })
    return
  }
  
  isUploading.value = true

  try {
    const response: any = await $fetch('/api/book', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        author: author.value.trim(),
        category: category.value.trim()
      }
    })
    
    toast.add({ 
      title: 'Success', 
      description: response.message || 'Book added to Library Graph!', 
      color: 'success' 
    })
    
    // Reset form
    title.value = ''
    author.value = ''
    category.value = ''

    // Redirect to home/graph view after short delay
    setTimeout(() => {
      navigateTo('/')
    }, 1500)
    
  } catch (error: any) {
    const errorMsg = error.data?.statusMessage || error.message || 'Unknown error occurred'
    toast.add({ title: 'Failed to add Book', description: errorMsg, color: 'error' })
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-xl py-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-book-plus" class="w-6 h-6" />
          Add New Book
        </h2>
        <p class="text-sm text-gray-500 mt-1">Insert a new book, author, and category into the Knowledge Graph.</p>
      </template>

      <form @submit.prevent="onSubmit" class="space-y-6 flex flex-col mx-auto item-center">
        <UFormGroup label="Book Title" required>
          <h4>Book Title</h4>
          <UInput v-model="title" placeholder="e.g. 1984" icon="i-lucide-type" />
        </UFormGroup>

        <UFormGroup label="Author" required>
          <h4>Author</h4>
          <UInput v-model="author" placeholder="e.g. George Orwell" icon="i-lucide-user" />
          <p class="text-xs text-gray-500">Author will be created or linked as a node in the graph.</p>
        </UFormGroup>

        <UFormGroup label="Category" required>
          <h4>Category</h4>
          <UInput v-model="category" placeholder="e.g. Dystopian" icon="i-lucide-tag" />
          <p class="text-xs text-gray-500">Category will be linked as a node in the graph.</p>
        </UFormGroup>

        <div class="flex justify-end pt-4">
          <UButton 
            type="submit" 
            color="primary" 
            size="lg"
            :loading="isUploading"
            icon="i-lucide-plus"
          >
            Add to Library
          </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>
