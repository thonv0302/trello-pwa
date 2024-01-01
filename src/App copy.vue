<template>
  <RouterView></RouterView>

  <button @click="createUser">Sign In</button>
  <pre>{{ user }}</pre>
</template>

<script setup>
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth'

const auth = useFirebaseAuth()
const user = useCurrentUser()
const createUser = async () => {
  createUserWithEmailAndPassword(auth, 'nguyenvietthoit@gmail1.com', '123456')
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user
      console.log('user: ', user)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      // ..
    })
}

const logOut = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    })
}

const signIn = () => {
  signInWithEmailAndPassword(auth, 'nguyenvietthoit@gmail.com', '123456')
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user
      console.log('user: ', user)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      // ..
    })
}

console.log('auth: ', auth)
</script>
