const plusArea = document.getElementById('plusArea');
const footer = document.getElementById('footer');
const dragBar = document.querySelector('.drag-bar');
const inputRow = document.getElementById('inputRow');
const micBtn = document.getElementById('micBtn');
const keyboardBtn = document.getElementById('keyboardBtn');
const taskInput = document.getElementById('taskInput');
const submitBtn = document.getElementById('submitBtn');
const holdSpeakBtn = document.getElementById('holdSpeakBtn');
const transcriptionDisplay = document.getElementById('transcriptionDisplay');

// ---------- test transcription ----------
const test_transcription = "I has to go to gym this afternoon, and start my Programming 1 assigment tonight.";

// ---------- Footer open / close ----------
plusArea.addEventListener('click', () => {
    footer.classList.add('open');
    updateFooterHeight();
});

dragBar.addEventListener('click', () => {
    footer.classList.remove('open');
});

// ---------- Mic <-> Keyboard toggle ----------
micBtn.addEventListener('click', () => {
    inputRow.classList.add('voice-mode');
    updateFooterHeight();
});

keyboardBtn.addEventListener('click', () => {
    inputRow.classList.remove('voice-mode');
    updateFooterHeight();
});

// ---------- Submit button active state ----------
taskInput.addEventListener('input', () => {
    if (taskInput.value.trim()) {
        submitBtn.classList.add('active');
    } else {
        submitBtn.classList.remove('active');
    }
    autoResizeTaskInput();
});

// ---------- Task input auto-resize ----------
const MAX_LINES = 4;
const LINE_HEIGHT = 1.4;
const FONT_SIZE = 15;
const PADDING_V = 10;

function autoResizeTaskInput() {
    taskInput.style.height = 'auto';
    const lineHeightPx = FONT_SIZE * LINE_HEIGHT;
    const maxHeight = lineHeightPx * MAX_LINES + PADDING_V * 2;
    const newHeight = Math.min(taskInput.scrollHeight, maxHeight);
    taskInput.style.height = newHeight + 'px';
    updateFooterHeight();
}

// ---------- Footer height ----------
function updateFooterHeight() {
    if (!footer.classList.contains('open')) return;

    const expanded = footer.querySelector('.footer-expanded');
    const needed = expanded.scrollHeight + 24; // 24px padding-top
    footer.style.height = needed + 'px';
}

// ---------- Hold to speak ----------
let pressTimer = null;
let isPressed = false;

function startPress(e) {
    e.preventDefault();
    pressTimer = setTimeout(() => {
        isPressed = true;
        holdSpeakBtn.classList.add('pressed');
        holdSpeakBtn.textContent = 'Release to submit';
        transcriptionDisplay.textContent = test_transcription;
        transcriptionDisplay.classList.add('visible');
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
        holdSpeakBtn.classList.remove('pressed');
        holdSpeakBtn.textContent = 'Hold to speak';
        transcriptionDisplay.classList.remove('visible');
        transcriptionDisplay.textContent = '';

        // Put transcription into task input
        taskInput.value = test_transcription;
        submitBtn.classList.add('active');
        autoResizeTaskInput();

        // Switch back to keyboard mode
        inputRow.classList.remove('voice-mode');
        updateFooterHeight();
    }
}

holdSpeakBtn.addEventListener('mousedown', startPress);
holdSpeakBtn.addEventListener('touchstart', startPress, { passive: false });

holdSpeakBtn.addEventListener('mouseup', endPress);
holdSpeakBtn.addEventListener('touchend', endPress);

holdSpeakBtn.addEventListener('mouseleave', () => {
    cancelPress();
    if (isPressed) endPress({});
});

holdSpeakBtn.addEventListener('touchcancel', () => {
    cancelPress();
    if (isPressed) endPress({});
});

submitBtn.addEventListener('click', () => {
    if (!submitBtn.classList.contains('active')) {
        return;
    }
    // goto create page with inputs
    const path = window.location.pathname;
    const url = path.substring(0, path.lastIndexOf('/')) + "/create.html?input=" + taskInput.value;
    window.location.href = url;
})

holdSpeakBtn.addEventListener('touchmove', cancelPress);


console.log("init")
window.addEventListener('task-detail', (e) => {
    console.log(e)
    window.location.href = "detail.html?task=" + e.detail.id;
})

window.addEventListener('task-done', (e) => {
    console.log(e)
    window.location.href = "done.html?task=" + e.detail.id;
});