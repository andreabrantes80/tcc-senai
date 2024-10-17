function openModal() {
    document.getElementById('loginModal').style.display = 'block';
  }
  
  function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
  }
  
  // Fecha a modal se o usuário clicar fora dela
  window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
      closeModal();
    }
  }