import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDyqvypm634-lTLKshBjZufknBxgGyRDq4',
  authDomain: 'anchateam.firebaseapp.com',
  databaseURL: 'https://anchateam-default-rtdb.firebaseio.com',
  projectId: 'anchateam',
  storageBucket: 'anchateam.appspot.com',
  messagingSenderId: '631644109230',
  appId: '1:631644109230:web:d7e29d1216b92eba35f03f'
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const database = getDatabase(app)
const storage = getStorage(app)

export { app, auth, database, storage }
