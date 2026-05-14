const TEMPLATES = {
    cleanup: [
        /(?:I|i|we|you)\s+(?:need|have|must|should|got|gotta|gonna|has)\s+to\s+/g,
        /(?:need|have|must|should|got|gotta|gonna|has)\s+to\s+/gi,
    ],

    // Split points that definitely separate distinct tasks
    strongSeparators: /,?\s*(?:and\s+also|also\s+|remember\s+to\s+|don't\s+forget\s+to\s+)\s*/gi,

    // Split on "and" only when followed by an action verb
    weakSeparator: /\s+and\s+(?=(?:buy|get|pick\s*up|go\s+to|do|start|finish|complete|work\s+on|call|send|check|clean|fix|make|cook|prepare|water|read|write|submit|attend|pay|drop|grab|fetch|take|bring|put|run|walk|drive|visit|order|book|schedule|set\s+up|fill|sign|turn\s+in|hand\s+in)\b)/gi,

    // Time keywords → slot. Checked in order; first match wins.
    timeSlots: [
        { keys: ['tomorrow morning', 'tomorrow'], slot: 'Tomorrow Morning' },
        { keys: ['morning', 'breakfast', 'a.m.', 'am'], slot: 'Morning' },
        { keys: ['afternoon', 'noon', 'lunch', 'p.m.', 'pm'], slot: 'Afternoon' },
        { keys: ['evening', 'tonight', 'dinner', 'night'], slot: 'Evening' },
    ],

    // Remove from task name after time detection
    timePhrases: [
        /\bthis\s+(morning|afternoon|evening)\b/gi,
        /\b(tomorrow\s+(morning|afternoon|evening)|tomorrow)\b/gi,
        /\b(tonight)\b/gi,
        /\b(at|in)\s+the\s+(morning|afternoon|evening|night)\b/gi,
        /,?\s*(this\s+)?(morning|afternoon|evening|tonight)\s*,?/gi,
    ],
};

function detectTimeSlot(text) {
    const lower = text.toLowerCase();
    for (const { keys, slot } of TEMPLATES.timeSlots) {
        for (const key of keys) {
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (regex.test(lower)) {
                return slot;
            }
        }
    }
    return 'Afternoon';
}

function parseTasks(input) {
    if (!input || !input.trim()) return [];

    let text = input;

    TEMPLATES.cleanup.forEach(p => { text = text.replace(p, ''); });

    let fragments = text.split(TEMPLATES.strongSeparators).filter(Boolean);
    fragments = fragments.flatMap(f => f.split(TEMPLATES.weakSeparator)).filter(Boolean);

    return fragments.map(fragment => {
        let name = fragment.trim();
        const timeSlot = detectTimeSlot(name);

        TEMPLATES.timePhrases.forEach(p => { name = name.replace(p, ''); });

        name = name.replace(/^[,\s]+|[,\s]+$/g, '').trim();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        return { name, timeSlot };
    }).filter(t => t.name.length > 0);
}

function createTaskElement(name, timeSlot) {
    const item = document.createElement('div');
    item.className = 'task-item';

    const column = document.createElement('div');
    column.className = 'column';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-name-input';
    input.value = name;

    const select = document.createElement('select');
    select.className = 'time-select';
    ['Morning', 'Afternoon', 'Evening', 'Tomorrow Morning'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === timeSlot) option.selected = true;
        select.appendChild(option);
    });

    column.appendChild(input);
    column.appendChild(select);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => item.remove());

    item.appendChild(column);
    item.appendChild(deleteBtn);
    return item;
}

function renderTasks(tasks) {
    const container = document.getElementById('tasks');
    container.innerHTML = '';
    tasks.forEach(task => {
        container.appendChild(createTaskElement(task.name, task.timeSlot));
    });
}

function collectTasks() {
    const items = document.querySelectorAll('#tasks .task-item');
    return Array.from(items).map(item => ({
        name: item.querySelector('.task-name-input').value.trim(),
        timeSlot: item.querySelector('.time-select').value,
    })).filter(t => t.name);
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const input = params.get('input') || '';

    document.getElementById('inputDisplay').textContent = input;

    const tasks = parseTasks(input);
    renderTasks(tasks);

    document.getElementById('btn-return').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.querySelector('.action-done').addEventListener('click', () => {
        const tasks = collectTasks();
        if (tasks.length === 0) return;

        const existing = JSON.parse(localStorage.getItem('equora_tasks') || '[]');
        localStorage.setItem('equora_tasks', JSON.stringify([...existing, ...tasks]));
        window.location.href = 'index.html';
    });

    document.querySelector('.action-delete').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
