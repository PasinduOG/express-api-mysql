const api_url = 'http://localhost:5000/api/tasks';
const taskDiv = document.getElementById('taskList');
const taskform = document.getElementById('todoForm');

taskform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('taskInput');
    const title = titleInput.value.trim();

    if (!title) return;

    const isEdit = taskform.dataset.editId;
    if (isEdit) {
        await updateTask(isEdit, title);
        taskform.removeAttribute('data-edit-id');
    } else {
        await addTask(title);
    }

    titleInput.value = "";
    loadTasks();
});

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

async function loadTasks() {
    try {
        const response = await fetch(api_url);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error("Task getting error:", error);
        alert('Please check if server is started');
    }
}

async function checkTask(id) {
    try {
        const response = await fetch(`${api_url}/${id}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task status');
        }
        
        // Reload tasks to reflect the changes
        loadTasks();
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to mark task as complete');
    }
}

async function addTask(title) {
    try {
        await fetch(api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
    } catch (error) {
        console.error('Task collecting error:', error);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${api_url}/${id}`, { method: "DELETE" });
        loadTasks();
    } catch (error) {
        console.error("Task deleting error:", error);
    }
}

function displayTasks(tasks) {
    taskDiv.innerHTML = "";

    tasks.forEach(task => {
        const taskEl = document.createElement('tr');

        taskEl.innerHTML = `
                            <td>${task.id}</td>
                            <td>${task.title}</td>
                            <td><span class="badge ${task.statusColor} ${task.textColor}">${task.status}</span></td>
                            <td>
                            <button class="btn btn-sm btn-success" onclick="checkTask(${task.id})" ${task.status === 'Completed' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                            </td>
                            `;
        
        taskDiv.appendChild(taskEl);
    });
}