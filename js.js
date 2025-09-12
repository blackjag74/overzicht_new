// Function to check for due dates and send notifications
function checkDueDates() {
    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    currentData.forEach(item => {
        if (item.Betaaldatum === currentDate && item.Status === "Onbetaald") {
            sendNotification(item.Rekening, item.Bedrag);
        }
    });
}

// Function to send a notification
function sendNotification(rekening, bedrag) {
    // Check if the browser supports notifications
    if (Notification.permission === "granted") {
        new Notification("Betalingsherinnering", {
            body: `De betaling voor ${rekening} van €${bedrag} is vandaag verschuldigd.`,
            icon: 'path/to/icon.png' // Optional: Add an icon for the notification
        });
    } else if (Notification.permission !== "denied") {
        // Request permission if not already denied
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Betalingsherinnering", {
                    body: `De betaling voor ${rekening} van €${bedrag} is vandaag verschuldigd.`,
                    icon: 'path/to/icon.png' // Optional: Add an icon for the notification
                });
            }
        });
    }
}

// Set up a timer to check due dates every day (86400000 milliseconds)
setInterval(checkDueDates, 86400000);

// Initial check when the page loads
checkDueDates();