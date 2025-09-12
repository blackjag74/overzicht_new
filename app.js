// Modern Financial Dashboard Application

class FinancialDashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarOpen = false;
        this.data = {
            bills: [],
            tasks: [],
            stats: {}
        };
        this.unreadMailCount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.showPage('dashboard');
        this.updateStats();
        this.checkResponsive();
        
        // Make showPage globally accessible for widgets
        window.showPage = (pageId) => this.showPage(pageId);
        
        // Make closeModal globally accessible for cancel buttons
        window.closeModal = () => {
            const modalOverlay = document.getElementById('modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                const allModals = modalOverlay.querySelectorAll('.modal');
                allModals.forEach(modal => {
                    modal.style.display = 'none';
                    // Reset forms in the modal
                    const forms = modal.querySelectorAll('form');
                    forms.forEach(form => {
                        form.reset();
                        // Clear any validation states
                        const inputs = form.querySelectorAll('input, select, textarea');
                        inputs.forEach(input => {
                            input.classList.remove('error', 'valid');
                        });
                    });
                });
                document.body.style.overflow = '';
            }
        };
        
        // Setup Add New button
        this.setupAddNewButton();
    }

    setupAddNewButton() {
        const addNewBtn = document.getElementById('add-new-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                this.showAddNewDropdown();
            });
        }
    }
    
    showAddNewDropdown() {
        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'add-new-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-item" onclick="app.addNewBill()">
                <i class="fas fa-file-invoice"></i> New Bill
            </div>
            <div class="dropdown-item" onclick="app.addNewTask()">
                <i class="fas fa-tasks"></i> New Task
            </div>
            <div class="dropdown-item" onclick="app.addNewPaymentArrangement()">
                <i class="fas fa-credit-card"></i> New Payment Arrangement
            </div>
        `;
        
        // Position dropdown
        const addNewBtn = document.getElementById('add-new-btn');
        const rect = addNewBtn.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = (rect.bottom + 5) + 'px';
        dropdown.style.right = '20px';
        dropdown.style.zIndex = '1000';
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ddd';
        dropdown.style.borderRadius = '8px';
        dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        dropdown.style.minWidth = '200px';
        
        // Remove existing dropdown
        const existingDropdown = document.querySelector('.add-new-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        document.body.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target) && !addNewBtn.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);
    }
    
    addNewBill() {
        const addBillBtn = document.getElementById('add-bill-btn');
        if (addBillBtn) {
            addBillBtn.click();
        } else {
            // Fallback: call showAddBillModal directly
            this.showAddBillModal();
        }
        document.querySelector('.add-new-dropdown')?.remove();
    }
    
    addNewTask() {
        // Remove dropdown first
        document.querySelector('.add-new-dropdown')?.remove();
        
        // Try to click the add task button, or call the modal directly
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.click();
        } else {
            // Fallback: call showAddTaskModal directly
            this.showAddTaskModal();
        }
    }
    
    addNewPaymentArrangement() {
        // Try multiple possible button IDs for payment arrangements
        const buttonIds = ['add-payment-arrangement-button', 'add-payment-arrangement-button-main', 'add-payment-arrangement-button-data'];
        let buttonFound = false;
        
        for (const buttonId of buttonIds) {
            const addPaymentBtn = document.getElementById(buttonId);
            if (addPaymentBtn) {
                addPaymentBtn.click();
                buttonFound = true;
                break;
            }
        }
        
        if (!buttonFound && typeof showAddPaymentArrangementModal === 'function') {
            showAddPaymentArrangementModal();
        }
        
        document.querySelector('.add-new-dropdown')?.remove();
    }

    setupEventListeners() {
        // Navigation events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                if (page) {
                    this.showPage(page);
                    this.setActiveNavItem(item);
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Modal events
        this.setupModalEvents();

        // Form events
        this.setupFormEvents();
        this.setupEditFormEvents();

        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Responsive events
        window.addEventListener('resize', () => {
            this.checkResponsive();
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && this.sidebarOpen) {
                const sidebar = document.querySelector('.sidebar');
                const sidebarToggle = document.querySelector('.sidebar-toggle');
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            this.updatePageTitle(pageId);
            this.loadPageData(pageId);
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768 && this.sidebarOpen) {
                this.closeSidebar();
            }
        }
    }

    setActiveNavItem(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    updatePageTitle(pageId) {
        const titles = {
            'dashboard': 'Dashboard',
            'bills': 'Bills Management',
            'tasks': 'Tasks & Activities',
            'calendar': 'Calendar View',
            'reports': 'Reports & Analytics',
            'settings': 'Settings'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[pageId] || 'Dashboard';
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.sidebarOpen = true;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.add('open');
        mainContent.classList.add('blurred');
        document.body.classList.add('sidebar-open');
    }

    closeSidebar() {
        this.sidebarOpen = false;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.remove('open');
        mainContent.classList.remove('blurred');
        document.body.classList.remove('sidebar-open');
    }

    checkResponsive() {
        if (window.innerWidth > 1024) {
            this.closeSidebar();
        }
    }

    // Data Management
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadBills(),
                this.loadTasks()
            ]);
            // Update stats after data is loaded
            await this.updateStats();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    async loadBills() {
        try {
            const response = await fetch(`get_rekeningen.php?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Bills data received:', data); // Debug log
            this.data.bills = data.RegularAccounts || [];
            console.log('Bills array:', this.data.bills); // Debug log
            // V2.1 - Updated to use separate table rendering functions
            this.renderUnpaidBillsTable();
            this.renderPaidBillsTable();
        } catch (error) {
            console.error('Error loading bills:', error);
            this.showToast('Error loading bills data', 'error');
            this.data.bills = [];
        }
    }

    async loadTasks() {
        try {
            const response = await fetch(`get_taken.php?t=${Date.now()}`, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.data.tasks = data.Taken || [];
            this.renderTasksTable();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showToast('Error loading tasks data', 'error');
            this.data.tasks = [];
        }
    }

    async loadPageData(pageId) {
        switch(pageId) {
            case 'dashboard':
                await this.updateDashboard();
                break;
            case 'bills':
                // V2.1 - Updated to use separate table rendering functions
            this.renderUnpaidBillsTable();
            this.renderPaidBillsTable();
                break;
            case 'tasks':
                this.renderTasksTable();
                break;
            case 'transactions':
                this.renderTransactionsPage();
                break;
            case 'calendar':
                this.renderCalendarPage();
                break;
            case 'mail':
                await this.renderMailPage();
                break;
            case 'reports':
                this.renderReportsPage();
                break;
            case 'settings':
                this.renderSettingsPage();
                break;
            case 'recent-bills':
                this.showRecentBills();
                break;
            case 'upcoming-tasks':
                this.showUpcomingTasks();
                break;
            case 'expense-overview':
                this.showExpenseOverview();
                break;
            default:
                console.log(`Page ${pageId} not implemented yet`);
        }
    }

    async updateStats() {
        try {
            // Initialize data arrays if they don't exist
            const bills = this.data.bills || [];
            const tasks = this.data.tasks || [];
            
            // Calculate stats from loaded data (will be 0 if no data)
            const unpaidBills = bills.filter(bill => bill.Status === 'Onbetaald' || !bill.Betaaldatum);
            const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
            const pendingTasks = tasks.filter(task => task.Status !== 'Klaar');
            
            // Calculate due this month
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            const dueThisMonth = bills.filter(bill => {
                if ((bill.Status === 'Onbetaald' || !bill.Betaaldatum) && bill.Volgende) {
                    const dueDate = new Date(bill.Volgende);
                    // Check if date is valid and in current month/year
                    return !isNaN(dueDate.getTime()) && 
                           dueDate.getMonth() === currentMonth && 
                           dueDate.getFullYear() === currentYear;
                }
                return false;
            });
            
            const totalDueThisMonth = dueThisMonth.reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
            
            // Calculate completed tasks this month using transaction data
            let completedThisMonth = 0;
            try {
                const transactionResponse = await fetch('get_transacties.php');
                if (transactionResponse.ok) {
                    const transactionData = await transactionResponse.json();
                    const transactions = transactionData.Transacties || [];
                    
                    // Find task completion transactions from this month
                    completedThisMonth = transactions.filter(transaction => {
                        if (transaction.taak && transaction.description === 'updated' && transaction.transaction_date) {
                            const transactionDate = new Date(transaction.transaction_date);
                            if (!isNaN(transactionDate.getTime()) && 
                                transactionDate.getMonth() === currentMonth && 
                                transactionDate.getFullYear() === currentYear) {
                                // Check if the corresponding task is now completed
                                const relatedTask = tasks.find(task => task.Taaknaam === transaction.taak);
                                return relatedTask && relatedTask.Status === 'Klaar';
                            }
                        }
                        return false;
                    }).length;
                }
            } catch (error) {
                console.error('Error fetching transaction data for completed tasks:', error);
                // Fallback: count tasks marked as completed (less accurate)
                completedThisMonth = tasks.filter(task => task.Status === 'Klaar').length;
            }
            
            this.data.stats = {
                totalUnpaid: totalUnpaid,
                unpaidCount: unpaidBills.length,
                pendingTasks: pendingTasks.length,
                totalBills: bills.length,
                dueThisMonth: dueThisMonth.length,
                totalDueThisMonth: totalDueThisMonth,
                completedThisMonth: completedThisMonth
            };

            this.renderStats();
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    renderStats() {
        const stats = this.data.stats || {};
        
        // Always show calculated values, even if they are zero
        const totalUnpaid = stats.totalUnpaid || 0;
        const totalDueThisMonth = stats.totalDueThisMonth || 0;
        const pendingTasks = stats.pendingTasks || 0;
        const completedThisMonth = stats.completedThisMonth || 0;
        
        this.updateStatCard('total-unpaid-amount', `€${totalUnpaid.toFixed(2)}`);
        this.updateStatCard('due-this-month', `€${totalDueThisMonth.toFixed(2)}`);
        this.updateStatCard('pending-tasks-stat', pendingTasks.toString());
        this.updateStatCard('completed-this-month', completedThisMonth.toString());
        
        // Update navigation badges
        this.updateNavigationBadges();
    }

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    updateNavigationBadges() {
        // Update unpaid bills count
        const unpaidBillsCount = this.data.bills.filter(bill => bill.Status === 'Onbetaald').length;
        this.updateBadge('unpaid-bills-count', unpaidBillsCount);
        
        // Update pending tasks count
        const pendingTasksCount = this.data.tasks.filter(task => task.Status !== 'Klaar').length;
        this.updateBadge('pending-tasks-count', pendingTasksCount);
        
        // Update notification count (due items within 3 days + unread mails)
        const currentDate = new Date();
        let dueItemsCount = 0;
        
        // Count due bills
        this.data.bills.forEach(bill => {
            if (bill.Status === 'Onbetaald' && bill.Betaaldatum) {
                const dueDate = new Date(bill.Betaaldatum);
                const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 3) dueItemsCount++;
            }
        });
        
        // Count due tasks
        this.data.tasks.forEach(task => {
            if (task.Status !== 'Klaar' && task.Afspraakdatum) {
                const dueDate = new Date(task.Afspraakdatum);
                const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 3) dueItemsCount++;
            }
        });
        
        // Add unread mail count to total notifications
        const totalNotifications = dueItemsCount + this.unreadMailCount;
        this.updateBadge('notification-count', totalNotifications);
        
        // Update new mail count (placeholder - will be updated when mail data is loaded)
        this.updateMailCount();
    }
    
    updateBadge(badgeId, count) {
        const badge = document.getElementById(badgeId);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }
    
    async updateMailCount() {
        try {
            const response = await fetch('get_mail.php');
            if (response.ok) {
                const mailData = await response.json();
                // Count unread mails (assuming there's a 'read' property)
                const unreadCount = mailData.filter(mail => !mail.read).length;
                this.unreadMailCount = unreadCount;
                this.updateBadge('new-mail-count', unreadCount);
                
                // Update the main notification counter to include unread mails
                this.updateMainNotificationCounter();
            }
        } catch (error) {
            console.log('Mail data not available yet');
            this.unreadMailCount = 0;
            this.updateBadge('new-mail-count', 0);
            this.updateMainNotificationCounter();
        }
    }
    
    updateMainNotificationCounter() {
        // Calculate due items within 3 days
        const currentDate = new Date();
        let dueItemsCount = 0;
        
        // Count due bills
        this.data.bills.forEach(bill => {
            if (bill.Status === 'Onbetaald' && bill.Betaaldatum) {
                const dueDate = new Date(bill.Betaaldatum);
                const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 3) dueItemsCount++;
            }
        });
        
        // Count due tasks
        this.data.tasks.forEach(task => {
            if (task.Status !== 'Klaar' && task.Afspraakdatum) {
                const dueDate = new Date(task.Afspraakdatum);
                const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
                if (daysUntilDue <= 3) dueItemsCount++;
            }
        });
        
        // Combine due items and unread mails for total notification count
        const totalNotifications = dueItemsCount + this.unreadMailCount;
        this.updateBadge('notification-count', totalNotifications);
    }

    async updateDashboard() {
        await this.updateStats();
        this.renderRecentBills();
        this.renderUpcomingTasks();
        this.renderMonthlyOverview();
        this.renderExpenseCategories();
        this.renderMonthlyTrends();
        this.updateRecentActivity();
    }

    renderRecentBills() {
        const container = document.getElementById('recent-bills-widget');
        if (!container) {
            console.warn('Recent bills widget container not found');
            return;
        }

        // Get recently paid bills (last 30 days) and new unpaid bills
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentlyPaid = this.data.bills
            .filter(bill => bill.Betaaldatum && new Date(bill.Betaaldatum) >= thirtyDaysAgo)
            .sort((a, b) => new Date(b.Betaaldatum) - new Date(a.Betaaldatum))
            .slice(0, 3);
            
        const newUnpaid = this.data.bills
            .filter(bill => !bill.Betaaldatum || bill.Status === 'Onbetaald')
            .sort((a, b) => new Date(a.Volgende) - new Date(b.Volgende))
            .slice(0, 2);
            
        const combinedBills = [...recentlyPaid, ...newUnpaid];

        if (combinedBills.length === 0) {
            container.innerHTML = '<p class="no-data">No recent bills to display</p>';
            return;
        }

        container.innerHTML = combinedBills.map(bill => {
            const isPaid = bill.Betaaldatum && bill.Status !== 'Onbetaald';
            return `
                <div class="bill-item ${isPaid ? 'paid' : 'unpaid'}" data-widget-click="bills" style="cursor: pointer;">
                    <div class="bill-info">
                        <h4>${bill.Rekening}</h4>
                        <p>€${parseFloat(bill.Bedrag || 0).toFixed(2)}</p>
                        <small>${isPaid ? 'Paid: ' + this.formatDate(bill.Betaaldatum) : 'Due: ' + this.formatDate(bill.Volgende)}</small>
                    </div>
                    ${!isPaid ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); app.payBill('${bill.ID || bill.id || 'unknown'}')">
                        <i class="fas fa-credit-card"></i> Pay
                    </button>` : '<span class="status-badge paid"><i class="fas fa-check"></i> Paid</span>'}
                </div>
            `;
        }).join('');
        
        // Add click-to-view-all message
        container.innerHTML += '<div class="widget-footer"><small><i class="fas fa-mouse-pointer"></i> Click any item to view all bills</small></div>';
        
        // Add event delegation for widget clicks
        container.removeEventListener('click', this.handleWidgetClick);
        container.addEventListener('click', this.handleWidgetClick.bind(this));
    }

    renderUpcomingTasks() {
        // Update both dashboard widget and main upcoming tasks container
        const widgetContainer = document.getElementById('upcoming-tasks-widget');
        const mainContainer = document.getElementById('upcoming-tasks');

        if (!widgetContainer) {
            console.warn('Upcoming tasks widget container not found');
            return;
        }

        const upcomingTasks = this.data.tasks
            .filter(task => {
                if (task.Status === 'Voltooid') return false;
                const taskDate = new Date(task.Afspraakdatum);
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return taskDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.Afspraakdatum) - new Date(b.Afspraakdatum))
            .slice(0, 5);

        // Widget content for dashboard
        if (upcomingTasks.length === 0) {
            widgetContainer.innerHTML = '<p class="no-data">No upcoming tasks</p>';
        } else {
            const widgetHtml = upcomingTasks.map(task => {
                const taskDate = new Date(task.Afspraakdatum);
                const isOverdue = taskDate < new Date();
                return `
                    <div class="widget-item ${isOverdue ? 'overdue' : ''}" data-widget-click="tasks" style="cursor: pointer;">
                        <div class="item-info">
                            <span class="item-title">${task.Taaknaam || task.Info}</span>
                            <span class="item-date">${this.formatDate(task.Afspraakdatum)}</span>
                        </div>
                        <span class="item-status status-${task.Status.toLowerCase()}">${task.Status}</span>
                    </div>
                `;
            }).join('');
            widgetContainer.innerHTML = widgetHtml + '<div class="widget-footer"><small><i class="fas fa-mouse-pointer"></i> Click any item to view all tasks</small></div>';
            
            // Add event delegation for widget clicks
            widgetContainer.removeEventListener('click', this.handleWidgetClick);
            widgetContainer.addEventListener('click', this.handleWidgetClick.bind(this));
        }
    }

    renderExpenseCategories() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        // Calculate expense categories from bills
        const categories = {};
        this.data.bills.forEach(bill => {
            const category = bill.Categorie || 'Other';
            const amount = parseFloat(bill.Bedrag || 0);
            categories[category] = (categories[category] || 0) + amount;
        });

        const sortedCategories = Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const chartHtml = `
            <h3><i class="fas fa-chart-pie"></i> Expense Categories</h3>
            <div class="category-chart">
                ${sortedCategories.map(([category, amount]) => {
                    const percentage = categories ? Math.round((amount / Object.values(categories).reduce((a, b) => a + b, 0)) * 100) : 0;
                    return `
                        <div class="category-item">
                            <div class="category-info">
                                <span class="category-name">${category}</span>
                                <span class="category-amount">€${amount.toFixed(2)}</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="category-percentage">${percentage}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        chartContainer.innerHTML = chartHtml;
    }

    renderMonthlyTrends() {
        const trendsContainer = document.querySelector('.chart-section:nth-child(2) .chart-container');
        if (!trendsContainer) return;

        // Calculate last 6 months trends
        const currentDate = new Date();
        const monthlyData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthBills = this.data.bills.filter(bill => {
                const billDate = new Date(bill.Volgende);
                return billDate.getMonth() === date.getMonth() && billDate.getFullYear() === date.getFullYear();
            });
            
            const totalAmount = monthBills.reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
            const paidAmount = monthBills.filter(bill => bill.Betaaldatum && bill.Status !== 'Onbetaald').reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
            
            monthlyData.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                total: totalAmount,
                paid: paidAmount
            });
        }

        const maxAmount = Math.max(...monthlyData.map(d => d.total));
        
        const trendsHtml = `
            <h3><i class="fas fa-chart-line"></i> Monthly Trends</h3>
            <div class="trends-chart">
                ${monthlyData.map(data => {
                    const totalHeight = maxAmount > 0 ? (data.total / maxAmount) * 100 : 0;
                    const paidHeight = maxAmount > 0 ? (data.paid / maxAmount) * 100 : 0;
                    return `
                        <div class="trend-item">
                            <div class="trend-bar">
                                <div class="trend-total" style="height: ${totalHeight}%" title="Total: €${data.total.toFixed(2)}"></div>
                                <div class="trend-paid" style="height: ${paidHeight}%" title="Paid: €${data.paid.toFixed(2)}"></div>
                            </div>
                            <span class="trend-month">${data.month}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="trends-legend">
                <div class="legend-item">
                    <span class="legend-color total"></span>
                    <span>Total Bills</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color paid"></span>
                    <span>Paid Bills</span>
                </div>
            </div>
        `;

        trendsContainer.innerHTML = trendsHtml;
    }

    // Version Control: v2.0 - Split bills table into separate paid/unpaid tables
    // Replaced single renderBillsTable() with renderUnpaidBillsTable() and renderPaidBillsTable()
    renderBillsTable() {
        // Call both separate rendering functions
        this.renderUnpaidBillsTable();
        this.renderPaidBillsTable();
    }

    renderUnpaidBillsTable() {
        const container = document.getElementById('unpaid-bills-table-body');
        if (!container) {
            console.log('Unpaid bills container not found!');
            return;
        }

        const unpaidBills = this.data.bills.filter(bill => {
            const status = bill.Status || bill.status || '';
            return status !== 'Betaald' && status !== 'Paid' && status !== 'betaald' && status !== 'paid';
        });
        console.log('Unpaid bills:', unpaidBills);

        container.innerHTML = unpaidBills.map(bill => `
            <tr>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm" onclick="app.payBill(${bill.ID || bill.id})" title="Mark as paid">
                            <i class="fas fa-credit-card"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="app.editBill(${bill.ID || bill.id})" title="Edit bill">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteBill(${bill.ID || bill.id})" title="Delete bill">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="bill-name">${bill.Rekening}</div>
                </td>
                <td>
                    <div>${this.formatDate(bill.Volgende)}</div>
                    ${this.formatDaysRemaining(bill.Volgende)}
                </td>
                <td>
                    <span class="status-badge unpaid">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${bill.Status || 'Unpaid'}
                    </span>
                </td>
            </tr>
        `).join('');

        // Show message if no unpaid bills
        if (unpaidBills.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #10b981;">
                        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <div>All bills are paid!</div>
                    </td>
                </tr>
            `;
        }
    }

    renderPaidBillsTable() {
        const container = document.getElementById('paid-bills-table-body');
        if (!container) {
            console.log('Paid bills container not found!');
            return;
        }

        const paidBills = this.data.bills.filter(bill => {
            const status = bill.Status || bill.status || '';
            return status === 'Betaald' || status === 'Paid' || status === 'betaald' || status === 'paid';
        });
        console.log('Paid bills:', paidBills);

        container.innerHTML = paidBills.map(bill => `
            <tr>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="app.unpayBill(${bill.ID || bill.id})" title="Mark as unpaid">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="app.editBill(${bill.ID || bill.id})" title="Edit bill">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteBill(${bill.ID || bill.id})" title="Delete bill">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="bill-name">${bill.Rekening}</div>
                </td>
                <td>
                    <div>${this.formatDate(bill.Volgende)}</div>
                    ${this.formatDaysRemaining(bill.Volgende)}
                </td>
                <td>
                    <span class="status-badge paid">
                        <i class="fas fa-check-circle"></i>
                        ${bill.Status}
                    </span>
                </td>
            </tr>
        `).join('');

        // Show message if no paid bills
        if (paidBills.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #9ca3af;">
                        <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                        <div>No paid bills yet</div>
                    </td>
                </tr>
            `;
        }
    }

    renderTasksTable() {
        const container = document.getElementById('tasks-table-body');
        if (!container) return;

        container.innerHTML = this.data.tasks.map(task => `
            <tr>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick="app.editTask(${task.ID || task.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteTask(${task.ID || task.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
                <td>${task.Info}</td>
                <td>${this.formatDate(task.Afspraakdatum)}</td>
                <td>
                    <span class="status-badge ${task.Status.toLowerCase()}">
                        ${task.Status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    renderMonthlyOverview() {
        const monthlyOverviewWidget = document.querySelector('.widget:nth-child(3) .widget-content');
        if (!monthlyOverviewWidget) return;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Calculate monthly statistics
        const monthlyBills = this.data.bills.filter(bill => {
            const billDate = new Date(bill.Volgende);
            return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        });

        const totalAmount = monthlyBills.reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
        const paidAmount = monthlyBills
            .filter(bill => bill.Betaaldatum && bill.Status !== 'Onbetaald')
            .reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
        const unpaidAmount = totalAmount - paidAmount;
        const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        monthlyOverviewWidget.innerHTML = `
            <div class="monthly-stats">
                <h4>${monthNames[currentMonth]} ${currentYear}</h4>
                <div class="stat-row">
                    <span class="stat-label">Total Bills:</span>
                    <span class="stat-value">€${totalAmount.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Paid:</span>
                    <span class="stat-value paid">€${paidAmount.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Unpaid:</span>
                    <span class="stat-value unpaid">€${unpaidAmount.toFixed(2)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${paidPercentage}%"></div>
                </div>
                <div class="progress-text">${paidPercentage}% paid</div>
            </div>
        `;
    }

    renderBillsTable() {
        const container = document.getElementById('bills-table-body');
        if (!container) return;

        container.innerHTML = this.data.bills.map((bill, index) => `
            <tr>
                <td>
                    <div class="action-buttons">
                        ${bill.Status === 'Onbetaald' ? 
                            `<button class="btn btn-success btn-sm" onclick="app.payBill('${bill.ID || bill.id || index}')" title="Mark as paid">
                                <i class="fas fa-credit-card"></i> Pay
                            </button>` : 
                            `<button class="btn btn-warning btn-sm" onclick="app.unpayBill('${bill.ID || bill.id || index}')" title="Mark as unpaid">
                                <i class="fas fa-undo"></i> Unpay
                            </button>`
                        }
                        <button class="btn btn-secondary btn-sm" onclick="app.editBill('${bill.ID || bill.id || index}')" title="Edit bill">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteBill('${bill.ID || bill.id || index}')" title="Delete bill">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="bill-info">
                        <strong>${bill.Rekening}</strong>
                        <div class="bill-amount">€${parseFloat(bill.Bedrag || 0).toFixed(2)}</div>
                    </div>
                </td>
                <td>${this.formatDate(bill.Volgende)}</td>
                <td>
                    <span class="status-badge ${bill.Status === 'Onbetaald' ? 'unpaid' : 'paid'}">
                        <i class="fas ${bill.Status === 'Onbetaald' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                        ${bill.Status === 'Onbetaald' ? 'Unpaid' : 'Paid'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    renderTasksTable() {
        const container = document.getElementById('tasks-table-body');
        if (!container) return;

        container.innerHTML = this.data.tasks.map((task, index) => `
            <tr>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick="app.editTask(${index})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteTask(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
                <td>${task.Info || task.Taaknaam || 'No description'}</td>
                <td>${this.formatDate(task.Afspraakdatum)}</td>
                <td>
                    <span class="status-badge ${(task.Status || 'pending').toLowerCase()}">
                        ${task.Status || 'Pending'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // Modal Management
    setupModalEvents() {
        // Close modal events
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target === element) {
                    window.closeModal();
                }
            });
        });

        // Add bill/task buttons
        const addBillBtn = document.getElementById('add-bill-btn');
        if (addBillBtn) {
            addBillBtn.addEventListener('click', () => this.showAddBillModal());
        }

        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
        }
    }

    showModal(modalId) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (modalOverlay && modal) {
            // Hide all other modals first
            const allModals = modalOverlay.querySelectorAll('.modal');
            allModals.forEach(m => {
                m.style.display = 'none';
                m.classList.remove('active');
            });
            
            // Reset and show the requested modal
            modal.style.display = 'block';
            modal.classList.add('active');
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input if available
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        } else {
            console.error(`Modal not found: ${modalId}`);
        }
    }

    closeModal(modal) {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            if (modal) {
                modal.style.display = 'none';
            }
            document.body.style.overflow = '';
        }
    }

    showAddBillModal() {
        this.showModal('add-bill-modal');
    }

    showAddTaskModal() {
        this.showModal('add-task-modal');
    }

    // Form Management
    setupFormEvents() {
        const addBillForm = document.getElementById('add-bill-form');
        if (addBillForm) {
            addBillForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddBill(new FormData(addBillForm));
            });
        }

        const addTaskForm = document.getElementById('add-task-form');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTask(new FormData(addTaskForm));
            });
        }
    }

    setupEditFormEvents() {
        const editBillForm = document.getElementById('edit-bill-form');
        if (editBillForm) {
            editBillForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditBill();
            });
        }
        
        const editTaskForm = document.getElementById('edit-task-form');
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEditTask();
            });
        }
    }

    async handleEditBill() {
        const billId = document.getElementById('edit-bill-id').value;
        const billName = document.getElementById('edit-bill-name').value;
        const amount = document.getElementById('edit-bill-amount').value;
        const dueDate = document.getElementById('edit-bill-due-date').value;
        const period = document.getElementById('edit-bill-period').value;
        const url = document.getElementById('edit-bill-url').value;
        
        // Format data to match existing PHP structure
        const formData = {
            RegularAccounts: [{
                id: parseInt(billId),
                Rekening: billName,
                Bedrag: parseFloat(amount),
                Volgende: dueDate,
                Periode: period,
                URL: url,
                Status: 'active',
                Betaaldatum: null,
                Kenmerk: ''
            }]
        };

        try {
            const response = await fetch('update_rekeningen.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showToast('Bill updated successfully!', 'success');
                window.closeModal();
                await this.loadBills();
                // V2.1 - Updated to use separate table rendering functions
                this.renderUnpaidBillsTable();
                this.renderPaidBillsTable();
                this.updateStats();
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error updating bill:', error);
            this.showToast('Error updating bill. Please try again.', 'error');
        }
    }

    async handleEditTask() {
        try {
            const taskIndex = parseInt(document.getElementById('edit-task-id').value);
            const info = document.getElementById('edit-task-info').value;
            const dueDate = document.getElementById('edit-task-due-date').value;
            const status = document.getElementById('edit-task-status').value;

            // Validate task index
            if (taskIndex >= 0 && taskIndex < this.data.tasks.length) {
                // Update the task in local data
                this.data.tasks[taskIndex] = {
                    ...this.data.tasks[taskIndex],
                    Info: info,
                    Taaknaam: info, // Update both fields for compatibility
                    Afspraakdatum: dueDate,
                    Status: status
                };

                // Try to update on server if task has an ID
                const task = this.data.tasks[taskIndex];
                if (task.ID || task.id) {
                    try {
                        const formData = new FormData();
                        formData.append('id', task.ID || task.id);
                        formData.append('info', info);
                        formData.append('afspraakdatum', dueDate);
                        formData.append('status', status);

                        const response = await fetch('update_taken.php', {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            console.warn('Server update failed, but local update succeeded');
                        }
                    } catch (serverError) {
                        console.warn('Server update failed:', serverError);
                    }
                }

                // Update UI
                this.showToast('Task updated successfully!', 'success');
                window.closeModal();
                this.updateStats();
                this.renderTasksTable();
                this.updateDashboard();
            } else {
                this.showToast('Task not found', 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Error updating task. Please try again.', 'error');
        }
    }

    async handleAddBill(formData) {
        try {
            // Since we're running on a simple HTTP server, simulate adding the bill
            const newBill = {
                id: Date.now(),
                Rekening: formData.get('rekening'),
                Bedrag: parseFloat(formData.get('bedrag')),
                Periode: formData.get('periode'),
                Status: formData.get('status') || 'Open',
                Betaaldatum: formData.get('betaaldatum') || null,
                Volgende: formData.get('volgende'),
                Kenmerk: formData.get('kenmerk') || '',
                URL: formData.get('url') || ''
            };
            
            // Add to local data
            this.data.bills.push(newBill);
            
            // Save to localStorage
            localStorage.setItem('financialDashboard_bills', JSON.stringify(this.data.bills));
            
            this.showToast('Bill added successfully', 'success');
            window.closeModal();
            await this.updateStats();
            // V2.1 - Updated to use separate table rendering functions
            this.renderUnpaidBillsTable();
            this.renderPaidBillsTable();
            this.updateDashboard();
            
            // In a real application, you would make the API call:
            /*
            const response = await fetch('new_rekening.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBill)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Handle success
                } else {
                    this.showToast(result.message || 'Error adding bill', 'error');
                }
            }
            */
        } catch (error) {
            console.error('Error adding bill:', error);
            this.showToast('Error adding bill. Please try again.', 'error');
        }
    }

    async handleAddTask(formData) {
        try {
            // Since we're running on a simple HTTP server, simulate adding the task
            const newTask = {
                id: Date.now(),
                Taaknaam: formData.get('taaknaam'),
                Afspraakdatum: formData.get('afspraakdatum'),
                Status: formData.get('status') || 'Open',
                Info: formData.get('info')
            };
            
            // Add to local data
            this.data.tasks.push(newTask);
            
            // Save to localStorage
            localStorage.setItem('financialDashboard_tasks', JSON.stringify(this.data.tasks));
            
            this.showToast('Task added successfully', 'success');
            window.closeModal();
            await this.updateStats();
            this.renderTasksTable();
            this.updateDashboard();
            
            // In a real application, you would make the API call:
            /*
            const response = await fetch('new_taken.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Handle success
                } else {
                    this.showToast(result.message || 'Error adding task', 'error');
                }
            }
            */
        } catch (error) {
            console.error('Error adding task:', error);
            this.showToast('Error adding task', 'error');
        }
    }

    // Bill Actions
    // Version Control: v2.0 - Updated to work with separate paid/unpaid tables
    // Function remains unchanged but now triggers renderBillsTable() which updates both tables
    async payBill(billId) {
        if (!confirm('Mark this bill as paid?')) return;

        try {
            const response = await fetch('pay_bill.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: billId, betaaldatum: new Date().toISOString().split('T')[0] })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('Bill marked as paid', 'success');
                    await this.loadBills();
                    await this.updateStats();
                } else {
                    this.showToast(result.message || 'Error paying bill', 'error');
                }
            }
        } catch (error) {
            console.error('Error paying bill:', error);
            this.showToast('Error paying bill', 'error');
        }
    }

    // Version Control: v2.0 - Updated to work with separate paid/unpaid tables
    // Function remains unchanged but now triggers renderBillsTable() which updates both tables
    async unpayBill(billId) {
        if (!confirm('Are you sure you want to mark this bill as unpaid?')) return;

        try {
            const response = await fetch('update_rekeningen.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: billId, 
                    Status: 'Onbetaald',
                    Betaaldatum: null
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('Bill marked as unpaid', 'success');
                    await this.loadBills();
                    await this.updateStats();
                    this.updateDashboard();
                    
                    // Update transactions view if currently visible
                    const transactionsPage = document.getElementById('transactions-page');
                    if (transactionsPage && !transactionsPage.classList.contains('hidden')) {
                        this.loadTransactions();
                    }
                } else {
                    this.showToast(result.message || 'Error unpaying bill', 'error');
                }
            }
        } catch (error) {
            console.error('Error unpaying bill:', error);
            this.showToast('Error unpaying bill. Please try again.', 'error');
        }
    }

    // Version Control: v2.0 - Compatible with separate paid/unpaid tables
    // Function remains unchanged, works with both table structures
    async editBill(billId) {
        const bill = this.data.bills.find(b => b.ID == billId || b.id == billId);
        if (!bill) {
            this.showToast('Bill not found', 'error');
            return;
        }

        // Populate the edit form with current bill data
        document.getElementById('edit-bill-id').value = bill.ID || bill.id;
        document.getElementById('edit-bill-name').value = bill.Rekening || '';
        document.getElementById('edit-bill-amount').value = bill.Bedrag || '';
        document.getElementById('edit-bill-due-date').value = bill.Volgende ? bill.Volgende.split(' ')[0] : '';
        document.getElementById('edit-bill-period').value = bill.Periode || 'monthly';
        document.getElementById('edit-bill-url').value = bill.URL || bill.Url || '';

        this.showModal('edit-bill-modal');
    }

    // Version Control: v2.0 - Updated to work with separate paid/unpaid tables
    // Function remains unchanged but now triggers renderBillsTable() which updates both tables
    async deleteBill(billId) {
        if (!confirm('Are you sure you want to delete this bill?')) return;

        try {
            const response = await fetch(`delete_rekeningen.php?id=${billId}`, {
                method: 'GET'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('Bill deleted successfully', 'success');
                    await this.loadBills();
                    await this.updateStats();
                } else {
                    this.showToast(result.message || 'Error deleting bill', 'error');
                }
            }
        } catch (error) {
            console.error('Error deleting bill:', error);
            this.showToast('Error deleting bill', 'error');
        }
    }

    // Task Actions
    async editTask(taskIndex) {
        const task = this.data.tasks[taskIndex];
        if (!task) {
            this.showToast('Task not found', 'error');
            return;
        }

        // Populate the edit form with current task data
        document.getElementById('edit-task-id').value = taskIndex;
        document.getElementById('edit-task-info').value = task.Info || task.Taaknaam || '';
        document.getElementById('edit-task-due-date').value = task.Afspraakdatum ? task.Afspraakdatum.split(' ')[0] : '';
        document.getElementById('edit-task-status').value = task.Status || 'Pending';

        this.showModal('edit-task-modal');
    }

    async deleteTask(taskIndex) {
        const task = this.data.tasks[taskIndex];
        if (!task) {
            this.showToast('Task not found', 'error');
            return;
        }

        if (!confirm(`Are you sure you want to delete the task "${task.Taaknaam || task.Info || 'this task'}"?`)) return;

        try {
            // If task has an ID field, use it; otherwise use the task name for deletion
            const taskId = task.ID || task.id || task.Taaknaam;
            const response = await fetch(`delete_taken.php?id=${encodeURIComponent(taskId)}`, {
                method: 'GET'
            });

            if (response.ok) {
                const responseText = await response.text();
                try {
                    const result = JSON.parse(responseText);
                    if (result.success) {
                        this.showToast('Task deleted successfully', 'success');
                        await this.loadTasks();
                        await this.updateStats();
                    } else {
                        this.showToast(result.message || 'Error deleting task', 'error');
                    }
                } catch (jsonError) {
                    console.error('Invalid JSON response:', responseText);
                    // If JSON parsing fails but HTTP status is OK, assume deletion worked
                    this.showToast('Task deleted successfully', 'success');
                    await this.loadTasks();
                    await this.updateStats();
                }
            } else {
                this.showToast(`Server error: ${response.status} ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showToast('Error deleting task', 'error');
        }
    }

    // Search functionality
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearch();
            return;
        }

        const searchResults = {
            bills: this.data.bills.filter(bill => 
                bill.Rekening.toLowerCase().includes(query.toLowerCase()) ||
                bill.Bedrag.toString().includes(query)
            ),
            tasks: this.data.tasks.filter(task => 
                task.Info.toLowerCase().includes(query.toLowerCase())
            )
        };

        this.displaySearchResults(searchResults);
    }

    clearSearch() {
        // Reset to original data display
        // V2.1 - Updated to use separate table rendering functions
        this.renderUnpaidBillsTable();
        this.renderPaidBillsTable();
        this.renderTasksTable();
    }

    displaySearchResults(results) {
        // Update tables with filtered results
        const originalBills = this.data.bills;
        const originalTasks = this.data.tasks;
        
        this.data.bills = results.bills;
        this.data.tasks = results.tasks;
        
        // V2.1 - Updated to use separate table rendering functions
        this.renderUnpaidBillsTable();
        this.renderPaidBillsTable();
        this.renderTasksTable();
        
        // Restore original data
        this.data.bills = originalBills;
        this.data.tasks = originalTasks;
    }

    // Utility functions
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    // Calculate days remaining until due date with color coding
    formatDaysRemaining(dateString) {
        if (!dateString) return '';
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let text, colorClass;
        
        if (diffDays < 0) {
            // Past due
            const daysPast = Math.abs(diffDays);
            text = `${daysPast} day${daysPast === 1 ? '' : 's'} overdue`;
            colorClass = 'days-overdue';
        } else if (diffDays === 0) {
            // Due today
            text = 'Due today';
            colorClass = 'days-today';
        } else if (diffDays <= 7) {
            // Due within a week
            text = `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
            colorClass = 'days-soon';
        } else {
            // Due in the future
            text = `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
            colorClass = 'days-future';
        }
        
        return `<div class="days-remaining ${colorClass}">(${text})</div>`;
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;

        // Mock recent activity data
        const activities = [
            { type: 'payment', description: 'Paid electricity bill', amount: '€125.50', time: '2 hours ago' },
            { type: 'task', description: 'Completed budget review', time: '1 day ago' },
            { type: 'reminder', description: 'Water bill due tomorrow', time: '2 days ago' },
            { type: 'payment', description: 'Paid internet service', amount: '€89.99', time: '3 days ago' }
        ];

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.type === 'payment' ? 'credit-card' : activity.type === 'task' ? 'check-circle' : 'bell'}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-description">${activity.description}</p>
                    <span class="activity-time">${activity.time}</span>
                    ${activity.amount ? `<span class="activity-amount">${activity.amount}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Chart functionality removed as requested

    // Page render methods
    renderTransactionsPage() {
        this.showTransactions();
    }

    renderCalendarPage() {
        const container = document.querySelector('#calendar-page .content-card');
        if (container) {
            container.innerHTML = `
                <div class="calendar-controls">
                    <button id="prev-month" class="btn btn-secondary">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="current-month"></h3>
                    <button id="next-month" class="btn btn-secondary">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div id="calendar-grid" class="calendar-grid"></div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #ef4444;"></span>
                        <span>Overdue Bills</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #f59e0b;"></span>
                        <span>Due Soon</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #10b981;"></span>
                        <span>Tasks</span>
                    </div>
                </div>
            `;
            
            // Initialize calendar functionality
            this.initializeCalendar();
        }
    }
    
    initializeCalendar() {
        // Use existing calendar.js functionality if available
        if (typeof generateCalendar === 'function') {
            generateCalendar();
            if (typeof populateCalendarWithEvents === 'function') {
                populateCalendarWithEvents();
            }
        } else {
            // Fallback calendar implementation
            this.generateBasicCalendar();
        }
        
        // Setup navigation
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.navigateMonth(-1);
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            this.navigateMonth(1);
        });
    }
    
    generateBasicCalendar() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        this.displayMonth(currentYear, currentMonth);
    }
    
    displayMonth(year, month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const monthHeader = document.getElementById('current-month');
        if (monthHeader) {
            monthHeader.textContent = `${monthNames[month]} ${year}`;
        }
        
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let html = '<div class="calendar-header">';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            html += `<div class="day-header">${day}</div>`;
        });
        html += '</div><div class="calendar-body">';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const events = this.getEventsForDate(date);
            
            html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">`;
            html += `<span class="day-number">${day}</span>`;
            
            if (events.length > 0) {
                html += '<div class="day-events">';
                events.slice(0, 3).forEach(event => {
                    html += `<div class="event ${event.type}" title="${event.title}">${event.title}</div>`;
                });
                if (events.length > 3) {
                    html += `<div class="event-more">+${events.length - 3} more</div>`;
                }
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        calendarGrid.innerHTML = html;
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    getEventsForDate(date) {
        const events = [];
        const dateStr = date.toISOString().split('T')[0];
        
        // Add bills due on this date
        if (this.data.bills) {
            this.data.bills.forEach(bill => {
                const billDueDate = bill.Volgende || bill.Betaaldatum;
                if (billDueDate && billDueDate.startsWith(dateStr)) {
                    const isOverdue = new Date(billDueDate) < new Date() && bill.Status === 'Onbetaald';
                    events.push({
                        type: 'bill',
                        status: bill.Status === 'Onbetaald' ? (isOverdue ? 'overdue' : 'unpaid') : 'paid',
                        title: bill.Rekening || 'Unknown Bill',
                        amount: parseFloat(bill.Bedrag || 0),
                        dueDate: billDueDate,
                        priority: bill.Status === 'Onbetaald' ? (isOverdue ? 'critical' : 'high') : 'low',
                        icon: 'fa-file-invoice-dollar',
                        color: isOverdue ? '#dc2626' : (bill.Status === 'Onbetaald' ? '#ef4444' : '#10b981'),
                        data: bill
                    });
                }
            });
        }
        
        // Add tasks due on this date
        if (this.data.tasks) {
            this.data.tasks.forEach(task => {
                if (task.Afspraakdatum && task.Afspraakdatum.startsWith(dateStr)) {
                    const isCompleted = task.Status === 'Klaar' || task.Status === 'Completed';
                    const isPending = task.Status === 'Open' || task.Status === 'Pending';
                    const isOverdue = new Date(task.Afspraakdatum) < new Date() && !isCompleted;
                    
                    events.push({
                        type: 'task',
                        status: isCompleted ? 'completed' : (isOverdue ? 'overdue' : 'pending'),
                        title: task.Taaknaam || task.Info || 'Unknown Task',
                        description: task.Info || task.Taaknaam,
                        dueDate: task.Afspraakdatum,
                        priority: isCompleted ? 'low' : (isOverdue ? 'critical' : (isPending ? 'medium' : 'high')),
                        icon: 'fa-tasks',
                        color: isCompleted ? '#10b981' : (isOverdue ? '#dc2626' : (isPending ? '#f59e0b' : '#8b5cf6')),
                        data: task
                    });
                }
            });
        }
        
        // Sort events by priority and type
        events.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // If same priority, bills come first
            if (a.type !== b.type) {
                return a.type === 'bill' ? -1 : 1;
            }
            
            return 0;
        });
        
        return events;
    }
    
    navigateMonth(direction) {
        const currentMonth = document.getElementById('current-month')?.textContent;
        if (!currentMonth) return;
        
        const [monthName, year] = currentMonth.split(' ');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let monthIndex = monthNames.indexOf(monthName);
        let yearNum = parseInt(year);
        
        monthIndex += direction;
        
        if (monthIndex < 0) {
            monthIndex = 11;
            yearNum--;
        } else if (monthIndex > 11) {
            monthIndex = 0;
            yearNum++;
        }
        
        this.displayMonth(yearNum, monthIndex);
    }

    async renderMailPage() {
        const container = document.querySelector('#mail-page .content-card');
        if (container) {
            container.innerHTML = `
                <div class="mail-header">
                    <h2>Mail</h2>
                    <button class="btn btn-primary" onclick="app.showComposeModal()">
                        <i class="fas fa-plus"></i> Compose
                    </button>
                </div>
                <div class="mail-content">
                    <div id="mail-list" class="mail-list">
                        <div class="loading">Loading emails...</div>
                    </div>
                </div>
            `;
            
            await this.loadMails();
        }
    }

    async loadMails() {
        try {
            const response = await fetch('get_mail.php');
            if (response.ok) {
                const mailData = await response.json();
                this.data.mails = mailData || [];
                this.renderMailList();
            } else {
                this.showMailError('Failed to load emails');
            }
        } catch (error) {
            console.error('Error loading mails:', error);
            this.showMailError('Error loading emails');
        }
    }

    renderMailList() {
        const container = document.getElementById('mail-list');
        if (!container) return;

        if (!this.data.mails || this.data.mails.length === 0) {
            container.innerHTML = `
                <div class="no-mails">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #6b7280; margin-bottom: 1rem;"></i>
                    <p>No emails found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.data.mails.map(mail => `
            <div class="mail-item ${mail.read ? '' : 'unread'}" onclick="app.openMail(${mail.id})">
                <div class="mail-sender">
                    <strong>${mail.sender || 'Unknown Sender'}</strong>
                </div>
                <div class="mail-subject">
                    ${mail.subject || 'No Subject'}
                </div>
                <div class="mail-preview">
                    ${mail.preview || mail.body?.substring(0, 100) || 'No content'}
                </div>
                <div class="mail-date">
                    ${this.formatDate(mail.date)}
                </div>
                <div class="mail-actions">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); app.replyToMail(${mail.id})">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); app.deleteMail(${mail.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showMailError(message) {
        const container = document.getElementById('mail-list');
        if (container) {
            container.innerHTML = `
                <div class="mail-error">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 1rem;"></i>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="app.loadMails()">Retry</button>
                </div>
            `;
        }
    }

    openMail(mailId) {
        const mail = this.data.mails.find(m => m.id === mailId);
        if (mail) {
            // Mark as read
            mail.read = true;
            this.updateMailReadStatus(mailId, true);
            
            // Show mail detail modal or navigate to detail view
            this.showMailDetail(mail);
        }
    }

    showMailDetail(mail) {
        // Create and show mail detail modal
        const modalHtml = `
            <div class="modal-overlay" id="mail-detail-modal">
                <div class="modal-content mail-detail">
                    <div class="modal-header">
                        <h3>${mail.subject || 'No Subject'}</h3>
                        <button class="modal-close" onclick="app.closeModal(document.getElementById('mail-detail-modal'))">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="mail-meta">
                            <p><strong>From:</strong> ${mail.sender || 'Unknown'}</p>
                            <p><strong>Date:</strong> ${this.formatDate(mail.date)}</p>
                        </div>
                        <div class="mail-body">
                            ${mail.body || 'No content'}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.replyToMail(${mail.id})">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteMail(${mail.id}); app.closeModal(document.getElementById('mail-detail-modal'))">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.showModal('mail-detail-modal');
    }

    async updateMailReadStatus(mailId, isRead) {
        try {
            await fetch('update_mail_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: mailId, read: isRead })
            });
            
            // Update mail count badge
            this.updateMailCount();
        } catch (error) {
            console.error('Error updating mail status:', error);
        }
    }

    showComposeModal() {
        const modalHtml = `
            <div class="modal-overlay" id="compose-mail-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Compose Email</h3>
                        <button class="modal-close" onclick="app.closeModal(document.getElementById('compose-mail-modal'))">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="compose-mail-form">
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="mail-to">To:</label>
                                <input type="email" id="mail-to" name="to" required>
                            </div>
                            <div class="form-group">
                                <label for="mail-subject">Subject:</label>
                                <input type="text" id="mail-subject" name="subject" required>
                            </div>
                            <div class="form-group">
                                <label for="mail-body">Message:</label>
                                <textarea id="mail-body" name="body" rows="8" required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="app.closeModal(document.getElementById('compose-mail-modal'))">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i> Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.showModal('compose-mail-modal');
        
        // Setup form handler
        document.getElementById('compose-mail-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMail(new FormData(e.target));
        });
    }

    async handleSendMail(formData) {
        try {
            const response = await fetch('send_mail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: formData.get('to'),
                    subject: formData.get('subject'),
                    body: formData.get('body')
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('Email sent successfully', 'success');
                    window.closeModal();
                } else {
                    this.showToast(result.message || 'Error sending email', 'error');
                }
            }
        } catch (error) {
            console.error('Error sending mail:', error);
            this.showToast('Error sending email', 'error');
        }
    }

    replyToMail(mailId) {
        const mail = this.data.mails.find(m => m.id === mailId);
        if (mail) {
            this.showComposeModal();
            // Pre-fill reply fields
            setTimeout(() => {
                document.getElementById('mail-to').value = mail.sender || '';
                document.getElementById('mail-subject').value = `Re: ${mail.subject || ''}`;
                document.getElementById('mail-body').value = `\n\n--- Original Message ---\n${mail.body || ''}`;
            }, 100);
        }
    }

    async deleteMail(mailId) {
        if (!confirm('Are you sure you want to delete this email?')) return;

        try {
            const response = await fetch(`delete_mail.php?id=${mailId}`, {
                method: 'GET'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('Email deleted successfully', 'success');
                    await this.loadMails();
                    this.updateMailCount();
                } else {
                    this.showToast(result.message || 'Error deleting email', 'error');
                }
            }
        } catch (error) {
            console.error('Error deleting mail:', error);
            this.showToast('Error deleting email', 'error');
        }
     }

     showTransactions() {
         const container = document.querySelector('#transactions-page .content-card');
         if (container) {
             container.innerHTML = `
                 <div class="transactions-header">
                     <div class="transactions-title">
                         <h2><i class="fas fa-exchange-alt"></i> Transaction History</h2>
                         <p>Track all your bills, payments, and financial activities</p>
                     </div>
                     <div class="transactions-filters">
                         <div class="filter-row">
                             <div class="filter-group">
                                 <label for="transaction-type-filter">Type:</label>
                                 <select id="transaction-type-filter" class="filter-select" onchange="app.filterTransactions()">
                                     <option value="all">All Types</option>
                                     <option value="bills">Bills Only</option>
                                     <option value="tasks">Tasks Only</option>
                                     <option value="paid">Paid Items</option>
                                     <option value="unpaid">Unpaid Items</option>
                                 </select>
                             </div>
                             <div class="filter-group">
                                 <label for="transaction-period-filter">Period:</label>
                                 <select id="transaction-period-filter" class="filter-select" onchange="app.filterTransactions()">
                                     <option value="all">All Time</option>
                                     <option value="today">Today</option>
                                     <option value="week">This Week</option>
                                     <option value="month">This Month</option>
                                     <option value="quarter">This Quarter</option>
                                     <option value="year">This Year</option>
                                 </select>
                             </div>
                             <div class="filter-group">
                                 <label for="transaction-search">Search:</label>
                                 <input type="text" id="transaction-search" class="filter-input" placeholder="Search transactions..." oninput="app.filterTransactions()">
                             </div>
                         </div>
                         <div class="filter-row">
                             <div class="filter-group">
                                 <label for="date-from">From:</label>
                                 <input type="date" id="date-from" class="filter-input" onchange="app.filterTransactions()">
                             </div>
                             <div class="filter-group">
                                 <label for="date-to">To:</label>
                                 <input type="date" id="date-to" class="filter-input" onchange="app.filterTransactions()">
                             </div>
                             <button id="clear-filters-btn" class="btn btn-secondary" onclick="app.clearTransactionFilters()">Clear Filters</button>
                         </div>
                     </div>
                 </div>
                 <div class="transactions-summary">
                     <div class="summary-cards">
                         <div class="summary-card">
                             <div class="summary-icon"><i class="fas fa-list"></i></div>
                             <div class="summary-content">
                                 <h4>Total Items</h4>
                                 <span id="total-transactions">0</span>
                             </div>
                         </div>
                         <div class="summary-card">
                             <div class="summary-icon"><i class="fas fa-euro-sign"></i></div>
                             <div class="summary-content">
                                 <h4>Total Amount</h4>
                                 <span id="total-amount">€0.00</span>
                             </div>
                         </div>
                         <div class="summary-card">
                             <div class="summary-icon"><i class="fas fa-exclamation-triangle"></i></div>
                             <div class="summary-content">
                                 <h4>Unpaid</h4>
                                 <span id="unpaid-amount">€0.00</span>
                             </div>
                         </div>
                         <div class="summary-card">
                             <div class="summary-icon"><i class="fas fa-check-circle"></i></div>
                             <div class="summary-content">
                                 <h4>Completed</h4>
                                 <span id="completed-count">0</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 <div class="transactions-content">
                     <div id="transactions-list" class="transactions-list">
                         <div class="loading-spinner">
                             <i class="fas fa-spinner fa-spin"></i>
                             <span>Loading transactions...</span>
                         </div>
                     </div>
                 </div>
             `;
             
             this.loadTransactions();
             this.setupTransactionFilters();
         }
     }

     loadTransactions() {
         // Combine bills and tasks into a unified transaction list
         const transactions = [];
         
         // Add bills as transactions
         if (this.data.bills && this.data.bills.length > 0) {
             this.data.bills.forEach((bill, index) => {
                 transactions.push({
                     id: bill.ID || bill.id || `bill-${index}`,
                     type: 'bill',
                     name: bill.Rekening || 'Unknown Bill',
                     amount: parseFloat(bill.Bedrag || 0),
                     date: bill.Betaaldatum || bill.Volgende,
                     status: bill.Status === 'Onbetaald' ? 'unpaid' : 'paid',
                     category: 'Bill',
                     description: bill.Rekening,
                     originalData: bill
                 });
             });
         }
         
         // Add tasks as transactions
         if (this.data.tasks && this.data.tasks.length > 0) {
             this.data.tasks.forEach((task, index) => {
                 transactions.push({
                     id: task.ID || task.id || `task-${index}`,
                     type: 'task',
                     name: task.Taaknaam || task.Info || 'Unknown Task',
                     amount: 0, // Tasks don't have amounts
                     date: task.Afspraakdatum,
                     status: task.Status === 'Klaar' ? 'completed' : (task.Status === 'Open' ? 'pending' : task.Status?.toLowerCase() || 'pending'),
                     category: 'Task',
                     description: task.Info || task.Taaknaam,
                     originalData: task
                 });
             });
         }
         
         // Sort transactions by date (newest first)
         transactions.sort((a, b) => {
             const dateA = new Date(a.date || '1970-01-01');
             const dateB = new Date(b.date || '1970-01-01');
             return dateB - dateA;
         });
         
         this.allTransactions = transactions;
         this.updateTransactionSummary(transactions);
         this.renderTransactionsList(transactions);
     }

     renderTransactionsList(transactions) {
         const container = document.getElementById('transactions-list');
         if (!container) return;

         if (!transactions || transactions.length === 0) {
             container.innerHTML = `
                 <div class="no-transactions">
                     <div class="no-transactions-icon">
                         <i class="fas fa-receipt"></i>
                     </div>
                     <h3>No Transactions Found</h3>
                     <p>No transactions match your current filters.</p>
                     <button class="btn btn-primary" onclick="app.clearTransactionFilters()">Clear Filters</button>
                 </div>
             `;
             return;
         }

         container.innerHTML = `
             <div class="transaction-table">
                 <div class="transaction-header">
                     <div class="col-type">Type</div>
                     <div class="col-name">Name</div>
                     <div class="col-amount">Amount</div>
                     <div class="col-date">Date</div>
                     <div class="col-status">Status</div>
                     <div class="col-actions">Actions</div>
                 </div>
                 <div class="transaction-body">
                     ${transactions.map((transaction, index) => `
                         <div class="transaction-row ${transaction.status}" data-type="${transaction.type}">
                             <div class="col-type">
                                 <div class="transaction-type-badge ${transaction.type}">
                                     <i class="fas ${transaction.type === 'bill' ? 'fa-file-invoice-dollar' : 'fa-tasks'}"></i>
                                     <span>${transaction.category}</span>
                                 </div>
                             </div>
                             <div class="col-name">
                                 <div class="transaction-name">${transaction.name}</div>
                                 ${transaction.description && transaction.description !== transaction.name ? 
                                     `<div class="transaction-description">${transaction.description}</div>` : ''}
                             </div>
                             <div class="col-amount">
                                 ${transaction.amount > 0 ? `€${transaction.amount.toFixed(2)}` : '-'}
                             </div>
                             <div class="col-date">
                                 ${this.formatDate(transaction.date)}
                             </div>
                             <div class="col-status">
                                 <span class="status-badge ${transaction.status}">
                                     <i class="fas ${this.getStatusIcon(transaction.status)}"></i>
                                     ${this.formatStatus(transaction.status)}
                                 </span>
                             </div>
                             <div class="col-actions">
                                 <div class="action-buttons">
                                     ${this.getTransactionActions(transaction, index)}
                                 </div>
                             </div>
                         </div>
                     `).join('')}
                 </div>
             </div>
         `;
     }

     updateTransactionSummary(transactions) {
         const totalTransactions = transactions.length;
         const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
         const unpaidAmount = transactions.filter(t => t.status === 'unpaid').reduce((sum, t) => sum + (t.amount || 0), 0);
         const completedCount = transactions.filter(t => t.status === 'completed' || t.status === 'paid').length;
         
         const totalTransactionsEl = document.getElementById('total-transactions');
         const totalAmountEl = document.getElementById('total-amount');
         const unpaidAmountEl = document.getElementById('unpaid-amount');
         const completedCountEl = document.getElementById('completed-count');
         
         if (totalTransactionsEl) totalTransactionsEl.textContent = totalTransactions;
         if (totalAmountEl) totalAmountEl.textContent = `€${totalAmount.toFixed(2)}`;
         if (unpaidAmountEl) unpaidAmountEl.textContent = `€${unpaidAmount.toFixed(2)}`;
         if (completedCountEl) completedCountEl.textContent = completedCount;
     }

     setupTransactionFilters() {
         // Set default date range to current month
         const now = new Date();
         const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
         const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
         
         const dateFromInput = document.getElementById('date-from');
         const dateToInput = document.getElementById('date-to');
         
         if (dateFromInput) dateFromInput.value = firstDay.toISOString().split('T')[0];
         if (dateToInput) dateToInput.value = lastDay.toISOString().split('T')[0];
     }

     clearTransactionFilters() {
         document.getElementById('transaction-type-filter').value = 'all';
         document.getElementById('transaction-period-filter').value = 'all';
         document.getElementById('transaction-search').value = '';
         document.getElementById('date-from').value = '';
         document.getElementById('date-to').value = '';
         this.filterTransactions();
     }

     getStatusIcon(status) {
         const icons = {
             'paid': 'fa-check-circle',
             'unpaid': 'fa-exclamation-triangle',
             'completed': 'fa-check-circle',
             'pending': 'fa-clock',
             'planned': 'fa-calendar-alt'
         };
         return icons[status] || 'fa-question-circle';
     }

     formatStatus(status) {
         const statusMap = {
             'paid': 'Paid',
             'unpaid': 'Unpaid',
             'completed': 'Completed',
             'pending': 'Pending',
             'planned': 'Planned'
         };
         return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
     }

     getTransactionActions(transaction, index) {
         if (transaction.type === 'bill') {
             if (transaction.status === 'unpaid') {
                 return `<button class="btn btn-sm btn-primary" onclick="app.payBill('${transaction.id}')"><i class="fas fa-credit-card"></i> Pay</button>`;
             } else {
                 return `<button class="btn btn-sm btn-secondary" onclick="app.unpayBill('${transaction.id}')"><i class="fas fa-undo"></i> Unpay</button>`;
             }
         } else if (transaction.type === 'task') {
             return `
                 <button class="btn btn-sm btn-secondary" onclick="app.editTask(${index})"><i class="fas fa-edit"></i> Edit</button>
                 <button class="btn btn-sm btn-danger" onclick="app.deleteTask(${index})"><i class="fas fa-trash"></i> Delete</button>
             `;
         }
         return '';
     }

     filterTransactions() {
         if (!this.allTransactions) return;
         
         const typeFilter = document.getElementById('transaction-type-filter')?.value || 'all';
         const periodFilter = document.getElementById('transaction-period-filter')?.value || 'all';
         const searchFilter = document.getElementById('transaction-search')?.value.toLowerCase() || '';
         const dateFrom = document.getElementById('date-from')?.value;
         const dateTo = document.getElementById('date-to')?.value;
         
         let filteredTransactions = [...this.allTransactions];
         
         // Filter by type
         if (typeFilter === 'bills') {
             filteredTransactions = filteredTransactions.filter(t => t.type === 'bill');
         } else if (typeFilter === 'tasks') {
             filteredTransactions = filteredTransactions.filter(t => t.type === 'task');
         } else if (typeFilter === 'paid') {
             filteredTransactions = filteredTransactions.filter(t => t.status === 'paid' || t.status === 'completed');
         } else if (typeFilter === 'unpaid') {
             filteredTransactions = filteredTransactions.filter(t => t.status === 'unpaid' || t.status === 'pending');
         }
         
         // Filter by period
         if (periodFilter !== 'all') {
             const now = new Date();
             let startDate, endDate;
             
             switch (periodFilter) {
                 case 'today':
                     startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                     endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                     break;
                 case 'week':
                     const weekStart = now.getDate() - now.getDay();
                     startDate = new Date(now.getFullYear(), now.getMonth(), weekStart);
                     endDate = new Date(now.getFullYear(), now.getMonth(), weekStart + 7);
                     break;
                 case 'month':
                     startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                     endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                     break;
                 case 'quarter':
                     const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                     startDate = new Date(now.getFullYear(), quarterStart, 1);
                     endDate = new Date(now.getFullYear(), quarterStart + 3, 1);
                     break;
                 case 'year':
                     startDate = new Date(now.getFullYear(), 0, 1);
                     endDate = new Date(now.getFullYear() + 1, 0, 1);
                     break;
             }
             
             if (startDate && endDate) {
                 filteredTransactions = filteredTransactions.filter(t => {
                     const transactionDate = new Date(t.date);
                     return transactionDate >= startDate && transactionDate < endDate;
                 });
             }
         }
         
         // Filter by search term
         if (searchFilter) {
             filteredTransactions = filteredTransactions.filter(t => 
                 t.name.toLowerCase().includes(searchFilter) ||
                 t.description.toLowerCase().includes(searchFilter) ||
                 t.category.toLowerCase().includes(searchFilter)
             );
         }
         
         // Filter by custom date range
         if (dateFrom) {
             filteredTransactions = filteredTransactions.filter(t => {
                 const transactionDate = new Date(t.date);
                 return transactionDate >= new Date(dateFrom);
             });
         }
         
         if (dateTo) {
             filteredTransactions = filteredTransactions.filter(t => {
                 const transactionDate = new Date(t.date);
                 return transactionDate <= new Date(dateTo);
             });
         }
         
         this.updateTransactionSummary(filteredTransactions);
         this.renderTransactionsList(filteredTransactions);
     }

     showReports() {
         const container = document.querySelector('#reports-page .content-card');
         if (container) {
             container.innerHTML = `
                 <div class="reports-header">
                     <h2>Reports & Analytics</h2>
                     <div class="report-filters">
                         <select id="report-period" onchange="app.updateReports()">
                             <option value="month">This Month</option>
                             <option value="quarter">This Quarter</option>
                             <option value="year">This Year</option>
                         </select>
                     </div>
                 </div>
                 <div class="reports-content">
                     <div class="reports-grid">
                         <div class="report-card">
                             <h3>Financial Summary</h3>
                             <div id="financial-summary"></div>
                         </div>
                         <div class="report-card">
                             <h3>Payment Trends</h3>
                             <div id="payment-trends"></div>
                         </div>
                         <div class="report-card">
                             <h3>Task Completion</h3>
                             <div id="task-completion"></div>
                         </div>
                         <div class="report-card">
                             <h3>Upcoming Payments</h3>
                             <div id="upcoming-payments"></div>
                         </div>
                     </div>
                 </div>
             `;
             
             this.generateReports();
         }
     }

     generateReports() {
         this.generateFinancialSummary();
         this.generatePaymentTrends();
         this.generateTaskCompletion();
         this.generateUpcomingPayments();
     }

     generateFinancialSummary() {
         const container = document.getElementById('financial-summary');
         if (!container) return;

         const totalUnpaid = this.data.bills
             .filter(bill => bill.Status === 'Onbetaald')
             .reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);
         
         const totalPaid = this.data.bills
             .filter(bill => bill.Status !== 'Onbetaald')
             .reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0);

         container.innerHTML = `
             <div class="summary-stats">
                 <div class="stat-item">
                     <span class="stat-label">Total Unpaid</span>
                     <span class="stat-value negative">€${totalUnpaid.toFixed(2)}</span>
                 </div>
                 <div class="stat-item">
                     <span class="stat-label">Total Paid</span>
                     <span class="stat-value positive">€${totalPaid.toFixed(2)}</span>
                 </div>
                 <div class="stat-item">
                     <span class="stat-label">Total Bills</span>
                     <span class="stat-value">${this.data.bills.length}</span>
                 </div>
             </div>
         `;
     }

     generatePaymentTrends() {
         const container = document.getElementById('payment-trends');
         if (!container) return;

         // Simple trend analysis
         const currentMonth = new Date().getMonth();
         const currentYear = new Date().getFullYear();
         
         const thisMonthPayments = this.data.bills.filter(bill => {
             if (!bill.Betaaldatum) return false;
             const payDate = new Date(bill.Betaaldatum);
             return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
         });

         container.innerHTML = `
             <div class="trend-stats">
                 <p>Payments this month: ${thisMonthPayments.length}</p>
                 <p>Amount paid: €${thisMonthPayments.reduce((sum, bill) => sum + parseFloat(bill.Bedrag || 0), 0).toFixed(2)}</p>
             </div>
         `;
     }

     generateTaskCompletion() {
         const container = document.getElementById('task-completion');
         if (!container) return;

         const completedTasks = this.data.tasks.filter(task => task.Status === 'Klaar').length;
         const totalTasks = this.data.tasks.length;
         const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

         container.innerHTML = `
             <div class="completion-stats">
                 <div class="completion-rate">
                     <span class="rate-value">${completionRate}%</span>
                     <span class="rate-label">Completion Rate</span>
                 </div>
                 <p>Completed: ${completedTasks} / ${totalTasks}</p>
             </div>
         `;
     }

     generateUpcomingPayments() {
         const container = document.getElementById('upcoming-payments');
         if (!container) return;

         const currentDate = new Date();
         const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

         const upcomingBills = this.data.bills
             .filter(bill => {
                 if (bill.Status !== 'Onbetaald' || !bill.Volgende) return false;
                 const dueDate = new Date(bill.Volgende);
                 return !isNaN(dueDate.getTime()) && dueDate >= currentDate && dueDate <= nextWeek;
             })
             .sort((a, b) => new Date(a.Volgende) - new Date(b.Volgende));

         container.innerHTML = `
             <div class="upcoming-list">
                 ${upcomingBills.length > 0 ? 
                     upcomingBills.map(bill => `
                         <div class="upcoming-item">
                             <span class="bill-name">${bill.Rekening}</span>
                             <span class="bill-amount">€${parseFloat(bill.Bedrag || 0).toFixed(2)}</span>
                             <span class="bill-date">${this.formatDate(bill.Volgende)}</span>
                         </div>
                     `).join('') :
                     '<p>No upcoming payments in the next 7 days</p>'
                 }
             </div>
         `;
     }

     updateReports() {
         this.generateReports();
     }

     renderReportsPage() {
        const container = document.querySelector('#reports-page .content-card');
        if (container) {
            container.innerHTML = `
                <div class="reports-header">
                    <h2><i class="fas fa-chart-line"></i> Financial Reports & Analytics</h2>
                    <div class="reports-controls">
                        <select id="report-period" class="form-control">
                            <option value="7">Last 7 days</option>
                            <option value="30" selected>Last 30 days</option>
                            <option value="90">Last 3 months</option>
                            <option value="365">Last year</option>
                        </select>
                        <button class="btn btn-primary" onclick="dashboard.generateReports()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.exportReports()">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="reports-grid">
                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-euro-sign"></i> Financial Summary</h3>
                        </div>
                        <div id="financial-summary" class="report-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-chart-pie"></i> Expense Breakdown</h3>
                        </div>
                        <div id="expense-breakdown" class="report-content">
                            <canvas id="expense-pie-chart" width="400" height="300"></canvas>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-trending-up"></i> Payment Trends</h3>
                        </div>
                        <div id="payment-trends" class="report-content">
                            <canvas id="trends-line-chart" width="400" height="300"></canvas>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-tasks"></i> Task Completion</h3>
                        </div>
                        <div id="task-completion" class="report-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-calendar-check"></i> Upcoming Payments</h3>
                        </div>
                        <div id="upcoming-payments" class="report-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-header">
                            <h3><i class="fas fa-chart-bar"></i> Monthly Comparison</h3>
                        </div>
                        <div id="monthly-comparison" class="report-content">
                            <canvas id="monthly-bar-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <div class="reports-insights">
                    <div class="insight-card">
                        <h3><i class="fas fa-lightbulb"></i> Financial Insights</h3>
                        <div id="financial-insights" class="insights-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        this.generateReports();
    }

    renderSettingsPage() {
        const container = document.querySelector('#settings-page .content-card');
        if (container) {
            container.innerHTML = `
                <h2><i class="fas fa-cog"></i> Settings</h2>
                <div class="settings-sections">
                    <div class="settings-section">
                        <h3><i class="fas fa-credit-card"></i> Payment Arrangements (Betalingsregelingen)</h3>
                        <div class="settings-group">
                            <label for="default-payment-method">Default Payment Method:</label>
                            <select id="default-payment-method" class="form-control">
                                <option value="bank-transfer">Bank Transfer</option>
                                <option value="direct-debit">Direct Debit</option>
                                <option value="credit-card">Credit Card</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div class="settings-group">
                            <label for="payment-reminder-days">Payment Reminder (days before due):</label>
                            <input type="number" id="payment-reminder-days" class="form-control" value="3" min="1" max="30">
                        </div>
                        <div class="settings-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auto-payment" checked>
                                <span class="checkmark"></span>
                                Enable automatic payments for recurring bills
                            </label>
                        </div>
                        <div class="settings-group">
                            <label for="payment-buffer">Payment Buffer Amount (€):</label>
                            <input type="number" id="payment-buffer" class="form-control" value="50" min="0" step="10">
                            <small class="form-text">Extra amount to keep in account for unexpected charges</small>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-calendar-alt"></i> Bill Periods & Scheduling</h3>
                        <div class="settings-group">
                            <label for="default-bill-period">Default Bill Period:</label>
                            <select id="default-bill-period" class="form-control">
                                <option value="weekly">Weekly</option>
                                <option value="monthly" selected>Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div class="settings-group">
                            <label for="bill-due-day">Preferred Due Day of Month:</label>
                            <input type="number" id="bill-due-day" class="form-control" value="15" min="1" max="31">
                        </div>
                        <div class="settings-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="weekend-adjustment" checked>
                                <span class="checkmark"></span>
                                Adjust due dates that fall on weekends
                            </label>
                        </div>
                        <div class="settings-group">
                            <label for="grace-period">Grace Period (days):</label>
                            <input type="number" id="grace-period" class="form-control" value="5" min="0" max="15">
                            <small class="form-text">Days after due date before marking as overdue</small>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-bell"></i> Notifications</h3>
                        <div class="settings-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="email-notifications" checked>
                                <span class="checkmark"></span>
                                Email notifications for due bills
                            </label>
                        </div>
                        <div class="settings-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="browser-notifications" checked>
                                <span class="checkmark"></span>
                                Browser notifications
                            </label>
                        </div>
                        <div class="settings-group">
                            <label for="notification-time">Daily notification time:</label>
                            <input type="time" id="notification-time" class="form-control" value="09:00">
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3><i class="fas fa-database"></i> Data Management</h3>
                        <div class="settings-group">
                            <label for="data-retention">Data Retention Period (months):</label>
                            <select id="data-retention" class="form-control">
                                <option value="6">6 months</option>
                                <option value="12" selected>12 months</option>
                                <option value="24">24 months</option>
                                <option value="60">5 years</option>
                            </select>
                        </div>
                        <div class="settings-group">
                            <button class="btn btn-secondary" onclick="dashboard.exportData()">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                            <button class="btn btn-warning" onclick="dashboard.clearOldData()">
                                <i class="fas fa-trash-alt"></i> Clear Old Data
                            </button>
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="btn btn-primary" onclick="dashboard.saveSettings()">
                            <i class="fas fa-save"></i> Save Settings
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.resetSettings()">
                            <i class="fas fa-undo"></i> Reset to Defaults
                        </button>
                    </div>
                </div>
            `;
        }
        this.loadSettings();
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('financialDashboardSettings') || '{}');
        
        // Load payment settings
        if (settings.defaultPaymentMethod) {
            document.getElementById('default-payment-method').value = settings.defaultPaymentMethod;
        }
        if (settings.paymentReminderDays) {
            document.getElementById('payment-reminder-days').value = settings.paymentReminderDays;
        }
        if (settings.autoPayment !== undefined) {
            document.getElementById('auto-payment').checked = settings.autoPayment;
        }
        if (settings.paymentBuffer) {
            document.getElementById('payment-buffer').value = settings.paymentBuffer;
        }
        
        // Load bill period settings
        if (settings.defaultBillPeriod) {
            document.getElementById('default-bill-period').value = settings.defaultBillPeriod;
        }
        if (settings.billDueDay) {
            document.getElementById('bill-due-day').value = settings.billDueDay;
        }
        if (settings.weekendAdjustment !== undefined) {
            document.getElementById('weekend-adjustment').checked = settings.weekendAdjustment;
        }
        if (settings.gracePeriod) {
            document.getElementById('grace-period').value = settings.gracePeriod;
        }
        
        // Load notification settings
        if (settings.emailNotifications !== undefined) {
            document.getElementById('email-notifications').checked = settings.emailNotifications;
        }
        if (settings.browserNotifications !== undefined) {
            document.getElementById('browser-notifications').checked = settings.browserNotifications;
        }
        if (settings.notificationTime) {
            document.getElementById('notification-time').value = settings.notificationTime;
        }
        
        // Load data management settings
        if (settings.dataRetention) {
            document.getElementById('data-retention').value = settings.dataRetention;
        }
    }

    saveSettings() {
        const settings = {
            defaultPaymentMethod: document.getElementById('default-payment-method').value,
            paymentReminderDays: parseInt(document.getElementById('payment-reminder-days').value),
            autoPayment: document.getElementById('auto-payment').checked,
            paymentBuffer: parseFloat(document.getElementById('payment-buffer').value),
            defaultBillPeriod: document.getElementById('default-bill-period').value,
            billDueDay: parseInt(document.getElementById('bill-due-day').value),
            weekendAdjustment: document.getElementById('weekend-adjustment').checked,
            gracePeriod: parseInt(document.getElementById('grace-period').value),
            emailNotifications: document.getElementById('email-notifications').checked,
            browserNotifications: document.getElementById('browser-notifications').checked,
            notificationTime: document.getElementById('notification-time').value,
            dataRetention: parseInt(document.getElementById('data-retention').value),
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('financialDashboardSettings', JSON.stringify(settings));
        this.showToast('Settings saved successfully!', 'success');
        
        // Apply browser notifications permission if enabled
        if (settings.browserNotifications && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            localStorage.removeItem('financialDashboardSettings');
            this.renderSettingsPage();
            this.showToast('Settings reset to defaults', 'info');
        }
    }

    exportData() {
        const exportData = {
            bills: this.data.bills,
            tasks: this.data.tasks,
            settings: JSON.parse(localStorage.getItem('financialDashboardSettings') || '{}'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    clearOldData() {
        const settings = JSON.parse(localStorage.getItem('financialDashboardSettings') || '{}');
        const retentionMonths = settings.dataRetention || 12;
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
        
        if (confirm(`Are you sure you want to delete all data older than ${retentionMonths} months? This cannot be undone.`)) {
            // This would typically involve server-side cleanup
            // For now, just show a message
            this.showToast(`Data cleanup initiated for records older than ${cutoffDate.toLocaleDateString()}`, 'info');
        }
    }

    showRecentBills() {
        const content = document.querySelector('.page-content');
        if (!content) return;
        
        const recentBills = this.bills
            .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
            .slice(0, 10);
        
        content.innerHTML = `
            <div class="page-header">
                <h2>Recent Bills</h2>
            </div>
            <div class="content-card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Bill Name</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentBills.map(bill => `
                                <tr>
                                    <td>${bill.name}</td>
                                    <td>${this.formatCurrency(bill.amount)}</td>
                                    <td>${this.formatDate(bill.dueDate)}</td>
                                    <td><span class="status ${bill.status}">${bill.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="app.editBill('${bill.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="app.deleteBill('${bill.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    showUpcomingTasks() {
        const content = document.querySelector('.page-content');
        if (!content) return;
        
        const upcomingTasks = this.tasks
            .filter(task => task.status === 'pending')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 10);
        
        content.innerHTML = `
            <div class="page-header">
                <h2>Upcoming Tasks</h2>
            </div>
            <div class="content-card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${upcomingTasks.map(task => `
                                <tr>
                                    <td>${task.name}</td>
                                    <td>${this.formatDate(task.dueDate)}</td>
                                    <td><span class="status ${task.status}">${task.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="app.editTask('${task.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="app.deleteTask('${task.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    showExpenseOverview() {
        const content = document.querySelector('.page-content');
        if (!content) return;
        
        const totalExpenses = this.bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const paidExpenses = this.bills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const unpaidExpenses = this.bills.filter(bill => bill.status === 'unpaid').reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        
        content.innerHTML = `
            <div class="page-header">
                <h2>Expense Overview</h2>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-euro-sign"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.formatCurrency(totalExpenses)}</h3>
                        <p>Total Expenses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.formatCurrency(paidExpenses)}</h3>
                        <p>Paid Expenses</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.formatCurrency(unpaidExpenses)}</h3>
                        <p>Unpaid Expenses</p>
                    </div>
                </div>
            </div>
            <div class="content-card">
                <h3>Expense Breakdown by Category</h3>
                <div class="expense-categories">
                    <div class="category-item">
                        <span>Utilities</span>
                        <span>${this.formatCurrency(this.bills.filter(b => b.name.toLowerCase().includes('utility') || b.name.toLowerCase().includes('electric') || b.name.toLowerCase().includes('gas')).reduce((sum, bill) => sum + parseFloat(bill.amount), 0))}</span>
                    </div>
                    <div class="category-item">
                        <span>Insurance</span>
                        <span>${this.formatCurrency(this.bills.filter(b => b.name.toLowerCase().includes('insurance')).reduce((sum, bill) => sum + parseFloat(bill.amount), 0))}</span>
                    </div>
                    <div class="category-item">
                        <span>Other</span>
                        <span>${this.formatCurrency(this.bills.filter(b => !b.name.toLowerCase().includes('utility') && !b.name.toLowerCase().includes('electric') && !b.name.toLowerCase().includes('gas') && !b.name.toLowerCase().includes('insurance')).reduce((sum, bill) => sum + parseFloat(bill.amount), 0))}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Handle widget clicks with event delegation
    handleWidgetClick(event) {
        const target = event.target.closest('[data-widget-click]');
        if (!target) return;
        
        const widgetType = target.getAttribute('data-widget-click');
        console.log('Widget clicked:', widgetType);
        
        if (widgetType === 'bills') {
            this.showBillsFromWidget();
        } else if (widgetType === 'tasks') {
            this.showTasksFromWidget();
        }
    }

    // Widget click handlers
    showBillsFromWidget() {
        this.showPage('bills');
        // Update navigation to show bills page is active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === 'bills') {
                item.classList.add('active');
            }
        });
        
        // Filter bills to show recent and unpaid ones (same as widget logic)
        setTimeout(() => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const filteredBills = this.data.bills.filter(bill => {
                const isRecentlyPaid = bill.Betaaldatum && new Date(bill.Betaaldatum) >= thirtyDaysAgo;
                const isUnpaid = !bill.Betaaldatum || bill.Status === 'Onbetaald';
                return isRecentlyPaid || isUnpaid;
            });
            
            // Update the bills table with filtered data
            const container = document.getElementById('bills-table-body');
            if (container && filteredBills.length > 0) {
                container.innerHTML = filteredBills.map((bill, index) => `
                    <tr>
                        <td>
                            <div class="bill-info">
                                <strong>${bill.Rekening}</strong>
                                <div class="bill-amount">€${parseFloat(bill.Bedrag || 0).toFixed(2)}</div>
                            </div>
                        </td>
                        <td>${this.formatDate(bill.Volgende)}</td>
                        <td>
                            <span class="status-badge ${bill.Status === 'Onbetaald' ? 'unpaid' : 'paid'}">
                                <i class="fas ${bill.Status === 'Onbetaald' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                                ${bill.Status === 'Onbetaald' ? 'Unpaid' : 'Paid'}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                ${bill.Status === 'Onbetaald' ? 
                                    `<button class="btn btn-success btn-sm" onclick="app.payBill('${bill.ID || bill.id || index}')" title="Mark as paid">
                                        <i class="fas fa-credit-card"></i> Pay
                                    </button>` : 
                                    `<button class="btn btn-warning btn-sm" onclick="app.unpayBill('${bill.ID || bill.id || index}')" title="Mark as unpaid">
                                        <i class="fas fa-undo"></i> Unpay
                                    </button>`
                                }
                                <button class="btn btn-secondary btn-sm" onclick="app.editBill('${bill.ID || bill.id || index}')" title="Edit bill">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="app.deleteBill('${bill.ID || bill.id || index}')" title="Delete bill">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                this.showToast(`Showing ${filteredBills.length} recent and unpaid bills`, 'info');
            } else {
                this.showToast('Showing all bills', 'info');
            }
        }, 100);
    }

    showTasksFromWidget() {
        this.showPage('tasks');
        // Update navigation to show tasks page is active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === 'tasks') {
                item.classList.add('active');
            }
        });
        
        // Filter tasks to show upcoming ones (same as widget logic)
        setTimeout(() => {
            const upcomingTasks = this.data.tasks.filter(task => {
                if (task.Status === 'Voltooid') return false;
                const taskDate = new Date(task.Afspraakdatum);
                const today = new Date();
                const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return taskDate <= nextWeek;
            }).sort((a, b) => new Date(a.Afspraakdatum) - new Date(b.Afspraakdatum));
            
            // Update the tasks table with filtered data
            const container = document.getElementById('tasks-table-body');
            if (container && upcomingTasks.length > 0) {
                container.innerHTML = upcomingTasks.map((task, index) => {
                    const taskDate = new Date(task.Afspraakdatum);
                    const isOverdue = taskDate < new Date();
                    return `
                        <tr class="${isOverdue ? 'overdue' : ''}">
                            <td>${task.Taaknaam || task.Info || 'No description'}</td>
                            <td>${this.formatDate(task.Afspraakdatum)}</td>
                            <td>
                                <span class="status-badge ${task.Status.toLowerCase()}">
                                    ${task.Status}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-secondary btn-sm" onclick="app.editTask(${index})" title="Edit task">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="app.deleteTask(${index})" title="Delete task">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                this.showToast(`Showing ${upcomingTasks.length} upcoming tasks`, 'info');
            } else {
                this.showToast('Showing all tasks', 'info');
            }
        }, 100);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinancialDashboard();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinancialDashboard;
}