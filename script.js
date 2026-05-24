document.addEventListener("DOMContentLoaded", function () {

    let isLoginMode = true;
    let currentFilter = "All";
    let myReportFilter = "All";

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const defaultProfileImage =
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify([]));
    }

    if (!localStorage.getItem("items")) {
        localStorage.setItem("items", JSON.stringify([]));
    }

    if (currentUser) {
        openMainApp();
    }

    window.toggleAuthMode = function () {
        isLoginMode = !isLoginMode;

        document.getElementById("authTitle").textContent =
            isLoginMode ? "Login" : "Sign Up";

        document.getElementById("authButton").textContent =
            isLoginMode ? "Login" : "Create Account";

        document.getElementById("switchText").textContent =
            isLoginMode ? "Don’t have an account?" : "Already have an account?";

        document.querySelector(".switch-auth a").textContent =
            isLoginMode ? "Sign up" : "Login";

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
            const user = users.find(
                u => u.email === email && u.password === password
            );

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
                alert("Email already exists.");
                return;
            }

            const newUser = {
                id: Date.now(),
                name,
                contact,
                email,
                password,
                profileImage: defaultProfileImage,
                seenChats: []
            };

            users.push(newUser);

            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(newUser));

            currentUser = newUser;
            openMainApp();
        }
    };

    function openMainApp() {
        if (!currentUser.seenChats) {
            currentUser.seenChats = [];
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

        document.getElementById("authPage").classList.add("hidden");
        document.getElementById("mainApp").classList.remove("hidden");

        document.getElementById("welcomeName").textContent = currentUser.name;

        loadProfile();
        showSection("home");
        updateStats();
        updateNotifications();
    }

    window.logoutUser = function () {
        localStorage.removeItem("currentUser");
        location.reload();
    };

    window.showSection = function (sectionId) {
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active-section");
        });

        document.getElementById(sectionId).classList.add("active-section");

        if (sectionId === "search") {
            displayItems();
        }

        if (sectionId === "myReports") {
            markMessagesAsSeen();
            displayMyReports();
        }

        if (sectionId === "profile") {
            loadProfile();
        }

        updateStats();
        updateNotifications();
    };

    window.filterItems = function (filterType) {
        currentFilter = filterType;
        showSection("search");

        const title = document.getElementById("searchTitle");

        if (filterType === "All") {
            title.textContent = "All Lost and Found Reports";
        } else if (filterType === "Lost") {
            title.textContent = "Lost Item Reports";
        } else {
            title.textContent = "Found Item Reports";
        }

        displayItems();
    };

    window.filterMyReports = function (filterType) {
        myReportFilter = filterType;

        if (filterType === "Responses") {
            markMessagesAsSeen();
        }

        displayMyReports();
        updateNotifications();
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
            id: Date.now(),
            ownerId: currentUser.id,
            ownerName: currentUser.name,
            ownerContact: currentUser.contact,
            type: document.getElementById("type").value,
            itemName: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value,
            description: document.getElementById("description").value,
            verification: document.getElementById("verification").value,
            image: imageData,
            claims: [],
            chats: [],
            createdAt: new Date().toLocaleString()
        };

        const items = JSON.parse(localStorage.getItem("items")) || [];

        items.push(newItem);

        localStorage.setItem("items", JSON.stringify(items));

        alert("Report submitted successfully!");

        itemForm.reset();

        filterItems("All");
    }

    window.displayItems = function () {
        const itemList = document.getElementById("itemList");
        const searchInput = document.getElementById("searchInput");

        const searchValue = searchInput.value.toLowerCase();

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
                    <p>No reports match your search.</p>
                </div>
            `;
            return;
        }

        itemList.innerHTML = filteredItems.map(item => createPublicCard(item)).join("");
    };

    function createPublicCard(item) {
        const isOwner = item.ownerId === currentUser.id;

        const hasClaimed = item.claims.some(
            claim => claim.userId === currentUser.id
        );

        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image">` : ""}

                <span class="badge">${item.type}</span>

                ${isOwner ? `<span class="owner-badge">Your Report</span>` : ""}

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>
                <p><strong>Reported By:</strong> ${item.ownerName}</p>
                <p><strong>Posted:</strong> ${item.createdAt}</p>
                <p><strong>Verification:</strong> ${item.verification || "Not provided"}</p>

                ${item.type === "Found" ? createClaimBox(item) : ""}

                ${!isOwner ? createChatSection(item, hasClaimed) : ""}
            </div>
        `;
    }

    function createClaimBox(item) {
        return `
            <div class="claim-box">
                <h4>Public Claims</h4>

                ${item.claims.length === 0
                    ? `<p>No public claims yet.</p>`
                    : item.claims.map(claim => `
                        <div class="claim-message">
                            <p><strong>${claim.name}</strong></p>
                            <p>${claim.contact}</p>
                            <p>${claim.date}</p>
                        </div>
                    `).join("")
                }

                <button onclick="claimItem(${item.id})" class="secondary-btn">
                    <i class="fa-solid fa-hand"></i> Claim This Item
                </button>
            </div>
        `;
    }

    window.claimItem = function (itemId) {
        const name = prompt("Enter your name:");

        if (!name) return;

        const contact = prompt("Enter your contact number:");

        if (!contact) return;

        const items = JSON.parse(localStorage.getItem("items")) || [];

        const item = items.find(i => i.id === itemId);

        const alreadyClaimed = item.claims.some(
            claim => claim.userId === currentUser.id
        );

        if (alreadyClaimed) {
            alert("You already claimed this item.");
            return;
        }

        item.claims.push({
            userId: currentUser.id,
            name,
            contact,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        alert("Claim submitted publicly.");

        displayItems();
    };

    function createChatSection(item, hasClaimed) {
        if (item.type === "Found" && !hasClaimed) {
            return `
                <div class="response-box">
                    <h4>Claim Required</h4>
                    <p>You must claim this item first before sending response.</p>
                </div>
            `;
        }

        const myConversation = item.chats.filter(chat =>
            chat.fromUserId === currentUser.id ||
            chat.toUserId === currentUser.id
        );

        return `
            <div class="chat-box">
                <h4>Private Conversation</h4>

                ${myConversation.length === 0
                    ? `<p>No conversation yet.</p>`
                    : myConversation.map(chat => `
                        <div class="chat-message ${chat.fromUserId === item.ownerId ? "owner-reply" : ""}">
                            <p><strong>${chat.fromName}</strong></p>
                            <p>${chat.message}</p>
                            <p>${chat.date}</p>
                        </div>
                    `).join("")
                }

                <textarea id="chat-${item.id}" placeholder="Send message..."></textarea>

                <button onclick="sendMessage(${item.id})">
                    <i class="fa-solid fa-paper-plane"></i> Send Message
                </button>
            </div>
        `;
    }

    window.sendMessage = function (itemId) {
        const textArea = document.getElementById(`chat-${itemId}`);
        const message = textArea.value.trim();

        if (!message) {
            alert("Please write a message.");
            return;
        }

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id === itemId);

        item.chats.push({
            id: Date.now(),
            fromUserId: currentUser.id,
            fromName: currentUser.name,
            toUserId: item.ownerId,
            message,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        textArea.value = "";

        alert("Message sent.");

        displayItems();
        displayMyReports();
        updateNotifications();
    };

    window.displayMyReports = function () {
        const myReportList = document.getElementById("myReportList");

        const items = JSON.parse(localStorage.getItem("items")) || [];

        let html = "";

        if (myReportFilter === "Responses") {
            const responseItems = items.filter(item =>
                item.chats.some(chat =>
                    chat.fromUserId === currentUser.id ||
                    chat.toUserId === currentUser.id
                )
            );

            html += `<h2 class="report-heading">My Responses</h2>`;

            html += responseItems.length > 0
                ? responseItems.map(item => createResponseCard(item)).join("")
                : createEmptyMessage("No responses yet.");

            myReportList.innerHTML = html;
            return;
        }

        let myItems = items.filter(item => item.ownerId === currentUser.id);

        if (myReportFilter !== "All") {
            myItems = myItems.filter(item => item.type === myReportFilter);
        }

        const lost = myItems.filter(item => item.type === "Lost");
        const found = myItems.filter(item => item.type === "Found");

        if (myReportFilter === "All" || myReportFilter === "Lost") {
            html += `<h2 class="report-heading">My Lost Reports</h2>`;

            html += lost.length > 0
                ? lost.map(item => createMyReportCard(item)).join("")
                : createEmptyMessage("No lost reports.");
        }

        if (myReportFilter === "All" || myReportFilter === "Found") {
            html += `<h2 class="report-heading">My Found Reports</h2>`;

            html += found.length > 0
                ? found.map(item => createMyReportCard(item)).join("")
                : createEmptyMessage("No found reports.");
        }

        myReportList.innerHTML = html;
    };

    function createResponseCard(item) {
        const myConversation = item.chats.filter(chat =>
            chat.fromUserId === currentUser.id ||
            chat.toUserId === currentUser.id
        );

        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image">` : ""}

                <span class="badge">${item.type}</span>

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Report Owner:</strong> ${item.ownerName}</p>

                <div class="chat-box">
                    <h4>Conversation</h4>

                    ${myConversation.map(chat => `
                        <div class="chat-message ${chat.fromUserId === currentUser.id ? "owner-reply" : ""}">
                            <p><strong>${chat.fromName}</strong></p>
                            <p>${chat.message}</p>
                            <p>${chat.date}</p>
                        </div>
                    `).join("")}

                    <textarea id="responseReply-${item.id}" placeholder="Reply message..."></textarea>

                    <button onclick="replyFromResponseSection(${item.id})">
                        <i class="fa-solid fa-reply"></i> Reply
                    </button>
                </div>
            </div>
        `;
    }

    window.replyFromResponseSection = function (itemId) {
        const textArea = document.getElementById(`responseReply-${itemId}`);
        const message = textArea.value.trim();

        if (!message) {
            alert("Please write reply.");
            return;
        }

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id === itemId);

        const receiverId =
            currentUser.id === item.ownerId
                ? getLastOtherUserId(item)
                : item.ownerId;

        item.chats.push({
            id: Date.now(),
            fromUserId: currentUser.id,
            fromName: currentUser.name,
            toUserId: receiverId,
            message,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        textArea.value = "";

        displayMyReports();
        updateNotifications();
    };

    function createMyReportCard(item) {
        const conversationsByUser = getConversationsGroupedByUser(item);

        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" class="item-image">` : ""}

                <span class="badge">${item.type}</span>
                <span class="owner-badge">Your Report</span>

                <h3>${item.itemName}</h3>

                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Description:</strong> ${item.description}</p>

                <div class="chat-box">
                    <h4>Private Conversations</h4>

                    ${conversationsByUser.length === 0
                        ? `<p>No messages yet.</p>`
                        : conversationsByUser.map(group => `
                            <div class="response-message">
                                <h4>Conversation with ${group.name}</h4>

                                ${group.messages.map(chat => `
                                    <div class="chat-message ${chat.fromUserId === currentUser.id ? "owner-reply" : ""}">
                                        <p><strong>${chat.fromName}</strong></p>
                                        <p>${chat.message}</p>
                                        <p>${chat.date}</p>
                                    </div>
                                `).join("")}

                                <textarea id="ownerReply-${item.id}-${group.userId}" placeholder="Reply to ${group.name}..."></textarea>

                                <button onclick="replyToSpecificUser(${item.id}, ${group.userId})">
                                    <i class="fa-solid fa-reply"></i> Reply
                                </button>
                            </div>
                        `).join("")
                    }
                </div>

                ${item.type === "Found" ? createClaimBox(item) : ""}

                <button onclick="deleteReport(${item.id})" class="danger-btn">
                    <i class="fa-solid fa-trash"></i> Delete Report
                </button>
            </div>
        `;
    }

    function getConversationsGroupedByUser(item) {
        const groups = [];

        item.chats.forEach(chat => {
            const otherUserId =
                chat.fromUserId === currentUser.id
                    ? chat.toUserId
                    : chat.fromUserId;

            if (!otherUserId || otherUserId === currentUser.id) return;

            let group = groups.find(g => g.userId === otherUserId);

            if (!group) {
                group = {
                    userId: otherUserId,
                    name: chat.fromUserId === currentUser.id ? "User" : chat.fromName,
                    messages: []
                };

                groups.push(group);
            }

            group.messages.push(chat);
        });

        return groups;
    }

    window.replyToSpecificUser = function (itemId, receiverId) {
        const textArea = document.getElementById(`ownerReply-${itemId}-${receiverId}`);
        const message = textArea.value.trim();

        if (!message) {
            alert("Please write reply.");
            return;
        }

        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id === itemId);

        item.chats.push({
            id: Date.now(),
            fromUserId: currentUser.id,
            fromName: currentUser.name,
            toUserId: receiverId,
            message,
            date: new Date().toLocaleString()
        });

        localStorage.setItem("items", JSON.stringify(items));

        textArea.value = "";

        displayMyReports();
        updateNotifications();
    };

    function getLastOtherUserId(item) {
        const reversedChats = [...item.chats].reverse();

        const lastChat = reversedChats.find(chat =>
            chat.fromUserId !== currentUser.id
        );

        return lastChat ? lastChat.fromUserId : item.ownerId;
    }

    window.deleteReport = function (itemId) {
        const confirmDelete = confirm("Delete this report?");

        if (!confirmDelete) return;

        let items = JSON.parse(localStorage.getItem("items")) || [];

        items = items.filter(item => item.id !== itemId);

        localStorage.setItem("items", JSON.stringify(items));

        displayMyReports();
        displayItems();
        updateStats();
        updateNotifications();
    };

    function createEmptyMessage(text) {
        return `
            <div class="empty-message">
                <h3>${text}</h3>
            </div>
        `;
    }

    function loadProfile() {
        document.getElementById("profileName").value = currentUser.name;
        document.getElementById("profileContact").value = currentUser.contact;
        document.getElementById("profileImagePreview").src =
            currentUser.profileImage || defaultProfileImage;
    }

    window.saveProfile = function () {
        const name = document.getElementById("profileName").value.trim();
        const contact = document.getElementById("profileContact").value.trim();
        const imageInput = document.getElementById("profileImage");
        const imageFile = imageInput.files[0];

        if (!name || !contact) {
            alert("Please fill all fields.");
            return;
        }

        if (imageFile) {
            const reader = new FileReader();

            reader.onload = function () {
                updateProfile(name, contact, reader.result);
            };

            reader.readAsDataURL(imageFile);
        } else {
            updateProfile(name, contact, currentUser.profileImage);
        }
    };

    function updateProfile(name, contact, image) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        users = users.map(user => {
            if (user.id === currentUser.id) {
                return {
                    ...user,
                    name,
                    contact,
                    profileImage: image
                };
            }

            return user;
        });

        currentUser.name = name;
        currentUser.contact = contact;
        currentUser.profileImage = image;

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        alert("Profile updated.");

        loadProfile();

        document.getElementById("welcomeName").textContent = currentUser.name;
    }

    function updateStats() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        document.getElementById("totalReports").textContent = items.length;
        document.getElementById("lostReports").textContent =
            items.filter(i => i.type === "Lost").length;
        document.getElementById("foundReports").textContent =
            items.filter(i => i.type === "Found").length;
    }

    function updateNotifications() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        if (!currentUser.seenChats) {
            currentUser.seenChats = [];
        }

        let count = 0;

        items.forEach(item => {
            item.chats.forEach(chat => {
                const isForCurrentUser =
                    chat.toUserId === currentUser.id ||
                    item.ownerId === currentUser.id;

                const isNotMine =
                    chat.fromUserId !== currentUser.id;

                const isUnseen =
                    !currentUser.seenChats.includes(chat.id);

                if (isForCurrentUser && isNotMine && isUnseen) {
                    count++;
                }
            });
        });

        const badge = document.getElementById("notificationBadge");

        if (count > 0) {
            badge.classList.remove("hidden");
            badge.textContent = count;
        } else {
            badge.classList.add("hidden");
        }

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    function markMessagesAsSeen() {
        const items = JSON.parse(localStorage.getItem("items")) || [];

        if (!currentUser.seenChats) {
            currentUser.seenChats = [];
        }

        items.forEach(item => {
            item.chats.forEach(chat => {
                const isForCurrentUser =
                    chat.toUserId === currentUser.id ||
                    item.ownerId === currentUser.id;

                const isNotMine =
                    chat.fromUserId !== currentUser.id;

                if (isForCurrentUser && isNotMine) {
                    if (!currentUser.seenChats.includes(chat.id)) {
                        currentUser.seenChats.push(chat.id);
                    }
                }
            });
        });

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        let users = JSON.parse(localStorage.getItem("users")) || [];

        users = users.map(user => {
            if (user.id === currentUser.id) {
                return currentUser;
            }

            return user;
        });

        localStorage.setItem("users", JSON.stringify(users));
    }

});
