document.addEventListener("DOMContentLoaded", function () {

    let currentFilter = "All";

    const sampleItems = [
        {
            type: "Lost",
            itemName: "Student ID Card",
            category: "ID Card",
            location: "Library",
            description: "Lost near study area.",
            contact: "student@kdu.ac.kr",
            image: "",
            status: "Pending",
            verification: "What name is written on the ID card?"
        },
        {
            type: "Found",
            itemName: "Black Wallet",
            category: "Wallet",
            location: "Cafeteria",
            description: "Found near cafeteria counter.",
            contact: "finder@kdu.ac.kr",
            image: "",
            status: "Pending",
            verification: "What color/design is inside the wallet?"
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
        updateStats();
    };

    window.filterItems = function (filterType) {
        currentFilter = filterType;
        showSection("search");
        displayItems();
    };

    const itemForm = document.getElementById("itemForm");

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

    function saveItem(imageData) {
        const newItem = {
            type: document.getElementById("type").value,
            itemName: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value,
            description: document.getElementById("description").value,
            contact: document.getElementById("contact").value,
            image: imageData,
            status: "Pending",
            verification: document.getElementById("verification").value
        };

        const items = JSON.parse(localStorage.getItem("items")) || [];

        items.push(newItem);

        localStorage.setItem("items", JSON.stringify(items));

        alert("Report submitted successfully!");

        itemForm.reset();

        currentFilter = "All";

        showSection("search");
    }

    window.displayItems = function () {
        const itemList = document.getElementById("itemList");
        const searchInput = document.getElementById("searchInput");

        const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

        const items = JSON.parse(localStorage.getItem("items")) || [];

        const filteredItems = items.filter(item => {
            const matchesSearch =
                item.itemName.toLowerCase().includes(searchValue) ||
                item.category.toLowerCase().includes(searchValue) ||
                item.location.toLowerCase().includes(searchValue) ||
                item.description.toLowerCase().includes(searchValue);

            const matchesFilter =
                currentFilter === "All" ||
                item.type === currentFilter ||
                item.status === currentFilter;

            return matchesSearch && matchesFilter;
        });

        if (filteredItems.length === 0) {
            itemList.innerHTML = `
                <div class="empty-message">
                    <h3>No items found</h3>
                    <p>No reports match your selected filter or search keyword.</p>
                </div>
            `;
            return;
        }

        itemList.innerHTML = filteredItems.map(item => `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}

                <span class="badge">${item.type}</span>
                <span class="status">${item.status || "Pending"}</span>

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Contact:</strong> ${item.contact}</p>
                <p><strong>Claim Verification:</strong> ${item.verification || "Not provided"}</p>
            </div>
        `).join("");
    };

    window.displayAdminItems = function () {
        const adminList = document.getElementById("adminList");

        const items = JSON.parse(localStorage.getItem("items")) || [];

        const lostItems = items
            .map((item, index) => ({ ...item, realIndex: index }))
            .filter(item => item.type === "Lost");

        const foundItems = items
            .map((item, index) => ({ ...item, realIndex: index }))
            .filter(item => item.type === "Found");

        let html = "";

        html += `<h2 class="admin-heading">Lost Item Reports</h2>`;

        if (lostItems.length === 0) {
            html += `
                <div class="empty-message">
                    <h3>No lost item reports</h3>
                    <p>No lost item has been reported yet.</p>
                </div>
            `;
        } else {
            html += lostItems.map(item => createAdminCard(item)).join("");
        }

        html += `<h2 class="admin-heading">Found Item Reports</h2>`;

        if (foundItems.length === 0) {
            html += `
                <div class="empty-message">
                    <h3>No found item reports</h3>
                    <p>No found item has been reported yet.</p>
                </div>
            `;
        } else {
            html += foundItems.map(item => createAdminCard(item)).join("");
        }

        adminList.innerHTML = html;
    };

    function createAdminCard(item) {
        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}

                <span class="badge">${item.type}</span>

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Status:</strong> ${item.status || "Pending"}</p>
                <p><strong>Claim Verification:</strong> ${item.verification || "Not provided"}</p>

                <label>Update Status</label>

                <select onchange="updateStatus(${item.realIndex}, this.value)">
                    <option value="Pending" ${(item.status || "Pending") === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Approved" ${item.status === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Claimed" ${item.status === "Claimed" ? "selected" : ""}>Claimed</option>
                    <option value="Returned" ${item.status === "Returned" ? "selected" : ""}>Returned</option>
                </select>

                <button onclick="deleteItem(${item.realIndex})">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;
    }

    window.updateStatus = function (index, status) {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        items[index].status = status;

        localStorage.setItem("items", JSON.stringify(items));

        displayItems();
        displayAdminItems();
        updateStats();
    };

    window.deleteItem = function (index) {
        const confirmDelete = confirm("Are you sure you want to delete this report?");

        if (!confirmDelete) {
            return;
        }

        const items = JSON.parse(localStorage.getItem("items")) || [];

        items.splice(index, 1);

        localStorage.setItem("items", JSON.stringify(items));

        displayItems();
        displayAdminItems();
        updateStats();
    };

    function updateStats() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        document.getElementById("totalReports").textContent = items.length;
        document.getElementById("lostReports").textContent = items.filter(item => item.type === "Lost").length;
        document.getElementById("foundReports").textContent = items.filter(item => item.type === "Found").length;
        document.getElementById("returnedReports").textContent = items.filter(item => item.status === "Returned").length;
    }

    displayItems();
    displayAdminItems();
    updateStats();

});
