// Recurring Task Templates Implementation

let taskTemplates = [];

// Initialize the recurring task templates functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the add task button to show our enhanced modal
    const addTaskButton = document.getElementById('add-task-button');
    if (addTaskButton) {
        // Replace the original click handler with our enhanced version
        addTaskButton.removeEventListener('click', window.showAddTaskModal);
        addTaskButton.addEventListener('click', showEnhancedAddTaskModal);
    }

    // Listen for the dataLoaded event to load task templates
    document.addEventListener('dataLoaded', () => {
        loadTaskTemplates();
    });
});

// Function to load task templates (from localStorage in this implementation)
function loadTaskTemplates() {
    const savedTemplates = localStorage.getItem('taskTemplates');
    if (savedTemplates) {
        taskTemplates = JSON.parse(savedTemplates);
    } else {
        // Initialize with some default templates
        taskTemplates = [
            {
                id: 1,
                name: 'Monthly Bill Payment',
                description: 'Regular monthly bill payment task',
                taskName: 'Pay {billName}',
                dueDate: '', // Will be calculated based on recurrence
                priority: 'medium',
                recurrence: 'monthly',
                dayOfMonth: 15,
                notes: 'Don\'t forget to check for any changes in the amount'
            },
            {
                id: 2,
                name: 'Quarterly Tax Review',
                description: 'Review tax documents every quarter',
                taskName: 'Quarterly Tax Review',
                dueDate: '', // Will be calculated based on recurrence
                priority: 'high',
                recurrence: 'quarterly',
                monthsOfYear: [3, 6, 9, 12], // March, June, September, December
                dayOfMonth: 15,
                notes: 'Gather all receipts and review tax obligations'
            },
            {
                id: 3,
                name: 'Weekly Budget Check',
                description: 'Check budget compliance weekly',
                taskName: 'Weekly Budget Review',
                dueDate: '', // Will be calculated based on recurrence
                priority: 'low',
                recurrence: 'weekly',
                dayOfWeek: 5, // Friday
                notes: 'Compare actual spending with budget plan'
            }
        ];
        saveTaskTemplates();
    }
}

// Function to save task templates to localStorage
function saveTaskTemplates() {
    localStorage.setItem('taskTemplates', JSON.stringify(taskTemplates));
}

// Function to show the enhanced add task modal with template options
function showEnhancedAddTaskModal() {
    // Check if the original modal exists
    let modal = document.getElementById('add-task-modal');
    
    // If the modal doesn't exist, create it first
    if (!modal) {
        createAddTaskModal();
        modal = document.getElementById('add-task-modal');
    }
    
    // Enhance the modal with template options if not already enhanced
    if (!document.getElementById('task-template-section')) {
        enhanceAddTaskModal(modal);
    }
    
    // Show the modal
    modal.style.display = 'block';
    
    // Populate template dropdown
    populateTemplateDropdown();
}

// Function to create the basic add task modal if it doesn't exist
function createAddTaskModal() {
    const modal = document.createElement('div');
    modal.id = 'add-task-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add New Task</h2>
            <form id="add-task-form">
                <label for="task-name">Task Name:</label>
                <input type="text" id="task-name" required>
                
                <label for="task-due-date">Due Date:</label>
                <input type="date" id="task-due-date" required>
                
                <label for="task-priority">Priority:</label>
                <select id="task-priority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
                
                <label for="task-notes">Notes:</label>
                <textarea id="task-notes"></textarea>
                
                <button type="submit">Add Task</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    const form = modal.querySelector('#add-task-form');
    form.addEventListener('submit', handleAddTask);
}

