# Distort

**Distort** is a lightweight, open source desktop app for managing your Riot accounts. It lets you save multiple account names, view rank information, add notes, and organize everything in one place.

> 🛑 **This app does not store or check any passwords.**  
> Everything runs locally on your machine. No data is sent or stored online.

---

## 🔒 Privacy First

- No login required
- No external database or API
- No Riot credentials are ever stored or requested
- All data stays on your computer

---

## 🧰 Tech Stack

Distort is built using a modern full-stack setup designed for speed, security, and portability:

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite (local database)
- **Desktop Shell**: [Tauri](https://tauri.app/) (lightweight and secure)
- **Package Management**: npm + Cargo (for Tauri)

## 📝 License

MIT License.  
This project is not affiliated with Riot Games and does not access private account data. It is built for **local use only** and uses the Riot API solely for public information retrieval.
