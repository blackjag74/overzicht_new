// Swipe gesture functionality for Bills and Tasks
class SwipeGestures {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.activeRow = null;
        this.swipeThreshold = 15; // Minimum distance for swipe (reduced for easier detection)
        this.actionThreshold = 25; // Distance to trigger action (reduced for easier mobile use)
        this.init();
    }

    init() {
        this.attachEventListeners();
        // Re-initialize when new content is loaded
        this.observeTableChanges();
    }

    attachEventListeners() {
        // Use event delegation for dynamically created table rows
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Mouse events for desktop testing
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    observeTableChanges() {
        // Observer to detect when table content changes
        const observer = new MutationObserver(() => {
            this.resetSwipeStates();
        });

        // Observe changes in table bodies
        const tableSelectors = [
            '#unpaid-rekeningen-table-body',
            '#paid-rekeningen-table-body',
            '#taken-table-body'
        ];

        tableSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                observer.observe(element, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }

    isSwipeableRow(element) {
        // Check if the element is a table row in Bills or Tasks sections
        const row = element.closest('tr');
        if (!row) return null;

        const table = row.closest('table');
        if (!table) return null;

        const tableBody = table.querySelector('tbody');
        if (!tableBody) return null;

        const validTableIds = [
            'unpaid-rekeningen-table-body',
            'paid-rekeningen-table-body',
            'taken-table-body'
        ];

        if (validTableIds.includes(tableBody.id)) {
            return row;
        }

        return null;
    }

    handleTouchStart(e) {
        const row = this.isSwipeableRow(e.target);
        if (!row) return;

        this.startTouch(e.touches[0].clientX, e.touches[0].clientY, row);
        e.preventDefault();
    }

    handleMouseDown(e) {
        const row = this.isSwipeableRow(e.target);
        if (!row) return;

        this.startTouch(e.clientX, e.clientY, row);
        e.preventDefault();
    }

    startTouch(x, y, row) {
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
        this.isDragging = true;
        this.activeRow = row;
        
        // Add swipe class for styling
        row.classList.add('swipe-active');
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.activeRow) return;

        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
        
        this.updateSwipePosition();
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.activeRow) return;

        this.currentX = e.clientX;
        this.currentY = e.clientY;
        
        this.updateSwipePosition();
        e.preventDefault();
    }

    updateSwipePosition() {
        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        // Only allow horizontal swipes (but be more lenient with vertical movement)
        if (Math.abs(deltaY) > Math.abs(deltaX) * 2) {
            return;
        }

        // Apply transform to show swipe progress
        if (Math.abs(deltaX) > this.swipeThreshold) {
            const transform = `translateX(${deltaX}px)`;
            this.activeRow.style.transform = transform;
            
            // Add visual feedback based on swipe direction
            if (deltaX > 0) {
                this.activeRow.classList.add('swipe-right');
                this.activeRow.classList.remove('swipe-left');
            } else {
                this.activeRow.classList.add('swipe-left');
                this.activeRow.classList.remove('swipe-right');
            }
        }
    }

    handleTouchEnd(e) {
        if (this.isDragging && this.activeRow) {
            e.preventDefault();
        }
        this.endTouch();
    }

    handleMouseUp(e) {
        this.endTouch();
    }

    endTouch() {
        if (!this.isDragging || !this.activeRow) return;

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;
        
        // Only process horizontal swipes with lower threshold for better mobile experience
        const isHorizontal = Math.abs(deltaY) <= Math.abs(deltaX) * 1.5; // Allow more vertical movement
        const exceedsThreshold = Math.abs(deltaX) > this.actionThreshold;
        
        if (isHorizontal && exceedsThreshold) {
            this.executeSwipeAction(deltaX);
        }

        this.resetSwipeState();
    }

    executeSwipeAction(deltaX) {
        if (!this.activeRow) return;

        const actionButtons = this.activeRow.querySelector('.action-buttons');
        if (!actionButtons) return;

        if (deltaX > 0) {
            // Swipe right - Edit action
            const editButton = actionButtons.querySelector('button[onclick*="editRekening"], button[onclick*="editTask"], button[onclick*="editPaymentArrangement"], button[onclick*="showEditTaskModal"]');
            if (editButton) {
                editButton.click();
            }
        } else {
            // Swipe left - Delete action
            const deleteButton = actionButtons.querySelector('button[onclick*="showDeleteRekeningModal"], button[onclick*="showDeleteTaskModal"], button[onclick*="showDeletePaymentArrangementModal"], button[onclick*="deleteTask"]');
            if (deleteButton) {
                deleteButton.click();
            }
        }
    }

    resetSwipeState() {
        if (this.activeRow) {
            this.activeRow.style.transform = '';
            this.activeRow.classList.remove('swipe-active', 'swipe-left', 'swipe-right');
        }
        
        this.isDragging = false;
        this.activeRow = null;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
    }

    resetSwipeStates() {
        // Reset all rows that might have swipe states
        document.querySelectorAll('tr.swipe-active, tr.swipe-left, tr.swipe-right').forEach(row => {
            row.style.transform = '';
            row.classList.remove('swipe-active', 'swipe-left', 'swipe-right');
        });
    }
}

// Initialize swipe gestures when DOM is loaded
// Initialize swipe gestures with proper timing
function initializeSwipeGestures() {
    // Wait for mobile initialization to complete
    setTimeout(() => {
        new SwipeGestures();
    }, 100);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeSwipeGestures);

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSwipeGestures);
} else {
    initializeSwipeGestures();
}

// Re-initialize when data is loaded
document.addEventListener('dataLoaded', () => {
    setTimeout(() => {
        new SwipeGestures();
    }, 200);
});