<script setup>
import { ArrowSmallLeftIcon } from '@heroicons/vue/24/solid'
import { ref } from 'vue'
import { useAuth } from '@/composables/auth'

const { signUp } = useAuth()

const signUpData = ref({
  email: '',
  password: '',
  passwordConfirm: ''
})

const isLoading = ref(false)

const onSignUp = async () => {
  // console.log('vao day')
  await signUp(signUpData.value)
}
</script>

<template>
  <h2 class="text-2xl font-extrabold text-gray-900 flex items-center">
    <RouterLink
      :to="{
        name: 'signIn'
      }"
      class="mr-2"
    >
      <ArrowSmallLeftIcon class="w-6 h-6" /> </RouterLink
    >Sign up your account
  </h2>
  <div class="mt-8">
    <VeeForm class="space-y-6" v-slot="{ errors }" @submit="onSignUp">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
        <div class="mt-1">
          <VeeField
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            v-model="signUpData.email"
            rules="required|email"
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

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
        <div class="mt-1">
          <VeeField
            id="password"
            name="password"
            type="password"
            v-model="signUpData.password"
            rules="required|minLength:6"
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
        <label for="password-confirm" class="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <div class="mt-1">
          <VeeField
            id="password-confirm"
            name="passwordConfirm"
            type="password"
            v-model="signUpData.passwordConfirm"
            rules="required|minLength:6|confirmed:@password"
            :class="[
              'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm',
              {
                'ring-red-500 border-red-500': errors.passwordConfirm,
                ' focus:ring-indigo-500 focus:border-indigo-500': !errors.passwordConfirm
              }
            ]"
          />
          <ErrorMessage name="passwordConfirm" class="mt-2 text-sm text-red-600" />
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
          Sign up
        </button>
      </div>
    </VeeForm>
    <div class="text-center mt-2">
      <RouterLink
        :to="{ name: 'signIn' }"
        class="text-sm text-gray-600 hover:underline hover:text-blue-700"
      >
        Already have an account.</RouterLink
      >
    </div>
  </div>
</template>
