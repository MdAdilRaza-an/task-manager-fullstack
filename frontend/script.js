// BACKEND API URL
const API_BASE = "http://localhost:3000/api"; // later yahi URL change karoge jab deploy karoge

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const tasksContainer = document.getElementById("tasks-container");

// Fetch all tasks on page load
window.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
  tasksContainer.innerHTML = "Loading...";
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error("Error loading tasks", err);
    tasksContainer.innerHTML = "Error loading tasks.";
  }
}

function renderTasks(tasks) {
  if (!tasks.length) {
    tasksContainer.innerHTML = "<p>No tasks yet. Add one above 👆</p>";
    return;
  }

  tasksContainer.innerHTML = "";
  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <div class="task-header">
        <span class="task-title">${task.title}</span>
        <span class="badge ${task.is_completed ? "completed" : ""}">
          ${task.is_completed ? "Completed" : "Pending"}
        </span>
      </div>
      <p>${task.description || ""}</p>
      <small>Created: ${new Date(task.created_at).toLocaleString()}</small>
      <div class="task-actions">
        <button class="small-btn" data-action="toggle" data-id="${task.id}">
          ${task.is_completed ? "Mark Pending" : "Mark Done"}
        </button>
        <button class="small-btn" data-action="delete" data-id="${task.id}">
          Delete
        </button>
      </div>
    `;

    tasksContainer.appendChild(div);
  });

  // Add event listeners for buttons
  tasksContainer.querySelectorAll("button").forEach((btn) => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "toggle") {
      btn.addEventListener("click", () => toggleTask(id));
    } else if (action === "delete") {
      btn.addEventListener("click", () => deleteTask(id));
    }
  });
}

// Form submit → create task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) return;

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "Error creating task");
      return;
    }

    titleInput.value = "";
    descriptionInput.value = "";

    // Reload tasks
    loadTasks();
  } catch (err) {
    console.error("Error creating task", err);
  }
});

// Toggle complete / pending
async function toggleTask(id) {
  try {
    // pehle existing task data laa lo
    const resGet = await fetch(`${API_BASE}/tasks`);
    const tasks = await resGet.json();
    const task = tasks.find((t) => t.id === Number(id));
    if (!task) return;

    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        is_completed: !task.is_completed
      })
    });

    if (!res.ok) {
      alert("Error updating task");
      return;
    }

    loadTasks();
  } catch (err) {
    console.error("Error updating task", err);
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Error deleting task");
      return;
    }

    loadTasks();
  } catch (err) {
    console.error("Error deleting task", err);
  }
}
