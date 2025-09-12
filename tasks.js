let currentTasks = []; // Store the current tasks
let taskToDeleteIndex = null; // Store the index of the task to delete
let originalAfspraakdatum;

// Function to fetch and display tasks
function fetchTasks() {
    fetch(`get_taken.php?t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            currentTasks = data.Taken; // Store the fetched tasks
            displayTasks(currentTasks); // Display the fetched tasks
            
            // Check for due tasks after data is loaded
            if (typeof checkAllDueItems === 'function') {
                checkAllDueItems();
            }
        })
        .catch(error => {
            console.error('Error fetching from PHP:', error);
            // Show empty state message when get_taken.php fails
            const tableBody = document.getElementById('taken-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ccc;">No tasks found. Add a new task to get started.</td></tr>';
            }
        });
}

let editTaskIndex = null; // Global variable to store the index of the task being edited

// In tasks.js
// Function to toggle task status
function toggleTaskStatus(index) {
    if (index < 0 || index >= currentTasks.length) {
        console.error(`Invalid index: ${index}`);
        return;
    }

    const task = currentTasks[index];
    const statusOrder = ["Nieuw", "Wacht", "Klaar"]; // Define the order of statuses
    const currentStatusIndex = statusOrder.indexOf(task.Status);
    const nextStatusIndex = (currentStatusIndex + 1) % statusOrder.length; // Cycle to the next status
    task.Status = statusOrder[nextStatusIndex]; // Update the status

    // Update the button's data-status attribute and text
    const toggleButton = document.querySelector(`.status-toggle[data-index="${index}"]`);
    if (toggleButton) {
        toggleButton.textContent = task.Status; // Update the button text
        toggleButton.setAttribute("data-status", task.Status); // Update the data-status attribute
    }

    // Update the task-status input field
    const taskStatusInput = document.getElementById('task-status');
    if (taskStatusInput) {
        taskStatusInput.value = task.Status; // Update the task-status input field
    }

    updateTasks(); // Send the updated data to the server
    displayTasks(currentTasks); // Refresh the displayed tasks
}
function editTask(index) {
    const task = currentTasks[index]; // Get the current task based on the index

    // Check if the task is defined
    if (!task) {
        console.error(`No task found at index ${index}`);
        return; // Exit if no task is found
    }

    // Populate the input fields with the current values
    document.getElementById('edit-task-id').value = task.id; // Populate task name
    console.log('ID set to:', task.id); // Log the ID being set

    document.getElementById('edit-task-name').value = task.Taaknaam; // Populate task name
    console.log('Taaknaam set to:', task.Taaknaam); // Log the ID being set

    document.getElementById('edit-appointment-date').value = task.Afspraakdatum; // Populate appointment date
    document.getElementById('edit-task-status').value = task.Status; // Populate status
    document.getElementById('edit-task-info').value = task.Info; // Populate status

    // Show the modal for editing
    document.getElementById('edit-task-modal').style.display = 'block';

    // Save the index for later use
    editTaskIndex = index; // Store the index for later use
}

// Event listener for saving the edited task
document.getElementById('save-edited-task-button').addEventListener('click', () => {
    const taskNameInput = document.getElementById('edit-task-name');
    const appointmentDateInput = document.getElementById('edit-appointment-date');
    const taskStatusInput = document.getElementById('edit-task-status');
    const taskInfoInput = document.getElementById('edit-task-info');

    if (taskNameInput && appointmentDateInput && taskStatusInput) {
        // Update the currentTasks array with the new values
        currentTasks[editTaskIndex].Taaknaam = taskNameInput.value; // Update task name
        currentTasks[editTaskIndex].Afspraakdatum = appointmentDateInput.value; // Update appointment date
        currentTasks[editTaskIndex].Status = taskStatusInput.value; // Update status
        currentTasks[editTaskIndex].Info = taskInfoInput.value; // Update info

        // Call the function to update the tasks on the server
        const changedTaskId = currentTasks[editTaskIndex].id;
        const updatedTasks = {
            changedTaskId: changedTaskId,
            tasks: [
                {
                    id: currentTasks[editTaskIndex].id,
                    Taaknaam: currentTasks[editTaskIndex].Taaknaam,
                    Afspraakdatum: currentTasks[editTaskIndex].Afspraakdatum,
                    Status: currentTasks[editTaskIndex].Status,
                    Info: currentTasks[editTaskIndex].Info
                }
            ]
        };

        fetch('update_taken.php', {
            method: 'POST',
            body: JSON.stringify(updatedTasks),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update tasks');
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            console.log('Tasks updated successfully:', data);
            // Optionally, refresh the displayed tasks or handle the response
        })
        .catch(error => {
            console.error('Error updating tasks:', error);
        });
    } else {
        console.error("One or more input elements are not found.");
    }
    updateTasks(); // Send the updated data to the server
    displayTasks(currentTasks); // Refresh
});

// Helper function to get the current week
function getThisWeek(date) {
    const firstDayOfWeek = date.getDate() - date.getDay();
    const lastDayOfWeek = firstDayOfWeek + 6;
    const thisWeek = [];
    for (let i = firstDayOfWeek; i <= lastDayOfWeek; i++) {
        const day = new Date(date);
        day.setDate(i);
        thisWeek.push(day);
    }
    return thisWeek;
}

// Helper function to check if a date is in a given week
function isDateInWeek(date, week) {
    return week.some(day => {
        return date.toDateString() === day.toDateString();
    });
}

function displayTasks(tasks) {
    const today = new Date();
    const thisWeek = getThisWeek(today);

    // Sort tasks by due date, prioritizing tasks due this week
    tasks.sort((a, b) => {
        const dueDateA = new Date(a.Afspraakdatum);
        const dueDateB = new Date(b.Afspraakdatum);
        const isDueThisWeekA = isDateInWeek(dueDateA, thisWeek);
        const isDueThisWeekB = isDateInWeek(dueDateB, thisWeek);

        if (isDueThisWeekA && !isDueThisWeekB) {
            return -1;
        } else if (!isDueThisWeekA && isDueThisWeekB) {
            return 1;
        } else {
            return dueDateA - dueDateB;
        }
    });
    
    const tableBody = document.getElementById('taken-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    // Show all tasks instead of filtering by date
    const iconMapping = {
        "Dubbele voucher": "fas fa-ticket-alt", // Example task type
        "GGD Mohamed": "fas fa-user-md", // Example task type
        "Neuroloog Musa": "fas fa-brain", // Example task type
        "Brandstofkosten": "fas fa-gas-pump", // Example task type
        "Revolut": "fas fa-credit-card", // Example task type
        "Koran lessen inschrijven": "fas fa-book", // Example task type
        "Voetbal": "fas fa-futbol", // Example task type
        // Add more mappings as needed
    };

    tasks.forEach((item, index) => {
        // Show all tasks without date filtering
            const row = document.createElement('tr');

            const taskName = item.Taaknaam;
            const taskStatus = item.Status;
            const taskDate = item.Afspraakdatum;

            const afspraakdatum = new Date(item.Afspraakdatum);
            const isToday = afspraakdatum.toDateString() === today.toDateString();
            const isExpired = afspraakdatum < today;

            let taskNameElement;
            if (taskStatus === 'Klaar') {
                taskNameElement = document.createElement('span');
                taskNameElement.style.textDecoration = 'line-through';
                taskNameElement.textContent = taskName;
            } else {
                taskNameElement = document.createElement('span');
                taskNameElement.textContent = taskName;
            }

            row.innerHTML = `
                <td>
                    <div class="action-buttons">
                        <button class="status-toggle" data-index="${index}" data-status="${item.Status}" onclick="toggleTaskStatus(${index})">
                            ${item.Status}
                        </button>
                        <button onclick="editTask(${index})">E</button>
                        <button onclick="showDeleteTaskModal(${index})">X</button>
                    </div>
                </td>
                <td><i class="${iconMapping[item.Taaknaam] || "fas fa-question-circle"}"></i> <strong>${taskNameElement.outerHTML}</strong><br>
                    ${item.Info !== '' ? '<textarea style="width: 100%; height: 30px; font-size: 10px; background-color: #140404; border-color: transparent; color: white;" readonly>' + item.Info + '</textarea>' : ''}
                </td>
                <td><input type="date" value="${item.Afspraakdatum}" data-index="${index}" class="task-date" style="color: ${isToday ? 'orange' : isExpired ? 'red' : 'white'};"></td>
            `;

            if (isToday) {
                const afspraakdatumInput = row.querySelector('input.task-date');
                afspraakdatumInput.classList.add('task-due-today');
            }

            tableBody.appendChild(row);
    });
    
    // Add message if no tasks found
    if (tasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" style="text-align: center; color: #888;">No tasks found. Add a new task to get started.</td>';
        tableBody.appendChild(row);
    }
}

// Function to export taken to taken.json
const exportButton = document.getElementById('export-taken-button-data');
if (exportButton) {
    exportButton.addEventListener('click', () => {
    const takenData = currentTasks.map(item => ({
        Taaknaam: item.Taaknaam,
        Afspraakdatum: item.Afspraakdatum,
        Status: item.Status,
        info: item.Info
    }));

    fetch('export_taken.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(takenData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to export taken');
        }
        return response.json();
    })
    .then(data => {
        console.log('Taken exported successfully:', data);
        alert('Taken exported to taken.json successfully!');
    })
    .catch(error => {
        console.error('Error exporting taken:', error);
    });
    });
}

// Function to update the task status

// Function to update tasks
function updateTasks() {
    console.log("Update Tasks function called"); // Debugging line

    // Prepare the updated data for both types
    const updatedTasks = currentTasks.map((item, index) => {
        return {
            id: item.id, // Ensure you have the ID of the task
            Taaknaam: item.Taaknaam,
            Afspraakdatum: item.Afspraakdatum,
            Status: item.Status,
            Info: item.Info
        };
    });

    // Send the updated data back to the server
    fetch('update_taken.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTasks) // Send the updated tasks as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update tasks');
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        console.log ('Tasks updated successfully:', data);
        // Optionally, refresh the displayed tasks or handle the response
    })
    .catch(error => {
        console.error('Error updating tasks:', error);
    });
}

function addTask() {
    console.log('addTask function called'); // Log the function call

    const taskName = document.getElementById('task-name').value;
    console.log('taskName:', taskName); // Log the taskName value
    const appointmentDateInput = document.getElementById('task-date');
    const appointmentDate = appointmentDateInput.value ? appointmentDateInput.value : new Date().toISOString().split('T')[0];
    console.log('Afspraakdatum:', appointmentDate); // Log the appointmentDate value
    const status = document.getElementById('task-status').value;
    console.log('status:', status); // Log the status value
    const info = document.getElementById('task-info').value;
    console.log('info:', info); // Log the info value

    // Validate input
    if (!taskName) {
        alert("Niet vergeten een taaknaam op te geven");
        return;
    }
    if (appointmentDate === '') {
        alert('Warning: No date has been selected. The current date will be used.');
        appointmentDate = new Date().toISOString().split('T')[0];
        console.log('Afspraakdatum set to current date:', appointmentDate);
    }

    const newTask = {
        Taaknaam: taskName, // Ensure the key matches what the PHP script expects
        Afspraakdatum: appointmentDate,
        Status: status,
        Info: info
    };

    console.log('newTask:', newTask); // Log the newTask object

    // Send the new task to the server
    fetch('new_taken.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask) // Send the new task as JSON
    })
    .then(response => {
        console.log('response:', response); // Log the response
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        return response.json();
    })
    .then(data => {
        console.log('data:', data); // Log the data
        console.log('Task created successfully:', data);
        
        // Add the new task with the ID from the server response
        if (data.Taken && data.Taken.id) {
            // Add the server-generated ID to the task
            newTask.id = data.Taken.id;
            currentTasks.push(newTask); // Add the new task to the current tasks
            displayTasks(currentTasks); // Refresh the displayed tasks
        } else {
            // If we didn't get a proper response, refresh the tasks from server
            fetchTasks();
        }
        
        closeAddTaskModal(); // Close the modal
        clearTaskInputs(); // Clear the input fields
    })
    .catch(error => {
        console.error('Error creating task:', error);
        closeAddTaskModal(); // Close the modal
    });
}
function showAddTaskModal() {
    console.log('showAddTaskModal function called');
    document.getElementById('add-task-modal').style.display = 'block';
}

function closeAddTaskModal() {
    console.log('closeAddTaskModal called');
    document.getElementById('add-task-modal').style.display = 'none';
}

// Event listener for the add task button (primary handler)
document.getElementById('add-task-button').addEventListener('click', function() {
    showAddTaskModal();
});  
  

// Function to clear task inputs
function clearTaskInputs() {
    document.getElementById('edit-task-name').value = '';
    document.getElementById('edit-appointment-date').value = '';
    document.getElementById('edit-task-status').value = 'Open'; // Reset to default
    document.getElementById('edit-task-info').value = ''; // Reset to default
}


// Function to show delete task modal
function showDeleteTaskModal(index) {
    taskToDeleteIndex = index;
    const taskName = currentTasks[index].Taaknaam; // Get the task name
    document.getElementById('delete-task-name').innerText = taskName;
    document.getElementById('delete-task-modal').style.display = 'block';
}

// Function to confirm delete task
document.getElementById('confirm-delete-task-button').addEventListener('click', () => {
    if (taskToDeleteIndex !== null) {
        deleteTask(taskToDeleteIndex);
        closeDeleteTaskModal();
    }
});

function deleteTask(index) {
    if (index < 0 || index >= currentTasks.length) {
        console.error(`Invalid index: ${index}`);
        return;
    }

    const taskId = currentTasks[index].id;

    fetch(`delete_taken.php?id=${taskId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        return response.json();
    })
    .then(data => {
        console.log('Task deleted successfully:', data);
        // Refresh tasks from server to ensure data consistency
        fetchTasks();
        // Close the delete modal after successful deletion
        closeDeleteTaskModal();
    })
    .catch(error => {
        console.error('Error deleting task:', error);
    });
}

