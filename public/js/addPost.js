const titleInput = document.querySelector(".titleInput");
const bodyInput = document.querySelector(".bodyInput");
const submitBtn = document.querySelector(".submitBtn");

submitBtn.disabled = true;
titleInput.addEventListener("input", checkInputs);
bodyInput.addEventListener("input", checkInputs);

function checkInputs() {
  if (titleInput.value && bodyInput.value) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}
