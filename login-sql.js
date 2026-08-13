const apiBase = "http://localhost:3000";

async function addUser(name, email) {
  const response = await fetch(`${apiBase}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Unable to save record");
  }
}

async function getUsers() {
  const response = await fetch(`${apiBase}/records`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Unable to load records");
  }

  const data = await response.json();
  return data.records || [];
}

function showStatus(message, isError = false) {
  const statusBox = document.getElementById("status");
  statusBox.textContent = message;
  statusBox.style.color = isError ? "#b91c1c" : "#0f766e";
}

function renderUsers(users) {
  const list = document.getElementById("user-list");
  list.innerHTML = "";

  if (!users.length) {
    list.innerHTML = "<li>No records yet.</li>";
    return;
  }

  const items = users.map((user) => `<li>${user.name} — ${user.email}</li>`).join("");
  list.innerHTML = items;
}

async function loadUsers() {
  try {
    const users = await getUsers();
    renderUsers(users);
  } catch (error) {
    showStatus("Could not load records: " + error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadUsers();
    showStatus("Connected to SQLite database.");
  } catch (error) {
    showStatus("Failed to connect to SQLite server: " + error.message, true);
  }

  document.getElementById("user-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
      showStatus("Please fill in both fields.", true);
      return;
    }

    try {
      await addUser(name, email);
      document.getElementById("user-form").reset();
      showStatus("Record saved successfully.");
      await loadUsers();
    } catch (error) {
      showStatus("Failed to save record: " + error.message, true);
    }
  });
});