function saveEditedTask() {
    const task = currentTasks[editTaskIndex]; // Get the task being edited
    task.Taaknaam = document.getElementById('edit-task-name').value; // Update task name
    task.Afspraakdatum = document.getElementById('edit-appointment-date').value; // Update appointment date
    task.Info = document.getElementById('edit-task-info').value; // Update info
    task.id = document.getElementById('edit-task-id').value; // Update info

    // Update the task status using the updated status from the toggleTaskStatus function
    const toggleButton = document.querySelector(`.status-toggle[data-index="${editTaskIndex}"]`);
    if (toggleButton) {
        task.Status = toggleButton.getAttribute("data-status"); // Update status
    }

    updateTasks(); // Update the server with the edited task
    displayTasks(currentTasks); // Refresh the displayed tasks
    closeEditTaskModal(); // Close the edit modal
}
// Function to close delete task modal
function closeDeleteTaskModal() {
    document.getElementById('delete-task-modal').style.display = 'none';
}

function closeEditTaskModal() {
    console.log('closeEditTaskModal called');
    document.getElementById('edit-task-modal').style.display = 'none';
}
// Event listener for cancel button
document.getElementById('cancel-delete-task-button').addEventListener('click', closeDeleteTaskModal);

// Event listeners for modal functionality (duplicate removed)
document.getElementById('close-modal').addEventListener('click', closeAddTaskModal);
document.getElementById('save-edited-task-button').addEventListener('click', saveEditedTask);
document.getElementById('close-edit-task-modal').addEventListener('click', closeEditTaskModal);
const cancelEditedTaskButton = document.getElementById('cancel-edited-task-button');
if (cancelEditedTaskButton) {
    cancelEditedTaskButton.addEventListener('click', closeEditTaskModal);
}

