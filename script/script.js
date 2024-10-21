import { auth, db, storage } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
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
  getFirestore,
  setDoc,
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const authPages = ["aluno.html", "professor.html", "gestor.html"];

  // Verifica se o usuário está em uma das páginas de autenticação
  if (authPages.includes(window.location.pathname.split("/").pop())) {
    if (!isLoggedIn) {
      // Exibe uma mensagem e redireciona o usuário para a página inicial
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "index.html"; // Redireciona para a página inicial
    }
  }
});
// INÍCIO DO SCRIPT DO INDEX
let currentIndex = 0;
const slides = document.querySelector(".slidesfoto");
const totalSlides = document.querySelectorAll(".slidefoto").length;

function showSlide(index) {
  if (index >= totalSlides) {
    currentIndex = 0;
  } else if (index < 0) {
    currentIndex = totalSlides - 1;
  } else {
    currentIndex = index;
  }
  slides.style.transform = `translateX(-${currentIndex * 1920}px)`;
}

function nextSlide() {
  showSlide(currentIndex + 1);
}

function prevSlide() {
  showSlide(currentIndex - 1);
}

setInterval(nextSlide, 5000); // Muda de slide automaticamente a cada 5 segundos
// FIM DO SCRIPT DO INDEX

//SCRIPT DE ALGUMAS FUNCIONALIDADES DO SITE

// Atualizar a função de adicionar professor
window.adicionarProfessor = function () {
  const email = document.getElementById("emailProfessor").value;
  const senha = document.getElementById("senhaProfessor").value;
  const nome = document.getElementById("nomeProfessor").value; // Novo campo

  if (email && senha && nome) {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const user = userCredential.user;
        return setDoc(doc(db, "users", user.uid), {
          email: email,
          role: "professor",
          nome: nome, // Adicionando o nome ao Firestore
        });
      })
      .then(() => {
        alert("Professor adicionado com sucesso!");
        closeModal("modalProfessor");
      })
      .catch((error) => {
        alert("Erro ao adicionar professor: " + error.message);
      });
  } else {
    alert("Por favor, preencha todos os campos!");
  }
};

window.adicionarGestor = async function () {
  const email = document.getElementById("emailGestor").value;
  const senha = document.getElementById("senhaGestor").value;
  const nome = document.getElementById("nomeGestor").value;

  if (email && senha && nome) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "gestor",
        nome: nome,
      });

      alert("Gestor adicionado com sucesso!");
      closeModal("modalGestor");
    } catch (error) {
      alert("Erro ao adicionar gestor: " + error.message);
    }
  } else {
    alert("Por favor, preencha todos os campos!");
  }
};

// Função para excluir gestor
window.excluirGestor = async function () {
  const emailGestor = document.getElementById("emailGestor").value;

  if (emailGestor) {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailGestor));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        alert("Gestor excluído com sucesso!");
      } else {
        alert("Gestor não encontrado.");
      }
    } catch (error) {
      alert("Erro ao excluir gestor: " + error.message);
    }
  } else {
    alert("Por favor, informe o email do gestor para excluir.");
  }
};

window.adicionarAluno = async function () {
  const email = document.getElementById("emailAluno").value;
  const senha = document.getElementById("senhaAluno").value;
  const turma = document.getElementById("turmaAluno").value; // Nova seleção de turma

  try {
    // Adiciona o aluno com a turma no Firestore
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: "aluno",
      turma: turma, // Associar aluno à turma
    });

    alert("Aluno adicionado com sucesso!");
    closeModal("modalAluno");
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
    alert("Erro ao adicionar aluno: " + error.message);
  }
};

window.excluirAluno = async function () {
  const emailAluno = document.getElementById("emailAluno").value;

  if (emailAluno) {
    try {
      // Referência à coleção 'users'
      const usersRef = collection(db, "users");

      // Filtra para encontrar o aluno pelo email
      const q = query(usersRef, where("email", "==", emailAluno));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          // Exclui o documento do aluno
          await deleteDoc(doc.ref);
        });

        alert("Aluno excluído com sucesso!");
      } else {
        alert("Aluno não encontrado.");
      }
    } catch (error) {
      alert("Erro ao excluir aluno: " + error.message);
    }
  } else {
    alert("Por favor, informe o email do aluno para excluir.");
  }
};

