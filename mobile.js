/**
 * Mobile App Version functionality
 * Handles mobile-specific features and responsive behavior
 */

// Initialize mobile functionality
function initMobile() {
    // Check if we're on a mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        initBottomNavigation();
        createMobileActionButton();
        adjustTableColumnsForMobile();
        addSwipeGestures();
        hideDesktopButtons();
        addPullToRefresh();
        enableOfflineMode();
    }
    
    // Listen for window resize to handle orientation changes
    window.addEventListener('resize', handleResize);
    
    // Add PWA install button
    addInstallButton();
}

// Hide desktop buttons when in mobile view
function hideDesktopButtons() {
    // Hide all header buttons in mobile view
    const headerButtons = document.querySelectorAll('header h2 button');
    headerButtons.forEach(button => {
        button.style.display = 'none';
    });
}

// Initialize bottom navigation functionality
function initBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const sidebarItems = document.querySelectorAll('.sidebar .nav-item');
    
    // Handle bottom navigation clicks
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            
            // Remove active class from all bottom nav items
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Sync with sidebar navigation
            sidebarItems.forEach(sidebarItem => sidebarItem.classList.remove('active'));
            const correspondingSidebarItem = document.querySelector(`.sidebar .nav-item[data-page="${page}"]`);
            if (correspondingSidebarItem) {
                correspondingSidebarItem.classList.add('active');
            }
            
            // Navigate to the page
            if (typeof app !== 'undefined' && app.showPage) {
                app.showPage(page);
            } else if (typeof window.showPage === 'function') {
                window.showPage(page);
            }
            
            // Add haptic feedback for iOS devices
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
    
    // Sync sidebar clicks with bottom navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            const correspondingBottomNavItem = document.querySelector(`.bottom-nav-item[data-page="${page}"]`);
            if (correspondingBottomNavItem) {
                bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
                correspondingBottomNavItem.classList.add('active');
            }
        });
    });
}

// Create bottom navigation bar for mobile (legacy function - keeping for compatibility)
function createMobileNavigation() {
    // This function is now handled by the HTML structure and initBottomNavigation
    console.log('Mobile navigation initialized via bottom nav');
}

// Create floating action button for quick actions
function createMobileActionButton() {
    // Create the main action button
    const actionButton = document.createElement('div');
    actionButton.className = 'mobile-action-button';
    actionButton.innerHTML = '<i class="fas fa-plus"></i>';
    
    // Add to DOM
    document.body.appendChild(actionButton);
    
    // Handle button click
    actionButton.addEventListener('click', function() {
        const actionMenu = document.querySelector('.mobile-action-menu');
        
        if (actionMenu) {
            actionMenu.classList.toggle('show');
        } else {
            createMobileActionMenu();
        }
    });
}

