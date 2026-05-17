import {CACHE} from "../../scripts/cache.js";

let TIME_BOXES = CACHE.getConfig();
document.addEventListener("DOMContentLoaded", () => setup())

let TASK = undefined;

function setup() {
    const taskId = new URLSearchParams(window.location.search).get("task");

    const taskData = CACHE.find(taskId);
    const taskInfo = taskData.task;

    TASK = taskInfo;

    const task = document.getElementById("detail-task");
    const time = document.getElementById("detail-time");
    const status = document.getElementById("detail-status");

    task.textContent = taskInfo.task;
    time.textContent = taskData.time + (taskInfo.time ? " at " + taskInfo.time : "");
    status.textContent = taskInfo.status;
    status.classList.add(taskInfo.status);

    setupButtons();
}

function setupButtons() {
    const path = window.location.pathname;
    const base = path.substring(0, path.lastIndexOf('/'));

    // Mark as Done
    document.getElementById("btn-done").addEventListener("click", () => {
        CACHE.updateStatus(TASK.id, "Done");
        CACHE.saveConfig();
        window.location.href = base + "/done.html";
    });

    // Delay pop-up
    const popupDelay = document.getElementById("popup-delay");
    document.getElementById("btn-delay").addEventListener("click", () => {
        popupDelay.classList.add("active");
    });
    document.getElementById("btn-cancel-delay").addEventListener("click", () => {
        popupDelay.classList.remove("active");
    });
    document.getElementById("delay-options").addEventListener("click", (e) => {
        const option = e.target.closest(".delay-option");
        if (!option) return;

        CACHE.updateStatus(TASK.id, "Delayed");
        CACHE.saveConfig();

        popupDelay.classList.remove("active");
        document.getElementById("detail-status").textContent = "Delayed";
        document.getElementById("detail-status").className = "task-status Delayed";

        window.location.href = base + "/index.html";
    });
    popupDelay.addEventListener("click", (e) => {
        if (e.target === popupDelay) popupDelay.classList.remove("active");
    });

    // Delete confirmation pop-up
    const popupDelete = document.getElementById("popup-delete");
    document.getElementById("btn-delete").addEventListener("click", () => {
        popupDelete.classList.add("active");
    });
    document.getElementById("btn-cancel-delete").addEventListener("click", () => {
        popupDelete.classList.remove("active");
    });
    document.getElementById("btn-confirm-delete").addEventListener("click", () => {
        CACHE.remove(TASK.id);
        CACHE.saveConfig();
        window.location.href = base + "/index.html";
    });
    popupDelete.addEventListener("click", (e) => {
        if (e.target === popupDelete) popupDelete.classList.remove("active");
    });

    if (TASK.status === "Done") {
        document.getElementById("btn-done").style.display = "none";
        document.getElementById("btn-delay").style.display = "none";
    }
}


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
