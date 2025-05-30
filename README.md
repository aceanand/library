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

## Project Resources

Below are the downloadable resources associated with this project:

- 📄 **[SQL Database File](https://drive.google.com/file/d/1rlKoljQ4AiVIa5xi1K3oWShdRe9E4v8C/view?usp=drivesdk)**  
  This file contains the complete database schema and sample data required to set up the MySQL database for the application.

- 🎞️ **[Library API Source Code](https://drive.google.com/file/d/1ro_tPt9z13Ndhd1TySvl5yyqcUaH0Ex4/view?usp=drivesdk)**  
  complete backend API implementation. It contains route handlers, database connection logic, and controller files necessary to run the service.

## Setup Instructions

1. ** Download the Project Files**  
   Download the API and SQL files using the links above.

2. **Import the SQL File**  
   - Use tools like phpMyAdmin or MySQL CLI to import the SQL database into your local or server-based MySQL instance.

3. **Configure the API**  
   - Extract the API source code.
   - Set up environment variables such as database credentials.


4. **Test the Endpoints**  
   - Use Postman or any REST client to test API routes.
   - Ensure database connection is successful and CRUD operations are functioning.

---

For any questions or issues, feel free to raise an issue or contact the maintainer.  
  
