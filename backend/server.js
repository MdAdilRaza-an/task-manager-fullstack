const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000; // http://localhost:3000

app.use(cors());
app.use(express.json());

// ------- API ROUTES -------

// 1. Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Create new task
app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title, description || null]
    );

    const [taskRows] = await db.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json(taskRows[0]);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Update (mark complete / edit)
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, is_completed } = req.body;

  try {
    await db.query(
      "UPDATE tasks SET title = ?, description = ?, is_completed = ? WHERE id = ?",
      [title, description || null, is_completed ? 1 : 0, id]
    );

    const [taskRows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(taskRows[0]);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 5. Root endpoint (test)
app.get("/", (req, res) => {
  res.send("Task Manager API is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
