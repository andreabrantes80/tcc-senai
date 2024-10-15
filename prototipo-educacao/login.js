import { auth } from "./firebase-init.js";
import { db } from "./firebase-init.js"; // Importar Firestore se necessário
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import {
  collection,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";


window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  // Função para mostrar o loading (spinner)
  function showLoading() {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading";
    loadingDiv.style.position = "fixed";
    loadingDiv.style.top = "50%";
    loadingDiv.style.left = "50%";
    loadingDiv.style.transform = "translate(-50%, -50%)";
    loadingDiv.innerHTML = "<p>Carregando...</p>";
    document.body.appendChild(loadingDiv);
  }

  // Função para esconder o loading (spinner)
  function hideLoading() {
    const loadingDiv = document.getElementById("loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  // Função de login
window.login = async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validação
  if (!isEmailValid(email) || !isPasswordValid(password)) {
    document.getElementById("error-message").textContent =
      "Email ou senha inválidos.";
    return;
  }

  showLoading();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Usuário logado:", user);

    // Usar collection e doc para buscar a categoria do usuário
    const userDocRef = doc(collection(db, "usuarios"), user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const categoria = userData.categoria; // Supondo que a categoria esteja armazenada aqui

      // Redirecionar com base na categoria
      if (categoria === "aluno") {
        window.location.href = "aluno.html";
      } else if (categoria === "professor") {
        window.location.href = "professor.html";
      } else if (categoria === "gestor") {
        window.location.href = "gestor.html";
      } else {
        console.error("Categoria desconhecida:", categoria);
        document.getElementById("error-message").textContent =
          "Erro: Categoria desconhecida.";
      }
    } else {
      console.error("Documento do usuário não encontrado.");
      document.getElementById("error-message").textContent =
        "Erro: Usuário não encontrado.";
    }
  } catch (error) {
    handleError(error);
  } finally {
    hideLoading();
  }
};

  function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isPasswordValid(password) {
    return password.length >= 6; // Exemplo: a senha deve ter pelo menos 6 caracteres
  }

  // Função para tratamento de erros
  function handleError(error) {
    console.error("Erro ao fazer login:", error.message);
    document.getElementById("error-message").textContent =
      "Erro: " + error.message;
  }

  // Função para recuperação de senha
  window.recoveryPassword = function recoveryPassword() {
    const email = document.getElementById("email").value;

    if (!email) {
      alert("Por favor, insira o seu e-mail.");
      return;
    }

    showLoading();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        hideLoading();
        alert("Email de recuperação de senha enviado com sucesso!");
      })
      .catch((error) => {
        hideLoading();
        alert("Erro ao enviar email de recuperação: " + error.message);
      });
  };
});