// Função para atribuir disciplina a um professor
window.atribuirDisciplina = async function () {
  const emailProfessor = document.getElementById(
    "emailProfessorDisciplina"
  ).value;
  const disciplina = document.getElementById("disciplina").value;

  if (!emailProfessor || !disciplina) {
    alert("Por favor, informe o email do professor e a disciplina.");
    return;
  }

  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", emailProfessor)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        await addDoc(collection(db, "disciplinas"), {
          professorId: doc.id,
          disciplina: disciplina,
        });
      });
      alert("Disciplina atribuída com sucesso!");
      closeModal("modalDisciplinas");
    } else {
      alert("Professor não encontrado!");
    }
  } catch (error) {
    alert("Erro ao atribuir disciplina: " + error.message);
  }
};

window.excluirDisciplina = async function () {
  const emailProfessor = document.getElementById(
    "emailProfessorDisciplina"
  ).value;
  const disciplina = document.getElementById("disciplina").value;

  if (!emailProfessor || !disciplina) {
    alert(
      "Por favor, informe o email do professor e a disciplina para excluir."
    );
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists() && userDoc.data().role === "gestor") {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailProfessor));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const professorDoc = querySnapshot.docs[0];
        const professorId = professorDoc.id;

        // Busca a disciplina na coleção 'disciplinas'
        const disciplinasRef = collection(db, "disciplinas");
        const disciplinaQuery = query(
          disciplinasRef,
          where("professorId", "==", professorId),
          where("disciplina", "==", disciplina)
        );
        const disciplinaSnapshot = await getDocs(disciplinaQuery);

        if (!disciplinaSnapshot.empty) {
          // Remove todas as disciplinas que correspondem ao professor e à disciplina
          const deletePromises = disciplinaSnapshot.docs.map((doc) =>
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);
          alert("Disciplina excluída com sucesso!");
        } else {
          alert("Disciplina não encontrada para o professor.");
        }
      } else {
        alert("Professor não encontrado.");
      }
    } else {
      alert("Você não tem permissão para excluir disciplinas.");
    }
  } catch (error) {
    alert("Erro ao excluir disciplina: " + error.message);
  }
};

window.listarProfessores = async function () {
  const professoresTable = document.getElementById("professoresTable");

  if (!professoresTable) {
    console.error("Tabela de professores não encontrada.");
    return;
  }

  const tbody = professoresTable.getElementsByTagName("tbody")[0];
  tbody.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

  try {
    const professoresSnapshot = await getDocs(collection(db, "users"));
    const disciplinaPromises = [];

    professoresSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role === "professor") {
        const newRow = tbody.insertRow();

        const cellProfessorNome = newRow.insertCell(0);
        const cellProfessorEmail = newRow.insertCell(1);
        const cellDisciplina = newRow.insertCell(2);

        cellProfessorNome.innerText = data.nome; // Exibe o nome do professor
        cellProfessorEmail.innerText = data.email; // Exibe o email do professor

        // Busca as disciplinas atribuídas a este professor
        disciplinaPromises.push(
          getDocs(
            query(
              collection(db, "disciplinas"),
              where("professorId", "==", doc.id)
            )
          ).then((disciplinasSnapshot) => {
            const disciplinas = disciplinasSnapshot.docs.map(
              (d) => d.data().disciplina
            );
            cellDisciplina.innerText =
              disciplinas.length > 0 ? disciplinas.join(", ") : "Nenhuma";
          })
        );
      }
    });

    // Aguarda todas as promessas de busca de disciplinas
    await Promise.all(disciplinaPromises);
  } catch (error) {
    console.error("Erro ao listar professores:", error);
  }
};

