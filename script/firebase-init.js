import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTZmcb7uM1MbmwWtzPo8RXm8YOOhgCgSg",
  authDomain: "bd-projeto-senai.firebaseapp.com",
  projectId: "bd-projeto-senai",
  storageBucket: "bd-projeto-senai.appspot.com",
  messagingSenderId: "586899029663",
  appId: "1:586899029663:web:a51e9d2458354829666caa",
  measurementId: "G-BY8V5CXLD2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
