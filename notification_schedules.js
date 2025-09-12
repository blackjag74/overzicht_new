// Customizable Notification Schedules System
class NotificationSchedules {
    constructor() {
        this.schedules = this.loadSchedules();
        this.init();
    }

    init() {
        this.createSchedulesModal();
        this.bindEvents();
        this.startScheduleChecker();
    }

    loadSchedules() {
        const saved = localStorage.getItem('notification_schedules');
        return saved ? JSON.parse(saved) : this.getDefaultSchedules();
    }

    saveSchedules() {
        localStorage.setItem('notification_schedules', JSON.stringify(this.schedules));
    }

    getDefaultSchedules() {
        return {
            bills: [
                { id: 1, name: '30 Days Before', days: 30, enabled: true, time: '09:00' },
                { id: 2, name: '7 Days Before', days: 7, enabled: true, time: '09:00' },
                { id: 3, name: '1 Day Before', days: 1, enabled: true, time: '18:00' },
                { id: 4, name: 'On Due Date', days: 0, enabled: true, time: '08:00' }
            ],
            tasks: [
                { id: 5, name: '3 Days Before', days: 3, enabled: true, time: '10:00' },
                { id: 6, name: '1 Day Before', days: 1, enabled: true, time: '16:00' },
                { id: 7, name: 'On Due Date', days: 0, enabled: true, time: '09:00' }
            ]
        };
    }

    createSchedulesModal() {
        const modal = document.createElement('div');
        modal.id = 'notification-schedules-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: #1a1a1a; color: white; max-width: 600px;">
                <div class="modal-header">
                    <h2>Notification Schedules</h2>
                    <span class="close" onclick="notificationSchedules.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="schedule-tabs">
                        <button class="tab-btn active" onclick="notificationSchedules.showTab('bills')">Bills</button>
                        <button class="tab-btn" onclick="notificationSchedules.showTab('tasks')">Tasks</button>
                    </div>
                    
                    <div id="bills-schedules" class="schedule-tab active">
                        <h3>Bill Notification Schedules</h3>
                        <div id="bills-schedule-list"></div>
                        <button class="btn btn-primary" onclick="notificationSchedules.addSchedule('bills')">Add Schedule</button>
                    </div>
                    
                    <div id="tasks-schedules" class="schedule-tab" style="display: none;">
                        <h3>Task Notification Schedules</h3>
                        <div id="tasks-schedule-list"></div>
                        <button class="btn btn-primary" onclick="notificationSchedules.addSchedule('tasks')">Add Schedule</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="notificationSchedules.closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="notificationSchedules.saveAndClose()">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addScheduleStyles();
    }

    addScheduleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .schedule-tabs {
                display: flex;
                margin-bottom: 20px;
                border-bottom: 1px solid #333;
            }
            