// Create mobile action menu
function createMobileActionMenu() {
    const actionMenu = document.createElement('div');
    actionMenu.className = 'mobile-action-menu show';
    
    // Define action items
    const actionItems = [
        { id: 'new-bill', icon: 'fa-file-invoice-dollar', text: 'New Bill' },
        { id: 'new-task', icon: 'fa-tasks', text: 'New Task' },
        { id: 'new-payment', icon: 'fa-money-bill-wave', text: 'New Payment' }
    ];
    
    // Create action items
    actionItems.forEach(item => {
        const actionItem = document.createElement('div');
        actionItem.className = 'mobile-action-item';
        actionItem.id = `mobile-action-${item.id}`;
        
        actionItem.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <span>${item.text}</span>
        `;
        
        actionItem.addEventListener('click', () => {
            handleMobileAction(item.id);
            actionMenu.classList.remove('show');
        });
        
        actionMenu.appendChild(actionItem);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!actionMenu.contains(e.target) && !document.querySelector('.mobile-action-button').contains(e.target)) {
            actionMenu.classList.remove('show');
        }
    });
    
    document.body.appendChild(actionMenu);
}

// Handle mobile action button clicks
function handleMobileAction(action) {
    // Map action IDs to button IDs
    const actionToButtonMap = {
        'new-bill': 'add-rekening-button',
        'new-task': 'add-task-button',
        'new-payment': 'add-payment-arrangement-button'
    };
    
    // Get the button ID for the action
    const buttonId = actionToButtonMap[action];
    
    // Click the button if it exists
    if (buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.click();
        }
    }
}

// Navigate to a specific section
function navigateToSection(section) {
    // Use the app's showPage method directly
    if (typeof app !== 'undefined' && app.showPage) {
        app.showPage(section);
    } else if (typeof window.showPage === 'function') {
        window.showPage(section);
    }
    
    // Close any open menus
    const mobileMoreMenu = document.getElementById('mobile-more-menu');
    if (mobileMoreMenu) mobileMoreMenu.style.display = 'none';
    
    const mobileActionMenu = document.querySelector('.mobile-action-menu');
    if (mobileActionMenu && mobileActionMenu.classList.contains('show')) {
        mobileActionMenu.classList.remove('show');
    }
    
    // Update active state in navigation
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Toggle mobile 'More' menu
function toggleMobileMoreMenu() {
    // Remove existing menu if it exists
    const existingMenu = document.getElementById('mobile-more-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Create more menu
    const moreMenu = document.createElement('div');
    moreMenu.id = 'mobile-more-menu';
    moreMenu.className = 'mobile-action-menu show';
    moreMenu.style.bottom = '70px'; // Position above nav bar
    moreMenu.style.right = '10px';
    
    // Define more menu items
    const moreItems = [
        { id: 'mail', icon: 'fa-envelope', text: 'Mail', section: 'mail' },
        { id: 'data', icon: 'fa-database', text: 'Data', section: 'data' },
        { id: 'changes', icon: 'fa-exchange-alt', text: 'Changes', section: 'changes' },
        { id: 'saldo', icon: 'fa-wallet', text: 'Saldo', section: 'saldo' },
        { id: 'import-bills', icon: 'fa-file-import', text: 'Import Bills', action: 'import-bills' },
        { id: 'export-bills', icon: 'fa-file-export', text: 'Export Bills', action: 'export-bills' }
    ];
    
    // Create more menu items
    moreItems.forEach(item => {
        const moreItem = document.createElement('a');
        moreItem.className = 'mobile-action-item';
        moreItem.id = `mobile-more-${item.id}`;
        moreItem.href = '#';
        
        moreItem.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <span>${item.text}</span>
        `;
        
        moreItem.addEventListener('click', function(e) {
            e.preventDefault();
            moreMenu.remove();
            
            if (item.section) {
                navigateToSection(item.section);
            } else if (item.action) {
                handleMoreMenuSelection(item.action);
            }
        });
        
        moreMenu.appendChild(moreItem);
    });
    
    document.body.appendChild(moreMenu);
    
    // Close when clicking outside
    document.addEventListener('click', function closeMoreMenu(e) {
        if (!moreMenu.contains(e.target) && e.target.id !== 'mobile-nav-more' && !e.target.closest('#mobile-nav-more')) {
            moreMenu.remove();
            document.removeEventListener('click', closeMoreMenu);
        }
    });
}

// Handle selections from the more menu
function handleMoreMenuSelection(section) {
    // Map sections to button IDs
    const sectionToButtonMap = {
        'mail': 'mail-button',
        'data': 'data-button',
        'changes': 'transacties-button',
        'saldo': 'saldo-button'
    };
    
    // Handle section navigation
    if (sectionToButtonMap[section]) {
        const button = document.getElementById(sectionToButtonMap[section]);
        if (button) {
            button.click();
        }
    } else {
        // Handle special actions
        switch(section) {
            case 'import-bills':
                // Trigger Bills import functionality
                const importBillsButton = document.getElementById('import-rekeningen-button');
                if (importBillsButton) importBillsButton.click();
                break;
            case 'export-bills':
                // Trigger Bills export functionality
                const exportBillsButton = document.getElementById('export-rekeningen-button');
                if (exportBillsButton) exportBillsButton.click();
                break;
        }
    }
}

