let lists = JSON.parse(localStorage.getItem('todoLists')) || [];
let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
let currentListId = localStorage.getItem('currentListId') || null;
let editingListId = null;
let editingTaskId = null;
let showCompleted = false;

const listsPanelEl = document.getElementById('lists-panel');
const tasksPanelEl = document.getElementById('tasks-panel');
const currentListTitleEl = document.getElementById('current-list-title');
const addListBtnEl = document.getElementById('add-list-btn');
const addTaskBtnEl = document.getElementById('add-task-btn');
const listModalEl = document.getElementById('list-modal');
const taskModalEl = document.getElementById('task-modal');
const closeListModalEl = document.getElementById('close-list-modal');
const closeTaskModalEl = document.getElementById('close-task-modal');
const listNameEl = document.getElementById('list-name');
const taskTitleEl = document.getElementById('task-title');
const taskDescriptionEl = document.getElementById('task-description');
const taskDateEl = document.getElementById('task-date');
const taskTimeEl = document.getElementById('task-time');
const taskListEl = document.getElementById('task-list');
const listModalTitleEl = document.getElementById('list-modal-title');
const taskModalTitleEl = document.getElementById('task-modal-title');
const saveListBtnEl = document.getElementById('save-list-btn');
const saveTaskBtnEl = document.getElementById('save-task-btn');
const cancelListBtnEl = document.getElementById('cancel-list-btn');
const cancelTaskBtnEl = document.getElementById('cancel-task-btn');
const showCompletedEl = document.getElementById('show-completed');

function init() {
    renderLists();
    renderTasks();

    addListBtnEl.addEventListener('click', openAddListModal);
    addTaskBtnEl.addEventListener('click', openAddTaskModal);
    closeListModalEl.addEventListener('click', closeListModal);
    closeTaskModalEl.addEventListener('click', closeTaskModal);
    saveListBtnEl.addEventListener('click', saveList);
    saveTaskBtnEl.addEventListener('click', saveTask);
    cancelListBtnEl.addEventListener('click', closeListModal);
    cancelTaskBtnEl.addEventListener('click', closeTaskModal);
    showCompletedEl.addEventListener('change', toggleShowCompleted);

    if (lists.length === 0) {
        createDefaultList();
    }
}

