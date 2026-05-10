import { TIME_BOXES } from "./default_config.js"

document.addEventListener("DOMContentLoaded", () => setup())

function setup() {
    const list      = document.getElementById("list");

    TIME_BOXES.forEach(item => {
        const box   = timebox(item.name, item.tasks);
        list        .appendChild(box);
    });
}

function timebox(label, items) {
    const box           = document.createElement("div");
    box.className       = "timebox";

    const title         = document.createElement("div");
    title.className     = "timebox-title";
    title.textContent   = label;

    box                 .appendChild(title);

    items.forEach(item => {
        box             .appendChild(task(item));
    });

    return              box;
}

function task(item) {
    const div           = document.createElement("div");
    div.className       = "task-item";

    const content       = document.createElement("div");
    content.className   = "task-content";

    const title         = document.createElement("div");
    title.className     = "task-title";
    title.textContent   = item.time ? item.time : "Anytime";
    content             .appendChild(title);

    const desc          = document.createElement("div");
    desc.className      = "task-desc";
    desc.textContent    = item.task;
    content             .appendChild(desc);

    const status        = document.createElement("div");
    status.className    = "task-status";
    status.classList    .add(item.status);
    status.textContent  = item.status;
    content             .appendChild(status);

    const done          = document.createElement("button");
    done.className      = "done-btn";
    done.textContent    = "Done";
    
    div                 .appendChild(content);
    div                 .appendChild(done);
    return              div;
}