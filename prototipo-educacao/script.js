import { auth, db, storage } from "./firebase-init.js"; // Certifique-se de que o storage está incluído aqui
import { registerUser } from "./auth.js"; // Importa a função de registro
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import {
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const deleteUserButton = document.getElementById("deleteUserButton");
  const logoutButton = document.getElementById("logoutButton");
  const addContentForm = document.getElementById("addContentForm");
  const contentListA = document.getElementById("contentListA");
  const contentListB = document.getElementById("contentListB");
  const deleteButtonA = document.getElementById("deleteButtonA");
  const deleteButtonB = document.getElementById("deleteButtonB");
  const errorMessage = document.getElementById("error-message");

  let selectedContentId = null; // Variável para armazenar o ID do conteúdo selecionado
  let selectedTurma = null; // Variável para armazenar a turma do conteúdo selecionado

  // Função debounce para evitar múltiplas requisições consecutivas
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
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

  // Função para criar um Promise com timeout
  function timeoutPromise(promise, ms) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Operação excedeu o tempo limite"));
      }, ms);
      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  // Função de Login
  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      debounce(async (e) => {
        e.preventDefault();

        const loginButton = e.target.querySelector("button[type='submit']");
        loginButton.disabled = true; // Desabilita o botão

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        showLoading(); // Mostra o loading
        document.getElementById("error-message").textContent = ""; // Limpa mensagens de erro anteriores

        try {
          // Tenta fazer login com email e senha
          const userCredential = await timeoutPromise(
            signInWithEmailAndPassword(auth, email, password),
            10000 // Timeout de 10 segundos
          );
          const user = userCredential.user;

          // Obtém o documento do usuário no Firestore
          const docRef = doc(db, "usuarios", user.uid);
          console.log("Obtendo documento do usuário com ID:", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const tipo = docSnap.data().tipo;
            console.log("Tipo de usuário:", tipo);

            // Redireciona com base no tipo de usuário
            switch (tipo) {
              case "professor":
                window.location.href = "professor.html";
                break;
              case "aluno":
                window.location.href = "aluno.html";
                break;
              case "gestor":
                window.location.href = "gestor.html";
                break;
              default:
                console.error("Tipo de usuário desconhecido.");
                document.getElementById("error-message").textContent =
                  "Tipo de usuário desconhecido.";
                break;
            }
          } else {
            console.error("Nenhum documento encontrado para este usuário.");
            document.getElementById("error-message").textContent =
              "Nenhum documento encontrado para este usuário.";
          }
        } catch (error) {
          console.error("Erro ao fazer login: ", error.message);
          document.getElementById("error-message").textContent =
            "Erro ao fazer login: " + error.message;
        } finally {
          hideLoading(); // Esconde o loading
          loginButton.disabled = false; // Reabilita o botão
        }
      }, 1000) // Debounce de 1 segundo
    );
  }

  // Logout do usuário
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        console.log("Usuário deslogado com sucesso!");
        window.location.href = "index.html"; // Redirecionar para a página de login
      } catch (error) {
        console.error("Erro ao deslogar:", error.message);
      }
    });
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

  // Função para excluir o usuário
  if (deleteUserButton) {
    deleteUserButton.addEventListener("click", async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          await user.delete();
          console.log("Usuário excluído com sucesso.");
          window.location.href = "index.html"; // Redireciona após exclusão
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
    });
  }

  // Função para listar conteúdos por turma
  const listarConteudos = () => {
    const q = query(collection(db, "conteudos"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
      // Limpa as listas de ambas as turmas
      contentListA.innerHTML = "";
      contentListB.innerHTML = "";

      // Loop através dos documentos retornados pelo snapshot
      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt
          ? data.createdAt.toDate().toLocaleString()
          : "Data não disponível";

        // Cria o elemento do card
        const contentCard = document.createElement("div");
        contentCard.classList.add("content-card");

        // Define o HTML do card
        contentCard.innerHTML = `
        <a href="${data.fileUrl}" target="_blank">${data.title}</a>
        <p>Data: ${createdAt}</p>
      `;

        // Adiciona o conteúdo à lista apropriada com base na turma
        if (data.turma === "Turma A") {
          contentListA.appendChild(contentCard);
        } else if (data.turma === "Turma B") {
          contentListB.appendChild(contentCard);
        }

        // Adiciona evento de clique no link para selecionar o conteúdo
        const contentLink = contentCard.querySelector("a");
        contentLink.addEventListener("click", (e) => {
          e.preventDefault(); // Previne o comportamento padrão do link
          selectedContentId = doc.id; // Armazena o ID do conteúdo selecionado
          selectedTurma = data.turma; // Armazena a turma do conteúdo selecionado

          // Mostra o botão de exclusão apropriado baseado na turma
          if (selectedTurma === "Turma A") {
            deleteButtonA.style.display = "block";
            deleteButtonB.style.display = "none";
          } else {
            deleteButtonB.style.display = "block";
            deleteButtonA.style.display = "none";
          }
        });
      });
    });
  };

  listarConteudos(); // Chama a função para listar os conteúdos ao carregar a página

  // Excluir conteúdo
  const excluirConteudo = async (turma) => {
    if (!selectedContentId) {
      console.error("Nenhum conteúdo selecionado.");
      return;
    }

    try {
      const docRef = doc(db, "conteudos", selectedContentId);
      await deleteDoc(docRef);
      console.log("Conteúdo excluído com sucesso!");
      selectedContentId = null; // Reseta o ID do conteúdo selecionado
      listarConteudos(); // Atualiza a lista de conteúdos
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error.message);
    }
  };

  // Adicionar evento de clique para os botões de exclusão
  deleteButtonA.addEventListener("click", () => excluirConteudo("Turma A"));
  deleteButtonB.addEventListener("click", () => excluirConteudo("Turma B"));

  // Adicionar conteúdo
  if (addContentForm) {
    addContentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("contentTitle").value;
      const fileInput = document.getElementById("contentFile").files[0];
      const turma = document.querySelector('input[name="turma"]:checked').value;

      if (!title || !fileInput) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      const storageRef = ref(storage, `conteudos/${fileInput.name}`);

      showLoading();

      try {
        // Faz o upload do arquivo
        await uploadBytes(storageRef, fileInput);
        const fileUrl = await getDownloadURL(storageRef);

        // Adiciona o conteúdo ao Firestore
        await addDoc(collection(db, "conteudos"), {
          title,
          fileUrl,
          turma,
          createdAt: serverTimestamp(),
        });

        console.log("Conteúdo adicionado com sucesso!");
        listarConteudos(); // Atualiza a lista de conteúdos após adicionar
        addContentForm.reset(); // Reseta o formulário
      } catch (error) {
        console.error("Erro ao adicionar conteúdo:", error.message);
      } finally {
        hideLoading();
      }
    });
  }
});
