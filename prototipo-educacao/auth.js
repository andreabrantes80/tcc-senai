import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Função para criar um novo usuário
export async function registerUser(email, password, userType) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Salva o tipo de usuário no Firestore
    await setDoc(doc(db, "usuarios", user.uid), { tipo: userType });

    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Função para verificar o estado de autenticação do usuário
export function checkAuthState() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          resolve(userData.tipo); // Retorna o tipo de usuário
        } else {
          resolve(null); // Nenhum documento encontrado
        }
      } else {
        resolve(null); // Nenhum usuário logado
      }
    });
  });
}
