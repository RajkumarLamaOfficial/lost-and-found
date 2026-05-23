document.addEventListener("DOMContentLoaded", function () {

    const sampleItems = [
        {
            type: "Lost",
            itemName: "Student ID Card",
            category: "ID Card",
            location: "Library",
            description: "Lost near study area.",
            contact: "student@kdu.ac.kr",
            image: "",
            status: "Pending"
        },
        {
            type: "Found",
            itemName: "Black Wallet",
            category: "Wallet",
            location: "Cafeteria",
            description: "Found near cafeteria counter.",
            contact: "finder@kdu.ac.kr",
            image: "",
            status: "Pending"
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
            image: imageData,
            status: "Pending",
            verification: document.getElementById("verification").value,
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
        

        if (!adminList) return;

        const items = JSON.parse(localStorage.getItem("items")) || [];

        adminList.innerHTML = items.map((item, index) => `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}
                <span class="badge">${item.type}</span>
                <h3>${item.itemName}</h3>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Status:</strong> ${item.status || "Pending"}</p>
                <p><strong>Claim Verification:</strong> ${item.verification || "Not provided"}</p>

                <label>Update Status</label>
                <select onchange="updateStatus(${index}, this.value)">
                    <option value="Pending" ${(item.status || "Pending") === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Approved" ${item.status === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Claimed" ${item.status === "Claimed" ? "selected" : ""}>Claimed</option>
                    <option value="Returned" ${item.status === "Returned" ? "selected" : ""}>Returned</option>
                </select>

                <button onclick="deleteItem(${index})">Delete</button>
            </div>
        `).join("");
    };

    window.updateStatus = function (index, status) {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        items[index].status = status;

        localStorage.setItem("items", JSON.stringify(items));

        displayItems();
        displayAdminItems();
        updateStats();
    };

    window.deleteItem = function (index) {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        items.splice(index, 1);

        localStorage.setItem("items", JSON.stringify(items));

        displayItems();
        displayAdminItems();
        updateStats();
    };
    function updateStats() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        const totalReports = items.length;
        const lostReports = items.filter(item => item.type === "Lost").length;
        const foundReports = items.filter(item => item.type === "Found").length;
        const returnedReports = items.filter(item => item.status === "Returned").length;

        document.getElementById("totalReports").textContent = totalReports;
        document.getElementById("lostReports").textContent = lostReports;
        document.getElementById("foundReports").textContent = foundReports;
        document.getElementById("returnedReports").textContent = returnedReports;
}

    displayItems();
    displayAdminItems();
    updateStats();

});
