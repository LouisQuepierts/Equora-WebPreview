import { TIME_BOXES } from "../../scripts/default_config.js"
import {parseTasks, createTaskElement, collectTasks, renderTasks} from "../../scripts/create.js"
import {setup} from "../../scripts/cardlist.js";

let currentTaskInfo = null;

document.addEventListener("DOMContentLoaded", () => {
    setupFooter();
    setupSidePanel();
    setupPopups();
    setupSubmit();
});

window.addEventListener('task-detail', (e) => {
    console.log(e)
    const taskData = findTask(e.detail.id);
    openSidePanel(taskData);
})

window.addEventListener('task-done', (e) => {
    const taskData = findTask(e.detail.id);
    console.log(taskData)
    currentTaskInfo = taskData.task;
    currentTaskInfo.status = "Done";
    openPopup("popup-done");
})

function findTask(id) {
    for (let i = 0; i < TIME_BOXES.length; i++) {
        const item = TIME_BOXES[i];
        for (let j = 0; j < item.tasks.length; j++) {
            if (item.tasks[j].id === id) {
                return {
                    "task": item.tasks[j],
                    "time": item.name
                }
            }
        }
    }
    return null;
}

function extractTaskFromCard(cardEl) {
    const desc = cardEl.querySelector(".task-desc");
    const status = cardEl.querySelector(".task-status");
    if (!desc) return null;

    const taskName = desc.textContent.trim();
    // Find matching task in TIME_BOXES
    for (let i = 0; i < TIME_BOXES.length; i++) {
        const item = TIME_BOXES[i];
        for (let j = 0; j < item.tasks.length; j++) {
            if (item.tasks[j].task === taskName) {
                return {
                    task: item.tasks[j],
                    time: item.name
                };
            }
        }
    }
    return null;
}

// =========================================================================
//  SIDE PANEL
// =========================================================================
function setupSidePanel() {
    const overlay = document.getElementById("sidePanelOverlay");
    document.getElementById("btn-close-panel").addEventListener("click", closeSidePanel);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeSidePanel();
    });

    // Panel action buttons
    document.getElementById("btn-panel-done").addEventListener("click", () => {
        if (currentTaskInfo) currentTaskInfo.status = "Done";
        updatePanelStatusDisplay("Done");
        closeSidePanel();
        openPopup("popup-done");
        refreshCardStatus();
    });

    document.getElementById("btn-panel-delay").addEventListener("click", () => {
        openPopup("popup-delay");
    });

    document.getElementById("btn-panel-delete").addEventListener("click", () => {
        openPopup("popup-delete");
    });
}

function openSidePanel(taskData) {
    currentTaskInfo = taskData.task;
    console.log(taskData)
    document.getElementById("panel-task").textContent = taskData.task.task;
    document.getElementById("panel-time").textContent =
        taskData.time + (taskData.task.time ? " at " + taskData.task.time : "");

    const statusEl = document.getElementById("panel-status");
    statusEl.textContent = taskData.task.status;
    statusEl.className = "task-status " + taskData.task.status;

    document.getElementById("sidePanelOverlay").classList.add("active");

    if (taskData.task.status === "Done") {
        document.getElementById("btn-panel-done").style.display = "none";
        document.getElementById("btn-panel-delay").style.display = "none";
    } else {
        document.getElementById("btn-panel-done").style.display = "block";
        document.getElementById("btn-panel-delay").style.display = "block";
    }

    // Reset done pop-up animation classes
    resetDoneAnimation();
}

function closeSidePanel() {
    document.getElementById("sidePanelOverlay").classList.remove("active");
    currentTaskInfo = null;
}

function updatePanelStatusDisplay(newStatus) {
    const statusEl = document.getElementById("panel-status");
    statusEl.textContent = newStatus;
    statusEl.className = "task-status " + newStatus;
}

function refreshCardStatus() {
    refreshCardList();
}

// =========================================================================
//  POP-UPS
// =========================================================================
function setupPopups() {
    // Delay pop-up
    document.getElementById("btn-cancel-delay").addEventListener("click", () => {
        closePopup("popup-delay");
    });
    document.getElementById("delay-options").addEventListener("click", (e) => {
        const option = e.target.closest(".delay-option");
        if (!option) return;
        if (currentTaskInfo) currentTaskInfo.status = "Delayed";
        updatePanelStatusDisplay("Delayed");
        closePopup("popup-delay");
        refreshCardStatus();
    });
    document.getElementById("popup-delay").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closePopup("popup-delay");
    });

    // Delete pop-up
    document.getElementById("btn-cancel-delete").addEventListener("click", () => {
        closePopup("popup-delete");
    });
    document.getElementById("btn-confirm-delete").addEventListener("click", () => {
        if (currentTaskInfo) removeTask(currentTaskInfo.id);
        closePopup("popup-delete");
        closeSidePanel();
        refreshCardList();
    });
    document.getElementById("popup-delete").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closePopup("popup-delete");
    });

    // Done pop-up
    document.getElementById("btn-done-return").addEventListener("click", () => {
        closePopup("popup-done");
        refreshCardList();
    });
    document.getElementById("popup-done").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closePopup("popup-done");
    });

    // Create confirm pop-up
    document.getElementById("btn-create-confirm").addEventListener("click", confirmCreateTasks);
    document.getElementById("btn-create-discard").addEventListener("click", () => {
        closePopup("popup-create");
    });
    document.getElementById("popup-create").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closePopup("popup-create");
    });
}

function openPopup(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

function closePopup(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
}

function resetDoneAnimation() {
    const circle = document.querySelector("#popup-done .checkmark-draw");
    const check = document.querySelector("#popup-done .checkmark-check");
    const msg = document.querySelector("#popup-done .done-message");
    const btn = document.querySelector("#popup-done .done-return-btn");
    if (circle) circle.style.animation = "none";
    if (check) check.style.animation = "none";
    if (msg) msg.style.animation = "none";
    if (btn) btn.style.animation = "none";
    void circle?.offsetHeight;
    if (circle) circle.style.animation = "";
    if (check) check.style.animation = "";
    if (msg) msg.style.animation = "";
    if (btn) btn.style.animation = "";
}

// =========================================================================
//  CREATE CONFIRM FLOW
// =========================================================================
function setupSubmit() {
    const submitBtn = document.getElementById("submitBtn");
    const taskInput = document.getElementById("taskInput");

    submitBtn.addEventListener("click", () => {
        if (!submitBtn.classList.contains("active")) return;
        const input = taskInput.value.trim();
        if (!input) return;

        const tasks = parseTasks(input);
        document.getElementById("create-input-display").textContent = input;

        const container = document.getElementById("create-tasks-container");
        container.innerHTML = "";
        renderTasks(container, tasks)

        openPopup("popup-create");
    });
}

function confirmCreateTasks() {
    const tasks = collectTasks();
    if (tasks.length === 0) return;

    // Find max existing ID and assign new ones
    let maxId = 0;
    TIME_BOXES.forEach(box => {
        box.tasks.forEach(t => {
            const id = parseInt(t.id, 10);
            if (id > maxId) maxId = id;
        });
    });

    tasks.forEach((t, i) => {
        const id = String(maxId + i + 1);
        const slot = t.timeSlot || "Afternoon";
        const entry = { id, task: t.name, status: "Pending" };
        if (t.clockTime) entry.time = t.clockTime;

        const box = TIME_BOXES.find(b => b.name === slot);
        if (box) {
            box.tasks.push(entry);
        } else {
            // Try Tomorrow slot
            const tomorrowBox = TIME_BOXES.find(b => b.name === "Tomorrow");
            if (tomorrowBox) {
                tomorrowBox.tasks.push(entry);
            } else {
                TIME_BOXES[TIME_BOXES.length - 1].tasks.push(entry);
            }
        }
    });

    closePopup("popup-create");
    document.getElementById("taskInput").value = "";
    document.getElementById("submitBtn").classList.remove("active");
    refreshCardList();
}

// =========================================================================
//  HELPERS
// =========================================================================
function removeTask(id) {
    for (let i = 0; i < TIME_BOXES.length; i++) {
        const tasks = TIME_BOXES[i].tasks;
        for (let j = 0; j < tasks.length; j++) {
            if (tasks[j].id === id) {
                tasks.splice(j, 1);
                return;
            }
        }
    }
}

function refreshCardList() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    setup(list)
}

function buildTimebox(label, items) {
    const box = document.createElement("div");
    box.className = "timebox";

    const title = document.createElement("div");
    title.className = "timebox-title";
    title.textContent = label;
    box.appendChild(title);

    items.forEach(item => {
        box.appendChild(buildTaskCard(item));
    });

    return box;
}

