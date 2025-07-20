const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const durationSlider = document.getElementById("range1");
const durationValue = document.getElementById("durationValue");

const soundAdd = document.getElementById("sound-add");
const soundComplete = document.getElementById("sound-complete");
const soundDelete = document.getElementById("sound-delete");
const soundClick = document.getElementById("sound-click");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

durationSlider.addEventListener("input", () => {
  durationValue.innerHTML = "<strong>" + durationSlider.value + "</strong>";
});

document.addEventListener("click", function() {soundClick.play;})


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

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  let currentTime = new Date();

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.draggable = true;
    li.dataset.index = index;

    const taskTime = document.createElement("div");
    taskTime.className = "task-time";
    taskTime.textContent = formatTime(currentTime);

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.contentEditable = true;
    taskText.textContent = task.text;
    if (task.completed) taskText.classList.add("completed");

    taskText.addEventListener("blur", () => {
      tasks[index].text = taskText.textContent.trim();
      saveTasks();
    });

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.innerHTML = `
      <button onclick="toggleComplete(${index})">✔</button>
      <button onclick="deleteTask(${index})">✖</button>
    `;

    const left = document.createElement("div");
    left.className = "task-left";
    left.appendChild(taskTime);
    left.appendChild(taskText);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);

    // Drag-and-drop handlers
    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragover", dragOver);
    li.addEventListener("drop", drop);
    li.addEventListener("dragend", dragEnd);

    // Update time for next task
    currentTime = new Date(currentTime.getTime() + task.duration * 60000);
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

// Drag & Drop
let draggedIndex = null;

function dragStart(e) {
  draggedIndex = parseInt(e.target.dataset.index);
  e.target.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
  const overItem = e.target.closest(".task-item");
  if (!overItem || overItem.dataset.index === draggedIndex) return;
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

// Initial render on load
renderTasks();