// Adjust table columns for mobile view
function adjustTableColumnsForMobile() {
    // Add mobile-hide class to less important columns
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        // Skip tables with few columns
        if (headers.length <= 3) return;
        
        // Identify less important columns (customize based on your tables)
        const lessImportantIndices = [];
        
        headers.forEach((header, index) => {
            const text = header.textContent.trim().toLowerCase();
            
            // For very small screens, hide status column (keep bill name with actions, due date)
            if (text === 'status') {
                header.classList.add('mobile-hide-small');
                
                // Add class to all cells in this column
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > index) {
                        cells[index].classList.add('mobile-hide-small');
                    }
                });
            }
            
            // Add mobile-hide class to less important columns
            if (lessImportantIndices.includes(index)) {
                header.classList.add('mobile-hide');
                
                // Add class to all cells in this column
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > index) {
                        cells[index].classList.add('mobile-hide');
                    }
                });
            }
        });
    });
}

// Add swipe gestures for mobile navigation
function addSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let validSwipeStart = false;
    let isScrolling = false;
    
    // The main sections in order
    const sections = ['bills', 'tasks', 'calendar', 'documents'];
    
    // Use passive listeners for better performance
    document.addEventListener('touchstart', function(e) {
        // Only allow navigation swipes from specific safe areas
        const target = e.target;
        const isInTable = target.closest('table') || target.closest('tr') || target.closest('td');
        const isInActionButtons = target.closest('.action-buttons');
        const isInModal = target.closest('.modal');
        const isInScrollableArea = target.closest('.transactions-list') || target.closest('.transaction-body') || target.closest('.page-content');
        
        // Don't handle swipes that start in tables, action buttons, modals, or scrollable areas
        if (isInTable || isInActionButtons || isInModal || isInScrollableArea) {
            validSwipeStart = false;
            return;
        }
        
        // Only handle swipes from navigation area or main content headers
        const isFromNav = target.closest('.mobile-nav') || target.closest('.mobile-action-button');
        const isFromHeader = target.closest('h1') || target.closest('h2') || target.closest('.section-header');
        const isFromEmptyArea = target === document.body || target.closest('.section') === target.closest('section');
        
        if (isFromNav || isFromHeader || isFromEmptyArea) {
            validSwipeStart = true;
            isScrolling = false;
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        } else {
            validSwipeStart = false;
        }
    }, { passive: true });
    
    // Add touchmove to detect scrolling
    document.addEventListener('touchmove', function(e) {
        if (!validSwipeStart) return;
        
        const currentX = e.changedTouches[0].screenX;
        const currentY = e.changedTouches[0].screenY;
        const deltaX = Math.abs(currentX - touchStartX);
        const deltaY = Math.abs(currentY - touchStartY);
        
        // If vertical movement is greater than horizontal, it's scrolling
        if (deltaY > deltaX && deltaY > 10) {
            isScrolling = true;
            validSwipeStart = false;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (!validSwipeStart || isScrolling) {
            validSwipeStart = false;
            isScrolling = false;
            return;
        }
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
        validSwipeStart = false;
        isScrolling = false;
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 120; // Increased minimum distance for a swipe
        const maxVerticalMovement = 80; // Maximum vertical movement allowed
        
        const horizontalDistance = Math.abs(touchEndX - touchStartX);
        const verticalDistance = Math.abs(touchEndY - touchStartY);
        
        // Only process if it's primarily horizontal movement
        if (verticalDistance > maxVerticalMovement) return;
        if (horizontalDistance < swipeThreshold) return;
        if (verticalDistance > horizontalDistance * 0.5) return; // Ensure it's more horizontal than vertical
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next section
            navigateToNextSection(1);
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - go to previous section
            navigateToNextSection(-1);
        }
    }
    
    function navigateToNextSection(direction) {
        // Find current active section
        const activeNavItem = document.querySelector('.mobile-nav-item.active');
        if (!activeNavItem) return;
        
        const currentSection = activeNavItem.getAttribute('data-section');
        const currentIndex = sections.indexOf(currentSection);
        
        if (currentIndex === -1) return;
        
        // Calculate next section index with wrapping
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = sections.length - 1;
        if (nextIndex >= sections.length) nextIndex = 0;
        
        // Navigate to the next section
        navigateToSection(sections[nextIndex]);
    }
}

