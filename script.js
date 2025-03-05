// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.todo-container').classList.toggle('dark-mode');
}

// Function to add a task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const categorySelect = document.getElementById('categorySelect');
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const category = categorySelect.value;

    if (taskText === '') {
        alert('Please enter a task.');
        return;
    }

    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.innerHTML = `${taskText} [${category}] <br> Due: ${new Date(dueDate).toLocaleString()}`;
    li.classList.add(priority);
    li.setAttribute('data-category', category);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.onclick = function () {
        editTask(li, taskText, priority, dueDate, category);
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('remove-btn');
    removeBtn.onclick = function () {
        taskList.removeChild(li);
        updateProgress(); // Update the progress bar when a task is removed
    };

    li.appendChild(editBtn);
    li.appendChild(removeBtn);
    li.onclick = function () {
        li.classList.toggle('completed');
        updateProgress(); // Update the progress bar when a task is marked as completed
    };

    taskList.appendChild(li);
    taskInput.value = '';
    dueDateInput.value = '';

    updateProgress(); // Update the progress bar when a new task is added

    const timeUntilDue = new Date(dueDate).getTime() - new Date().getTime();
    if (timeUntilDue > 0) {
        setTimeout(function () {
            alert(`Reminder: Task "${taskText}" is due!`);
        }, timeUntilDue);
    }
}

// Function to edit a task
function editTask(li, taskText, priority, dueDate, category) {
    const newTaskText = prompt('Edit task:', taskText);
    if (newTaskText !== null && newTaskText.trim() !== '') {
        li.innerHTML = `${newTaskText} [${category}] <br> Due: ${new Date(dueDate).toLocaleString()}`;
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = function () {
            editTask(li, newTaskText, priority, dueDate, category);
        };
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-btn');
        removeBtn.onclick = function () {
            li.remove();
            updateProgress(); // Update the progress bar when a task is removed
        };
        li.appendChild(editBtn);
        li.appendChild(removeBtn);
        li.classList.add(priority);
    }
    updateProgress(); // Update the progress bar when a task is edited
}

// Function to update progress bar
function updateProgress() {
    const taskList = document.getElementById('taskList');
    const tasks = taskList.querySelectorAll('li'); // All tasks
    const completedTasks = taskList.querySelectorAll('li.completed').length; // Completed tasks

    // Calculate progress percentage
    const progressPercent = tasks.length ? (completedTasks / tasks.length) * 100 : 0;

    // Update the progress bar and percentage text
    const progressBar = document.getElementById('progressBar');
    const progressPercentText = document.getElementById('progressPercent');
    progressBar.value = progressPercent;
    progressPercentText.textContent = `${Math.round(progressPercent)}%`;
}

// Initialize IndexedDB
let db;
const request = indexedDB.open('todoListDB', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('taskText', 'taskText', { unique: false });
    objectStore.createIndex('priority', 'priority', { unique: false });
    objectStore.createIndex('dueDate', 'dueDate', { unique: false });
    objectStore.createIndex('category', 'category', { unique: false });
    objectStore.createIndex('completed', 'completed', { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadTasks();
};

request.onerror = function (event) {
    console.error('Database error:', event.target.errorCode);
};

// Function to add a task to the database
function addTaskToDB(task) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    objectStore.add(task);
}

// Function to load tasks from the database
function loadTasks() {
    const transaction = db.transaction(['tasks'], 'readonly');
    const objectStore = transaction.objectStore('tasks');
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const tasks = event.target.result;
        tasks.forEach(task => {
            displayTask(task);
        });
        updateProgress(); // Update the progress bar after loading tasks
    };
}

