Here’s a **GitHub-ready README.md** for your chat application project, based on the files you provided (`package.json`, `server.js`, `code.js`, `index.html`, and `style.css`):

---

# 💬 ChatRoom – Real-time Chat Application

A modern, responsive **real-time chat application** built with **Node.js, Express, and Socket.io**, featuring user-friendly UI, typing indicators, in-app/browser notifications, and message history.

![Chat Preview](https://img.shields.io/badge/ChatRoom-Realtime-blue?style=for-the-badge)

## 🚀 Features

* 🌐 **Real-time messaging** with Socket.io
* 👥 **User join/leave updates** with live online user count
* 💾 **Message history** (last 100 messages preserved per session)
* ⌨️ **Typing indicators** for active users
* 🔔 **Notifications**

  * Browser notifications (if supported)
  * In-app notifications (for mobile)
* 🎨 **Modern responsive UI** with a gradient background, animations, and smooth scrolling
* 📱 **Mobile-friendly** with safe-area support (for notched devices)

## 📂 Project Structure

```
chatroom/
│
├── public/
│   ├── index.html       # Main UI
│   ├── style.css        # Styling
│   ├── code.js          # Client-side logic
│
├── server.js            # Express + Socket.io backend
├── package.json         # Dependencies & scripts
├── package-lock.json    # Dependency lock file
```

## ⚡ Tech Stack

* **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Socket.io](https://socket.io/)
* **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
* **UI/UX**: Responsive layout, FontAwesome icons, Google Fonts

---

## 🛠 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/chatroom.git
cd chatroom
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the server**

* For production:

  ```bash
  npm start
  ```
* For development (with auto-reload):

  ```bash
  npm run dev
  ```

4. **Open in browser**

Go to 👉 [http://localhost:3000](http://localhost:3000)

## 📸 Screenshots

**Join Screen**

* Enter your username to join the chat.

**Chat Screen**

* Send/receive messages in real-time.
* See who is online.
* Get notified when others join, leave, or are typing.

## 🔮 Future Enhancements

* ✅ Emoji picker integration
* ✅ Private 1-to-1 chat
* ✅ Persistent database support (MongoDB/Firebase)
* ✅ Dark mode toggle

## 👨‍💻 Author

* Developed by **CHAPA ASHOK KUMAR**
* 🚀 Contributions are welcome! Feel free to fork and submit PRs.

## 📜 License

This project is licensed under the **ISC License** – see the [LICENSE](LICENSE) file for details.
