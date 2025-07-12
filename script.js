let tasksByDate = {};
let currentSort = 'none';

const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dateInput = document.getElementById('dateInput');
const timeHours = document.getElementById('time-hours');
const timeMin = document.getElementById('time-min');
const am = document.getElementById('am');
const pm = document.getElementById('pm');
const addBtn = document.getElementById('addBtn');
const sortBtn = document.getElementById('sortBtn');
const sortOptions = document.getElementById('sortOptions');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const monthYear = document.getElementById('monthYear');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const taskTooltip = document.getElementById('taskTooltip');

// Set default input date
const today = new Date();
dateInput.value = formatDate(today);

// ===== LOCAL STORAGE FUNCTIONS =====
function saveTasks() {
    localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
}

function loadTasks() {
    const saved = localStorage.getItem('tasksByDate');
    if (saved) {
        tasksByDate = JSON.parse(saved);
        for (const date in tasksByDate) {
            tasksByDate[date].forEach(task => {
                if (typeof task.created === 'string') {
                    task.created = new Date(task.created);
                }
            });
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getLocalDateTime(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
}

function formatDateText(date, time) {
    const taskDate = getLocalDateTime(date, time);
    const now = new Date();
    const diffTime = taskDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
}

function truncateText(text, maxLength = 12) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// ===== TASK STRUCTURE =====
function Task(text, priority, date, time, ampm) {
    this.id = Date.now() + Math.random();
    this.text = text;
    this.priority = priority;
    this.date = date;
    this.time = time;
    this.created = new Date();
    this.ampm = ampm;
}

// ===== ADD TASK =====
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    let ampm;
    if (am.checked) ampm = 'AM';
    else if (pm.checked) ampm = 'PM';
    else return;

    let hour = parseInt(timeHours.value) || 12;
    const min = timeMin.value.padStart(2, '0') || '00';
    if (ampm === 'AM' && hour === 12) hour = 0;
    else if (ampm === 'PM' && hour !== 12) hour += 12;

    const formattedTime = `${hour.toString().padStart(2, '0')}:${min}`;
    const date = dateInput.value;

    const task = new Task(text, prioritySelect.value, date, formattedTime, ampm);

    if (!tasksByDate[date]) tasksByDate[date] = [];
    tasksByDate[date].push(task);

    taskInput.value = '';
    timeHours.value = '';
    timeMin.value = '';

    saveTasks();
    renderTasks();
    renderCalendar(currentDate);
}

// ===== DELETE TASK =====
function deleteTask(taskId) {
    for (const date in tasksByDate) {
        tasksByDate[date] = tasksByDate[date].filter(task => task.id !== taskId);
        if (tasksByDate[date].length === 0) delete tasksByDate[date];
    }
    saveTasks();
    renderTasks();
    renderCalendar(currentDate);
}

// ===== RENDER ALL TASKS =====
function renderTasks() {
    taskList.innerHTML = '';
    const allTasks = Object.values(tasksByDate).flat();

    if (allTasks.length === 0) {
        taskList.appendChild(emptyState);
        return;
    }

    allTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.priority}`;
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-text">${task.text}</div>
                <div class="task-priority ${task.priority}">${task.priority}</div>
            </div>
            <div class="task-details">
                <div class="task-deadline">
                    📅 ${formatDateText(task.date, task.time)} at ${task.time} ${task.ampm}
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// ===== UPDATED: RENDER CALENDAR WITH ALL TASKS =====
function renderCalendar(date) {
    calendarDays.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarDays.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const thisDate = new Date(year, month, day);
        const thisDateStr = formatDate(thisDate);

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'calendar-tasks';

        const tasksForDate = tasksByDate[thisDateStr] || [];
        if (tasksForDate.length > 0) {
            dayCell.classList.add('has-task');

            const sortedTasks = [...tasksForDate].sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });

            sortedTasks.forEach((task) => {
                const taskElement = document.createElement('div');
                taskElement.className = `calendar-task ${task.priority}`;
                taskElement.textContent = truncateText(task.text, 10);
                taskElement.title = `${task.text} (${task.time} ${task.ampm})`;

                taskElement.addEventListener('mouseenter', (e) => {
                    showTooltip(e, `${task.text} (${task.time} ${task.ampm})`);
                });
                taskElement.addEventListener('mouseleave', hideTooltip);

                tasksContainer.appendChild(taskElement);
            });
        }

        dayCell.appendChild(tasksContainer);

        if (thisDateStr === formatDate(new Date())) {
            dayCell.classList.add('selected');
        }

        calendarDays.appendChild(dayCell);
    }
}

// ===== TOOLTIP FUNCTIONS =====
function showTooltip(event, text) {
    taskTooltip.textContent = text;
    taskTooltip.style.left = event.pageX + 10 + 'px';
    taskTooltip.style.top = event.pageY - 10 + 'px';
    taskTooltip.classList.add('show');
}

function hideTooltip() {
    taskTooltip.classList.remove('show');
}

// ===== SORT TASKS =====
function sortTasks(sortType) {
    currentSort = sortType;
    const allTasks = Object.values(tasksByDate).flat();

    switch (sortType) {
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            allTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'deadline':
            allTasks.sort((a, b) =>
                getLocalDateTime(a.date, a.time) - getLocalDateTime(b.date, b.time)
            );
            break;
        case 'alphabetical':
            allTasks.sort((a, b) => a.text.localeCompare(b.text));
            break;
        default:
            allTasks.sort((a, b) => a.created - b.created);
    }

    tasksByDate = {};
    allTasks.forEach(task => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
    });

    saveTasks();
    renderTasks();
    renderCalendar(currentDate);
}

// ===== EVENT LISTENERS =====
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
});

sortBtn.addEventListener('click', () => {
    sortOptions.classList.toggle('active');
});

document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        sortTasks(option.dataset.sort);
        sortOptions.classList.remove('active');
    });
});

document.addEventListener('click', e => {
    if (!sortBtn.contains(e.target) && !sortOptions.contains(e.target)) {
        sortOptions.classList.remove('active');
    }
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

// ===== INITIALIZE APP =====
let currentDate = new Date();
loadTasks();
renderCalendar(currentDate);
renderTasks();
