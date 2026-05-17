import {TIME_BOXES} from "../../scripts/default_config";

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