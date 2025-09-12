// Email/SMS Reminder System for Bills and Tasks

class ReminderSystem {
    constructor() {
        this.reminderSettings = this.loadReminderSettings();
        this.initializeSystem();
    }

    // Load reminder settings from localStorage
    loadReminderSettings() {
        const saved = localStorage.getItem('reminderSettings');
        return saved ? JSON.parse(saved) : {
            emailEnabled: false,
            smsEnabled: false,
            emailAddress: '',
            phoneNumber: '',
            reminderDays: [7, 3, 1], // Days before due date to send reminders
            reminderTime: '09:00', // Time of day to send reminders
            billReminders: true,
            taskReminders: true
        };
    }

    // Save reminder settings to localStorage
    saveReminderSettings() {
        localStorage.setItem('reminderSettings', JSON.stringify(this.reminderSettings));
    }

    // Initialize the reminder system
    initializeSystem() {
        this.createReminderSettingsModal();
        this.scheduleReminderChecks();
    }

    // Create the reminder settings modal
    createReminderSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'reminder-settings-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeReminderSettingsModal()">&times;</span>
                <h2>Email/SMS Reminder Settings</h2>
                
                <div class="reminder-settings-form">
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="email-enabled"> Enable Email Reminders
                        </label>
                        <input type="email" id="email-address" placeholder="Enter email address" style="margin-left: 20px;">
                    </div>
                    
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="sms-enabled"> Enable SMS Reminders
                        </label>
                        <input type="tel" id="phone-number" placeholder="Enter phone number" style="margin-left: 20px;">
                    </div>
                    
                    <div class="setting-group">
                        <label>Reminder Days Before Due Date:</label>
                        <div class="reminder-days">
                            <label><input type="checkbox" value="7"> 7 days</label>
                            <label><input type="checkbox" value="3"> 3 days</label>
                            <label><input type="checkbox" value="1"> 1 day</label>
                            <label><input type="checkbox" value="0"> Same day</label>
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <label>Reminder Time:</label>
                        <input type="time" id="reminder-time">
                    </div>
                    
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="bill-reminders"> Bill Reminders
                        </label>
                        <label>
                            <input type="checkbox" id="task-reminders"> Task Reminders
                        </label>
                    </div>
                    
                    <div class="modal-actions">
                        <button onclick="saveReminderSettings()">Save Settings</button>
                        <button onclick="testReminder()">Send Test Reminder</button>
                        <button onclick="closeReminderSettingsModal()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Show reminder settings modal
    showReminderSettings() {
        const modal = document.getElementById('reminder-settings-modal');
        if (modal) {
            // Populate form with current settings
            document.getElementById('email-enabled').checked = this.reminderSettings.emailEnabled;
            document.getElementById('sms-enabled').checked = this.reminderSettings.smsEnabled;
            document.getElementById('email-address').value = this.reminderSettings.emailAddress;
            document.getElementById('phone-number').value = this.reminderSettings.phoneNumber;
            document.getElementById('reminder-time').value = this.reminderSettings.reminderTime;
            document.getElementById('bill-reminders').checked = this.reminderSettings.billReminders;
            document.getElementById('task-reminders').checked = this.reminderSettings.taskReminders;
            
            // Set reminder days checkboxes
            const dayCheckboxes = modal.querySelectorAll('.reminder-days input[type="checkbox"]');
            dayCheckboxes.forEach(checkbox => {
                checkbox.checked = this.reminderSettings.reminderDays.includes(parseInt(checkbox.value));
            });
            
            modal.style.display = 'block';
        }
    }

