/* main initialize functions, i.e. DOMContentLoaded stuff */


/* global variables */


/* event listeners */


/* big display functions */



/* helper & logic functions */



const baseUrl = "http://localhost:3000"

let userId 
const trashSectionName = "Trash"
const formDiv = document.querySelector("div#login")
const loginForm = document.querySelector("form#login-form")
const main = document.querySelector("main")
const errorList = document.querySelector("div#error ul")
const fridgeSection = document.querySelector("section#fridge-section")
const fridgeDisplay = document.querySelector("section#display")
const searchForm = document.querySelector("form#search-form")
const itemList = fridgeDisplay.querySelector("ul")
const spoonacularKey = config.MY_API_KEY
const spoonacularUrl = `https://api.spoonacular.com/food/ingredients/search?apiKey=${spoonacularKey}&query=`
const spoonacularImageUrl = 'https://spoonacular.com/cdn/ingredients_100x100/'
const logOutLink = document.querySelector("#sign-out")
const displayTitle = document.querySelector("#display-title")

logOutLink.addEventListener("click", logOut)
fridgeDisplay.addEventListener("click", event => {
  if (event.target.matches(".add-item-button")) {
    displayAddItemForm(event)
  }
  else if (event.target.matches(".remove-add-button")) {
    event.target.previousElementSibling.remove()
    event.target.className = "add-item-button"
    event.target.textContent = "Add Item to Fridge"
  }
})

fridgeSection.addEventListener("click", event => {
  if (event.target.matches(".section-div")) {
    fetchSectionById(event.target.dataset.id)
      .then(displayFridgeContents)
    displayTitle.textContent = event.target.textContent
  }
  else if (event.target.matches(".all-items")) {
    fetchFridgeById(event.target.dataset.id)
      .then(displayFridgeContents)
    displayTitle.textContent = "All Items"
  }
})

formDiv.addEventListener("submit", event => {
  event.preventDefault()
  errorList.innerHTML = ""
  if (event.target.matches("#login-form")) {
    fetch(`${baseUrl}/users/login`, fetchObj("POST", { email: event.target.email.value.toLowerCase() }))
      .then(resp => resp.json())
      .then(isUserValid)
  }
  else if (event.target.matches("#signup")) {
    fetch(`${baseUrl}/users/`, fetchObj("POST", { name: event.target.name.value, email: event.target.email.value.toLowerCase() }))
      .then(resp => resp.json())
      .then(isUserValid)
  }
})

searchForm.addEventListener("click", event => {
  if (event.target.id === "create-item") {
    const customForm = document.createElement("form")
    customForm.innerHTML = `
  <label for="item">Item</label><br>
  <input type="text" name="item" value="${searchForm.item.value}"><br>
  <label for="quantity">Amount</label><br>
  <input type="text" name="quantity"><br>
  <label for="dateAdded">Date Added</label><br>
  <input type="date" name="dateAdded"><br>
  <label for="expirationDate">Expiration Date</label><br>
  <input type="date" name="expirationDate"><br>
  <label for="image">Image</label><br>
  <input type="text" name="image"><br>
  <label for="section">Section</label><br>
  <select name="section"></select><br>
  <input type="submit" value="Add Item">
  `
    const sectionSelect = customForm.querySelector("select")
    fetchFridgeById(fridgeSection.dataset.id)
      .then(fridge => {
        fridge.sections
          .filter(section => section.name !== trashSectionName)
          .forEach(section => {
          sectionInput = document.createElement("option")
          sectionInput.textContent = section.name
          sectionInput.value = section.id
          sectionSelect.append(sectionInput)
        })
      })
    const searchContainer = document.querySelector("div#search-container")
    searchContainer.append(customForm)
    event.target.textContent = "Close Custom Form"
    event.target.id = "remove-create-button"
    customForm.addEventListener("submit", createFridgeItem)
  }
  else if (event.target.matches("#remove-create-button")) {
    searchForm.nextElementSibling.remove()
    event.target.id = "create-item"
    event.target.textContent = "Create Your Own"
  }
})

searchForm.addEventListener("submit", event => {
  event.preventDefault()
  const searchItem = event.target.item.value
  fetch(`${spoonacularUrl}${searchItem}`)
    .then(resp => resp.json())
    .then(displaySearchResults)
})

function fetchSectionById(sectionId) {
  return fetch(`${baseUrl}/sections/${sectionId}`)
    .then(resp => resp.json())
}