// Function to display a task
function displayTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    li.innerHTML = `${task.taskText} [${task.category}] <br> Due: ${new Date(task.dueDate).toLocaleString()}`;
    li.classList.add(task.priority);
    li.setAttribute('data-category', task.category);
    if (task.completed) {
        li.classList.add('completed');
    }

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('edit-btn');
    editBtn.onclick = function () {
                editTask(li, task.taskText, task.priority, task.dueDate, task.category);
            };
       
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-btn');
            removeBtn.onclick = function () {
                taskList.removeChild(li);
                updateProgress(); // Update the progress bar when a task is removed
            };
       
            li.appendChild(editBtn);
            li.appendChild(removeBtn);
            li.onclick = function () {
                li.classList.toggle('completed');
                updateProgress(); // Update the progress bar when a task is marked as completed
            };
       
            taskList.appendChild(li);
        }
        client.connect(err => {
            if (err) {
                console.error('Failed to connect to MongoDB', err);
                return;
            }
            console.log('Connected to MongoDB');
            const db = client.db('todoListDB');
            toDoCollection = db.collection('tasks');
            loadTasksFromMongoDB();
        });
       
        // Function to add a task to MongoDB
        function addTaskToMongoDB(task) {
            toDoCollection.insertOne(task, (err, result) => {
                if (err) {
                    console.error('Failed to add task to MongoDB', err);
                    return;
                }
                console.log('Task added to MongoDB', result);
            });
        }
       
        // Function to load tasks from MongoDB
        function loadTasksFromMongoDB() {
            toDoCollection.find().toArray((err, tasks) => {
                if (err) {
                    console.error('Failed to load tasks from MongoDB', err);
                    return;
                }
                tasks.forEach(task => {
                    displayTask(task);
                });
                updateProgress(); // Update the progress bar after loading tasks
            });
        }
       
        // Function to save tasks to the database
        function saveTask(task) {
            addTaskToDB(task);
            addTaskToMongoDB(task);
        }

        // Modify addTask function to save task to the database
        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const prioritySelect = document.getElementById('prioritySelect');
            const dueDateInput = document.getElementById('dueDateInput');
            const categorySelect = document.getElementById('categorySelect');
            const taskText = taskInput.value.trim();
            const priority = prioritySelect.value;
            const dueDate = dueDateInput.value;
            const category = categorySelect.value;

            if (taskText === '') {
                alert('Please enter a task.');
                return;
            }

            const task = {
                taskText,
                priority,
                dueDate,
                category,
                completed: false
            };

            displayTask(task);
            saveTask(task);

            taskInput.value = '';
            dueDateInput.value = '';

            updateProgress(); // Update the progress bar when a new task is added

            const timeUntilDue = new Date(dueDate).getTime() - new Date().getTime();
            if (timeUntilDue > 0) {
                setTimeout(function () {
                    alert(`Reminder: Task "${taskText}" is due!`);
                }, timeUntilDue);
            }
        }

    // Function to delete a task from the database
    function deleteTaskFromDB(taskId) {
        const transaction = db.transaction(['tasks'], 'readwrite');
        const objectStore = transaction.objectStore('tasks');
        objectStore.delete(taskId);
    }

    // Function to delete a task from MongoDB
    function deleteTaskFromMongoDB(taskId) {
        toDoCollection.deleteOne({ _id: taskId }, (err, result) => {
            if (err) {
                console.error('Failed to delete task from MongoDB', err);
                return;
            }
            console.log('Task deleted from MongoDB', result);
        });
    }

    // Modify remove button onclick function to delete task from the database
    function displayTask(task) {
        const taskList = document.getElementById('taskList');
        const li = document.createElement('li');
        li.innerHTML = `${task.taskText} [${task.category}] <br> Due: ${new Date(task.dueDate).toLocaleString()}`;
        li.classList.add(task.priority);
        li.setAttribute('data-category', task.category);
        if (task.completed) {
            li.classList.add('completed');
        }

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = function () {
            editTask(li, task.taskText, task.priority, task.dueDate, task.category);
        };

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.classList.add('remove-btn');
        removeBtn.onclick = function () {
            taskList.removeChild(li);
            deleteTaskFromDB(task.id);
            deleteTaskFromMongoDB(task._id);
            updateProgress(); // Update the progress bar when a task is removed
        };

        li.appendChild(editBtn);
        li.appendChild(removeBtn);
        li.onclick = function () {
            li.classList.toggle('completed');
            updateProgress(); // Update the progress bar when a task is marked as completed
        };

        taskList.appendChild(li);
    }

