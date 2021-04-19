let userId 
const baseUrl = "http://localhost:3000"
const formDiv = document.querySelector("div#login")
const loginForm = document.querySelector("form#login-form")
const main = document.querySelector("main")
const errorList = document.querySelector("div#error ul")

formDiv.addEventListener("submit", event => {
  event.preventDefault()
  errorList.innerHTML = ""
  if (event.target.matches("#login-form")) {
    fetch(`${baseUrl}/users/login`, fetchObj("POST", {email: event.target.email.value.toLowerCase()}))
      .then(resp => resp.json())
      .then(user => {
        userId = user.id
        formDiv.style.display = "none"
        main.style.display = "flex"
      })
  }
  else if (event.target.matches("#signup")) {
    fetch(`${baseUrl}/users/`, fetchObj("POST", {name: event.target.name.value, email: event.target.email.value.toLowerCase()}))
      .then(resp => resp.json())
      .then(isUserValid)
  }
})

function fetchObj(method, body){
  return {
    method,
    headers: {
      "Content-Type":"application/json",
      "Accept":"application/json"
    },
    body: JSON.stringify(body)
  }
}

function isUserValid(response){
  if (Array.isArray(response)){
    response.forEach(error => {
      const li = document.createElement("li")
      li.textContent = error
      li.style.color = "red"
      errorList.append(li)
    })
  }
  else {
    userId = response.id
    formDiv.style.display = "none"
    main.style.display = "flex"
  }
}