// Function to enhance the add task modal with template options
function enhanceAddTaskModal(modal) {
    const form = modal.querySelector('#add-task-form');
    
    // Create template section
    const templateSection = document.createElement('div');
    templateSection.id = 'task-template-section';
    
    templateSection.innerHTML = `
        <div class="template-controls">
            <label for="use-template">Use Template:</label>
            <input type="checkbox" id="use-template">
            
            <div id="template-options" style="display: none;">
                <label for="task-template">Select Template:</label>
                <select id="task-template">
                    <option value="">-- Select a Template --</option>
                    <!-- Templates will be populated here -->
                </select>
                
                <button type="button" id="manage-templates-button">Manage Templates</button>
            </div>
        </div>
        
        <div id="recurrence-options" style="display: none;">
            <h3>Recurrence Options</h3>
            
            <label for="recurrence-type">Repeat:</label>
            <select id="recurrence-type">
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
            </select>
            
            <div id="weekly-options" class="recurrence-detail" style="display: none;">
                <label>Day of Week:</label>
                <select id="day-of-week">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                </select>
            </div>
            
            <div id="monthly-options" class="recurrence-detail" style="display: none;">
                <label>Day of Month:</label>
                <input type="number" id="day-of-month" min="1" max="31" value="1">
            </div>
            
            <div id="yearly-options" class="recurrence-detail" style="display: none;">
                <label>Month:</label>
                <select id="month-of-year">
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                </select>
                <label>Day:</label>
                <input type="number" id="day-of-year" min="1" max="31" value="1">
            </div>
            
            <div id="save-as-template-option">
                <label for="save-as-template">Save as Template:</label>
                <input type="checkbox" id="save-as-template">
                
                <div id="template-save-options" style="display: none;">
                    <label for="template-name">Template Name:</label>
                    <input type="text" id="template-name">
                    
                    <label for="template-description">Description:</label>
                    <textarea id="template-description"></textarea>
                </div>
            </div>
        </div>
    `;
    
    // Insert the template section before the submit button
    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(templateSection, submitButton);
    
    // Add event listeners for template controls
    const useTemplateCheckbox = document.getElementById('use-template');
    useTemplateCheckbox.addEventListener('change', () => {
        document.getElementById('template-options').style.display = 
            useTemplateCheckbox.checked ? 'block' : 'none';
    });
    
    const templateSelect = document.getElementById('task-template');
    templateSelect.addEventListener('change', () => {
        if (templateSelect.value) {
            applyTemplate(templateSelect.value);
        }
    });
    
    const manageTemplatesButton = document.getElementById('manage-templates-button');
    manageTemplatesButton.addEventListener('click', showManageTemplatesModal);
    
    const recurrenceTypeSelect = document.getElementById('recurrence-type');
    recurrenceTypeSelect.addEventListener('change', () => {
        updateRecurrenceOptions(recurrenceTypeSelect.value);
    });
    
    const saveAsTemplateCheckbox = document.getElementById('save-as-template');
    saveAsTemplateCheckbox.addEventListener('change', () => {
        document.getElementById('template-save-options').style.display = 
            saveAsTemplateCheckbox.checked ? 'block' : 'none';
    });
    
    // Add recurrence checkbox
    const recurrenceCheckbox = document.createElement('div');
    recurrenceCheckbox.innerHTML = `
        <label for="enable-recurrence">Set Recurrence:</label>
        <input type="checkbox" id="enable-recurrence">
    `;
    
    form.insertBefore(recurrenceCheckbox, templateSection.nextSibling);
    
    document.getElementById('enable-recurrence').addEventListener('change', function() {
        document.getElementById('recurrence-options').style.display = 
            this.checked ? 'block' : 'none';
    });
    
    // Update the form submit handler
    form.removeEventListener('submit', handleAddTask);
    form.addEventListener('submit', handleEnhancedAddTask);
}

// Function to populate the template dropdown
function populateTemplateDropdown() {
    const templateSelect = document.getElementById('task-template');
    
    // Clear existing options except the first one
    while (templateSelect.options.length > 1) {
        templateSelect.remove(1);
    }
    
    // Add options for each template
    taskTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        templateSelect.appendChild(option);
    });
}

// Function to apply a template to the form
function applyTemplate(templateId) {
    const template = taskTemplates.find(t => t.id == templateId);
    if (!template) return;
    
    // Fill in the form fields
    document.getElementById('task-name').value = template.taskName;
    document.getElementById('task-priority').value = template.priority;
    document.getElementById('task-notes').value = template.notes || '';
    
    // Set recurrence options
    document.getElementById('enable-recurrence').checked = true;
    document.getElementById('recurrence-options').style.display = 'block';
    document.getElementById('recurrence-type').value = template.recurrence;
    
    // Update recurrence details
    updateRecurrenceOptions(template.recurrence);
    
    // Set specific recurrence options based on the template
    switch (template.recurrence) {
        case 'weekly':
            document.getElementById('day-of-week').value = template.dayOfWeek;
            break;
        case 'monthly':
            document.getElementById('day-of-month').value = template.dayOfMonth;
            break;
        case 'yearly':
            if (template.monthOfYear !== undefined) {
                document.getElementById('month-of-year').value = template.monthOfYear;
                document.getElementById('day-of-year').value = template.dayOfMonth;
            }
            break;
    }
    
    // Calculate the next due date based on recurrence
    const dueDate = calculateNextDueDate(template);
    document.getElementById('task-due-date').value = dueDate;
}

