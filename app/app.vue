<script setup lang="ts">
import { useSupabaseUser, useSupabaseClient, navigateTo } from '#imports'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-library" class="w-6 h-6 text-primary" />
          <span class="font-bold text-lg">Semantic Library System</span>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
        
        <div v-if="user" class="flex items-center gap-4">
          <UButton to="/add" variant="ghost" icon="i-lucide-plus" color="primary">Add Book</UButton>
          <UButton to="/mybooks" variant="ghost" icon="i-lucide-library-big" color="neutral">My Books</UButton>
          <span class="text-sm text-gray-500">{{ user.email }}</span>
          <UButton @click="logout" color="error" variant="ghost" icon="i-lucide-log-out">Logout</UButton>
        </div>
      </template>
    </UHeader>

    <UMain class="min-h-[calc(100vh-140px)]">
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-gray-500">
          Built with Nuxt 3 & Semantic Web • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
