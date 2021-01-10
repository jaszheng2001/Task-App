const errorField = document.getElementById("passwordValidation");
const pwField = document.querySelector("#password");
const errMsg = document.querySelector("#errMsg");
const regBtn = document.querySelector("#registerBtn");
const regForm = document.querySelector("#registerForm");

function validate() {
  const pwvalue = pwField.value;
  if (pwvalue.length >= 8) {
    errorField.style.color = "green";
    return true;
  } else {
    errorField.style.color = "red";
    return false;
  }
}
pwField.addEventListener("input", validate);

regForm.addEventListener("submit", (e) => {
  if (validate() === false) e.preventDefault();
  setTimeout(() => (errMsg.innerHTML = "Please fix the errors: "), ".5s");
});
