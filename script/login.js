import { auth } from "./firebase-init.js";
import { db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const logoutForm = document.getElementById("logout-form");

  // Definição da função showDialog
  function showDialog() {
    alert("Você precisa fazer login para acessar esta página.");
    // Você pode adicionar mais lógica aqui, como abrir um modal
  }

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
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const email = document.getElementById("email").value;
    const password = document.getElementById("senha").value;

    // Validação
    if (!isEmailValid(email) || !isPasswordValid(password)) {
      const errorMessageElement = document.getElementById("error-message");
      errorMessageElement.textContent = "Email ou senha inválidos.";
      errorMessageElement.style.display = "block"; // Torna a mensagem visível
      return;
    }

    showLoading();

    // Limpa mensagens de erro anteriores
    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.style.display = "none"; // Esconde mensagem anterior

    try {
      // Faz o login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Usuário logado:", user);

      // Obtém os dados do Firestore com base no UID
      const userDocRef = doc(collection(db, "users"), user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const categoria = userData.role;

        // Redirecionar com base na categoria
        redirectUser(categoria);
      } else {
        handleError(new Error("Erro: Usuário não encontrado."));
      }
    } catch (error) {
      handleError(error);
    } finally {
      hideLoading();
    }
  });

  // Função para redirecionar o usuário com base na categoria
  function redirectUser(role) {
    switch (role) {
      case "aluno":
        window.location.href = "aluno.html";
        break;
      case "professor":
        window.location.href = "professor.html";
        break;
      case "gestor":
        window.location.href = "gestor.html";
        break;
      default:
        handleError(new Error("role desconhecida."));
    }
  }

  function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isPasswordValid(password) {
    return password.length >= 6; // A senha deve ter pelo menos 6 caracteres
  }

  function handleError(error) {
    console.error("Erro ao fazer login:", error.message);

    const errorMessageElement = document.getElementById("error-message");
    errorMessageElement.textContent = "Erro: " + error.message;
    errorMessageElement.style.display = "block"; // Exibe a mensagem de erro

    // Oculta a mensagem após 5 segundos
    setTimeout(() => {
      errorMessageElement.style.display = "none";
    }, 5000);
  }

  // Função para recuperação de senha
  window.recoveryPassword = async function recoveryPassword() {
    const email = document.getElementById("email").value;

    if (!email) {
      alert("Por favor, insira o seu e-mail.");
      return;
    }

    showLoading();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Email de recuperação de senha enviado com sucesso!");
    } catch (error) {
      alert("Erro ao enviar email de recuperação: " + error.message);
    } finally {
      hideLoading();
    }
  };

  //  if (logoutForm) {
  //    logoutForm.addEventListener("submit", async (event) => {
  //      event.preventDefault(); // Impede o envio padrão do formulário
  //      console.log("Logout form submitted");
  //      showLoading(); // Mostrar o loading

  //      try {
  //        // Deslogar o usuário
  //        await signOut(auth);
  //        console.log("Usuário deslogado com sucesso!");

  //        // Limpar dados do localStorage (caso esteja usando para armazenar informações)
  //        localStorage.clear();

  //        // Redirecionar para a página inicial após o logout bem-sucedido
  //        window.location.href = "index.html";
  //      } catch (error) {
  //        // Exibir mensagem de erro se o logout falhar
  //        console.error("Erro ao deslogar:", error.message);
  //        alert("Erro ao deslogar: " + error.message);
  //      } finally {
  //        hideLoading(); // Esconder o loading
  //      }
  //    });
  //  } else {
  //    console.error("Logout form não encontrado");
  //  }
  // Adiciona o evento de clique ao botão de logout
  document.getElementById("logout-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio do formulário
    openModal("logoutModal"); // Abre a modal de confirmação
  });

  // Adiciona o evento de clique ao botão de confirmação de logout
  document
    .getElementById("confirmLogout")
    .addEventListener("click", async () => {
      // Aqui você pode chamar a função para deslogar o usuário
      try {
        await signOut(auth);
        console.log("Usuário deslogado com sucesso!");
        localStorage.clear(); // Limpa os dados do localStorage
        window.location.href = "index.html"; // Redireciona após o logout
      } catch (error) {
        console.error("Erro ao deslogar:", error.message);
        alert("Erro ao deslogar: " + error.message);
      } finally {
        closeModal("logoutModal"); // Fecha a modal
      }
    });

  // // Verificação do estado de autenticação
  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     // Se o usuário já está autenticado, carrega seus dados
  //     loadUserData(user.uid);
  //   } else {
  //     // Se o usuário não está autenticado, redireciona para a página de login
  //     if (window.location.pathname !== "/index.html") {
  //       // Ajuste o caminho conforme necessário
  //       window.location.href = "index.html"; // Redireciona para a página de login
  //     }
  //   }
  // });

  // Função para carregar os dados do usuário e redirecionar
  async function loadUserData(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Dados do usuário:", userData);

        // Redireciona com base na categoria do usuário, mas apenas se não estiver na página correta
        if (window.location.pathname !== `/${userData.role}.html`) {
          // Ajuste conforme necessário
          redirectUser(userData.role);
        }
      } else {
        console.error("Documento do usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao carregar os dados do usuário:", error.message);
    }
  }

  if (!localStorage.getItem("myPage.expectSignIn")) showDialog(); // or redirect to sign-in page
});