// Function to update recurrence options based on the selected recurrence type
function updateRecurrenceOptions(recurrenceType) {
    // Hide all recurrence detail sections
    document.querySelectorAll('.recurrence-detail').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show the relevant section based on recurrence type
    switch (recurrenceType) {
        case 'weekly':
            document.getElementById('weekly-options').style.display = 'block';
            break;
        case 'monthly':
        case 'quarterly':
            document.getElementById('monthly-options').style.display = 'block';
            break;
        case 'yearly':
            document.getElementById('yearly-options').style.display = 'block';
            break;
    }
}

// Function to calculate the next due date based on recurrence settings
function calculateNextDueDate(recurrenceSettings) {
    const today = new Date();
    let nextDate = new Date(today);
    
    switch (recurrenceSettings.recurrence) {
        case 'daily':
            nextDate.setDate(today.getDate() + 1);
            break;
        
        case 'weekly':
            const dayOfWeek = recurrenceSettings.dayOfWeek;
            const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7;
            nextDate.setDate(today.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
            break;
        
        case 'monthly':
            const dayOfMonth = recurrenceSettings.dayOfMonth;
            nextDate.setMonth(today.getMonth() + 1);
            nextDate.setDate(Math.min(dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
            break;
        
        case 'quarterly':
            const currentMonth = today.getMonth();
            const nextQuarterMonth = currentMonth + 3 - (currentMonth % 3);
            nextDate.setMonth(nextQuarterMonth % 12);
            if (nextQuarterMonth >= 12) {
                nextDate.setFullYear(today.getFullYear() + 1);
            }
            nextDate.setDate(Math.min(recurrenceSettings.dayOfMonth, getDaysInMonth(nextDate.getFullYear(), nextDate.getMonth())));
            break;
        
        case 'yearly':
            const monthOfYear = recurrenceSettings.monthOfYear || 0;
            const dayOfYear = recurrenceSettings.dayOfMonth || 1;
            
            if (today.getMonth() > monthOfYear || (today.getMonth() === monthOfYear && today.getDate() >= dayOfYear)) {
                nextDate.setFullYear(today.getFullYear() + 1);
            }
            
            nextDate.setMonth(monthOfYear);
            nextDate.setDate(Math.min(dayOfYear, getDaysInMonth(nextDate.getFullYear(), monthOfYear)));
            break;
    }
    
    // Format the date as YYYY-MM-DD for the input field
    return nextDate.toISOString().split('T')[0];
}

// Helper function to get the number of days in a month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Function to handle the enhanced add task form submission
function handleEnhancedAddTask(event) {
    event.preventDefault();
    
    // Get form values
    const taskName = document.getElementById('task-name').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const notes = document.getElementById('task-notes').value;
    
    // Create the task
    const newTask = {
        Taak: taskName,
        Datum: dueDate,
        Priority: priority,
        Notes: notes
    };
    
    // Add the task to the tasks array
    if (window.tasks) {
        newTask.id = window.tasks.length + 1;
        window.tasks.push(newTask);
        
        // Update the tasks table
        if (typeof window.displayTasks === 'function') {
            window.displayTasks();
        }
        
        // Show success notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('Task Added', `The task "${taskName}" has been added.`);
        }
    }
    
    // Check if we should save as a template
    if (document.getElementById('enable-recurrence').checked && 
        document.getElementById('save-as-template').checked) {
        saveNewTemplate();
    }
    
    // Check if this is a recurring task
    if (document.getElementById('enable-recurrence').checked) {
        scheduleNextRecurrence(newTask);
    }
    
    // Close the modal
    document.getElementById('add-task-modal').style.display = 'none';
    
    // Reset the form
    document.getElementById('add-task-form').reset();
    document.getElementById('template-options').style.display = 'none';
    document.getElementById('recurrence-options').style.display = 'none';
    document.getElementById('template-save-options').style.display = 'none';
}

// Function to save a new template
function saveNewTemplate() {
    const templateName = document.getElementById('template-name').value;
    if (!templateName) return;
    
    const templateDescription = document.getElementById('template-description').value;
    const taskName = document.getElementById('task-name').value;
    const priority = document.getElementById('task-priority').value;
    const notes = document.getElementById('task-notes').value;
    const recurrenceType = document.getElementById('recurrence-type').value;
    
    // Create template object
    const newTemplate = {
        id: Date.now(), // Use timestamp as ID
        name: templateName,
        description: templateDescription,
        taskName: taskName,
        priority: priority,
        recurrence: recurrenceType,
        notes: notes
    };
    
    // Add recurrence-specific properties
    switch (recurrenceType) {
        case 'weekly':
            newTemplate.dayOfWeek = parseInt(document.getElementById('day-of-week').value);
            break;
        case 'monthly':
        case 'quarterly':
            newTemplate.dayOfMonth = parseInt(document.getElementById('day-of-month').value);
            break;
        case 'yearly':
            newTemplate.monthOfYear = parseInt(document.getElementById('month-of-year').value);
            newTemplate.dayOfMonth = parseInt(document.getElementById('day-of-year').value);
            break;
    }
    
    // Add to templates array
    taskTemplates.push(newTemplate);
    
    // Save to localStorage
    saveTaskTemplates();
    
    // Show success notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Template Saved', `The template "${templateName}" has been saved.`);
    }
}

// Function to schedule the next recurrence of a task
function scheduleNextRecurrence(task) {
    // Get recurrence settings
    const recurrenceType = document.getElementById('recurrence-type').value;
    if (recurrenceType === 'none') return;
    
    const recurrenceSettings = {
        recurrence: recurrenceType,
        taskName: task.Taak,
        priority: task.Priority,
        notes: task.Notes
    };
    
    // Add recurrence-specific properties
    switch (recurrenceType) {
        case 'weekly':
            recurrenceSettings.dayOfWeek = parseInt(document.getElementById('day-of-week').value);
            break;
        case 'monthly':
        case 'quarterly':
            recurrenceSettings.dayOfMonth = parseInt(document.getElementById('day-of-month').value);
            break;
        case 'yearly':
            recurrenceSettings.monthOfYear = parseInt(document.getElementById('month-of-year').value);
            recurrenceSettings.dayOfMonth = parseInt(document.getElementById('day-of-year').value);
            break;
    }
    
    // Store the recurrence information
    const recurringTasks = JSON.parse(localStorage.getItem('recurringTasks') || '[]');
    recurringTasks.push(recurrenceSettings);
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
}

// Function to show the manage templates modal
function showManageTemplatesModal() {
    // Check if the modal already exists
    let modal = document.getElementById('manage-templates-modal');
    
    if (!modal) {
        // Create the modal
        modal = document.createElement('div');
        modal.id = 'manage-templates-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Manage Task Templates</h2>
                
                <div class="templates-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Recurrence</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="templates-table-body">
                            <!-- Templates will be populated here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Show the modal
    modal.style.display = 'block';
    
    // Populate the templates table
    displayTemplates();
}

// Function to display templates in the manage templates modal
function displayTemplates() {
    const tableBody = document.getElementById('templates-table-body');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Create rows for each template
    taskTemplates.forEach(template => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${template.name}</td>
            <td>${template.description || '-'}</td>
            <td>${formatRecurrence(template)}</td>
            <td>
                <button onclick="editTemplate(${template.id})">Edit</button>
                <button onclick="deleteTemplate(${template.id})">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no templates found
    if (taskTemplates.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center;">No templates found</td>`;
        tableBody.appendChild(row);
    }
}

// Function to format recurrence for display
function formatRecurrence(template) {
    switch (template.recurrence) {
        case 'daily':
            return 'Daily';
        
        case 'weekly':
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return `Weekly on ${days[template.dayOfWeek]}`;
        
        case 'monthly':
            return `Monthly on day ${template.dayOfMonth}`;
        
        case 'quarterly':
            return `Quarterly on day ${template.dayOfMonth}`;
        
        case 'yearly':
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return `Yearly on ${months[template.monthOfYear]} ${template.dayOfMonth}`;
        
        default:
            return template.recurrence || 'None';
    }
}

// Function to edit a template
function editTemplate(templateId) {
    const template = taskTemplates.find(t => t.id == templateId);
    if (!template) return;
    
    // Create or get the edit template modal
    let modal = document.getElementById('edit-template-modal');
    
    if (!modal) {
        // Create the modal
        modal = document.createElement('div');
        modal.id = 'edit-template-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Task Template</h2>
                
                <form id="edit-template-form">
                    <input type="hidden" id="edit-template-id">
                    
                    <label for="edit-template-name">Template Name:</label>
                    <input type="text" id="edit-template-name" required>
                    
                    <label for="edit-template-description">Description:</label>
                    <textarea id="edit-template-description"></textarea>
                    
                    <label for="edit-task-name">Task Name:</label>
                    <input type="text" id="edit-task-name" required>
                    
                    <label for="edit-task-priority">Priority:</label>
                    <select id="edit-task-priority">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    
                    <label for="edit-task-notes">Notes:</label>
                    <textarea id="edit-task-notes"></textarea>
                    
                    <label for="edit-recurrence-type">Recurrence:</label>
                    <select id="edit-recurrence-type">
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    
                    <div id="edit-weekly-options" class="recurrence-detail" style="display: none;">
                        <label>Day of Week:</label>
                        <select id="edit-day-of-week">
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                            <option value="0">Sunday</option>
                        </select>
                    </div>
                    
                    <div id="edit-monthly-options" class="recurrence-detail" style="display: none;">
                        <label>Day of Month:</label>
                        <input type="number" id="edit-day-of-month" min="1" max="31" value="1">
                    </div>
                    
                    <div id="edit-yearly-options" class="recurrence-detail" style="display: none;">
                        <label>Month:</label>
                        <select id="edit-month-of-year">
                            <option value="0">January</option>
                            <option value="1">February</option>
                            <option value="2">March</option>
                            <option value="3">April</option>
                            <option value="4">May</option>
                            <option value="5">June</option>
                            <option value="6">July</option>
                            <option value="7">August</option>
                            <option value="8">September</option>
                            <option value="9">October</option>
                            <option value="10">November</option>
                            <option value="11">December</option>
                        </select>
                        <label>Day:</label>
                        <input type="number" id="edit-day-of-year" min="1" max="31" value="1">
                    </div>
                    
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const form = modal.querySelector('#edit-template-form');
        form.addEventListener('submit', handleEditTemplate);
        
        const recurrenceTypeSelect = document.getElementById('edit-recurrence-type');
        recurrenceTypeSelect.addEventListener('change', () => {
            updateEditRecurrenceOptions(recurrenceTypeSelect.value);
        });
    }
    
    // Fill the form with template data
    document.getElementById('edit-template-id').value = template.id;
    document.getElementById('edit-template-name').value = template.name;
    document.getElementById('edit-template-description').value = template.description || '';
    document.getElementById('edit-task-name').value = template.taskName;
    document.getElementById('edit-task-priority').value = template.priority;
    document.getElementById('edit-task-notes').value = template.notes || '';
    document.getElementById('edit-recurrence-type').value = template.recurrence;
    
    // Update recurrence options
    updateEditRecurrenceOptions(template.recurrence);
    
    // Set specific recurrence options
    switch (template.recurrence) {
        case 'weekly':
            document.getElementById('edit-day-of-week').value = template.dayOfWeek;
            break;
        case 'monthly':
        case 'quarterly':
            document.getElementById('edit-day-of-month').value = template.dayOfMonth;
            break;
        case 'yearly':
            document.getElementById('edit-month-of-year').value = template.monthOfYear;
            document.getElementById('edit-day-of-year').value = template.dayOfMonth;
            break;
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Function to update edit recurrence options
function updateEditRecurrenceOptions(recurrenceType) {
    // Hide all recurrence detail sections
    document.querySelectorAll('#edit-template-modal .recurrence-detail').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show the relevant section based on recurrence type
    switch (recurrenceType) {
        case 'weekly':
            document.getElementById('edit-weekly-options').style.display = 'block';
            break;
        case 'monthly':
        case 'quarterly':
            document.getElementById('edit-monthly-options').style.display = 'block';
            break;
        case 'yearly':
            document.getElementById('edit-yearly-options').style.display = 'block';
            break;
    }
}

// Function to handle edit template form submission
function handleEditTemplate(event) {
    event.preventDefault();
    
    const templateId = document.getElementById('edit-template-id').value;
    const templateIndex = taskTemplates.findIndex(t => t.id == templateId);
    
    if (templateIndex === -1) return;
    
    // Get form values
    const name = document.getElementById('edit-template-name').value;
    const description = document.getElementById('edit-template-description').value;
    const taskName = document.getElementById('edit-task-name').value;
    const priority = document.getElementById('edit-task-priority').value;
    const notes = document.getElementById('edit-task-notes').value;
    const recurrenceType = document.getElementById('edit-recurrence-type').value;
    
    // Update template object
    const updatedTemplate = {
        id: templateId,
        name: name,
        description: description,
        taskName: taskName,
        priority: priority,
        recurrence: recurrenceType,
        notes: notes
    };
    
    // Add recurrence-specific properties
    switch (recurrenceType) {
        case 'weekly':
            updatedTemplate.dayOfWeek = parseInt(document.getElementById('edit-day-of-week').value);
            break;
        case 'monthly':
        case 'quarterly':
            updatedTemplate.dayOfMonth = parseInt(document.getElementById('edit-day-of-month').value);
            break;
        case 'yearly':
            updatedTemplate.monthOfYear = parseInt(document.getElementById('edit-month-of-year').value);
            updatedTemplate.dayOfMonth = parseInt(document.getElementById('edit-day-of-year').value);
            break;
    }
    
    // Update the template in the array
    taskTemplates[templateIndex] = updatedTemplate;
    
    // Save to localStorage
    saveTaskTemplates();
    
    // Close the modal
    document.getElementById('edit-template-modal').style.display = 'none';
    
    // Refresh the templates display
    displayTemplates();
    
    // Show success notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Template Updated', `The template "${name}" has been updated.`);
    }
}

// Function to delete a template
function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    const templateIndex = taskTemplates.findIndex(t => t.id == templateId);
    if (templateIndex === -1) return;
    
    const templateName = taskTemplates[templateIndex].name;
    
    // Remove the template from the array
    taskTemplates.splice(templateIndex, 1);
    
    // Save to localStorage
    saveTaskTemplates();
    
    // Refresh the templates display
    displayTemplates();
    
    // Show success notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Template Deleted', `The template "${templateName}" has been deleted.`);
    }
}

// Function to check for recurring tasks that need to be created
function checkRecurringTasks() {
    const recurringTasks = JSON.parse(localStorage.getItem('recurringTasks') || '[]');
    const today = new Date();
    
    recurringTasks.forEach((recurrenceSettings, index) => {
        const nextDueDate = calculateNextDueDate(recurrenceSettings);
        const dueDate = new Date(nextDueDate);
        
        // If the due date is today or in the past, create the task
        if (dueDate <= today) {
            // Create the task
            const newTask = {
                Taak: recurrenceSettings.taskName,
                Datum: nextDueDate,
                Priority: recurrenceSettings.priority,
                Notes: recurrenceSettings.notes
            };
            
            // Add the task to the tasks array
            if (window.tasks) {
                newTask.id = window.tasks.length + 1;
                window.tasks.push(newTask);
                
                // Update the tasks table if visible
                if (typeof window.displayTasks === 'function' && 
                    document.getElementById('taken-section') && 
                    document.getElementById('taken-section').style.display === 'block') {
                    window.displayTasks();
                }
            }
            
            // Update the recurrence settings with the next due date
            recurringTasks[index] = recurrenceSettings;
        }
    });
    
    // Save the updated recurring tasks
    localStorage.setItem('recurringTasks', JSON.stringify(recurringTasks));
}

// Check for recurring tasks when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check for recurring tasks
    checkRecurringTasks();
    
    // Set up a daily check for recurring tasks
    // In a real application, this would be handled by a server-side process
    // For this demo, we'll check when the page loads
});

// Make functions globally accessible
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;