// Handle window resize events
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileActionButton = document.querySelector('.mobile-action-button');
    
    if (isMobile) {
        // Ensure mobile elements exist
        if (!mobileNav) createMobileNavigation();
        if (!mobileActionButton) createMobileActionButton();
        adjustTableColumnsForMobile();
        hideDesktopButtons();
    } else {
        // Remove mobile elements if window is resized to desktop
        if (mobileNav) mobileNav.remove();
        if (mobileActionButton) mobileActionButton.remove();
        
        const mobileActionMenu = document.querySelector('.mobile-action-menu');
        if (mobileActionMenu) mobileActionMenu.remove();
        
        const mobileMoreMenu = document.getElementById('mobile-more-menu');
        if (mobileMoreMenu) mobileMoreMenu.remove();
        
        // Reset any mobile-specific styles
        document.querySelectorAll('.mobile-hide, .mobile-hide-small').forEach(el => {
            el.classList.remove('mobile-hide', 'mobile-hide-small');
        });
        
        // Show desktop buttons again
        const headerButtons = document.querySelectorAll('header h2 button');
        headerButtons.forEach(button => {
            button.style.display = '';
        });
    }
}

// Add PWA install button
function addInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'install-btn';
    installBtn.className = 'btn btn-primary install-btn';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
    installBtn.style.display = 'none';
    
    const header = document.querySelector('.top-header');
    if (header) {
        header.appendChild(installBtn);
    }
}

// Add pull to refresh functionality
function addPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    const threshold = 100;
    
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'pull-refresh-indicator';
    refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Pull to refresh';
    refreshIndicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: #4facfe;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 1000;
        transition: top 0.3s ease;
    `;
    document.body.appendChild(refreshIndicator);
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0 && startY > 0) {
            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0) {
                e.preventDefault();
                refreshIndicator.style.top = Math.min(pullDistance - 60, 10) + 'px';
                
                if (pullDistance > threshold) {
                    refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Release to refresh';
                }
            }
        }
    }, { passive: false }); // Explicitly non-passive since we use preventDefault
    
    document.addEventListener('touchend', () => {
        if (pullDistance > threshold) {
            refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            // Trigger refresh
            if (window.app && window.app.loadInitialData) {
                window.app.loadInitialData().then(() => {
                    refreshIndicator.style.top = '-60px';
                    setTimeout(() => {
                        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Pull to refresh';
                    }, 300);
                }).catch(() => {
                    // Fallback if loadInitialData fails
                    refreshIndicator.style.top = '-60px';
                    setTimeout(() => {
                        refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Pull to refresh';
                    }, 300);
                });
            } else {
                // Fallback refresh
                setTimeout(() => {
                    refreshIndicator.style.top = '-60px';
                    refreshIndicator.innerHTML = '<i class="fas fa-sync-alt"></i> Pull to refresh';
                }, 1000);
            }
        } else {
            refreshIndicator.style.top = '-60px';
        }
        
        startY = 0;
        pullDistance = 0;
    }, { passive: true });
}

// Enable offline mode functionality
function enableOfflineMode() {
    // Check online status
    function updateOnlineStatus() {
        const statusIndicator = document.getElementById('offline-indicator') || createOfflineIndicator();
        
        if (navigator.onLine) {
            statusIndicator.style.display = 'none';
        } else {
            statusIndicator.style.display = 'block';
            statusIndicator.textContent = 'You are offline. Some features may be limited.';
        }
    }
    
    function createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            text-align: center;
            padding: 10px;
            z-index: 1001;
            display: none;
        `;
        document.body.appendChild(indicator);
        return indicator;
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    
    // Cache data locally for offline use
    if ('localStorage' in window) {
        const cacheData = () => {
            if (window.app && window.app.data) {
                localStorage.setItem('financialDashboard_offline', JSON.stringify({
                    bills: window.app.data.bills || [],
                    tasks: window.app.data.tasks || [],
                    timestamp: Date.now()
                }));
            }
        };
        
        // Cache data periodically
        setInterval(cacheData, 30000); // Every 30 seconds
        
        // Load cached data when offline
        if (!navigator.onLine) {
            const cachedData = localStorage.getItem('financialDashboard_offline');
            if (cachedData && window.app) {
                const data = JSON.parse(cachedData);
                window.app.data = data;
                window.app.updateStats();
            }
        }
    }
}

// Initialize mobile functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMobile);