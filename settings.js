// Comprehensive Settings System
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createSettingsModal();
        this.bindEvents();
    }

    loadSettings() {
        const saved = localStorage.getItem('app_settings');
        return saved ? JSON.parse(saved) : this.getDefaultSettings();
    }

    saveSettings() {
        localStorage.setItem('app_settings', JSON.stringify(this.settings));
    }

    getDefaultSettings() {
        return {
            email: {
                enabled: false,
                address: '',
                smtp: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    username: '',
                    password: ''
                },
                reminders: {
                    bills_1_day: true,
                    bills_3_days: true,
                    bills_7_days: true,
                    tasks_1_day: true,
                    tasks_3_days: false
                }
            },
            sms: {
                enabled: false,
                phone: '',
                provider: 'twilio', // twilio, messagebird, nexmo
                credentials: {
                    accountSid: '',
                    authToken: '',
                    fromNumber: ''
                },
                reminders: {
                    bills_1_day: true,
                    bills_3_days: false,
                    bills_7_days: false,
                    tasks_1_day: true,
                    tasks_3_days: false
                }
            },
            notifications: {
                browser: true,
                sound: true,
                desktop: true,
                frequency: 'daily' // daily, hourly, realtime
            },
            recurring: {
                autoDetection: true,
                minOccurrences: 2,
                amountThreshold: 10, // percentage
                dateThreshold: 3 // days
            },
            general: {
                theme: 'dark',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                currency: 'EUR'
            }
        };
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: #1a1a1a; color: white; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> Settings</h2>
                    <span class="close" onclick="settingsManager.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="settings-tabs">
                        <button class="settings-tab-btn active" onclick="settingsManager.showTab('email')">Email</button>
                        <button class="settings-tab-btn" onclick="settingsManager.showTab('sms')">SMS</button>
                        <button class="settings-tab-btn" onclick="settingsManager.showTab('notifications')">Notifications</button>
                        <button class="settings-tab-btn" onclick="settingsManager.showTab('recurring')">Auto-Detection</button>
                        <button class="settings-tab-btn" onclick="settingsManager.showTab('general')">General</button>
                    </div>
                    
                    <!-- Email Settings -->
                    <div id="email-settings" class="settings-tab-content active">
                        <h3><i class="fas fa-envelope"></i> Email Reminder Settings</h3>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="email-enabled"> Enable Email Reminders
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>Your Email Address:</label>
                            <input type="email" id="email-address" placeholder="your.email@example.com">
                        </div>
                        
                        <div class="setting-group">
                            <h4>SMTP Configuration (Optional - for advanced users)</h4>
                            <div class="smtp-config">
                                <label>SMTP Host:</label>
                                <input type="text" id="smtp-host" placeholder="smtp.gmail.com">
                                
                                <label>Port:</label>
                                <input type="number" id="smtp-port" placeholder="587">
                                
                                <label>Username:</label>
                                <input type="text" id="smtp-username" placeholder="your.email@gmail.com">
                                
                                <label>App Password:</label>
                                <input type="password" id="smtp-password" placeholder="Your app-specific password">
                                
                                <small style="color: #888;">Note: For Gmail, use an app-specific password, not your regular password.</small>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <h4>Email Reminder Schedule</h4>
                            <label><input type="checkbox" id="email-bills-7d"> Bills - 7 days before due</label>
                            <label><input type="checkbox" id="email-bills-3d"> Bills - 3 days before due</label>
                            <label><input type="checkbox" id="email-bills-1d"> Bills - 1 day before due</label>
                            <label><input type="checkbox" id="email-tasks-3d"> Tasks - 3 days before due</label>
                            <label><input type="checkbox" id="email-tasks-1d"> Tasks - 1 day before due</label>
                        </div>
                        
                        <button class="btn btn-primary" onclick="settingsManager.testEmail()">Send Test Email</button>
                    </div>
                    
                    <!-- SMS Settings -->
                    <div id="sms-settings" class="settings-tab-content" style="display: none;">
                        <h3><i class="fas fa-sms"></i> SMS Reminder Settings</h3>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="sms-enabled"> Enable SMS Reminders
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>Your Phone Number:</label>
                            <input type="tel" id="sms-phone" placeholder="+1234567890">
                            <small style="color: #888;">Include country code (e.g., +1 for US, +31 for Netherlands)</small>
                        </div>
                        
                        <div class="setting-group">
                            <h4>SMS Provider Configuration</h4>
                            <label>Provider:</label>
                            <select id="sms-provider">
                                <option value="twilio">Twilio</option>
                                <option value="messagebird">MessageBird</option>
                                <option value="nexmo">Vonage (Nexmo)</option>
                            </select>
                            
                            <div id="twilio-config" class="provider-config">
                                <label>Account SID:</label>
                                <input type="text" id="twilio-sid" placeholder="Your Twilio Account SID">
                                
                                <label>Auth Token:</label>
                                <input type="password" id="twilio-token" placeholder="Your Twilio Auth Token">
                                
                                <label>From Number:</label>
                                <input type="tel" id="twilio-from" placeholder="+1234567890">
                            </div>
                            
                            <small style="color: #888;">You need to sign up for an SMS service provider to use SMS reminders.</small>
                        </div>
                        
                        <div class="setting-group">
                            <h4>SMS Reminder Schedule</h4>
                            <label><input type="checkbox" id="sms-bills-3d"> Bills - 3 days before due</label>
                            <label><input type="checkbox" id="sms-bills-1d"> Bills - 1 day before due</label>
                            <label><input type="checkbox" id="sms-tasks-1d"> Tasks - 1 day before due</label>
                        </div>
                        
                        <button class="btn btn-primary" onclick="settingsManager.testSMS()">Send Test SMS</button>
                    </div>
                    
                    <!-- Notification Settings -->
                    <div id="notifications-settings" class="settings-tab-content" style="display: none;">
                        <h3><i class="fas fa-bell"></i> Notification Settings</h3>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="browser-notifications"> Enable Browser Notifications
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="sound-notifications"> Enable Sound Notifications
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>Notification Frequency:</label>
                            <select id="notification-frequency">
                                <option value="realtime">Real-time</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <h4>Custom Notification Schedules</h4>
                            <p>Configure when you want to receive notifications for different types of items.</p>
                            <button class="btn btn-secondary" onclick="notificationSchedules.showModal()">Manage Notification Schedules</button>
                        </div>
                        
                        <button class="btn btn-primary" onclick="settingsManager.requestNotificationPermission()">Request Browser Permission</button>
                    </div>
                    
                    <!-- Recurring Detection Settings -->
                    <div id="recurring-settings" class="settings-tab-content" style="display: none;">
                        <h3><i class="fas fa-sync-alt"></i> Recurring Bill Auto-Detection</h3>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                <input type="checkbox" id="auto-detection-enabled"> Enable Auto-Detection
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>Minimum Occurrences:</label>
                            <input type="number" id="min-occurrences" min="2" max="10" value="2">
                            <small style="color: #888;">How many times a bill must appear to be considered recurring</small>
                        </div>
                        
                        <div class="setting-group">
                            <label>Amount Variation Threshold (%):</label>
                            <input type="number" id="amount-threshold" min="0" max="50" value="10">
                            <small style="color: #888;">Maximum allowed variation in bill amounts</small>
                        </div>
                        
                        <div class="setting-group">
                            <label>Date Variation Threshold (days):</label>
                            <input type="number" id="date-threshold" min="1" max="10" value="3">
                            <small style="color: #888;">Maximum allowed variation in due dates</small>
                        </div>
                        
                        <button class="btn btn-secondary" onclick="recurringBillDetection.showModal()">Manage Detection Rules</button>
                        <button class="btn btn-primary" onclick="recurringBillDetection.runDetection()">Run Detection Now</button>
                    </div>
                    
                    <!-- General Settings -->
                    <div id="general-settings" class="settings-tab-content" style="display: none;">
                        <h3><i class="fas fa-sliders-h"></i> General Settings</h3>
                        
                        <div class="setting-group">
                            <label>Theme:</label>
                            <select id="app-theme">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Language:</label>
                            <select id="app-language">
                                <option value="en">English</option>
                                <option value="nl">Nederlands</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Date Format:</label>
                            <select id="date-format">
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Currency:</label>
                            <select id="app-currency">
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <h4>Data Management</h4>
                            <button class="btn btn-secondary" onclick="settingsManager.exportSettings()">Export Settings</button>
                            <button class="btn btn-secondary" onclick="settingsManager.importSettings()">Import Settings</button>
                            <button class="btn btn-danger" onclick="settingsManager.resetSettings()">Reset to Defaults</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="settingsManager.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="settingsManager.saveAndClose()">Save Settings</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addSettingsStyles();
    }

    addSettingsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .settings-tabs {
                display: flex;
                margin-bottom: 20px;
                border-bottom: 1px solid #333;
                flex-wrap: wrap;
            }
            
            .settings-tab-btn {
                background: transparent;
                border: none;
                color: #ccc;
                padding: 10px 15px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.3s;
            }
            
            .settings-tab-btn.active {
                color: #007bff;
                border-bottom-color: #007bff;
            }
            
            .settings-tab-content {
                padding: 20px 0;
            }
            
            .setting-group {
                margin-bottom: 25px;
                padding: 15px;
                background: #2a2a2a;
                border-radius: 5px;
                border: 1px solid #444;
            }
            
            .setting-group h4 {
                margin-top: 0;
                color: #007bff;
                border-bottom: 1px solid #444;
                padding-bottom: 10px;
            }
            
            .setting-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .setting-group label {
                display: block;
                margin-bottom: 8px;
                color: #ddd;
            }
            
            .setting-group input[type="text"],
            .setting-group input[type="email"],
            .setting-group input[type="tel"],
            .setting-group input[type="password"],
            .setting-group input[type="number"],
            .setting-group select {
                width: 100%;
                padding: 8px;
                background: #333;
                border: 1px solid #555;
                color: white;
                border-radius: 3px;
                margin-bottom: 10px;
            }
            
            .setting-group input[type="checkbox"] {
                width: auto;
                margin-right: 8px;
            }
            
            .smtp-config,
            .provider-config {
                background: #333;
                padding: 15px;
                border-radius: 5px;
                margin-top: 10px;
            }
            
            .setting-group small {
                display: block;
                margin-top: 5px;
                font-style: italic;
            }
            
            .btn-danger {
                background: #dc3545;
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 10px;
            }
            
            .btn-danger:hover {
                background: #c82333;
            }
        `;
        document.head.appendChild(style);
    }

    showModal() {
        this.loadSettingsToForm();
        document.getElementById('settings-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.settings-tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(`${tabName}-settings`).style.display = 'block';
    }

    loadSettingsToForm() {
        // Email settings
        document.getElementById('email-enabled').checked = this.settings.email.enabled;
        document.getElementById('email-address').value = this.settings.email.address;
        document.getElementById('smtp-host').value = this.settings.email.smtp.host;
        document.getElementById('smtp-port').value = this.settings.email.smtp.port;
        document.getElementById('smtp-username').value = this.settings.email.smtp.username;
        document.getElementById('smtp-password').value = this.settings.email.smtp.password;
        
        document.getElementById('email-bills-7d').checked = this.settings.email.reminders.bills_7_days;
        document.getElementById('email-bills-3d').checked = this.settings.email.reminders.bills_3_days;
        document.getElementById('email-bills-1d').checked = this.settings.email.reminders.bills_1_day;
        document.getElementById('email-tasks-3d').checked = this.settings.email.reminders.tasks_3_days;
        document.getElementById('email-tasks-1d').checked = this.settings.email.reminders.tasks_1_day;
        
        // SMS settings
        document.getElementById('sms-enabled').checked = this.settings.sms.enabled;
        document.getElementById('sms-phone').value = this.settings.sms.phone;
        document.getElementById('sms-provider').value = this.settings.sms.provider;
        document.getElementById('twilio-sid').value = this.settings.sms.credentials.accountSid;
        document.getElementById('twilio-token').value = this.settings.sms.credentials.authToken;
        document.getElementById('twilio-from').value = this.settings.sms.credentials.fromNumber;
        
        document.getElementById('sms-bills-3d').checked = this.settings.sms.reminders.bills_3_days;
        document.getElementById('sms-bills-1d').checked = this.settings.sms.reminders.bills_1_day;
        document.getElementById('sms-tasks-1d').checked = this.settings.sms.reminders.tasks_1_day;
        
        // Notification settings
        document.getElementById('browser-notifications').checked = this.settings.notifications.browser;
        document.getElementById('sound-notifications').checked = this.settings.notifications.sound;
        document.getElementById('notification-frequency').value = this.settings.notifications.frequency;
        
        // Recurring settings
        document.getElementById('auto-detection-enabled').checked = this.settings.recurring.autoDetection;
        document.getElementById('min-occurrences').value = this.settings.recurring.minOccurrences;
        document.getElementById('amount-threshold').value = this.settings.recurring.amountThreshold;
        document.getElementById('date-threshold').value = this.settings.recurring.dateThreshold;
        
        // General settings
        document.getElementById('app-theme').value = this.settings.general.theme;
        document.getElementById('app-language').value = this.settings.general.language;
        document.getElementById('date-format').value = this.settings.general.dateFormat;
        document.getElementById('app-currency').value = this.settings.general.currency;
    }

    saveSettingsFromForm() {
        // Email settings
        this.settings.email.enabled = document.getElementById('email-enabled').checked;
        this.settings.email.address = document.getElementById('email-address').value;
        this.settings.email.smtp.host = document.getElementById('smtp-host').value;
        this.settings.email.smtp.port = parseInt(document.getElementById('smtp-port').value);
        this.settings.email.smtp.username = document.getElementById('smtp-username').value;
        this.settings.email.smtp.password = document.getElementById('smtp-password').value;
        
        this.settings.email.reminders.bills_7_days = document.getElementById('email-bills-7d').checked;
        this.settings.email.reminders.bills_3_days = document.getElementById('email-bills-3d').checked;
        this.settings.email.reminders.bills_1_day = document.getElementById('email-bills-1d').checked;
        this.settings.email.reminders.tasks_3_days = document.getElementById('email-tasks-3d').checked;
        this.settings.email.reminders.tasks_1_day = document.getElementById('email-tasks-1d').checked;
        
        // SMS settings
        this.settings.sms.enabled = document.getElementById('sms-enabled').checked;
        this.settings.sms.phone = document.getElementById('sms-phone').value;
        this.settings.sms.provider = document.getElementById('sms-provider').value;
        this.settings.sms.credentials.accountSid = document.getElementById('twilio-sid').value;
        this.settings.sms.credentials.authToken = document.getElementById('twilio-token').value;
        this.settings.sms.credentials.fromNumber = document.getElementById('twilio-from').value;
        
        this.settings.sms.reminders.bills_3_days = document.getElementById('sms-bills-3d').checked;
        this.settings.sms.reminders.bills_1_day = document.getElementById('sms-bills-1d').checked;
        this.settings.sms.reminders.tasks_1_day = document.getElementById('sms-tasks-1d').checked;
        
        // Notification settings
        this.settings.notifications.browser = document.getElementById('browser-notifications').checked;
        this.settings.notifications.sound = document.getElementById('sound-notifications').checked;
        this.settings.notifications.frequency = document.getElementById('notification-frequency').value;
        
        // Recurring settings
        this.settings.recurring.autoDetection = document.getElementById('auto-detection-enabled').checked;
        this.settings.recurring.minOccurrences = parseInt(document.getElementById('min-occurrences').value);
        this.settings.recurring.amountThreshold = parseInt(document.getElementById('amount-threshold').value);
        this.settings.recurring.dateThreshold = parseInt(document.getElementById('date-threshold').value);
        
        // General settings
        this.settings.general.theme = document.getElementById('app-theme').value;
        this.settings.general.language = document.getElementById('app-language').value;
        this.settings.general.dateFormat = document.getElementById('date-format').value;
        this.settings.general.currency = document.getElementById('app-currency').value;
    }

    saveAndClose() {
        this.saveSettingsFromForm();
        this.saveSettings();
        this.applySettings();
        this.closeModal();
        this.showNotification('Settings saved successfully!', 'success');
    }

    applySettings() {
        // Apply theme
        if (this.settings.general.theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        // Update other systems with new settings
        if (typeof emailReminders !== 'undefined') {
            emailReminders.updateSettings(this.settings.email);
        }
        
        if (typeof recurringBillDetection !== 'undefined') {
            recurringBillDetection.updateSettings(this.settings.recurring);
        }
    }

    testEmail() {
        if (!this.settings.email.enabled || !this.settings.email.address) {
            this.showNotification('Please enable email and set your email address first.', 'warning');
            return;
        }
        
        const testData = {
            to: this.settings.email.address,
            subject: 'Test Email from Bill Management System',
            body: 'This is a test email to verify your email settings are working correctly.\n\nIf you received this, your email configuration is set up properly!'
        };
        
        fetch('send_reminder_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Test email sent successfully!', 'success');
            } else {
                this.showNotification('Failed to send test email: ' + data.error, 'error');
            }
        })
        .catch(error => {
            this.showNotification('Error sending test email: ' + error.message, 'error');
        });
    }

    testSMS() {
        if (!this.settings.sms.enabled || !this.settings.sms.phone) {
            this.showNotification('Please enable SMS and set your phone number first.', 'warning');
            return;
        }
        
        const testData = {
            to: this.settings.sms.phone,
            message: 'Test SMS from Bill Management System. Your SMS settings are working correctly!'
        };
        
        fetch('send_reminder_sms.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Test SMS sent successfully!', 'success');
            } else {
                this.showNotification('Failed to send test SMS: ' + data.error, 'error');
            }
        })
        .catch(error => {
            this.showNotification('Error sending test SMS: ' + error.message, 'error');
        });
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Browser notifications enabled!', 'success');
                    new Notification('Test Notification', {
                        body: 'Browser notifications are now working!',
                        icon: '/favicon.ico'
                    });
                } else {
                    this.showNotification('Browser notifications permission denied.', 'warning');
                }
            });
        } else {
            this.showNotification('Browser notifications not supported.', 'error');
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bill-management-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Settings exported successfully!', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.getDefaultSettings(), ...importedSettings };
                        this.saveSettings();
                        this.loadSettingsToForm();
                        this.showNotification('Settings imported successfully!', 'success');
                    } catch (error) {
                        this.showNotification('Invalid settings file.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            this.loadSettingsToForm();
            this.applySettings();
            this.showNotification('Settings reset to defaults.', 'info');
        }
    }

    bindEvents() {
        // Add settings menu item
        const menuItem = document.createElement('li');
        menuItem.innerHTML = '<a href="#" onclick="settingsManager.showModal(); return false;"><i class="fas fa-cog"></i> Settings</a>';
        
        const menu = document.querySelector('.navbar ul');
        if (menu) {
            menu.appendChild(menuItem);
        }
        
        // SMS provider change handler
        document.addEventListener('change', (e) => {
            if (e.target.id === 'sms-provider') {
                this.updateProviderConfig(e.target.value);
            }
        });
    }

    updateProviderConfig(provider) {
        // Hide all provider configs
        document.querySelectorAll('.provider-config').forEach(config => {
            config.style.display = 'none';
        });
        
        // Show selected provider config
        const configElement = document.getElementById(`${provider}-config`);
        if (configElement) {
            configElement.style.display = 'block';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#007bff'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Public method to get current settings
    getSettings() {
        return this.settings;
    }

    // Public method to update specific setting
    updateSetting(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.saveSettings();
    }
}

// Initialize settings manager
let settingsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        settingsManager = new SettingsManager();
    });
} else {
    settingsManager = new SettingsManager();
}