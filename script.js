document.addEventListener("DOMContentLoaded", function () {

    let isLoginMode = true;
    let currentFilter = "All";
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const defaultProfileImage = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([]));
    }

    if (!localStorage.getItem("items")) {
        localStorage.setItem("items", JSON.stringify([]));
    }

    window.toggleAuthMode = function () {
        isLoginMode = !isLoginMode;

        document.getElementById("authTitle").textContent = isLoginMode ? "Login" : "Sign Up";
        document.getElementById("authButton").textContent = isLoginMode ? "Login" : "Create Account";
        document.getElementById("switchText").textContent = isLoginMode ? "Don’t have an account?" : "Already have an account?";
        document.querySelector(".switch-auth a").textContent = isLoginMode ? "Sign up" : "Login";

        document.querySelectorAll(".signup-only").forEach(input => {
            input.classList.toggle("hidden", isLoginMode);
        });
    };

    window.handleAuth = function () {
        const name = document.getElementById("authName").value.trim();
        const contact = document.getElementById("authContact").value.trim();
        const email = document.getElementById("authEmail").value.trim();
        const password = document.getElementById("authPassword").value.trim();

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        if (isLoginMode) {
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                alert("Invalid email or password.");
                return;
            }

            currentUser = user;
            localStorage.setItem("currentUser", JSON.stringify(user));
            openMainApp();
        } else {
            if (!name || !contact) {
                alert("Please enter name and contact number.");
                return;
            }

            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                alert("This email already has an account.");
                return;
            }

            const newUser = {
                id: Date.now(),
                name: name,
                contact: contact,
                email: email,
                password: password,
                profileImage: defaultProfileImage
            };

            users.push(newUser);

            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(newUser));

            currentUser = newUser;
            openMainApp();
        }
    };

    function openMainApp() {
        document.getElementById("authPage").classList.add("hidden");
        document.getElementById("mainApp").classList.remove("hidden");

        const welcomeName = document.getElementById("welcomeName");
        if (welcomeName) {
            welcomeName.textContent = currentUser.name;
        }

        loadProfile();
        showSection("home");
        updateStats();
    }

    window.logoutUser = function () {
        localStorage.removeItem("currentUser");
        location.reload();
    };

    window.showSection = function (sectionId) {
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active-section");
        });

        const selectedPage = document.getElementById(sectionId);

        if (selectedPage) {
            selectedPage.classList.add("active-section");
        }

        if (sectionId === "search") {
            displayItems();
        }

        if (sectionId === "myReports") {
            displayMyReports();
        }

        if (sectionId === "profile") {
            loadProfile();
        }

        updateStats();
    };

    window.filterItems = function (filterType) {
        currentFilter = filterType;
        showSection("search");

        const searchTitle = document.getElementById("searchTitle");

        if (searchTitle) {
            if (filterType === "All") {
                searchTitle.textContent = "All Lost and Found Reports";
            } else if (filterType === "Lost") {
                searchTitle.textContent = "Lost Item Reports";
            } else if (filterType === "Found") {
                searchTitle.textContent = "Found Item Reports";
            }
        }

        displayItems();
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
            id: Date.now(),
            ownerId: currentUser.id,
            ownerName: currentUser.name,
            ownerContact: currentUser.contact,
            type: document.getElementById("type").value,
            itemName: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value,
            description: document.getElementById("description").value,
            image: imageData,
            verification: document.getElementById("verification").value,
            responses: [],
            claims: [],
            createdAt: new Date().toLocaleString()
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

        if (!itemList) return;

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
                item.type === currentFilter;

            return matchesSearch && matchesFilter;
        });

        if (filteredItems.length === 0) {
            itemList.innerHTML = `
                <div class="empty-message">
                    <h3>No items found</h3>
                    <p>No reports match your search or selected filter.</p>
                </div>
            `;
            return;
        }

        itemList.innerHTML = filteredItems.map(item => createPublicItemCard(item)).join("");
    };

    function createPublicItemCard(item) {
        const isOwner = currentUser && item.ownerId === currentUser.id;

        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}

                <span class="badge">${item.type}</span>
                ${isOwner ? `<span class="owner-badge">Your Report</span>` : ""}

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Reported By:</strong> ${item.ownerName}</p>
                <p><strong>Reported On:</strong> ${item.createdAt}</p>
                <p><strong>Verification:</strong> ${item.verification || "Not provided"}</p>

                ${item.type === "Found" ? createClaimsBox(item) : ""}

                ${!isOwner ? `
                    <div class="response-box">
                        <h4>Send Private Response</h4>
                        <textarea id="response-${item.id}" placeholder="Example: I found it / This is my item"></textarea>
                        <button onclick="sendResponse(${item.id})">
                            <i class="fa-solid fa-message"></i> Send Response
                        </button>
                    </div>
                ` : ""}

                ${item.type === "Found" && !isOwner ? `
                    <button onclick="claimItem(${item.id})" class="secondary-btn">
                        <i class="fa-solid fa-hand"></i> Claim This Item
                    </button>
                ` : ""}
            </div>
        `;
    }

    function createClaimsBox(item) {
        if (!item.claims || item.claims.length === 0) {
            return `
                <div class="claim-box">
                    <h4>Public Claims</h4>
                    <p>No one has claimed this item yet.</p>
                </div>
            `;
        }

        return `
            <div class="claim-box">
                <h4>Public Claims</h4>
                ${item.claims.map(claim => `
                    <div class="claim-message">
                        <p><strong>Claimed By:</strong> ${claim.name}</p>
                        <p><strong>Contact:</strong> ${claim.contact}</p>
                        <p><strong>Claimed On:</strong> ${claim.date}</p>
                    </div>
                `).join("")}
            </div>
        `;
    }

    window.sendResponse = function (itemId) {
        const responseBox = document.getElementById(`response-${itemId}`);
        const message = responseBox.value.trim();

        if (!message) {
            alert("Please write a response message.");
            return;
        }

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id === itemId);

        item.responses.push({
            fromUserId: currentUser.id,
            fromName: currentUser.name,
            fromContact: currentUser.contact,
            message: message,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        alert("Private response sent.");
        responseBox.value = "";
        displayItems();
    };

    window.claimItem = function (itemId) {
        const claimName = prompt("Enter your name for public claim:");

        if (!claimName) return;

        const claimContact = prompt("Enter your contact number for public claim:");

        if (!claimContact) return;

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id === itemId);

        item.claims.push({
            userId: currentUser.id,
            name: claimName,
            contact: claimContact,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        alert("Your claim has been added publicly.");
        displayItems();
    };

    window.displayMyReports = function () {
        const myReportList = document.getElementById("myReportList");

        if (!myReportList) return;

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const myItems = items.filter(item => currentUser && item.ownerId === currentUser.id);

        const lostItems = myItems.filter(item => item.type === "Lost");
        const foundItems = myItems.filter(item => item.type === "Found");

        let html = "";

        html += `<h2 class="report-heading">My Lost Item Reports</h2>`;

        if (lostItems.length === 0) {
            html += `
                <div class="empty-message">
                    <h3>No lost item reports</h3>
                    <p>You have not reported any lost item yet.</p>
                </div>
            `;
        } else {
            html += lostItems.map(item => createMyReportCard(item)).join("");
        }

        html += `<h2 class="report-heading">My Found Item Reports</h2>`;

        if (foundItems.length === 0) {
            html += `
                <div class="empty-message">
                    <h3>No found item reports</h3>
                    <p>You have not reported any found item yet.</p>
                </div>
            `;
        } else {
            html += foundItems.map(item => createMyReportCard(item)).join("");
        }

        myReportList.innerHTML = html;
    };

    function createMyReportCard(item) {
        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image" alt="Item Image">` : ""}

                <span class="badge">${item.type}</span>
                <span class="owner-badge">Your Report</span>

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Reported On:</strong> ${item.createdAt}</p>

                <div class="response-box">
                    <h4>Private Responses</h4>

                    ${item.responses && item.responses.length > 0
                        ? item.responses.map(response => `
                            <div class="response-message">
                                <p><strong>From:</strong> ${response.fromName}</p>
                                <p><strong>Contact:</strong> ${response.fromContact}</p>
                                <p><strong>Message:</strong> ${response.message}</p>
                                <p><strong>Date:</strong> ${response.date}</p>
                            </div>
                        `).join("")
                        : `<p>No private responses yet.</p>`
                    }
                </div>

                ${item.type === "Found" ? createClaimsBox(item) : ""}

                <button onclick="deleteMyReport(${item.id})" class="danger-btn">
                    <i class="fa-solid fa-trash"></i> Delete Report
                </button>
            </div>
        `;
    }

    window.deleteMyReport = function (itemId) {
        const confirmDelete = confirm("Are you sure you want to delete this report?");

        if (!confirmDelete) return;

        let items = JSON.parse(localStorage.getItem("items")) || [];

        items = items.filter(item => item.id !== itemId || item.ownerId !== currentUser.id);

        localStorage.setItem("items", JSON.stringify(items));

        displayMyReports();
        displayItems();
        updateStats();
    };

    function loadProfile() {
        if (!currentUser) return;

        const profileName = document.getElementById("profileName");
        const profileContact = document.getElementById("profileContact");
        const profileImagePreview = document.getElementById("profileImagePreview");
        const welcomeName = document.getElementById("welcomeName");

        if (profileName) profileName.value = currentUser.name;
        if (profileContact) profileContact.value = currentUser.contact;
        if (profileImagePreview) profileImagePreview.src = currentUser.profileImage || defaultProfileImage;
        if (welcomeName) welcomeName.textContent = currentUser.name;
    }

    window.saveProfile = function () {
        const profileImageInput = document.getElementById("profileImage");
        const imageFile = profileImageInput.files[0];

        if (imageFile) {
            const reader = new FileReader();

            reader.onload = function () {
                updateProfile(reader.result);
            };

            reader.readAsDataURL(imageFile);
        } else {
            updateProfile(currentUser.profileImage || defaultProfileImage);
        }
    };

    function updateProfile(profileImageData) {
        const newName = document.getElementById("profileName").value.trim();
        const newContact = document.getElementById("profileContact").value.trim();

        if (!newName || !newContact) {
            alert("Name and contact cannot be empty.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        users = users.map(user => {
            if (user.id === currentUser.id) {
                return {
                    ...user,
                    name: newName,
                    contact: newContact,
                    profileImage: profileImageData
                };
            }

            return user;
        });

        currentUser.name = newName;
        currentUser.contact = newContact;
        currentUser.profileImage = profileImageData;

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        alert("Profile updated successfully.");
        loadProfile();
    }

    function updateStats() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        const totalReports = document.getElementById("totalReports");
        const lostReports = document.getElementById("lostReports");
        const foundReports = document.getElementById("foundReports");

        if (totalReports) totalReports.textContent = items.length;
        if (lostReports) lostReports.textContent = items.filter(item => item.type === "Lost").length;
        if (foundReports) foundReports.textContent = items.filter(item => item.type === "Found").length;
    }

    if (currentUser) {
        openMainApp();
    }

});
