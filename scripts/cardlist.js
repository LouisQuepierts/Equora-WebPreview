import { CACHE } from "./cache.js";

document.addEventListener("DOMContentLoaded", () =>
    setup(document.getElementById("list")))

export function setup(list) {
    const data = CACHE.getConfig();
    data.forEach(item => {
        const box = timebox(item.name, item.tasks);
        list.appendChild(box);
    })
}

function timebox(label, items) {
    const box           = document.createElement("div");
    box.classList.add("timebox", "card")

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
    div.classList       .add(item.status);

    const content       = document.createElement("div");
    content.className   = "task-content";
    content.addEventListener("click", () => {
        console.log(item)
        window.dispatchEvent(new CustomEvent("task-detail", { detail: item }))
    });

    const title         = document.createElement("span");
    title.className     = "task-title";
    title.textContent   = item.time ? item.time : "Anytime";
    content             .appendChild(title);

    const desc          = document.createElement("div");
    desc.className      = "task-desc";
    desc.textContent    = item.task;
    content             .appendChild(desc);

    const status        = document.createElement("div");
    status.className    = "status";
    // status.classList    .add(item.status);
    status.textContent  = item.status;
    content             .appendChild(status);
    div                 .appendChild(content);

    if (item.status !== "Done") {
        const done = document.createElement("button");
        done.className = "done-btn";
        done.textContent = "Done";

        done.addEventListener("click", (e) => {
            console.log(item)
            window.dispatchEvent(new CustomEvent("task-done", {detail: item}))
        })

        div.appendChild(done);
    }
    return              div;
}