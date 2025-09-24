(function(){
    const app = document.querySelector(".app");
    const socket = io();
    
    let uname;
    let isTyping = false;
    let typingTimer;

    // Check if browser supports notifications
    const notificationSupported = 'Notification' in window;
    let notificationPermission = notificationSupported ? Notification.permission : 'denied';
    
    // Request notification permission if needed
    if (notificationSupported && notificationPermission === 'default') {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission;
        });
    }

    // Join Chatroom
    app.querySelector(".join-screen #join-user").addEventListener("click", joinChat);
    
    // Allow joining with Enter key
    app.querySelector(".join-screen #username").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            joinChat();
        }
    });
    
    function joinChat() {
        let username = app.querySelector(".join-screen #username").value.trim();
        if (username.length === 0) {
            showError("Please enter a username");
            return;
        }
        if (username.length > 15) {
            showError("Username must be less than 15 characters");
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
        app.querySelector(".chat-screen #message-input").focus();
        
        // Show welcome notification
        showNotification("Welcome to ChatRoom!", "You've joined the chat successfully.");
    }
    
    function showError(message) {
        // Create error message element
        const errorEl = document.createElement("div");
        errorEl.className = "error-message";
        errorEl.innerHTML = message;
        errorEl.style.cssText = `
            color: var(--error-color);
            text-align: center;
            margin-top: 10px;
            font-size: 14px;
        `;
        
        // Remove any existing error
        const existingError = document.querySelector(".error-message");
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error
        app.querySelector(".join-screen .form").appendChild(errorEl);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 3000);
    }

    // Send Message
    app.querySelector(".chat-screen #send-message").addEventListener("click", sendMessage);
    
    // Allow sending with Enter key
    app.querySelector(".chat-screen #message-input").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
    
    // Typing indicator
    app.querySelector(".chat-screen #message-input").addEventListener("input", function() {
        if (!isTyping) {
            isTyping = true;
            socket.emit("typing", uname);
        }
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            isTyping = false;
            socket.emit("stop-typing");
        }, 1000);
    });
    
    function sendMessage() {
        let messageInput = app.querySelector(".chat-screen #message-input");
        let message = messageInput.value.trim();
        
        if (message.length === 0) {
            return;
        }
        
        // Stop typing indicator
        isTyping = false;
        socket.emit("stop-typing");
        clearTimeout(typingTimer);
        
        const messageData = {
            username: uname,
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Render message locally (only once)
        renderMessage("my", messageData);
        
        // Send to server (which will broadcast to others)
        socket.emit("chat", messageData);
        messageInput.value = "";
        messageInput.focus();
        
        // Show message sent notification
        showNotification("Message Sent", "Your message was delivered.");
    }

    // Exit Chatroom
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {
        if (confirm("Are you sure you want to leave the chat?")) {
            socket.emit("exituser", uname);
            window.location.href = window.location.href;
        }
    });

    // Socket event listeners
    socket.on("update", function(update) {
        renderMessage("update", update);
        
        // Show notification for user join/leave events
        if (update.includes("joined")) {
            showNotification("User Joined", update);
        } else if (update.includes("left")) {
            showNotification("User Left", update);
        }
    });

    socket.on("chat", function(message) {
        // Only render messages from other users (not our own)
        if (message.username !== uname) {
            renderMessage("other", message);
            
            // Show notification for new messages (only if not focused on chat)
            if (!document.hasFocus()) {
                showNotification(`New message from ${message.username}`, message.text);
            }
        }
    });
    
    socket.on("message-history", function(history) {
        const messageContainer = app.querySelector(".chat-screen .messages");
        messageContainer.innerHTML = ''; // Clear any existing messages
        
        history.forEach(message => {
            if (message.username === uname) {
                renderMessage("my", message);
            } else {
                renderMessage("other", message);
            }
        });
    });
    
    socket.on("user-count", function(count) {
        document.getElementById("online-count").textContent = `${count} user${count !== 1 ? 's' : ''} online`;
        document.getElementById("user-status").textContent = `${count} user${count !== 1 ? 's' : ''} online`;
    });
    
    socket.on("typing", function(username) {
        if (username !== uname) { // Don't show our own typing indicator
            const typingIndicator = document.getElementById("typing-indicator");
            if (!typingIndicator) {
                const el = document.createElement("div");
                el.setAttribute("id", "typing-indicator");
                el.setAttribute("class", "update");
                el.innerHTML = `${username} is typing...`;
                app.querySelector(".messages").appendChild(el);
                app.querySelector(".messages").scrollTop = app.querySelector(".messages").scrollHeight;
            }
        }
    });
    
    socket.on("stop-typing", function() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    });

    // Render message
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        
        // Remove typing indicator if present
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        let el = document.createElement("div");
        
        if (type === "my") {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="text">${escapeHtml(message.text)}</div>
                    <div class="time">${message.time}</div>
                </div>
            `;
        } else if (type === "other") {
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${escapeHtml(message.username)}</div>
                    <div class="text">${escapeHtml(message.text)}</div>
                    <div class="time">${message.time}</div>
                </div>
            `;
        } else if (type === "update") {
            el.setAttribute("class", "update");
            el.innerHTML = escapeHtml(message);
        }
        
        messageContainer.appendChild(el);
        
        // Scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    
    // Show notification
    function showNotification(title, body) {
        // Browser notifications
        if (notificationSupported && notificationPermission === 'granted' && !document.hasFocus()) {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico'
            });
        }
        
        // In-app notifications (for mobile browsers that don't support notifications)
        const notificationEl = document.createElement('div');
        notificationEl.className = 'in-app-notification';
        notificationEl.innerHTML = `
            <strong>${title}</strong>
            <p>${body}</p>
        `;
        
        document.body.appendChild(notificationEl);
        
        // Animate in
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notificationEl.classList.remove('show');
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Emoji button (placeholder for future functionality)
    app.querySelector(".chat-screen #emoji-btn").addEventListener("click", function() {
        alert("Emoji picker will be implemented here!");
    });
    
    // Handle device back button (mobile)
    if (history && history.pushState) {
        window.addEventListener('popstate', function() {
            if (app.querySelector(".chat-screen").classList.contains("active")) {
                if (confirm("Are you sure you want to leave the chat?")) {
                    socket.emit("exituser", uname);
                    window.location.href = window.location.href;
                } else {
                    history.pushState(null, null, document.URL);
                }
            }
        });
    }
})();