function fetchFridgeById(fridgeId) {
  return fetch(`${baseUrl}/fridges/${fridgeId}`)
    .then(resp => resp.json())
}

function isUserValid(response) {
  if (Array.isArray(response)) {
    response.forEach(error => {
      const li = document.createElement("li")
      li.textContent = error
      li.style.color = "red"
      errorList.append(li)
    })
  }
  else {
    userId = response.id
    // formDiv.style.display = "none"
    // main.style.display = "block"
    // logOutLink.style.display = "inline-block"

    formDiv.classList.add("hidden")
    main.classList.remove("hidden")
    logOutLink.classList.remove("hidden")
    fetchFirstFridge(response.id)
  }
}

function fetchFirstFridge(userId) {
  fetch(`${baseUrl}/users/${userId}`)
    .then(resp => resp.json())
    .then(user => {
      fetch(`${baseUrl}/fridges/${user.fridges[0].id}`)
        .then(resp => resp.json())
        .then(fridge => {
          displayFridgeContents(fridge)
          displayFridgeMenu(fridge)
          displayTitle.textContent = "All Items"
        })
    })
}

function displayFridgeMenu(fridge) {
  const fridgeName = fridgeSection.querySelector("h2#fridge-name")
  fridgeName.textContent = fridge.name

  fridgeSection.dataset.id = fridge.id

  const displayChoices = fridgeSection.querySelector("div#display-choices")
  displayChoices.innerHTML = ""

  const allItems = document.createElement("div")
  allItems.classList.add("all-items")
  allItems.dataset.id = fridge.id
  allItems.textContent = "All that's in yo' fridge"
  displayChoices.append(allItems)


  fridge.sections.forEach(renderSectionName)

  const addSectionDiv = fridgeSection.querySelector("div#add-section")
  addSectionDiv.innerHTML = `
    <form>
      <br>
      <input type="text" name="name" placeholder="New Section Name"><br>
      <input type="submit" value="Add Fridge Section" >
    </form>
  `
  addSectionDiv.addEventListener("submit", event => {
    addFridgeSection(event)
  })
}


function addFridgeSection(event) {
  event.preventDefault()

  const body = {
    name: event.target.name.value,
    fridge_id: fridgeSection.dataset.id
  }

  fetch(`${baseUrl}/sections`, fetchObj("POST", body))
    .then(resp => resp.json())
    .then(renderSectionName)

  event.target.reset()
}

function renderOneItem({ id, sectionId, name, image, quantity, dateAdded, expirationDate }) {
  const itemDiv = document.createElement("div")
  itemDiv.dataset.id = id
  itemDiv.dataset.sectionId = sectionId
  itemDiv.classList.add("card")
  itemList.append(itemDiv)

  itemDiv.innerHTML = `
    <img class="card-img-top" src=${image} alt=${name}>
    <div class="card-body">
      <h5 class="card-title item-name">${name}</h5>
      <ul>
        <li class="quantity">Amount: ${quantity}</li>
        <li class="date-added">Date Added: ${dateAdded}</li>
        <li class="exp-date">Eat by: ${expirationDate}</li>
      </ul>
    </div>
  `
  const cardBodyDiv = itemDiv.querySelector(".card-body")
  const cardButtonDiv = document.createElement("div")
  cardButtonDiv.className = "card-button-div"

  const updateBtn = document.createElement("button")
  updateBtn.textContent = "Update"
  updateBtn.classList.add("card-button", "btn-success")
  updateBtn.addEventListener("click", updateItem)

  const deleteBtn = document.createElement("button")
  deleteBtn.textContent = "Delete"
  deleteBtn.classList.add("card-button", "btn-warning")
  deleteBtn.addEventListener("click", removeItem)
  deleteBtn.dataset.id = id

  const trashBtn = document.createElement("button")
  trashBtn.textContent = "Threw it Out 😢"
  trashBtn.classList.add("card-button", "btn-danger")
  trashBtn.dataset.id = id
  trashBtn.addEventListener("click", trashItem)


  cardButtonDiv.append(updateBtn, deleteBtn, trashBtn)
  cardBodyDiv.append(cardButtonDiv)
}

function displayFridgeContents(fridgeOrSection) {
  itemList.innerHTML = ""

  fridgeOrSection.items.forEach(renderOneItem)

  if (fridgeOrSection.classType === "section") {
    const displayEnd = document.createElement("p")
    if (fridgeOrSection.items.length === 0) {
      displayEnd.textContent = "Section empty. You can delete this."
      const deleteButton = document.createElement("button")
      deleteButton.dataset.id = fridgeOrSection.id
      displayEnd.append(deleteButton)
      deleteButton.addEventListener("click", deleteSection)
    }
    else {
      displayEnd.textContent = "To delete this fridge section, please move or delete all items."
    }
    itemList.append(displayEnd)
  }
}

