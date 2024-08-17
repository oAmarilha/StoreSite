// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDaCbDHPbT_domsfjE0Girlt_7QdOBEP9s",
  authDomain: "store-adbf3.firebaseapp.com",
  databaseURL: "https://store-adbf3-default-rtdb.firebaseio.com",
  projectId: "store-adbf3",
  storageBucket: "store-adbf3.appspot.com",
  messagingSenderId: "607013324820",
  appId: "1:607013324820:web:00477ec2f55fdea34fff01",
  measurementId: "G-Q2R3KHKY7P"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