// Função para enviar documento para a turma
window.enviarDocumentoParaTurma = async function () {
  const turmaId = document.getElementById("turmaSelect").value;
  const file = document.getElementById("fileInput").files[0];

  // Verificação de seleção de turma e arquivo
  if (!turmaId || !file) {
    alert("Por favor, selecione uma turma e um arquivo.");
    return;
  }

  const user = auth.currentUser; // Verifica o usuário autenticado

  // Verifica se o usuário está autenticado
  if (!user) {
    alert("Usuário não autenticado.");
    return;
  }

  try {
    // Verifica o papel do usuário
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== "professor") {
      alert("Acesso negado. Você não tem permissão para enviar documentos.");
      return;
    }

    // Realiza o upload do arquivo
    const storageRef = ref(storage, `turmas/${turmaId}/${file.name}`);
    await uploadBytes(storageRef, file);

    // Obtém a URL do arquivo enviado
    const downloadURL = await getDownloadURL(storageRef);

    // Atualiza ou cria o documento de conteúdos da turma
    await setDoc(
      doc(db, "conteudos", turmaId),
      {
        url: downloadURL,
        nomeArquivo: file.name,
        timestamp: new Date(),
      },
      { merge: true }
    ); // Utiliza merge para não sobrescrever outros campos

    alert("Documento enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar documento:", error);
    alert("Erro ao enviar documento: " + error.message);
  }
};

window.listarTurmas = function () {
  const turmasTable = document
    .getElementById("turmasTable")
    .getElementsByTagName("tbody")[0];
  turmasTable.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

  // Referência à coleção 'users' no Firestore para buscar os alunos
  getDocs(collection(db, "users"))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Filtra os alunos (users que possuem role 'aluno' e têm uma turma associada)
        if (data.role === "aluno" && data.turma) {
          const newRow = turmasTable.insertRow();

          const cellTurma = newRow.insertCell(0);
          const cellAluno = newRow.insertCell(1);

          cellTurma.innerText = data.turma; // Exibe o nome da turma do aluno
          cellAluno.innerText = data.email; // Exibe o email do aluno
        }
      });
    })
    .catch((error) => {
      console.error("Erro ao listar turmas:", error);
    });
};

// Função para abrir e fechar modais
window.openModal = function (modalId) {
  document.getElementById(modalId).style.display = "block";
};

window.closeModal = function (modalId) {
  document.getElementById(modalId).style.display = "none";
};

// Chamando as funções para listar dados assim que a página carregar
window.onload = function () {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verificação e listagem com base no papel do usuário
        switch (userData.role) {
          case "professor":
            listarProfessores();
            listarTurmas();
            // listarTurmas(); // Professores também podem querer ver turmas
            break;
          case "aluno":
            listarTurmas(); // Alunos veem apenas turmas
            listarProfessores();
            break;
          case "gestor":
            listarProfessores(); // Gestores podem ver professores
            listarTurmas(); // E também turmas

            break;
          default:
            console.error("Papel de usuário desconhecido:", userData.role);
        }
      } else {
        console.error("Documento do usuário não encontrado.");
      }
    } else {
      console.log("Usuário não está autenticado.");
    }
  });
};

let isProfessoresVisible = false; // Estado inicial da seção de professores

document
  .getElementById("minhasProfessoresLink")
  .addEventListener("click", function () {
    // Seleciona a seção de professores
    const professoresSection = document.getElementById("professores");

    // Alterna a visibilidade da seção
    isProfessoresVisible = !isProfessoresVisible; // Inverte o estado

    if (isProfessoresVisible) {
      // Oculta todas as seções
      document.querySelectorAll("section").forEach((section) => {
        section.style.display = "none";
      });

      // Exibe a seção de professores
      professoresSection.style.display = "block";
    } else {
      // Oculta a seção de professores
      professoresSection.style.display = "none";
    }
  });

let isTurmasVisible = false; // Estado inicial da seção de professores

document
  .getElementById("minhasTurmasLink")
  .addEventListener("click", function () {
    // Seleciona a seção de professores
    const turmasSection = document.getElementById("turmas");

    // Alterna a visibilidade da seção
    isTurmasVisible = !isTurmasVisible; // Inverte o estado

    if (isTurmasVisible) {
      // Oculta todas as seções
      document.querySelectorAll("section").forEach((section) => {
        section.style.display = "none";
      });

      // Exibe a seção de professores
      turmasSection.style.display = "block";
    } else {
      // Oculta a seção de professores
      turmasSection.style.display = "none";
    }
  });
