// Financial Calendar View Implementation

let calendarEvents = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize the calendar functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the calendar button in the header
    const calendarButton = document.getElementById('calendar-button');
    if (calendarButton) {
        calendarButton.addEventListener('click', showCalendarSection);
    }

    // Listen for the dataLoaded event to populate the calendar
    document.addEventListener('dataLoaded', () => {
        populateCalendarWithEvents();
    });
});

// Function to show the calendar section
function showCalendarSection() {
    // Hide all other sections
    const rekeningenSection = document.getElementById('rekeningen-section');
    if (rekeningenSection) rekeningenSection.style.display = 'none';
    
    const takenSection = document.getElementById('taken-section');
    if (takenSection) takenSection.style.display = 'none';
    
    const transactiesSection = document.getElementById('transacties-section');
    if (transactiesSection) transactiesSection.style.display = 'none';
    
    const mailSection = document.getElementById('mail-section');
    if (mailSection) mailSection.style.display = 'none';
    
    const saldoSection = document.getElementById('saldo-section');
    if (saldoSection) saldoSection.style.display = 'none';
    
    // Hide data section if it exists
    const dataSection = document.getElementById('data-section');
    if (dataSection) {
        dataSection.style.display = 'none';
    }
    
    // Create or show the calendar section
    let calendarSection = document.getElementById('calendar-section');
    
    if (!calendarSection) {
        // Create the calendar section if it doesn't exist
        calendarSection = document.createElement('div');
        calendarSection.id = 'calendar-section';
        calendarSection.className = 'section';
        
        // Add content to the calendar section
        calendarSection.innerHTML = `
            <h2>Financial Calendar</h2>
            <div class="calendar-controls">
                <button id="prev-month">Previous Month</button>
                <h3 id="current-month-display"></h3>
                <button id="next-month">Next Month</button>
            </div>
            <div class="calendar-container">
                <div class="calendar-header">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>
                <div id="calendar-grid" class="calendar-grid">
                    <!-- Calendar days will be generated here -->
                </div>
            </div>
            <div id="day-details" class="day-details">
                <h3>Events for <span id="selected-date"></span></h3>
                <div id="day-events-list">
                    <!-- Events for the selected day will be displayed here -->
                </div>
            </div>
        `;
        
        // Append the calendar section to the main container
        document.querySelector('main').appendChild(calendarSection);
        
        // Add event listeners for calendar controls
        document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
    }
    
    // Show the calendar section
    calendarSection.style.display = 'block';
    
    // Generate the calendar for the current month
    generateCalendar(currentMonth, currentYear);
    
    // Update the active button in the header
    updateActiveHeaderButton('calendar-button');
}

// Function to update the active header button
function updateActiveHeaderButton(activeButtonId) {
    // Remove active class from all header buttons
    const headerButtons = document.querySelectorAll('header button');
    headerButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to the current button
    const activeButton = document.getElementById(activeButtonId);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Function to generate the calendar for a given month and year
function generateCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthDisplay = document.getElementById('current-month-display');
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Set the month and year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create calendar days
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        // Check if there are events for this day
        const eventsForDay = getEventsForDay(year, month, day);
        if (eventsForDay.length > 0) {
            dayCell.classList.add('has-events');
            
            // Add event indicators
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            eventIndicator.textContent = eventsForDay.length;
            dayCell.appendChild(eventIndicator);
        }
        
        // Add click event to show details for the day
        dayCell.addEventListener('click', () => showDayDetails(year, month, day));
        
        calendarGrid.appendChild(dayCell);
    }
}

// Function to navigate to previous or next month
function navigateMonth(direction) {
    // Update current month and year
    currentMonth += direction;
    
    // Adjust year if needed
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    // Regenerate the calendar
    generateCalendar(currentMonth, currentYear);
}

// Function to populate the calendar with events from bills, tasks, and payment arrangements
function populateCalendarWithEvents() {
    // Clear existing events
    calendarEvents = [];
    
    // Add bills to calendar events
    if (currentData && Array.isArray(currentData)) {
        currentData.forEach(bill => {
            if (bill.Betaaldatum) {
                calendarEvents.push({
                    date: new Date(bill.Betaaldatum),
                    title: bill.Rekening,
                    amount: bill.Bedrag,
                    type: 'bill',
                    status: bill.Status
                });
            }
            
            // If there's a next payment date, add it too
            if (bill.Volgende) {
                calendarEvents.push({
                    date: new Date(bill.Volgende),
                    title: bill.Rekening,
                    amount: bill.Bedrag,
                    type: 'upcoming-bill',
                    status: 'Upcoming'
                });
            }
        });
    }
    
    // Add tasks to calendar events
    if (window.tasks && Array.isArray(window.tasks)) {
        window.tasks.forEach(task => {
            if (task.Afspraakdatum) {
                calendarEvents.push({
                    date: new Date(task.Afspraakdatum),
                    title: task.Taak,
                    type: 'task',
                    status: task.Status
                });
            }
        });
    }
    
    // Add payment arrangements to calendar events
    if (window.paymentArrangements && Array.isArray(window.paymentArrangements)) {
        window.paymentArrangements.forEach(arrangement => {
            if (arrangement.Volgende) {
                calendarEvents.push({
                    date: new Date(arrangement.Volgende),
                    title: arrangement.Rekening,
                    amount: arrangement.Bedrag,
                    type: 'payment-arrangement',
                    status: 'Upcoming'
                });
            }
        });
    }
    
    // If the calendar is currently visible, refresh it
    if (document.getElementById('calendar-section') && 
        document.getElementById('calendar-section').style.display === 'block') {
        generateCalendar(currentMonth, currentYear);
    }
}

// Function to get events for a specific day
function getEventsForDay(year, month, day) {
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);
    
    return calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === targetDate.getTime();
    });
}

// Function to show details for a selected day
function showDayDetails(year, month, day) {
    const selectedDate = document.getElementById('selected-date');
    const dayEventsList = document.getElementById('day-events-list');
    
    // Format the date
    const date = new Date(year, month, day);
    selectedDate.textContent = date.toLocaleDateString();
    
    // Clear previous events
    dayEventsList.innerHTML = '';
    
    // Get events for the selected day
    const eventsForDay = getEventsForDay(year, month, day);
    
    if (eventsForDay.length === 0) {
        dayEventsList.innerHTML = '<p>No events for this day.</p>';
        return;
    }
    
    // Create event elements
    eventsForDay.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${event.type}`;
        
        let eventContent = `<h4>${event.title}</h4>`;
        
        if (event.amount) {
            eventContent += `<p>Amount: €${parseFloat(event.amount).toFixed(2)}</p>`;
        }
        
        eventContent += `<p>Type: ${formatEventType(event.type)}</p>`;
        eventContent += `<p>Status: ${event.status}</p>`;
        
        eventElement.innerHTML = eventContent;
        dayEventsList.appendChild(eventElement);
    });
}

// Helper function to format event type for display
function formatEventType(type) {
    switch (type) {
        case 'bill':
            return 'Bill';
        case 'upcoming-bill':
            return 'Upcoming Bill';
        case 'task':
            return 'Task';
        case 'payment-arrangement':
            return 'Payment Arrangement';
        default:
            return type;
    }
}

// Make functions globally accessible
window.showCalendarSection = showCalendarSection;
window.populateCalendarWithEvents = populateCalendarWithEvents;