<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/boardStore'

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  columnIndex: {
    type: Number,
    required: true
  }
})

const router = useRouter()
const boardStore = useBoardStore()

function deleteColumn(columnIndex) {
  boardStore.deleteColumn(columnIndex)
}

function goToTask(taskId) {
  router.push({
    name: 'task',
    params: {
      id: taskId
    }
  })
}

const newTaskName = ref('')

function addTask() {
  boardStore.addTask({
    taskName: newTaskName.value,
    columnIndex: props.columnIndex
  })
  newTaskName.value = ''
}

function dropItem(event, { toColumnIndex, toTaskIndex }) {
  const type = event.dataTransfer.getData('type')
  const fromColumnIndex = event.dataTransfer.getData('from-column-index')

  if (type === 'task') {
    const fromTaskIndex = event.dataTransfer.getData('from-task-index')

    boardStore.moveTask({
      fromTaskIndex,
      toTaskIndex,
      fromColumnIndex,
      toColumnIndex
    })
  } else if (type === 'column') {
    boardStore.moveColumn({
      fromColumnIndex,
      toColumnIndex
    })
  }
}

function pickupColumn(event, fromColumnIndex) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('type', 'column')
  event.dataTransfer.setData('from-column-index', fromColumnIndex)
}

function pickupTask(event, { fromColumnIndex, fromTaskIndex }) {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.setData('type', 'task')
  event.dataTransfer.setData('from-column-index', fromColumnIndex)
  event.dataTransfer.setData('from-task-index', fromTaskIndex)
}
</script>

<template>
  <div
    class="bg-gray-200 p-5 rounded min-w-[250px]"
    draggable="true"
    @dragstart.self="pickupColumn($event, columnIndex)"
    @dragenter.prevent
    @dragover.prevent
    @drop.stop="dropItem($event, { toColumnIndex: columnIndex })"
  >
    <header>
      <input
        class="title-input bg-transparent focus:bg-white rounded px-1 w-4/5 font-bold mb-4"
        type="text"
        v-model="column.name"
      />
      <button @click="deleteColumn(columnIndex)">x</button>
    </header>
    <TransitionGroup tag="ul" name="fade">
      <li
        v-for="(task, taskIndex) in column.tasks"
        :key="task.id"
        class="task bg-white p-2 mb-2 rounded shadow-sm max-w-[250px] flex"
        draggable="true"
        @dragstart="
          pickupTask($event, {
            fromColumnIndex: columnIndex,
            fromTaskIndex: taskIndex
          })
        "
        @drop.stop="
          dropItem($event, {
            toColumnIndex: columnIndex,
            toTaskIndex: taskIndex
          })
        "
      >
        <div class="mb-4" @click="goToTask(task.id)">
          <span class="font-semibold">{{ task.name }}</span>
          <p>{{ task.description }}</p>
        </div>
      </li>
    </TransitionGroup>
    <input
      class="title-input bg-transparent focus:bg-white rounded px-1 w-4/5 font-bold mb-4"
      type="text"
      placeholder="Create new task"
      v-model="newTaskName"
      @keyup.enter="addTask"
    />
  </div>
</template>

<style>
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
