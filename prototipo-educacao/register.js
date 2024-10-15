import { auth, db } from "./firebase-init.js";
import { registerUser } from "./auth.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Função para mostrar/esconder loading (spinner)
function toggleLoading(show) {
  let loadingDiv = document.getElementById("loading");
  if (show) {
    // Verifica se o loading já existe
    if (!loadingDiv) {
      loadingDiv = document.createElement("div");
      loadingDiv.id = "loading";
      loadingDiv.style.position = "fixed";
      loadingDiv.style.top = "50%";
      loadingDiv.style.left = "50%";
      loadingDiv.style.transform = "translate(-50%, -50%)";
      loadingDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Fundo semitransparente
      loadingDiv.style.color = "#fff"; // Cor do texto
      loadingDiv.style.padding = "20px"; // Espaçamento
      loadingDiv.style.borderRadius = "10px"; // Bordas arredondadas
      loadingDiv.innerHTML = "<p>Carregando...</p>";
      document.body.appendChild(loadingDiv);
    }
  } else if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Função para registrar o usuário
window.registerUserHandler = async function registerUserHandler(event) {
  event.preventDefault(); // Previne o comportamento padrão do formulário
  console.log("Submit event triggered"); // Log para verificação

  const registerButton = event.target.querySelector("button[type='submit']");

  // Desabilitar o botão para evitar múltiplas chamadas
  registerButton.disabled = true;

  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const tipo = document.querySelector('input[name="tipo"]:checked').value;

  console.log("Dados do usuário:", { email, password, tipo }); // Log dos dados

  toggleLoading(true);

  try {
    const { success, message } = await registerUser(email, password, tipo);
    console.log("Resultado do registro:", { success, message }); // Log do resultado

    if (success) {
      alert("Usuário registrado com sucesso!");
      window.location.href = "gestor.html"; // Redireciona após registro
      return; // Adicionando return para parar a execução da função
    } else {
      document.getElementById("error-message").textContent =
        "Erro ao registrar usuário: " + message;
    }
  } catch (error) {
    console.error("Erro na função registerUser:", error); // Log de erro
    document.getElementById("error-message").textContent =
      "Erro inesperado: " + error.message;
  } finally {
    toggleLoading(false);

    // Reabilitar o botão caso o registro falhe
    registerButton.disabled = false; // Reabilitar botão sempre
  }
};

// Logout do usuário
window.logout = async function logout() {
  console.log("Logout button clicked"); // Log do botão de logout
  try {
    await signOut(auth);
    console.log("Usuário deslogado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao deslogar:", error.message);
  }
};

// Função para excluir o usuário
window.deleteUser = async function deleteUser() {
  console.log("Delete user button clicked"); // Log do botão de excluir usuário
  const user = auth.currentUser;
  if (user) {
    try {
      await user.delete();
      console.log("Usuário excluído com sucesso.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Erro ao excluir o usuário:", error.message);
      document.getElementById("error-message").textContent =
        "Erro ao excluir o usuário: " + error.message;
    }
  } else {
    console.log("Nenhum usuário autenticado para excluir.");
    document.getElementById("error-message").textContent =
      "Nenhum usuário autenticado para excluir.";
  }
};

window.addEventListener("DOMContentLoaded", () => {
  console.log("Página carregada");
});