function createDefaultList() {
    const defaultList = {
        id: generateId(),
        name: 'My Tasks'
    };
    lists.push(defaultList);
    currentListId = defaultList.id;
    saveToLocalStorage();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function renderLists() {
    listsPanelEl.innerHTML = '';

    lists.forEach(list => {
        const listEl = document.createElement('div');
        listEl.className = `list-item ${list.id === currentListId ? 'active' : ''}`;
        listEl.setAttribute('data-id', list.id);
        listEl.innerHTML = `
            <div class="list-item-content">
                <span>${list.name}</span>
            </div>
        `;

        listEl.addEventListener('click', () => selectList(list.id));
        listEl.addEventListener('dblclick', () => openEditListModal(list.id));

        listsPanelEl.appendChild(listEl);
    });

    updateTaskListOptions();
}

function renderTasks() {
    tasksPanelEl.innerHTML = '';

    if (!currentListId) {
        tasksPanelEl.innerHTML = '<div class="no-tasks">Select a list to view tasks</div>';
        return;
    }

    const currentListTasks = tasks.filter(task =>
        task.listId === currentListId && (showCompleted || !task.completed)
    );

    if (currentListTasks.length === 0) {
        tasksPanelEl.innerHTML = '<div class="no-tasks">No tasks in this list</div>';
        return;
    }

    currentListTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    currentListTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskEl.setAttribute('data-id', task.id);

        let dueDate = '';
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            dueDate = `Due: ${date.toLocaleDateString()} ${task.dueTime || ''}`;
        }

        taskEl.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description || ''}</div>
                <div class="task-date">${dueDate}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn ${task.completed ? 'success' : ''}">${task.completed ? '✓' : 'Complete'}</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn danger">Delete</button>
            </div>
        `;

        tasksPanelEl.appendChild(taskEl);

        const completeBtn = taskEl.querySelector('.complete-btn');
        const editBtn = taskEl.querySelector('.edit-btn');
        const deleteBtn = taskEl.querySelector('.delete-btn');

        completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
        editBtn.addEventListener('click', () => openEditTaskModal(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    });

    const currentList = lists.find(list => list.id === currentListId);
    if (currentList) {
        currentListTitleEl.textContent = `${currentList.name} - Tasks`;
    }
}

function updateTaskListOptions() {
    taskListEl.innerHTML = '';

    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        taskListEl.appendChild(option);
    });

    if (currentListId) {
        taskListEl.value = currentListId;
    }
}

function selectList(listId) {
    currentListId = listId;
    localStorage.setItem('currentListId', listId);
    renderLists();
    renderTasks();
}

function toggleShowCompleted() {
    showCompleted = showCompletedEl.checked;
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveToLocalStorage();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveToLocalStorage();
    renderTasks();
}

function openAddListModal() {
    listModalTitleEl.textContent = 'Add New List';
    listNameEl.value = '';
    editingListId = null;
    listModalEl.style.display = 'flex';
}

function openEditListModal(listId) {
    const list = lists.find(list => list.id === listId);
    if (list) {
        listModalTitleEl.textContent = 'Edit List';
        listNameEl.value = list.name;
        editingListId = listId;
        listModalEl.style.display = 'flex';
    }
}

function closeListModal() {
    listModalEl.style.display = 'none';
}

function saveList() {
    const name = listNameEl.value.trim();
    if (!name) {
        alert('Please enter a list name');
        return;
    }

    if (editingListId) {
        const listIndex = lists.findIndex(list => list.id === editingListId);
        if (listIndex !== -1) {
            lists[listIndex].name = name;
        }
    } else {
        const newList = {
            id: generateId(),
            name: name
        };
        lists.push(newList);
        currentListId = newList.id;
    }

    saveToLocalStorage();
    renderLists();
    renderTasks();
    closeListModal();
}

function openAddTaskModal() {
    taskModalTitleEl.textContent = 'Add New Task';
    taskTitleEl.value = '';
    taskDescriptionEl.value = '';
    taskDateEl.value = '';
    taskTimeEl.value = '';

    if (currentListId) {
        taskListEl.value = currentListId;
    }

    editingTaskId = null;
    taskModalEl.style.display = 'flex';
}

function openEditTaskModal(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        taskModalTitleEl.textContent = 'Edit Task';
        taskTitleEl.value = task.title;
        taskDescriptionEl.value = task.description || '';
        taskDateEl.value = task.dueDate || '';
        taskTimeEl.value = task.dueTime || '';
        taskListEl.value = task.listId;

        editingTaskId = taskId;
        taskModalEl.style.display = 'flex';
    }
}

function closeTaskModal() {
    taskModalEl.style.display = 'none';
}

function saveTask() {
    const title = taskTitleEl.value.trim();
    const description = taskDescriptionEl.value.trim();
    const dueDate = taskDateEl.value;
    const dueTime = taskTimeEl.value;
    const listId = taskListEl.value;

    if (!title) {
        alert('Please enter a task title');
        return;
    }

    if (editingTaskId) {
        const taskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
            tasks[taskIndex].dueDate = dueDate;
            tasks[taskIndex].dueTime = dueTime;
            tasks[taskIndex].listId = listId;
        }
    } else {
        const newTask = {
            id: generateId(),
            title: title,
            description: description,
            dueDate: dueDate,
            dueTime: dueTime,
            listId: listId,
            completed: false
        };
        tasks.push(newTask);
    }

    if (listId !== currentListId) {
        currentListId = listId;
    }

    saveToLocalStorage();
    renderLists();
    renderTasks();
    closeTaskModal();
}

function saveToLocalStorage() {
    localStorage.setItem('todoLists', JSON.stringify(lists));
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
    localStorage.setItem('currentListId', currentListId);
}

init();
