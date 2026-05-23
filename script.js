document.addEventListener("DOMContentLoaded", function () {

    const sampleItems = [
        {
            type: "Lost",
            itemName: "Student ID Card",
            category: "ID Card",
            location: "Library",
            description: "Lost near study area.",
            contact: "student@kdu.ac.kr",
            image: ""
        },
        {
            type: "Found",
            itemName: "Black Wallet",
            category: "Wallet",
            location: "Cafeteria",
            description: "Found near cafeteria counter.",
            contact: "finder@kdu.ac.kr",
            image: ""
        }
    ];

    if (!localStorage.getItem("items")) {
        localStorage.setItem("items", JSON.stringify(sampleItems));
    }

    window.showSection = function (sectionId) {
        document.querySelectorAll("section").forEach(section => {
            section.classList.remove("active");
        });

        document.getElementById(sectionId).classList.add("active");

        displayItems();
        displayAdminItems();
    };

    const itemForm = document.getElementById("itemForm");

    if (itemForm) {
        itemForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const imageInput = document.getElementById("itemImage");
            const imageFile = imageInput.files[0];

            if (imageFile) {
                const reader = new FileReader();

                reader.onload = function () {
                    saveItem(reader.result);
                };

                reader.readAsDataURL(imageFile);
            } else {
                saveItem("");
            }
        });
    }

    function saveItem(imageData) {
        const newItem = {
            type: document.getElementById("type").value,
            itemName: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value,
            description: document.getElementById("description").value,
            contact: document.getElementById("contact").value,
            image: imageData
        };

        const items = JSON.parse(localStorage.getItem("items")) || [];
        items.push(newItem);
        localStorage.setItem("items", JSON.stringify(items));

        alert("Report submitted successfully!");
        itemForm.reset();

        showSection("search");
    }

    window.displayItems = function () {
        const itemList = document.getElementById("itemList");
        const searchInput = document.getElementById("searchInput");

        if (!itemList) return;

        const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

        const items = JSON.parse(localStorage.getItem("items")) || [];

        const filteredItems = items.filter(item =>
            item.itemName.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue) ||
            item.location.toLowerCase().includes(searchValue) ||
            item.description.toLowerCase().includes(searchValue)
        );

        itemList.innerHTML = filteredItems.map(item => `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}
                <span class="badge">${item.type}</span>
                <h3>${item.itemName}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Contact:</strong> ${item.contact}</p>
            </div>
        `).join("");
    };

    window.displayAdminItems = function () {
        const adminList = document.getElementById("adminList");

        if (!adminList) return;

        const items = JSON.parse(localStorage.getItem("items")) || [];

        adminList.innerHTML = items.map((item, index) => `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}
                <span class="badge">${item.type}</span>
                <h3>${item.itemName}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <button onclick="deleteItem(${index})">Delete</button>
            </div>
        `).join("");
    };

    window.deleteItem = function (index) {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        items.splice(index, 1);

        localStorage.setItem("items", JSON.stringify(items));

        displayItems();
        displayAdminItems();
    };

    displayItems();
    displayAdminItems();

});
