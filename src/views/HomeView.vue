<script setup>
// import { collection } from 'firebase/firestore'
// import { useFirestore, useCollection } from 'vuefire'
// const db = useFirestore()
// const cafeCollection = useCollection(collection(db, 'cafes'))
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BoardColumn from '@/components/BoardColumn.vue'
import { useBoardStore } from '@/stores/boardStore'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()

const newColumnName = ref('')

function addColumn() {
  boardStore.addColumn(newColumnName.value)
  newColumnName.value = ''
}

const isModalOpen = computed(() => {
  return route.name === 'task'
})

function closeModal() {
  router.push('/')
}
</script>

<template>
  <TransitionGroup tag="div" name="fade" class="flex items-start overflow-x-auto gap-4">
    <!-- <div class="bg-gray-200 p-5 rounded min-w-[250px]"> -->
    <BoardColumn
      v-for="(column, columnIndex) in boardStore.board.columns"
      :key="column.name"
      :column="column"
      :columnIndex="columnIndex"
    />
    <!-- </div>
     -->
    <input
      class="bg-gray-200 whitespace-nowrap p-2 rounded opacity-50"
      type="text"
      placeholder="+ Add Another Column"
      @keyup.enter="addColumn"
      v-model="newColumnName"
    />
  </TransitionGroup>
  <div v-if="isModalOpen" class="absolute inset-0 bg-black-50" @click.self="closeModal">
    <router-view />
  </div>
  <main>
    <pre>{{ boardStore.board }}</pre>
  </main>
</template>

<style scoped>
.bg-black-50 {
  background: rgba(0, 0, 0, 0.5);
}
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
