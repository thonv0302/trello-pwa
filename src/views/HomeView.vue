<script setup>
import { collection } from 'firebase/firestore'
import { useFirestore, useCollection } from 'vuefire'

const db = useFirestore()

const cafeCollection = useCollection(collection(db, 'cafes'))
</script>

<template>
  <main>
    <pre>{{ cafeCollection }}</pre>
  </main>
</template>
