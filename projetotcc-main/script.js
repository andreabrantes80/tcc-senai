import { auth, db, storage } from "./firebase-init.js";
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
  setDoc,
  updateDoc,
  updateObject,
  getFiles,
  getDownloadURL,
  createUserWithEmailAndPassword,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Função para cadastrar usuário
const registerUser = async (email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Adiciona a função do usuário (gestor, professor, aluno) no Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,
    });

    console.log("Usuário cadastrado com sucesso:", user.email);
  } catch (error) {
    console.error("Erro ao cadastrar o usuário:", error.message);
  }
};

// Função para login de usuário
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Usuário logado com sucesso:", user.email);
    return user;
  } catch (error) {
    console.error("Erro ao fazer login:", error.message);
  }
};

// Função para upload de arquivos
const uploadContent = async (file, turmaId) => {
  try {
    const storageRef = ref(storage, `conteudos/${turmaId}/${file.name}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    console.log("Arquivo disponível em:", downloadURL);

    // Armazenar no Firestore a referência ao conteúdo
    await setDoc(doc(db, "conteudos", turmaId), {
      url: downloadURL,
      timestamp: new Date(),
    });

    console.log("Conteúdo salvo com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error.message);
  }
};

// Função para listar conteúdos de uma turma
const getTurmaContent = async (turmaId) => {
  try {
    const docRef = doc(db, "conteudos", turmaId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Conteúdo da turma:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("Nenhum conteúdo encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error.message);
  }
};

// Função para adicionar professor
window.adicionarProfessor = function () {
  const email = document.getElementById("emailProfessor").value;
  const senha = document.getElementById("senhaProfessor").value;

  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection("users").doc(user.uid).set({
        email: email,
        role: "professor",
      });
    })
    .then(() => {
      alert("Professor adicionado com sucesso!");
      closeModal("modalProfessor");
    })
    .catch((error) => {
      alert("Erro ao adicionar professor: " + error.message);
    });
};

// Função para adicionar aluno
window.adicionarAluno = function () {
  const email = document.getElementById("emailAluno").value;
  const senha = document.getElementById("senhaAluno").value;

  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      const user = userCredential.user;
      return db.collection("users").doc(user.uid).set({
        email: email,
        role: "aluno",
      });
    })
    .then(() => {
      alert("Aluno adicionado com sucesso!");
      closeModal("modalAluno");
    })
    .catch((error) => {
      alert("Erro ao adicionar aluno: " + error.message);
    });
};

// Função para atribuir disciplina a um professor
window.atribuirDisciplina = function () {
  const emailProfessor = document.getElementById(
    "emailProfessorDisciplina"
  ).value;
  const disciplina = document.getElementById("disciplina").value;

  db.collection("users")
    .where("email", "==", emailProfessor)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          db.collection("disciplinas").add({
            professorId: doc.id,
            disciplina: disciplina,
          });
        });
        alert("Disciplina atribuída com sucesso!");
        closeModal("modalDisciplinas");
      } else {
        alert("Professor não encontrado!");
      }
    })
    .catch((error) => {
      alert("Erro ao atribuir disciplina: " + error.message);
    });
};

// Função para listar turmas
window.listarTurmas = function () {
  const turmasTable = document
    .getElementById("turmasTable")
    .getElementsByTagName("tbody")[0];
  turmasTable.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

  getDocs(collection(db, "turmas"))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const turmaNome = doc.id; // Nome da turma

        data.alunos.forEach((aluno) => {
          const newRow = turmasTable.insertRow();

          const cellTurma = newRow.insertCell(0);
          const cellAluno = newRow.insertCell(1);

          cellTurma.innerText = turmaNome; // Exibe o nome da turma
          cellAluno.innerText = aluno.email; // Exibe o email do aluno
        });
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
  listarProfessores();
  listarTurmas();
};
