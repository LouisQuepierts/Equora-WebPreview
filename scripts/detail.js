import { TIME_BOXES } from "./default_config.js"

document.addEventListener("DOMContentLoaded", () => setup())

function setup() {
    const taskId = new URLSearchParams(window.location.search).get("task");
    console.log(taskId)

    const taskData = findTask(taskId);
    const taskInfo = taskData.task;

    const task = document.getElementById("detail-task");
    const time = document.getElementById("detail-time");
    const status = document.getElementById("detail-status");

    task.textContent = taskInfo.task;
    time.textContent = taskData.time + (taskInfo.time ? " at " + taskInfo.time : "");
    status.textContent = taskInfo.status;
    status.classList.add(taskInfo.status);
}

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