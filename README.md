# 📚 Book Review API

A RESTful API built with **Node.js** and **Express.js** that allows users to register, log in, add books, and post reviews. It uses **JWT-based authentication** and **SQL** as the database.

🔗 [Project Repository](https://github.com/aceanand/library)

---

## 🚀 Features

- User registration and login with JWT  
- Add and retrieve books with filters and pagination  
- Post, update, and delete reviews (only by the author)  
- Search books by title or author (partial & case-insensitive)  
- Secure endpoints with proper access control  

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** SQL 
- **Auth:** JSON Web Tokens (JWT)  
- **Other Tools:** bcryptjs, dotenv, nodemon  

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

git clone https://github.com/aceanand/library.git
cd library

```bash
npm install
```
Start the server

```bash
  node server.js
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=library 
JWT_SECRET=your_jwt_secret
