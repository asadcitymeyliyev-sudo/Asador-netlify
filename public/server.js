import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

const SECRET_KEY = "supersecretkey"; 
const app = express();

// Подключаем body-parser
app.use(bodyParser.json());

// Добавляем статическую папку для файлов HTML/CSS/JS
app.use(express.static("public"));

// Ниже — остальной код: работа с базой данных, маршруты /register и /login
// Инициализация базы данных
const SQL = await initSqlJs();
let db;
const dbFile = "./mydb.sqlite";

if (fs.existsSync(dbFile)) {
  const filebuffer = fs.readFileSync(dbFile);
  db = new SQL.Database(filebuffer);
} else {
  db = new SQL.Database();
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
}

// Сохраняем базу
function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFile, buffer);
}

// Регистрация
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashed
    ]);
    saveDB();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

// Логин
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = db.exec("SELECT * FROM users WHERE username = ?", [username]);

  if (!result[0] || result[0].values.length === 0) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const user = result[0].values[0];
  const valid = await bcrypt.compare(password, user[2]);

  if (!valid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user[0], username: user[1] }, SECRET_KEY, {
    expiresIn: "1h"
  });
  res.json({ token });
});

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Порт для Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
