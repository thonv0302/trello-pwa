import { useFirebaseAuth } from 'vuefire'
import {
  createUserWithEmailAndPassword,
  signOut as logOut,
  signInWithEmailAndPassword
} from 'firebase/auth'
export function useAuth() {
  const auth = useFirebaseAuth()

  const signUp = async (payload) => {
    return createUserWithEmailAndPassword(auth, payload.email, payload.password)
  }

  const signIn = async (payload) => {
    return signInWithEmailAndPassword(auth, payload.email, payload.password)
  }

  const signOut = async () => {
    return logOut()
  }

  return {
    signUp,
    signIn,
    signOut
  }
}
