import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTAlTqqSGEBbXXminG4VyiL0PW0pf9qrM",
  authDomain: "portal-edu-6e89d.firebaseapp.com",
  projectId: "portal-edu-6e89d",
  storageBucket: "portal-edu-6e89d.appspot.com",
  messagingSenderId: "816961560273",
  appId: "1:816961560273:web:3697d9191f3f5e7158eff0",
  measurementId: "G-0BHMSQQ3ZV",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);



// Exporta auth e db para uso em outros módulos
export { auth, db, storage };
