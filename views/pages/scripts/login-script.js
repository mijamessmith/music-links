const bottomMessage = document.querySelector("#bottomMessage")
let msg = bottomMessage.textContent

if (msg.includes("Login to access your new account")) {
    bottomMessage.className = "welcome-message"
}


//if the backend does not send a message, clear the bottom message text;
if (msg == "false") {
    bottomMessage.textContent = "";
}