
const TIME_ORDER = new Map(
    [
        ["Morning", 1],
        ["Afternoon", 2],
        ["Evening", 3],
        ["Tomorrow", 4]
    ]
)

export class Cache {
    constructor() {
        this.data = undefined;
        this.id2task = new Map();
    }

    saveConfig() {
        let json = JSON.stringify([...this.data]);
        console.log(json)
        localStorage.setItem('equora_tasks', json);
    }

    setupConfig(data) {
        this.data = data;
        this.saveConfig();
    }

    getConfig() {
        if (!this.data) {
            this.loadConfig();
        }
        return this.data;
    }

    insert(pZone, pTask) {
        let zone = this.data[pZone];
        if (!zone) {
            zone = {
                name: pZone,
                tasks: []
            }
            this.data.set(pZone, zone);
        }

        zone.tasks.push(pTask);

        // sort
        const sorted = [...this.data].sort(
            (a, b) => {
                return TIME_ORDER.get(a[0]) - TIME_ORDER.get(b[0]);
            }
        )

        console.log(sorted)

        this.data = new Map(sorted);
    }

    update(pTaskId, pTask) {
        let entry = this.id2task[pTaskId];
        if (entry) {
            entry.task.id = pTask.id;
            entry.task.task = pTask.task;
            entry.task.time = pTask.time;
            entry.task.status = pTask.status;
        }
    }

    updateStatus(pTaskId, pStatus) {
        let entry = this.id2task[pTaskId];
        if (entry) {
            entry.task.status = pStatus;
        }
    }

    remove(pTaskId) {
        let entry = this.id2task[pTaskId];
        if (entry) {
            let zone = this.data.get(entry.zone);
            console.log(entry.zone);

            if (zone) {
                zone.tasks = zone.tasks.filter(t => t.id !== entry.task.id);

                if (zone.tasks.length === 0) {
                    this.data.delete(zone.name);
                }
            }

            this.id2task.delete(pTaskId);
        }
    }

    find(pTaskId) {
        return this.id2task[pTaskId];
    }

    loadConfig() {
        const json = localStorage.getItem('equora_tasks');
        const obj = JSON.parse(json);
        this.data = new Map(obj);

        this.id2task.clear();
        this.data.forEach(entry => {
            entry.tasks.forEach(task => {
                this.id2task[task.id] = {
                    zone: entry.name,
                    task: task
                }
            })
        })


    }
}

export const CACHE = new Cache();