    // Save reminder settings from modal
    saveSettings() {
        this.reminderSettings.emailEnabled = document.getElementById('email-enabled').checked;
        this.reminderSettings.smsEnabled = document.getElementById('sms-enabled').checked;
        this.reminderSettings.emailAddress = document.getElementById('email-address').value;
        this.reminderSettings.phoneNumber = document.getElementById('phone-number').value;
        this.reminderSettings.reminderTime = document.getElementById('reminder-time').value;
        this.reminderSettings.billReminders = document.getElementById('bill-reminders').checked;
        this.reminderSettings.taskReminders = document.getElementById('task-reminders').checked;
        
        // Get selected reminder days
        const dayCheckboxes = document.querySelectorAll('.reminder-days input[type="checkbox"]:checked');
        this.reminderSettings.reminderDays = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));
        
        this.saveReminderSettings();
        this.closeReminderSettings();
        
        window.showNotification('Settings Saved', 'Reminder settings have been saved successfully.');
    }

    // Close reminder settings modal
    closeReminderSettings() {
        const modal = document.getElementById('reminder-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Check for items that need reminders
    checkForReminders() {
        if (!this.reminderSettings.emailEnabled && !this.reminderSettings.smsEnabled) {
            return; // No reminders enabled
        }

        const today = new Date();
        const remindersToSend = [];

        // Check bills if enabled
        if (this.reminderSettings.billReminders && window.currentData) {
            window.currentData.forEach(bill => {
                if (bill.Status !== 'betaald') {
                    const dueDate = new Date(bill.Volgende);
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (this.reminderSettings.reminderDays.includes(daysUntilDue)) {
                        remindersToSend.push({
                            type: 'bill',
                            name: bill.Naam,
                            amount: bill.Bedrag,
                            dueDate: bill.Volgende,
                            daysUntilDue: daysUntilDue
                        });
                    }
                }
            });
        }

        // Check tasks if enabled
        if (this.reminderSettings.taskReminders && window.currentTasks) {
            window.currentTasks.forEach(task => {
                if (task.Status !== 'Klaar') {
                    const dueDate = new Date(task.Afspraakdatum);
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (this.reminderSettings.reminderDays.includes(daysUntilDue)) {
                        remindersToSend.push({
                            type: 'task',
                            name: task.Taaknaam,
                            dueDate: task.Afspraakdatum,
                            daysUntilDue: daysUntilDue,
                            info: task.Info
                        });
                    }
                }
            });
        }

        // Send reminders
        if (remindersToSend.length > 0) {
            this.sendReminders(remindersToSend);
        }
    }

    // Send reminders via email/SMS
    async sendReminders(reminders) {
        for (const reminder of reminders) {
            if (this.reminderSettings.emailEnabled && this.reminderSettings.emailAddress) {
                await this.sendEmailReminder(reminder);
            }
            
            if (this.reminderSettings.smsEnabled && this.reminderSettings.phoneNumber) {
                await this.sendSMSReminder(reminder);
            }
        }
    }

    // Send email reminder
    async sendEmailReminder(reminder) {
        const subject = `Reminder: ${reminder.name} ${reminder.type === 'bill' ? 'Payment' : 'Task'} Due`;
        let body = `Hello,\n\nThis is a reminder that your ${reminder.type} "${reminder.name}" is `;
        
        if (reminder.daysUntilDue === 0) {
            body += 'due today.';
        } else if (reminder.daysUntilDue === 1) {
            body += 'due tomorrow.';
        } else {
            body += `due in ${reminder.daysUntilDue} days.`;
        }
        
        if (reminder.type === 'bill') {
            body += `\nAmount: €${parseFloat(reminder.amount).toFixed(2)}`;
        }
        
        if (reminder.info) {
            body += `\nNotes: ${reminder.info}`;
        }
        
        body += `\nDue Date: ${new Date(reminder.dueDate).toLocaleDateString()}`;
        body += '\n\nBest regards,\nYour Bill Management System';

        try {
            const response = await fetch('send_reminder_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: this.reminderSettings.emailAddress,
                    subject: subject,
                    body: body,
                    reminder: reminder
                })
            });
            
            if (response.ok) {
                console.log(`Email reminder sent for ${reminder.name}`);
            }
        } catch (error) {
            console.error('Error sending email reminder:', error);
        }
    }

    // Send SMS reminder
    async sendSMSReminder(reminder) {
        let message = `Reminder: ${reminder.name} ${reminder.type === 'bill' ? 'payment' : 'task'} `;
        
        if (reminder.daysUntilDue === 0) {
            message += 'is due today';
        } else if (reminder.daysUntilDue === 1) {
            message += 'is due tomorrow';
        } else {
            message += `is due in ${reminder.daysUntilDue} days`;
        }
        
        if (reminder.type === 'bill') {
            message += ` (€${parseFloat(reminder.amount).toFixed(2)})`;
        }
        
        message += `. Due: ${new Date(reminder.dueDate).toLocaleDateString()}`;

        try {
            const response = await fetch('send_reminder_sms.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: this.reminderSettings.phoneNumber,
                    message: message,
                    reminder: reminder
                })
            });
            
            if (response.ok) {
                console.log(`SMS reminder sent for ${reminder.name}`);
            }
        } catch (error) {
            console.error('Error sending SMS reminder:', error);
        }
    }

    // Send test reminder
    async sendTestReminder() {
        const testReminder = {
            type: 'bill',
            name: 'Test Bill',
            amount: '50.00',
            dueDate: new Date().toISOString().split('T')[0],
            daysUntilDue: 1
        };
        
        await this.sendReminders([testReminder]);
        window.showNotification('Test Sent', 'Test reminder has been sent to your configured email/SMS.');
    }

    // Schedule reminder checks
    scheduleReminderChecks() {
        // Check for reminders every hour
        setInterval(() => {
            this.checkForReminders();
        }, 60 * 60 * 1000); // 1 hour
        
        // Also check when page loads
        this.checkForReminders();
    }
}

// Initialize reminder system
let reminderSystem;

document.addEventListener('DOMContentLoaded', () => {
    reminderSystem = new ReminderSystem();
});

// Global functions for modal interaction
function showReminderSettings() {
    if (reminderSystem) {
        reminderSystem.showReminderSettings();
    }
}

function saveReminderSettings() {
    if (reminderSystem) {
        reminderSystem.saveSettings();
    }
}

function closeReminderSettingsModal() {
    if (reminderSystem) {
        reminderSystem.closeReminderSettings();
    }
}

function testReminder() {
    if (reminderSystem) {
        reminderSystem.sendTestReminder();
    }
}

// Make functions globally accessible
window.showReminderSettings = showReminderSettings;
window.saveReminderSettings = saveReminderSettings;
window.closeReminderSettingsModal = closeReminderSettingsModal;
window.testReminder = testReminder;