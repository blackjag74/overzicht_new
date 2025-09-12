// Notification system for due tasks and bills
let notificationQueue = [];
let snoozeData = {};

// Check for localStorage support
const hasLocalStorage = typeof(Storage) !== "undefined";

// Load any previously snoozed notifications
function loadSnoozeData() {
    if (hasLocalStorage && localStorage.getItem('snoozeData')) {
        try {
            snoozeData = JSON.parse(localStorage.getItem('snoozeData'));
            // Clean up expired snooze data
            const now = new Date().getTime();
            let changed = false;
            
            Object.keys(snoozeData).forEach(id => {
                if (snoozeData[id] < now) {
                    delete snoozeData[id];
                    changed = true;
                }
            });
            
            if (changed) {
                saveSnoozeData();
            }
        } catch (e) {
            console.error('Error loading snooze data:', e);
            snoozeData = {};
        }
    }
}

// Save snooze data to localStorage
function saveSnoozeData() {
    if (hasLocalStorage) {
        localStorage.setItem('snoozeData', JSON.stringify(snoozeData));
    }
}

// Check if an item is snoozed
function isSnoozed(id) {
    const now = new Date().getTime();
    return snoozeData[id] && snoozeData[id] > now;
}

// Snooze a notification for a specified number of days (max 3)
function snoozeNotification(id, days) {
    // Limit to max 3 days
    const snoozedays = Math.min(days, 3);
    const now = new Date().getTime();
    const snoozeUntil = now + (snoozedays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    
    snoozeData[id] = snoozeUntil;
    saveSnoozeData();
}

// Check for due bills
function checkDueBills() {
    const currentDate = new Date();
    const dueBills = [];
    
    if (currentData && Array.isArray(currentData)) {
        currentData.forEach(item => {
            if (item.Status === 'Onbetaald') {
                const betaaldatum = new Date(item.Betaaldatum);
                const daysUntilDue = Math.ceil((betaaldatum - currentDate) / (1000 * 60 * 60 * 24));
                
                // If due within 3 days or overdue and not snoozed
                if (daysUntilDue <= 3 && !isSnoozed(`bill-${item.id}`)) {
                    dueBills.push({
                        id: `bill-${item.id}`,
                        type: 'bill',
                        name: item.Rekening,
                        date: item.Betaaldatum,
                        daysUntilDue: daysUntilDue,
                        amount: item.Bedrag
                    });
                }
            }
        });
    }
    
    return dueBills;
}

// Check for due tasks
function checkDueTasks() {
    const currentDate = new Date();
    const dueTasks = [];
    
    if (currentTasks && Array.isArray(currentTasks)) {
        currentTasks.forEach(task => {
            if (task.Status !== 'Klaar' && task.Afspraakdatum) {
                const afspraakdatum = new Date(task.Afspraakdatum);
                const daysUntilDue = Math.ceil((afspraakdatum - currentDate) / (1000 * 60 * 60 * 24));
                
                // If due within 3 days or overdue and not snoozed
                if (daysUntilDue <= 3 && !isSnoozed(`task-${task.id}`)) {
                    dueTasks.push({
                        id: `task-${task.id}`,
                        type: 'task',
                        name: task.Taaknaam,
                        date: task.Afspraakdatum,
                        daysUntilDue: daysUntilDue,
                        status: task.Status
                    });
                }
            }
        });
    }
    
    return dueTasks;
}

// Check for all due items and queue notifications
function checkAllDueItems() {
    loadSnoozeData();
    
    const dueBills = checkDueBills();
    const dueTasks = checkDueTasks();
    
    // Clear the current queue
    notificationQueue = [];
    
    // Add due bills and tasks to the queue
    notificationQueue = [...dueBills, ...dueTasks];
    
    // Sort by days until due (ascending)
    notificationQueue.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    
    // Show notifications if there are any
    if (notificationQueue.length > 0) {
        showNextNotification();
    }
}

// Show the next notification in the queue
function showNextNotification() {
    if (notificationQueue.length === 0) {
        return;
    }
    
    const item = notificationQueue.shift();
    showNotification(item);
}

// Show a notification for a specific item
function showNotification(item) {
    const notificationModal = document.getElementById('notification-modal');
    const notificationTitle = document.getElementById('notification-title');
    const notificationContent = document.getElementById('notification-content');
    const snoozeSelect = document.getElementById('snooze-days');
    
    // Set notification content based on type
    if (item.type === 'bill') {
        notificationTitle.textContent = 'Due Bill Reminder';
        let dueText = item.daysUntilDue === 0 ? 'today' : 
                     item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} days overdue` : 
                     `in ${item.daysUntilDue} days`;
        
        // Determine CSS class based on due status
        let statusClass = '';
        if (item.daysUntilDue < 0) {
            statusClass = 'task-expired';
        } else if (item.daysUntilDue <= 7) {
            statusClass = 'task-due';
        }
        
        notificationContent.innerHTML = `
            <p class="${statusClass}"><strong>${item.name}</strong> is due ${dueText}.</p>
            <p>Amount: €${parseFloat(item.amount).toFixed(2)}</p>
            <p>Due date: ${new Date(item.date).toLocaleDateString()}</p>
        `;
    } else if (item.type === 'task') {
        notificationTitle.textContent = 'Task Reminder';
        let dueText = item.daysUntilDue === 0 ? 'today' : 
                     item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} days overdue` : 
                     `in ${item.daysUntilDue} days`;
        
        // Determine CSS class based on due status
        let statusClass = '';
        if (item.daysUntilDue < 0) {
            statusClass = 'task-expired';
        } else if (item.daysUntilDue <= 7) {
            statusClass = 'task-due';
        }
        
        notificationContent.innerHTML = `
            <p class="${statusClass}"><strong>${item.name}</strong> is due ${dueText}.</p>
            <p>Status: ${item.status}</p>
            <p>Due date: ${new Date(item.date).toLocaleDateString()}</p>
        `;
    }
    
    // Reset snooze select
    snoozeSelect.value = '1';
    
    // Store the current item ID for snooze functionality
    notificationModal.dataset.itemId = item.id;
    
    // Show the modal
    notificationModal.style.display = 'block';
}

// Initialize notification system
function initNotificationSystem() {
    // Load any previously snoozed notifications
    loadSnoozeData();
    
    // Set up event listeners for notification modal buttons
    document.getElementById('dismiss-notification').addEventListener('click', () => {
        document.getElementById('notification-modal').style.display = 'none';
        showNextNotification(); // Show the next notification if any
    });
    
    document.getElementById('snooze-notification').addEventListener('click', () => {
        const modal = document.getElementById('notification-modal');
        const itemId = modal.dataset.itemId;
        const days = parseInt(document.getElementById('snooze-days').value, 10);
        
        if (itemId && days > 0) {
            snoozeNotification(itemId, days);
        }
        
        modal.style.display = 'none';
        showNextNotification(); // Show the next notification if any
    });
    
    // Check for due items when the page loads
    checkAllDueItems();
    
    // Set up periodic checks (every 5 minutes)
    setInterval(checkAllDueItems, 5 * 60 * 1000);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment to let other scripts load data first
    setTimeout(initNotificationSystem, 1000);
});