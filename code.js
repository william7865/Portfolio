var modalMesService = document.getElementById("popupMesService");
var imgMesService = document.getElementById("MesService");
var modalImgMesService = document.getElementById("img01");

imgMesService.onclick = function () {
  modalMesService.style.display = "flex";
  modalImgMesService.src = this.src;
};

var spanMesService = document.querySelector(".popupMesService .close");
spanMesService.onclick = function () {
  modalMesService.style.display = "none";
};

var modalTodoList = document.getElementById("popuptodolist");
var imgTodolist = document.getElementById("TodoList");
var modalImgTodoList = document.getElementById("img02");

imgTodolist.onclick = function () {
    modalTodoList.style.display = "flex";
    modalImgTodoList.src = this.src;
};

var spanTodoList = document.querySelector(".popuptodolist .close");
spanTodoList.onclick = function () {
  modalTodoList.style.display = "none";
};

window.onclick = function (event) {
    if (event.target == modalMesService) {
      modalMesService.style.display = "none";
    }
    if (event.target == modalTodoList) {
      modalTodoList.style.display = "none";
    }
};
function resetProgressBars() {
  document.getElementById("progressBars1").style.display = "none";
  document.getElementById("progressBars2").style.display = "none";
}

// Appeler resetProgressBars au chargement de la page pour cacher progressBars2
resetProgressBars();

function showProgressBars(buttonId) {
  // Réinitialiser toutes les barres de progression
  resetProgressBars();

  if (buttonId === "button1") {
    document.getElementById("progressBars1").style.display = "block";
  } else if (buttonId === "button2") {
    document.getElementById("progressBars2").style.display = "block";
  }
}
