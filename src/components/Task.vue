<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'

const boardStore = useBoardStore()
const route = useRoute()
const router = useRouter()

const task = computed(() => {
  return boardStore.getTask(route.params.id)
})

function deleteTask() {
  boardStore.deleteTask(route.params.id)
  router.push('/')
}
</script>

<template>
  <div v-if="task" class="max-w-2xl bg-gray-200 m-32 mx-auto py-4 rounded">
    <div class="flex flex-col flex-grow items-start justify-between px-4">
      <div class="flex justify-between w-full items-center mb-4">
        <input class="flex-1" v-model="task.name" />
        <button class="w-6 h-6" @click="deleteTask">x</button>
      </div>
      <textarea class="w-full mb-4" v-model="task.description"> </textarea>
    </div>
  </div>
</template>
