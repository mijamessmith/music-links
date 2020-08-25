const bottomMessage = document.querySelector("#bottomMessage")
let msg = bottomMessage.textContent

if (msg.includes("Login to access your new account")) {
    bottomMessage.className = "welcome-message"
}