// Event listeners for menu buttons
document.getElementById('rekeningen-button').addEventListener('click', () => {
    document.getElementById('rekeningen-section').style.display = 'block';
    document.getElementById('taken-section').style.display = 'none';
});

document.getElementById('taken-button').addEventListener('click', () => {
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'block';
    fetchTasks(); // Fetch tasks when the Taken section is displayed
});

const saveTaskButton = document.getElementById('save-task-button');
if (saveTaskButton) {
    saveTaskButton.addEventListener('click', () => {
    console.log('SAVE BUTTON CLICKED from tasks.js');
    const taakName = document.getElementById('task-name').value;
    const taakBeschrijving = document.getElementById('task-info').value;
    const afspraakdatumInput = document.getElementById('task-date');
    const afspraakdatum = afspraakdatumInput.value ? afspraakdatumInput.value : new Date().toISOString().split('T')[0];

    console.log('Taak Name:', taakName);
    console.log('Taak Beschrijving:', taakBeschrijving);
    // Validate input
    if (!taakName) {
        alert("Taak niet leeglaten");
        return;
    }

    const newTaak = {
        Taaknaam: taakName,
        Info: taakBeschrijving,
        Afspraakdatum: afspraakdatumInput.value ? afspraakdatumInput.value : `${new Date().getDate().toString().padStart(2, '0')}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}` // Set afspraakdatum to the entered value or current date
    };

    // If afspraakdatum is empty, set it to the current date
    if (!afspraakdatumInput.value) {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        newTaak.Afspraakdatum = `${day}-${month}-${year}`;
    }

    // Send the new taak to the server
    fetch('new_taken.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTaak) // Send the new taak as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create taak');
        }
        return response.json();
    })
    .then(data => {
        console.log('Taak created successfully:', data);
        // Optionally, refresh the data displayed
        fetchData(); // Fetch updated data
        displayData(currentTasks); // Refresh the displayed regular accounts
        closeAddTaskModal(); // Close the modal
        clearTaskInputs(); // Clear the input fields
    })
    .catch(error => {
        console.error('Error creating taak:', error);
        closeAddTaskModal(); // Close the modal
        fetchData(); // Fetch updated data
        displayData(currentTasks); // Refresh the displayed regular accounts

    });
    });
}

const cancelSaveTaskButton = document.getElementById('cancel-save-task-button');
if (cancelSaveTaskButton) {
    cancelSaveTaskButton.addEventListener('click', closeAddTaskModal);
}
document.getElementById('cancel-edited-task-button').addEventListener('click', closeEditTaskModal);

// Optional: Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('add-task-modal');
    if (event.target === modal) {
        closeAddTaskModal();
    }
};

document.querySelectorAll('.task-date').forEach((input) => {
    input.addEventListener('click', () => {
        input.type = 'date';
        input.click();
    });
});

// DOMContentLoaded handler (duplicate event listener removed)
// Initial fetch of tasks when the page loads
