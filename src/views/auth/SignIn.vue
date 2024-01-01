<script setup>
import { ref } from 'vue'
import { ArrowSmallLeftIcon } from '@heroicons/vue/24/solid'
import { useAuth } from '@/composables/auth'

const { signIn } = useAuth()

const loginData = ref({
  email: 'nguyenvietthoit@gmail1.com',
  password: '123456'
})

const isLoading = ref(false)

const onSignIn = async () => {
  try {
    await signIn(loginData.value)
  } catch (error) {
    console.log(error)
  }
}
</script>
<template>
  <h2 class="text-2xl font-extrabold text-gray-900 flex items-center">
    <RouterLink
      :to="{
        name: 'signUp'
      }"
      class="mr-2"
    >
      <ArrowSmallLeftIcon class="w-6 h-6" /> </RouterLink
    >Sign in to your account
  </h2>

  <div class="mt-8">
    <VeeForm class="space-y-6" v-slot="{ errors }" @submit="onSignIn">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
        <div class="mt-1">
          <VeeField
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            v-model="loginData.email"
            rules="required"
            :class="[
              'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
              {
                'ring-red-500 border-red-500': errors.email,
                ' focus:ring-indigo-500 focus:border-indigo-500': !errors.email
              }
            ]"
          />
          <ErrorMessage name="email" class="mt-2 text-sm text-red-600" />
        </div>
      </div>

      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
        <div class="mt-1">
          <VeeField
            id="password"
            name="password"
            type="password"
            v-model="loginData.password"
            rules="required"
            :class="[
              'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
              {
                'ring-red-500 border-red-500': errors.password,
                ' focus:ring-indigo-500 focus:border-indigo-500': !errors.password
              }
            ]"
          />
          <ErrorMessage name="password" class="mt-2 text-sm text-red-600" />
        </div>
      </div>

      <div>
        <button
          type="submit"
          :class="[
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
            {
              'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500':
                !isLoading,
              'bg-indigo-300': isLoading
            }
          ]"
          :disabled="isLoading"
        >
          <!-- <Spinner v-if="isLoading" class="w-5 h-5 mr-2" /> -->
          Sign in
        </button>
      </div>
    </VeeForm>

    <div class="text-center mt-2">
      <RouterLink
        :to="{ name: 'signUp' }"
        class="text-sm text-gray-600 hover:underline hover:text-blue-700"
      >
        Sign up an account.</RouterLink
      >
    </div>
  </div>
</template>