function buildTaskCard(item) {
    const div = document.createElement("div");
    div.className = "task-item";
    div.classList.add(item.status);
    div.addEventListener("click", () => {
        const taskData = extractTaskFromCard(div);
        if (taskData) openSidePanel(taskData);
    });

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = item.time ? item.time : "Anytime";
    content.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "task-desc";
    desc.textContent = item.task;
    content.appendChild(desc);

    const status = document.createElement("div");
    status.className = "task-status";
    status.classList.add(item.status);
    status.textContent = item.status;
    content.appendChild(status);

    const done = document.createElement("button");
    done.className = "done-btn";
    done.textContent = "Done";

    div.appendChild(content);
    div.appendChild(done);
    return div;
}

// =========================================================================
//  FOOTER — voice / input / auto-resize
// =========================================================================
function setupFooter() {
    const taskInput = document.getElementById("taskInput");
    const submitBtn = document.getElementById("submitBtn");
    const holdSpeakBtn = document.getElementById("holdSpeakBtn");
    const micBtn = document.getElementById("micBtn");
    const keyboardBtn = document.getElementById("keyboardBtn");
    const inputRow = document.getElementById("inputRow");
    const transcriptionDisplay = document.getElementById("transcriptionDisplay");
    const footer = document.getElementById("footer");

    const test_transcription = "I have to go to gym this afternoon, and start my Programming 1 assignment tonight.";

    micBtn.addEventListener("click", () => {
        inputRow.classList.add("voice-mode");
        updateFooterHeight();
    });

    keyboardBtn.addEventListener("click", () => {
        inputRow.classList.remove("voice-mode");
        updateFooterHeight();
    });

    taskInput.addEventListener("input", () => {
        if (taskInput.value.trim()) {
            submitBtn.classList.add("active");
        } else {
            submitBtn.classList.remove("active");
        }
        autoResizeTaskInput();
    });

    const MAX_LINES = 4;
    const LINE_HEIGHT = 1.4;
    const FONT_SIZE = 15;
    const PADDING_V = 10;

    function autoResizeTaskInput() {
        taskInput.style.height = "auto";
        const lineHeightPx = FONT_SIZE * LINE_HEIGHT;
        const maxHeight = lineHeightPx * MAX_LINES + PADDING_V * 2;
        const newHeight = Math.min(taskInput.scrollHeight, maxHeight);
        taskInput.style.height = newHeight + "px";
        updateFooterHeight();
    }

    function updateFooterHeight() {
        /*const needed = footer.scrollHeight;
        footer.style.height = needed + "px";*/
    }

    let pressTimer = null;
    let isPressed = false;

    function startPress(e) {
        e.preventDefault();
        pressTimer = setTimeout(() => {
            isPressed = true;
            holdSpeakBtn.classList.add("pressed");
            holdSpeakBtn.textContent = "Release to submit";
            transcriptionDisplay.textContent = test_transcription;
            transcriptionDisplay.classList.add("visible");
            updateFooterHeight();
        }, 500);
    }

    function cancelPress() {
        clearTimeout(pressTimer);
        pressTimer = null;
    }

    function endPress() {
        clearTimeout(pressTimer);
        pressTimer = null;

        if (isPressed) {
            isPressed = false;
            holdSpeakBtn.classList.remove("pressed");
            holdSpeakBtn.textContent = "Hold to speak";
            transcriptionDisplay.classList.remove("visible");
            transcriptionDisplay.textContent = "";

            taskInput.value = test_transcription;
            submitBtn.classList.add("active");
            autoResizeTaskInput();
            inputRow.classList.remove("voice-mode");
            updateFooterHeight();
        }
    }

    holdSpeakBtn.addEventListener("mousedown", startPress);
    holdSpeakBtn.addEventListener("touchstart", startPress, { passive: false });
    holdSpeakBtn.addEventListener("mouseup", endPress);
    holdSpeakBtn.addEventListener("touchend", endPress);
    holdSpeakBtn.addEventListener("mouseleave", () => {
        cancelPress();
        if (isPressed) endPress({});
    });
    holdSpeakBtn.addEventListener("touchcancel", () => {
        cancelPress();
        if (isPressed) endPress({});
    });
    holdSpeakBtn.addEventListener("touchmove", cancelPress);
}
