const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
document.addEventListener('DOMContentLoaded', () => {
    loginBtn.addEventListener('click', () => {
        const user = {
            username: username.value,
            password: password.value
        };
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", "/login", true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.send(JSON.stringify(user));
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4){
                if (this.status == 200) {
                    window.location.href = "/profile/"+username.value;
                }
                else{
                    errorMsg.innerHTML = "Invalid username or password";
                }
            }
        }
    });    
});

password.addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        loginBtn.click();
    }
});


