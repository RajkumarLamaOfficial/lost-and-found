const sampleItems = [

    {
        type: "Lost",
        itemName: "Student ID Card",
        category: "ID Card",
        location: "Library",
        description: "Lost near study area.",
        contact: "student@kdu.ac.kr"
    },

    {
        type: "Found",
        itemName: "Black Wallet",
        category: "Wallet",
        location: "Cafeteria",
        description: "Found near cafeteria counter.",
        contact: "finder@kdu.ac.kr"
    }

];

if(!localStorage.getItem("items")){

    localStorage.setItem("items", JSON.stringify(sampleItems));

}

/* SECTION NAVIGATION */

function showSection(sectionId){

    document.querySelectorAll("section").forEach(section => {

        section.classList.remove("active");

    });

    document.getElementById(sectionId).classList.add("active");

    displayItems();
    displayAdminItems();

}

/* FORM SUBMISSION */

document.getElementById("itemForm").addEventListener("submit", function(e){

    e.preventDefault();

    const newItem = {

        type: document.getElementById("type").value,
        itemName: document.getElementById("itemName").value,
        category: document.getElementById("category").value,
        location: document.getElementById("location").value,
        description: document.getElementById("description").value,
        contact: document.getElementById("contact").value

    };

    const items = JSON.parse(localStorage.getItem("items")) || [];

    items.push(newItem);

    localStorage.setItem("items", JSON.stringify(items));

    alert("Report submitted successfully!");

    document.getElementById("itemForm").reset();

    showSection("search");

});

/* DISPLAY ITEMS */

function displayItems(){

    const itemList = document.getElementById("itemList");

    const searchValue = document.getElementById("searchInput").value.toLowerCase();

    const items = JSON.parse(localStorage.getItem("items")) || [];

    const filteredItems = items.filter(item =>

        item.itemName.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.location.toLowerCase().includes(searchValue)

    );

    itemList.innerHTML = filteredItems.map(item => `

        <div class="item-card">

            <span class="badge">${item.type}</span>

            <h3>${item.itemName}</h3>

            <p><strong>Category:</strong> ${item.category}</p>

            <p><strong>Location:</strong> ${item.location}</p>

            <p><strong>Description:</strong> ${item.description}</p>

            <p><strong>Contact:</strong> ${item.contact}</p>

        </div>

    `).join("");

}

/* ADMIN PANEL */

function displayAdminItems(){

    const adminList = document.getElementById("adminList");

    const items = JSON.parse(localStorage.getItem("items")) || [];

    adminList.innerHTML = items.map((item,index) => `

        <div class="item-card">

            <span class="badge">${item.type}</span>

            <h3>${item.itemName}</h3>

            <p><strong>Category:</strong> ${item.category}</p>

            <p><strong>Location:</strong> ${item.location}</p>

            <button onclick="deleteItem(${index})">Delete</button>

        </div>

    `).join("");

}

/* DELETE ITEM */

function deleteItem(index){

    const items = JSON.parse(localStorage.getItem("items")) || [];

    items.splice(index,1);

    localStorage.setItem("items", JSON.stringify(items));

    displayItems();

    displayAdminItems();

}

displayItems();

displayAdminItems();