            .tab-btn {
                background: transparent;
                border: none;
                color: #ccc;
                padding: 10px 20px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            
            .tab-btn.active {
                color: #007bff;
                border-bottom-color: #007bff;
            }
            
            .schedule-item {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .schedule-info {
                flex: 1;
            }
            
            .schedule-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .schedule-input {
                background: #333;
                border: 1px solid #555;
                color: white;
                padding: 5px;
                border-radius: 3px;
                width: 60px;
            }
            
            .schedule-toggle {
                width: 20px;
                height: 20px;
            }
            
            .delete-schedule {
                background: #dc3545;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    showModal() {
        this.renderSchedules();
        document.getElementById('notification-schedules-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('notification-schedules-modal').style.display = 'none';
    }

    showTab(type) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.schedule-tab').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${type}-schedules`).style.display = 'block';
    }

    renderSchedules() {
        this.renderScheduleList('bills');
        this.renderScheduleList('tasks');
    }

    renderScheduleList(type) {
        const container = document.getElementById(`${type}-schedule-list`);
        const schedules = this.schedules[type];
        
        container.innerHTML = schedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-info">
                    <strong>${schedule.name}</strong><br>
                    <small>${schedule.days} days before due date at ${schedule.time}</small>
                </div>
                <div class="schedule-controls">
                    <input type="number" class="schedule-input" value="${schedule.days}" 
                           onchange="notificationSchedules.updateSchedule('${type}', ${schedule.id}, 'days', this.value)" min="0" max="365">
                    <input type="time" class="schedule-input" value="${schedule.time}" 
                           onchange="notificationSchedules.updateSchedule('${type}', ${schedule.id}, 'time', this.value)" style="width: 80px;">
                    <input type="checkbox" class="schedule-toggle" ${schedule.enabled ? 'checked' : ''} 
                           onchange="notificationSchedules.updateSchedule('${type}', ${schedule.id}, 'enabled', this.checked)">
                    <button class="delete-schedule" onclick="notificationSchedules.deleteSchedule('${type}', ${schedule.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateSchedule(type, id, field, value) {
        const schedule = this.schedules[type].find(s => s.id === id);
        if (schedule) {
            if (field === 'days') {
                schedule.days = parseInt(value);
            } else if (field === 'time') {
                schedule.time = value;
            } else if (field === 'enabled') {
                schedule.enabled = value;
            }
        }
    }

    addSchedule(type) {
        const name = prompt('Enter schedule name:');
        if (!name) return;
        
        const days = parseInt(prompt('Days before due date (0 for due date):') || '1');
        const time = prompt('Time (HH:MM format):') || '09:00';
        
        const newId = Math.max(...this.schedules[type].map(s => s.id), 0) + 1;
        
        this.schedules[type].push({
            id: newId,
            name: name,
            days: days,
            enabled: true,
            time: time
        });
        
        this.renderScheduleList(type);
    }

    deleteSchedule(type, id) {
        if (confirm('Are you sure you want to delete this schedule?')) {
            this.schedules[type] = this.schedules[type].filter(s => s.id !== id);
            this.renderScheduleList(type);
        }
    }

    saveAndClose() {
        this.saveSchedules();
        this.closeModal();
        this.showNotification('Notification schedules saved successfully!', 'success');
    }

    bindEvents() {
        // Add menu item for schedules
        const menuItem = document.createElement('li');
        menuItem.innerHTML = '<a href="#" onclick="notificationSchedules.showModal(); return false;">Notification Schedules</a>';
        
        const menu = document.querySelector('.navbar ul');
        if (menu) {
            menu.appendChild(menuItem);
        }
    }

    startScheduleChecker() {
        // Check every hour for scheduled notifications
        setInterval(() => {
            this.checkScheduledNotifications();
        }, 60 * 60 * 1000); // 1 hour
        
        // Initial check
        this.checkScheduledNotifications();
    }

    checkScheduledNotifications() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        // Check bills
        if (typeof bills !== 'undefined' && bills.length > 0) {
            this.checkItemsForScheduledNotifications(bills, 'bills', currentTime);
        }
        
        // Check tasks
        if (typeof tasks !== 'undefined' && tasks.length > 0) {
            this.checkItemsForScheduledNotifications(tasks, 'tasks', currentTime);
        }
    }

    checkItemsForScheduledNotifications(items, type, currentTime) {
        const schedules = this.schedules[type].filter(s => s.enabled && s.time === currentTime);
        
        schedules.forEach(schedule => {
            items.forEach(item => {
                const dueDate = new Date(item.due_date || item.date);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === schedule.days) {
                    this.sendScheduledNotification(item, type, schedule);
                }
            });
        });
    }

    sendScheduledNotification(item, type, schedule) {
        const title = type === 'bills' ? 'Bill Reminder' : 'Task Reminder';
        const itemName = item.name || item.title || 'Unnamed item';
        const dueDate = new Date(item.due_date || item.date).toLocaleDateString();
        
        let message;
        if (schedule.days === 0) {
            message = `${itemName} is due today (${dueDate})`;
        } else {
            message = `${itemName} is due in ${schedule.days} day${schedule.days > 1 ? 's' : ''} (${dueDate})`;
        }
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico'
            });
        }
        
        // Add to notification queue if notification system exists
        if (typeof notificationQueue !== 'undefined') {
            notificationQueue.push({
                type: type.slice(0, -1), // Remove 's' from 'bills'/'tasks'
                ...item,
                scheduled: true,
                scheduleName: schedule.name
            });
        }
        
        console.log(`Scheduled notification sent: ${message}`);
    }

    showNotification(message, type = 'info') {
        // Simple notification display
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#007bff'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Public method to get active schedules for a type
    getActiveSchedules(type) {
        return this.schedules[type].filter(s => s.enabled);
    }

    // Public method to check if an item should trigger a notification
    shouldNotify(item, type) {
        const dueDate = new Date(item.due_date || item.date);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        return this.schedules[type].some(schedule => 
            schedule.enabled && schedule.days === daysDiff
        );
    }
}

// Initialize the notification schedules system
let notificationSchedules;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationSchedules = new NotificationSchedules();
    });
} else {
    notificationSchedules = new NotificationSchedules();
}