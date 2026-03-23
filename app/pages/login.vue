<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const isRegister = ref(false)
const errorMsg = ref('')

async function handleAuth() {
  errorMsg.value = ''
  try {
    if (isRegister.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      alert('Check your email for the login link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })
      if (error) throw error
      navigateTo('/')
    }
  } catch (error) {
    errorMsg.value = error.message
  }
}
</script>

<template>
  <UContainer class="max-w-md mt-20">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">{{ isRegister ? 'Register' : 'Login' }} to Semantic Photo App</h2>
      </template>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <UFormField label="Email">
          <UInput v-model="email" type="email" placeholder="you@example.com" class="w-full" required />
        </UFormField>

        <UFormField label="Password">
          <UInput v-model="password" type="password" class="w-full" required />
        </UFormField>

        <UAlert v-if="errorMsg" color="error" variant="soft" :title="errorMsg" />

        <UButton type="submit" color="primary" class="w-full">
          {{ isRegister ? 'Sign Up' : 'Log In' }}
        </UButton>
      </form>

      <template #footer>
        <div class="text-center text-sm">
          <UButton variant="ghost" @click="isRegister = !isRegister">
            {{ isRegister ? 'Already have an account? Log in' : 'Need an account? Register' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
