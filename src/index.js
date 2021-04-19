let userId 
const baseUrl = "http://localhost:3000"
const formDiv = document.querySelector("div#login")
const loginForm = document.querySelector("form#login-form")
const main = document.querySelector("main")
const errorList = document.querySelector("div#error ul")
const fridgeSection = document.querySelector("section#fridge-section")
const fridgeDisplay = document.querySelector("section#display")
const searchForm = document.querySelector("form#search-form")
const itemList = fridgeDisplay.querySelector("ul")
const spoonacularUrl = 'https://api.spoonacular.com/food/ingredients/search?apiKey=53c0db67f0224581b5b024d12ffe3389&query='
const spoonacularImageUrl = 'https://spoonacular.com/cdn/ingredients_100x100/'

formDiv.addEventListener("submit", event => {
  event.preventDefault()
  errorList.innerHTML = ""
  if (event.target.matches("#login-form")) {
    fetch(`${baseUrl}/users/login`, fetchObj("POST", {email: event.target.email.value.toLowerCase()}))
      .then(resp => resp.json())
      .then(isUserValid)
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
    main.style.display = "block"
    fetchFirstFridge(response.id)
  }
}

function fetchFirstFridge(userId) {
  fetch(`${baseUrl}/users/${userId}`)
    .then(resp => resp.json())
    .then(user => {
      fetch(`${baseUrl}/fridges/${user.fridges[0].id}`)
        .then(resp => resp.json())
        .then(displayFridge)
    })
}

function displayFridge(fridge){
  fridgeSection.textContent = fridge.name
  itemList.innerHTML = ""
  fridge.items.forEach(item => {
    const itemListItem = document.createElement("li")
    itemListItem.textContent = item.name
    itemListItem.dataset.id = item.id
    itemList.append(itemListItem)
    
    const itemSubList = document.createElement("ul")
    const quantityLi = document.createElement("li")
    quantityLi.textContent = `Amount: ${item.quantity}`
    itemSubList.append(quantityLi)
    const imageLi = document.createElement("li")
    imageLi.textContent = item.image
    itemSubList.append(imageLi)
    const dateAddedLi = document.createElement("li")
    dateAddedLi.textContent = `Added on: ${item.dateAdded}`
    itemSubList.append(dateAddedLi)
    const expirationDateLi = document.createElement("li")
    expirationDateLi.textContent = `Expires on: ${item.expirationDate}`
    itemSubList.append(expirationDateLi)

    itemList.append(itemSubList)
  })
}

searchForm.addEventListener("submit", event => {
  event.preventDefault()
  const searchItem = event.target.item.value
  fetch(`${spoonacularUrl}${searchItem}`)
    .then(resp => resp.json())
    .then(displaySearchResults)
})

function displaySearchResults(searchResults) {
  itemList.innerHTML = ""
  searchResults.results.forEach(item => {
    const searchItemName = document.createElement("li")
    searchItemName.textContent = `Name: ${item.name}`
    const searchItemImage = document.createElement("li")
    searchItemImage.innerHTML = `<img src=${spoonacularImageUrl}${item.image} alt=${item.name}>`
    itemList.append(searchItemName)
    itemList.append(searchItemImage)
  })
}