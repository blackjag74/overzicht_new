// Recurring Bill Auto-Detection System
class RecurringBillDetection {
    constructor() {
        this.detectionRules = this.loadDetectionRules();
        this.detectedPatterns = this.loadDetectedPatterns();
        this.init();
    }

    init() {
        this.createDetectionModal();
        this.bindEvents();
        this.startAutoDetection();
    }

    loadDetectionRules() {
        const saved = localStorage.getItem('recurring_detection_rules');
        return saved ? JSON.parse(saved) : this.getDefaultRules();
    }

    saveDetectionRules() {
        localStorage.setItem('recurring_detection_rules', JSON.stringify(this.detectionRules));
    }

    loadDetectedPatterns() {
        const saved = localStorage.getItem('detected_patterns');
        return saved ? JSON.parse(saved) : [];
    }

    saveDetectedPatterns() {
        localStorage.setItem('detected_patterns', JSON.stringify(this.detectedPatterns));
    }

    getDefaultRules() {
        return {
            namePatterns: [
                { pattern: /electricity|electric|power/i, category: 'Utilities', confidence: 0.9 },
                { pattern: /gas|heating/i, category: 'Utilities', confidence: 0.9 },
                { pattern: /water|sewer/i, category: 'Utilities', confidence: 0.9 },
                { pattern: /internet|broadband|wifi/i, category: 'Utilities', confidence: 0.8 },
                { pattern: /phone|mobile|cellular/i, category: 'Utilities', confidence: 0.8 },
                { pattern: /rent|mortgage/i, category: 'Housing', confidence: 0.95 },
                { pattern: /insurance/i, category: 'Insurance', confidence: 0.85 },
                { pattern: /netflix|spotify|subscription/i, category: 'Subscriptions', confidence: 0.9 },
                { pattern: /gym|fitness/i, category: 'Health & Fitness', confidence: 0.8 },
                { pattern: /loan|credit/i, category: 'Loans', confidence: 0.8 }
            ],
            amountThreshold: 0.1, // 10% variation allowed
            dateThreshold: 3, // 3 days variation allowed
            minOccurrences: 2, // Minimum occurrences to detect pattern
            enabled: true
        };
    }

    createDetectionModal() {
        const modal = document.createElement('div');
        modal.id = 'recurring-detection-modal';
        modal.className = 'modal';
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="modal-content" style="background: #1a1a1a; color: white; max-width: 800px;">
                <div class="modal-header">
                    <h2>Recurring Bill Detection</h2>
                    <span class="close" onclick="recurringBillDetection.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="detection-tabs">
                        <button class="tab-btn active" onclick="recurringBillDetection.showTab('detected')">Detected Patterns</button>
                        <button class="tab-btn" onclick="recurringBillDetection.showTab('rules')">Detection Rules</button>
                        <button class="tab-btn" onclick="recurringBillDetection.showTab('settings')">Settings</button>
                    </div>
                    
                    <div id="detected-tab" class="detection-tab active">
                        <h3>Detected Recurring Bills</h3>
                        <div id="detected-patterns-list"></div>
                        <button class="btn btn-primary" onclick="recurringBillDetection.runDetection()">Run Detection Now</button>
                    </div>
                    
                    <div id="rules-tab" class="detection-tab" style="display: none;">
                        <h3>Detection Rules</h3>
                        <div id="detection-rules-list"></div>
                        <button class="btn btn-primary" onclick="recurringBillDetection.addRule()">Add Rule</button>
                    </div>
                    
                    <div id="settings-tab" class="detection-tab" style="display: none;">
                        <h3>Detection Settings</h3>
                        <div class="settings-form">
                            <label>Amount Variation Threshold (%):</label>
                            <input type="number" id="amount-threshold" min="0" max="50" step="1">
                            
                            <label>Date Variation Threshold (days):</label>
                            <input type="number" id="date-threshold" min="1" max="10" step="1">
                            
                            <label>Minimum Occurrences:</label>
                            <input type="number" id="min-occurrences" min="2" max="10" step="1">
                            
                            <label>
                                <input type="checkbox" id="detection-enabled"> Enable Auto-Detection
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="recurringBillDetection.closeModal()">Close</button>
                    <button class="btn btn-primary" onclick="recurringBillDetection.saveAndClose()">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addDetectionStyles();
    }

    addDetectionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .detection-tabs {
                display: flex;
                margin-bottom: 20px;
                border-bottom: 1px solid #333;
            }
            
            .detection-tab {
                padding: 20px 0;
            }
            
            .pattern-item {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .pattern-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .pattern-name {
                font-weight: bold;
                color: #007bff;
            }
            
            .pattern-confidence {
                background: #28a745;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
            }
            
            .pattern-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .pattern-actions {
                display: flex;
                gap: 10px;
            }
            
            .rule-item {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .settings-form {
                display: grid;
                gap: 15px;
            }
            
            .settings-form label {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .settings-form input[type="number"] {
                background: #333;
                border: 1px solid #555;
                color: white;
                padding: 5px;
                border-radius: 3px;
                width: 80px;
            }
            
            .btn-create-recurring {
                background: #28a745;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }
            
            .btn-ignore {
                background: #6c757d;
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
        this.loadSettings();
        this.renderDetectedPatterns();
        this.renderDetectionRules();
        document.getElementById('recurring-detection-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('recurring-detection-modal').style.display = 'none';
    }

    showTab(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        document.querySelectorAll('.detection-tab').forEach(tab => tab.style.display = 'none');
        document.getElementById(`${type}-tab`).style.display = 'block';
    }

    loadSettings() {
        document.getElementById('amount-threshold').value = this.detectionRules.amountThreshold * 100;
        document.getElementById('date-threshold').value = this.detectionRules.dateThreshold;
        document.getElementById('min-occurrences').value = this.detectionRules.minOccurrences;
        document.getElementById('detection-enabled').checked = this.detectionRules.enabled;
    }

    renderDetectedPatterns() {
        const container = document.getElementById('detected-patterns-list');
        
        if (this.detectedPatterns.length === 0) {
            container.innerHTML = '<p>No recurring patterns detected yet. Click "Run Detection Now" to analyze your bills.</p>';
            return;
        }
        
        container.innerHTML = this.detectedPatterns.map(pattern => `
            <div class="pattern-item">
                <div class="pattern-header">
                    <span class="pattern-name">${pattern.name}</span>
                    <span class="pattern-confidence">Confidence: ${Math.round(pattern.confidence * 100)}%</span>
                </div>
                <div class="pattern-details">
                    <div><strong>Category:</strong> ${pattern.category}</div>
                    <div><strong>Frequency:</strong> ${pattern.frequency}</div>
                    <div><strong>Average Amount:</strong> $${pattern.averageAmount.toFixed(2)}</div>
                    <div><strong>Occurrences:</strong> ${pattern.occurrences}</div>
                    <div><strong>Next Expected:</strong> ${pattern.nextExpected}</div>
                    <div><strong>Last Occurrence:</strong> ${pattern.lastOccurrence}</div>
                </div>
                <div class="pattern-actions">
                    <button class="btn-create-recurring" onclick="recurringBillDetection.createRecurringBill(${pattern.id})">Create Recurring Bill</button>
                    <button class="btn-ignore" onclick="recurringBillDetection.ignorePattern(${pattern.id})">Ignore</button>
                </div>
            </div>
        `).join('');
    }

    renderDetectionRules() {
        const container = document.getElementById('detection-rules-list');
        
        container.innerHTML = this.detectionRules.namePatterns.map((rule, index) => `
            <div class="rule-item">
                <div>
                    <strong>Pattern:</strong> ${rule.pattern.source} 
                    <strong>Category:</strong> ${rule.category} 
                    <strong>Confidence:</strong> ${rule.confidence}
                </div>
                <button class="delete-schedule" onclick="recurringBillDetection.deleteRule(${index})">Delete</button>
            </div>
        `).join('');
    }

    runDetection() {
        if (!this.detectionRules.enabled) {
            this.showNotification('Auto-detection is disabled. Enable it in settings first.', 'warning');
            return;
        }

        // Get bills data
        const billsData = this.getBillsData();
        if (billsData.length < this.detectionRules.minOccurrences) {
            this.showNotification('Not enough bill data for pattern detection.', 'info');
            return;
        }

        this.detectedPatterns = this.analyzePatterns(billsData);
        this.saveDetectedPatterns();
        this.renderDetectedPatterns();
        
        this.showNotification(`Detection complete! Found ${this.detectedPatterns.length} potential recurring patterns.`, 'success');
    }

    getBillsData() {
        // Try to get bills from global variable or localStorage
        if (typeof bills !== 'undefined' && bills.length > 0) {
            return bills;
        }
        
        const saved = localStorage.getItem('bills');
        return saved ? JSON.parse(saved) : [];
    }

    analyzePatterns(billsData) {
        const patterns = [];
        const groupedBills = this.groupBillsByName(billsData);
        
        Object.entries(groupedBills).forEach(([name, bills]) => {
            if (bills.length >= this.detectionRules.minOccurrences) {
                const pattern = this.analyzeGroup(name, bills);
                if (pattern && pattern.confidence > 0.6) {
                    patterns.push(pattern);
                }
            }
        });
        
        return patterns.sort((a, b) => b.confidence - a.confidence);
    }

    groupBillsByName(bills) {
        const groups = {};
        
        bills.forEach(bill => {
            const normalizedName = this.normalizeName(bill.name);
            if (!groups[normalizedName]) {
                groups[normalizedName] = [];
            }
            groups[normalizedName].push(bill);
        });
        
        return groups;
    }

    normalizeName(name) {
        return name.toLowerCase()
            .replace(/\d+/g, '') // Remove numbers
            .replace(/[^a-z\s]/g, '') // Remove special characters
            .trim();
    }

    analyzeGroup(name, bills) {
        const amounts = bills.map(b => parseFloat(b.amount));
        const dates = bills.map(b => new Date(b.due_date));
        
        // Check amount consistency
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const amountVariation = this.calculateVariation(amounts, avgAmount);
        
        if (amountVariation > this.detectionRules.amountThreshold) {
            return null; // Too much variation in amounts
        }
        
        // Check date patterns
        const frequency = this.detectFrequency(dates);
        if (!frequency) {
            return null; // No clear frequency pattern
        }
        
        // Determine category
        const category = this.categorizeByName(name);
        
        // Calculate confidence
        const confidence = this.calculateConfidence(amountVariation, frequency, category, bills.length);
        
        return {
            id: Date.now() + Math.random(),
            name: name,
            category: category.name,
            frequency: frequency.name,
            averageAmount: avgAmount,
            occurrences: bills.length,
            confidence: confidence,
            lastOccurrence: new Date(Math.max(...dates)).toLocaleDateString(),
            nextExpected: this.calculateNextExpected(dates, frequency).toLocaleDateString(),
            bills: bills
        };
    }

    calculateVariation(values, average) {
        const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
        return Math.sqrt(variance) / average;
    }

    detectFrequency(dates) {
        if (dates.length < 2) return null;
        
        const sortedDates = dates.sort((a, b) => a - b);
        const intervals = [];
        
        for (let i = 1; i < sortedDates.length; i++) {
            const days = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
            intervals.push(days);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        // Classify frequency
        if (avgInterval >= 25 && avgInterval <= 35) {
            return { name: 'Monthly', days: 30 };
        } else if (avgInterval >= 85 && avgInterval <= 95) {
            return { name: 'Quarterly', days: 90 };
        } else if (avgInterval >= 175 && avgInterval <= 185) {
            return { name: 'Semi-Annual', days: 180 };
        } else if (avgInterval >= 360 && avgInterval <= 370) {
            return { name: 'Annual', days: 365 };
        } else if (avgInterval >= 6 && avgInterval <= 8) {
            return { name: 'Weekly', days: 7 };
        }
        
        return null;
    }

    categorizeByName(name) {
        for (const rule of this.detectionRules.namePatterns) {
            if (rule.pattern.test(name)) {
                return { name: rule.category, confidence: rule.confidence };
            }
        }
        return { name: 'Other', confidence: 0.5 };
    }

    calculateConfidence(amountVariation, frequency, category, occurrences) {
        let confidence = 0.5; // Base confidence
        
        // Amount consistency bonus
        confidence += (1 - amountVariation) * 0.3;
        
        // Frequency detection bonus
        if (frequency) {
            confidence += 0.2;
        }
        
        // Category recognition bonus
        confidence += category.confidence * 0.2;
        
        // Occurrence count bonus
        confidence += Math.min(occurrences / 10, 0.2);
        
        return Math.min(confidence, 1.0);
    }

    calculateNextExpected(dates, frequency) {
        const lastDate = new Date(Math.max(...dates));
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + frequency.days);
        return nextDate;
    }

    createRecurringBill(patternId) {
        const pattern = this.detectedPatterns.find(p => p.id === patternId);
        if (!pattern) return;
        
        // Create recurring bill object
        const recurringBill = {
            id: Date.now(),
            name: pattern.name,
            amount: pattern.averageAmount,
            category: pattern.category,
            frequency: pattern.frequency,
            next_due: pattern.nextExpected,
            auto_detected: true,
            created_at: new Date().toISOString()
        };
        
        // Save to recurring bills
        this.saveRecurringBill(recurringBill);
        
        // Remove from detected patterns
        this.detectedPatterns = this.detectedPatterns.filter(p => p.id !== patternId);
        this.saveDetectedPatterns();
        this.renderDetectedPatterns();
        
        this.showNotification(`Recurring bill "${pattern.name}" created successfully!`, 'success');
    }

    saveRecurringBill(bill) {
        const existing = JSON.parse(localStorage.getItem('recurring_bills') || '[]');
        existing.push(bill);
        localStorage.setItem('recurring_bills', JSON.stringify(existing));
    }

    ignorePattern(patternId) {
        this.detectedPatterns = this.detectedPatterns.filter(p => p.id !== patternId);
        this.saveDetectedPatterns();
        this.renderDetectedPatterns();
        this.showNotification('Pattern ignored.', 'info');
    }

    addRule() {
        const pattern = prompt('Enter regex pattern (e.g., /electricity/i):');
        const category = prompt('Enter category:');
        const confidence = parseFloat(prompt('Enter confidence (0-1):') || '0.8');
        
        if (pattern && category) {
            try {
                const regex = new RegExp(pattern.replace(/^\/|\/$|[gi]*$/g, ''), 'i');
                this.detectionRules.namePatterns.push({
                    pattern: regex,
                    category: category,
                    confidence: confidence
                });
                this.renderDetectionRules();
            } catch (e) {
                this.showNotification('Invalid regex pattern', 'error');
            }
        }
    }

    deleteRule(index) {
        if (confirm('Delete this detection rule?')) {
            this.detectionRules.namePatterns.splice(index, 1);
            this.renderDetectionRules();
        }
    }

    saveAndClose() {
        // Save settings
        this.detectionRules.amountThreshold = parseFloat(document.getElementById('amount-threshold').value) / 100;
        this.detectionRules.dateThreshold = parseInt(document.getElementById('date-threshold').value);
        this.detectionRules.minOccurrences = parseInt(document.getElementById('min-occurrences').value);
        this.detectionRules.enabled = document.getElementById('detection-enabled').checked;
        
        this.saveDetectionRules();
        this.closeModal();
        this.showNotification('Settings saved successfully!', 'success');
    }

    bindEvents() {
        // Add menu item
        const menuItem = document.createElement('li');
        menuItem.innerHTML = '<a href="#" onclick="recurringBillDetection.showModal(); return false;">Recurring Detection</a>';
        
        const menu = document.querySelector('.navbar ul');
        if (menu) {
            menu.appendChild(menuItem);
        }
    }

    startAutoDetection() {
        if (!this.detectionRules.enabled) return;
        
        // Run detection daily
        setInterval(() => {
            this.runDetection();
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        // Initial detection after 5 seconds
        setTimeout(() => {
            this.runDetection();
        }, 5000);
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
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Initialize the recurring bill detection system
let recurringBillDetection;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        recurringBillDetection = new RecurringBillDetection();
    });
} else {
    recurringBillDetection = new RecurringBillDetection();
}