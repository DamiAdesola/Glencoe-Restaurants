let form = document.forms["user-registration-form"];

// Required Field validation
function showValidityCue(input) {
  let isValid = input.checkValidity();
  if (input.type === "text" || input.pattern) {
    const regPattern = new RegExp(input.pattern ? input.pattern : "^[a-zA-Z]+");
    isValid = regPattern.test(input.value);
  }
  if (isValid) {
    input.style.borderColor = "green";
    input.parentNode.classList.add("validBlock");
    input.parentNode.classList.remove("invalidBlock");
    input.setCustomValidity("");
  } else {
    input.style.borderColor = "red";
    input.parentNode.classList.remove("validBlock");
    input.parentNode.classList.add("invalidBlock");
    input.setCustomValidity(input.title);

  }
}

/*
    Sets a custom validation to require both password fields to match each other
    */
function validateConfirmPassword(input) {
  showValidityCue(input);
  const password = form.password;
  if (password.value !== input.value || password.length < 6) {
    input.validity.valid = false;
    input.style.borderColor = "red";
    input.parentNode.classList.remove("validBlock");
    input.parentNode.classList.add("invalidBlock");
    input.setCustomValidity(input.title);
  }
  else {
    input.validity.valid = true;
    input.style.borderColor = "green";
    input.parentNode.classList.add("validBlock");
    input.parentNode.classList.remove("invalidBlock");
    input.setCustomValidity("");
  }
}

function validateUsername(input) {
  showValidityCue(input);
  const username = form.username;
  if (username.value.length < 5) {
    input.validity.valid = false;
    input.style.borderColor = "red";
    input.parentNode.classList.remove("validBlock");
    input.parentNode.classList.add("invalidBlock");
    input.setCustomValidity(input.title);
  }
  else {
    const userName = form.username;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/check-username?username=" + input.value, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200 && this.responseText === "Username available.") {
        input.validity.valid = true;
        input.style.borderColor = "green";
        input.parentNode.classList.add("validBlock");
        input.parentNode.classList.remove("invalidBlock");
        input.setCustomValidity("");
      }
      else if (this.readyState == 4 && this.status == 200 && this.responseText === "Username already exists.") {
        input.validity.valid = false;
        userName.setCustomValidity("Username already exists");
        userName.style.borderColor = "red";
      }
    };
  }

}

function registerUser() {
  const username = form.username;
  const password = form.password;
  const email = form.email;
  const fullName = form.fullName;
  var data = {
    fullName: fullName.value,
    username: username.value,
    password: password.value,
    email: email.value,
    privacy: false
  };
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/register", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.send(JSON.stringify(data));
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      window.location.href = "/profile/"+username.value;
    }
    if (this.readyState == 4 && this.status == 400) {
      alert("Registration failed. Please try again.");
    }
  };
}