function trashItem(event) {
  const itemId = event.target.dataset.id
  const trashDiv = document.querySelector("#trash")
  const body = {
    trash: true,
    section_id: trashDiv.dataset.id
  }


  const card = document.querySelector(`div.card[data-id="${itemId}"]`)
  // const sectionId = card.dataset.sectionId
  card.remove()

  fetch(`${baseUrl}/items/${itemId}`, fetchObj("PATCH", body))
    .then(resp => resp.json())
    .then(item => {
      console.log("go to the trash section eventually")
      console.log(item)
      // render trash "section"
    })

}

function updateItem(event) {
  const updateItemForm = document.createElement("form")
  const parentCard = event.target.closest(".card")

  updateItemForm.innerHTML = `
  ${parentCard.querySelector(".item-name").textContent} <br>
  <label for="quantity">Amount:</label>
  <input type="text" name="quantity" value="${parentCard.querySelector(".quantity").textContent.split(":").slice(1)[0].trim()}"><br>
  ${parentCard.querySelector(".date-added").textContent}<br>
  <label for="expirationDate">Expiration Date</label><br>
  <input type="date" name="expDate" value="${parentCard.querySelector(".exp-date").textContent.split(":").slice(1)[0].trim()}"><br>
  <label for="section">Section</label><br>
  <select name="section"></select><br>
  <button type="submit" name="update">Update Item</button>
  <button type="button" name="cancel">❌</button> 
  `

  const sectionSelect = updateItemForm.querySelector("select")
  fetch(`${baseUrl}/fridges/${fridgeSection.dataset.id}`)
    .then(resp => resp.json())
    .then(fridge => {
      fridge.sections
        .filter(section => section.name !== trashSectionName)
        .forEach(section => {
        const sectionInput = document.createElement("option")
        sectionInput.textContent = section.name
        sectionInput.value = section.id

        if (section.id == parentCard.dataset.sectionId) {
          sectionInput.selected = true
        }

        sectionSelect.append(sectionInput)
      })
    })

  parentCard.querySelector(".card-body").classList.add("hidden")
  parentCard.append(updateItemForm)

  updateItemForm.addEventListener("click", event => {
    if (event.target.matches("button")) handleUpdateForm(event)
  })
}

function handleUpdateForm(event) {
  event.preventDefault()

  const parentCard = event.target.closest(".card")

  if (event.target.name === "cancel") {
    parentCard.querySelector(".card-body").classList.remove("hidden")
    event.target.form.remove()
  }
  else if (event.target.name === "update") {
    const body = {
      quantity: event.target.form.quantity.value,
      expiration_date: event.target.form.expDate.value,
      section_id: event.target.form.section.value
    }

    fetch(`${baseUrl}/items/${parentCard.dataset.id}`, fetchObj("PATCH", body))
      .then(resp => resp.json())
      .then(upItem => {
        fetchSectionById(upItem.sectionId)
          .then(section => {
            displayFridgeContents(section)
            displayTitle.textContent = section.name
          })
      })
  }
}

function removeItem(event) {
  const card = document.querySelector(`div.card[data-id="${event.target.dataset.id}"]`)
  const sectionId = card.dataset.sectionId
  card.remove()
  // event.target.parentElement.remove()
  fetch(`${baseUrl}/items/${event.target.dataset.id}`, {
    method: 'DELETE'
  })
    .then(resp => resp.json())
    .then(() => {
      fetchSectionById(sectionId)
        .then(displayFridgeContents)
    })
}

