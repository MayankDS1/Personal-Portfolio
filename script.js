const STORAGE_KEY = "mayankTaskflowTasksV1";
let tasks = loadTasks();
let currentFilter = "all";
let editingTaskId = null;

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} ${task.completed ? "active" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const main = document.createElement("div");
    main.className = "task-main";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
    meta.append(priority, document.createTextNode(`Added ${task.createdAt}`));
    main.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const editButton = document.createElement("button");
    editButton.className = "task-action";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEditDialog(task.id));
    const deleteButton = document.createElement("button");
    deleteButton.className = "task-action";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });
    actions.append(editButton, deleteButton);
    item.append(checkbox, main, actions);
    taskList.append(item);
  });

  emptyState.hidden = visibleTasks.length !== 0;
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = tasks.filter(t => t.completed).length;
  document.getElementById("pendingCount").textContent = tasks.filter(t => !t.completed).length;
  document.getElementById("allFilterCount").textContent = tasks.length;
  document.getElementById("footerCount").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }
  tasks.unshift({
    id: makeId(),
    title,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toLocaleDateString()
  });
  saveTasks();
  taskForm.reset();
  taskInput.focus();
  currentFilter = "all";
  renderTasks();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

function openEditDialog(id) {
  const task = tasks.find(entry => entry.id === id);
  if (!task) return;
  editingTaskId = id;
  document.getElementById("editTaskInput").value = task.title;
  document.getElementById("editPriorityInput").value = task.priority;
  editDialog.showModal();
  document.getElementById("editTaskInput").focus();
}

editForm.addEventListener("submit", event => {
  if (event.submitter && event.submitter.value === "cancel") return;
  event.preventDefault();
  const updatedTitle = document.getElementById("editTaskInput").value.trim();
  if (!updatedTitle) return;
  const task = tasks.find(entry => entry.id === editingTaskId);
  if (task) {
    task.title = updatedTitle;
    task.priority = document.getElementById("editPriorityInput").value;
    saveTasks();
  }
  editDialog.close();
  renderTasks();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkMode = document.body.classList.contains("dark");
  document.getElementById("themeToggle").textContent = darkMode ? "☾" : "☼";
});

const now = new Date();
document.getElementById("todayDate").textContent = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
document.getElementById("todayLabel").textContent = now.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase();
renderTasks();
