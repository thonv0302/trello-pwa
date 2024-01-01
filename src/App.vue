<template>
  <component :is="layoutSelected">
    <RouterView />
  </component>
</template>

<script setup>
import Auth from './layouts/Auth.vue'
import Home from './layouts/Home.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const layoutSelected = computed(() => {
  if (['signUp', 'signIn'].includes(route.name)) {
    return Auth
  }

  return Home
})
</script>