function displaySearchResults(searchResults) {
  displayTitle.textContent = "Search Results:"
  itemList.innerHTML = ""

  searchResults.results.forEach(item => {
    const itemDiv = document.createElement("div")
    itemDiv.classList.add("card")
    itemDiv.dataset.itemName = item.name
    itemList.append(itemDiv)

    itemDiv.innerHTML = `
    <img class="card-img-top" src='${spoonacularImageUrl}${item.image}' alt=${item.name}>
    <div class="card-body">
      <h5 class="card-title item-name">${item.name}</h5>
    </div>
  `
    const addItemButton = document.createElement("button")
    addItemButton.dataset.imageUrl = `${spoonacularImageUrl}${item.image}`
    addItemButton.textContent = "Add Item to Fridge"
    addItemButton.className = "add-item-button"
    itemDiv.append(addItemButton)

    // const searchItemName = document.createElement("li")
    // const searchItemImage = document.createElement("img")
    // const addItemButton = document.createElement("button")
    // searchItemName.textContent = `Name: ${item.name}`
    // searchItemName.dataset.itemName = item.name
    // searchItemImage.src = `${spoonacularImageUrl}${item.image}`
    // searchItemImage.alt = item.name
    // // searchItemImage.innerHTML = `<img src=${spoonacularImageUrl}${item.image} alt=${item.name}>`
    // addItemButton.dataset.imageUrl = `${spoonacularImageUrl}${item.image}`
    // addItemButton.textContent = "Add Item to Fridge"
    // addItemButton.className = "add-item-button"

    // searchItemName.append(searchItemImage)
    // searchItemName.append(addItemButton)
    // itemList.append(searchItemName)
    // // itemList.append(searchItemImage)

  })
}

function displayAddItemForm(event) {
  const addItemForm = document.createElement("form")
  const parentCard = event.target.closest(".card")
  const image = parentCard.querySelector("img").src
  addItemForm.innerHTML = `
  <label for="item">Item</label><br>
  <input type="text" name="item" value="${parentCard.dataset.itemName}"><br>
  <label for="quantity">Amount</label><br>
  <input type="text" name="quantity"><br>
  <label for="dateAdded">Date Added</label><br>
  <input type="date" name="dateAdded"><br>
  <label for="expirationDate">Expiration Date</label><br>
  <input type="date" name="expirationDate"><br>
  <label for="section">Section</label><br>
  <select name="section"></select><br>
  <input type="hidden" name="image" value=${image}>
  <input type="submit" value="Add Item">
  `
  parentCard.append(addItemForm)
  const addButton = parentCard.querySelector(".add-item-button")
  addButton.className = "remove-add-button"
  addButton.textContent = "❌"
  parentCard.append(addButton)
  addItemForm.addEventListener("submit", createFridgeItem)
  const sectionSelect = addItemForm.querySelector("select")
  fetch(`${baseUrl}/fridges/${fridgeSection.dataset.id}`)
    .then(resp => resp.json())
    .then(fridge => {
      fridge.sections
        .filter(section => section.name !== trashSectionName)
        .forEach(section => {
          sectionInput = document.createElement("option")
          sectionInput.textContent = section.name
          sectionInput.value = section.id
          sectionSelect.append(sectionInput)
      })
    })
  // addItemForm.insertAdjacentElement("beforeend", addButton)
}

function renderSectionName(section) {
  const allItems = fridgeSection.querySelector("div.all-items")

  const sectionDiv = document.createElement("div")
  sectionDiv.classList.add("section-div")
  sectionDiv.textContent = section.name
  sectionDiv.dataset.id = section.id

  if (section.name === trashSectionName) {
    sectionDiv.id = "trash"
    fridgeSection.append(sectionDiv)
  }
  else {
    allItems.insertAdjacentElement("beforebegin", sectionDiv)
  }
}

function logOut() {
  // formDiv.style.display = "block"
  // main.style.display = "none"
  // logOutLink.style.display = "none"

  formDiv.classList.remove("hidden")
  main.classList.add("hidden")
  logOutLink.classList.add("hidden")
  userId = ""
}

function createFridgeItem(event) {
  event.preventDefault()
  const body = {
    name: event.target.item.value,
    quantity: event.target.quantity.value,
    date_added: event.target.dateAdded.value,
    expiration_date: event.target.expirationDate.value,
    image: event.target.image.value,
    section_id: event.target.section.value
  }
  fetch(`${baseUrl}/items`, fetchObj('POST', body))
    .then(resp => resp.json())
    .then(item => {
      fetchSectionById(item.sectionId)
        .then(section => {
          displayFridgeContents(section)
          displayTitle.textContent = section.name
        })
    })
}

function deleteSection(event) {
  fetch(`${baseUrl}/sections/${event.target.dataset.id}`, {
    method: 'DELETE'
  })
    .then(resp => resp.json())
    .then(() => {
      fetchFridgeById(fridgeSection.dataset.id)
        .then(fridge => {
          displayFridgeMenu(fridge)
          displayFridgeContents(fridge)
          displayTitle.textContent = "All Items"
        })
    })
}

function fetchObj(method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(body)
  }
}