// main.js
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      alert("Вход успешен!");
      // Показываем основной контент
      document.getElementById("app").innerHTML = `<p>Привет, ${username}!</p>`;
    } else {
      alert("Ошибка: " + data.message);
    }
  } catch (err) {
    alert("Ошибка подключения к серверу");
    console.error(err);
  }
});
