const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const durationSlider = document.getElementById("range1");
const durationValue = document.getElementById("durationValue");

const soundAdd = document.getElementById("sound-add");
const soundComplete = document.getElementById("sound-complete");
const soundDelete = document.getElementById("sound-delete");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

durationSlider.addEventListener("input", () => {
  durationValue.textContent = durationSlider.value;
});

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const duration = parseInt(durationSlider.value);
  if (text) {
    tasks.push({ text, duration, completed: false });
    taskInput.value = "";
    saveTasks();
    renderTasks();
    soundAdd.play();
  }
});

const startTimeInput = document.getElementById("startTimeInput");
let startTimeStr = localStorage.getItem("startTime") || getCurrentTimeString();
startTimeInput.value = startTimeStr;

startTimeInput.addEventListener("change", () => {
  startTimeStr = startTimeInput.value;
  localStorage.setItem("startTime", startTimeStr);
  renderTasks();
});

function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // Format: HH:MM
}




function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  // Sort: incomplete tasks first, completed ones last
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  let currentTime = new Date();
  const [hours, minutes] = startTimeStr.split(":").map(Number);
  currentTime.setHours(hours, minutes, 0, 0);


  sortedTasks.forEach((task, sortedIndex) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    const originalIndex = tasks.indexOf(task);
    li.dataset.index = originalIndex;

    // Only show time if the task is not completed
    const taskTime = document.createElement("div");
    taskTime.className = "task-time";
    taskTime.textContent = task.completed ? "" : formatTime(currentTime);

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.contentEditable = true;
    taskText.textContent = task.text;
    if (task.completed) taskText.classList.add("completed");

    taskText.addEventListener("blur", () => {
      task.text = taskText.textContent.trim();
      saveTasks();
    });

    const durationDisplay = document.createElement("div");
    durationDisplay.className = "task-duration";
    durationDisplay.textContent = `(${task.duration} min)`;

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.innerHTML = `
      <button onclick="editDuration(${originalIndex})">⏱</button>
      <button onclick="toggleComplete(${originalIndex})">✔</button>
      <button onclick="deleteTask(${originalIndex})">✖</button>
    `;

    const left = document.createElement("div");
    left.className = "task-left";
    if (!task.completed) left.appendChild(taskTime); // Only add time for incomplete tasks
    left.appendChild(taskText);
    left.appendChild(durationDisplay);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);

    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);
    li.addEventListener("dragend", dragEnd);

    if (!task.completed) {
      currentTime = new Date(currentTime.getTime() + task.duration * 60000);
    }
  });
}



function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  soundComplete.play();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  soundDelete.play();
}

function editDuration(index) {
  const current = tasks[index].duration;
  const newDuration = prompt("Enter new duration in minutes:", current);
  const value = parseInt(newDuration);
  if (!isNaN(value) && value > 0) {
    tasks[index].duration = value;
    saveTasks();
    renderTasks();
  }
}

// Drag & Drop
let draggedIndex = null;

function dragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  const targetIndex = parseInt(e.target.closest(".task-item").dataset.index);
  if (targetIndex !== draggedIndex && draggedIndex !== null) {
    const movedTask = tasks.splice(draggedIndex, 1)[0];
    tasks.splice(targetIndex, 0, movedTask);
    saveTasks();
    renderTasks();
  }
}

function dragEnd(e) {
  e.target.classList.remove("dragging");
  draggedIndex = null;
}

// Initial render
renderTasks();




//STORING USEFUL ICONS:  ✖,✔,
