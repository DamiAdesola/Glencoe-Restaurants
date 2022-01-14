function updateUser(){
    var privacy_toggle = document.getElementById("privacy");
    var id = document.getElementById("id").value;
    var button = document.getElementById("update-user");
    button.classList.toggle('button--loading')
    var user = {
        fullName: document.getElementById("fullname").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        aboutme: document.getElementById("about-me").value,
        location: document.getElementById("location").value,
        privacy: privacy_toggle.checked
    };
    var xmlhttp = new XMLHttpRequest();
    var url = "/users/"+id+"/edit-profile";
    xmlhttp.open("PUT", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(JSON.stringify(user));
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(function () {
                window.location.href = "/users/"+id;
            }, 3000); 
            
        } 
        else if (this.readyState == 4 && this.status == 400) { 
            window.location.href = "/failure"; 
        }        
    };
}
