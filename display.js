function displayData(data) {
    console.log("FUNCTION displayData"); // Log when the displayData function is called
    console.log("Data to display:", data); // Log the data being displayed

    const tableBody = document.getElementById('regular-accounts-table-body');
    const tableBodyUnpaid = document.getElementById('unpaid-rekeningen-table-body');
    const tableBodyPaid = document.getElementById('paid-rekeningen-table-body');


    // Set the header color
    const unpaidHeader = document.querySelector('#unpaid-rekeningen-table-body th');
    if (unpaidHeader) {
        unpaidHeader.style.backgroundColor = 'orange';
        unpaidHeader.style.color = 'white';
    }

    const paidHeader = document.querySelector('#paid-rekeningen-table-body th');
    if (paidHeader) {
        paidHeader.style.backgroundColor = 'green';
        paidHeader.style.color = 'white';
    }
    const totalBedragElement = document.getElementById('total-bedrag-value');
    let totalBedrag = 0;

    tableBodyUnpaid.innerHTML = ''; // Clear existing rows
    tableBodyPaid.innerHTML = ''; // Clear existing rows
    tableBody.innerHTML = ''; // Clear existing rows

    // Sort the data based on Betaaldatum in descending order
    data.forEach((item, index) => {
        const row = document.createElement('tr');

        const currentDate = new Date();
        
        const paymentPeriod = item.Periode;

        const betaaldatum = new Date(item.Betaaldatum);

      
        
            // Use the Volgende field from database as the next due date
            let nextDueDate = null;
            if (item.Volgende) {
                nextDueDate = new Date(item.Volgende);
                // Validate the date
                if (isNaN(nextDueDate.getTime())) {
                    nextDueDate = null;
                }
            }

    // Compare dates properly using time values instead of loose equality
        if (nextDueDate && betaaldatum && betaaldatum.getTime() === nextDueDate.getTime()) {
            item.Status = "Onbetaald";
            totalBedrag += parseFloat(item.Bedrag); // Sum the Bedrag for open accounts
        }
      

        // Overwrite the status if the next due date is verlopen
    // Set the status to 'Onbetaald' when nextDueDate is reached
    if (nextDueDate && nextDueDate <= currentDate) {
        item.Status = 'Onbetaald'; // Set status to 'Onbetaald' if nextDueDate is reached
    }

    // Overwrite the status if the next due date is verlopen

        // Determine the status icon based on the current status
        // Validate Betaaldatum

        if (isNaN(betaaldatum.getTime())) {
            console.error(`Invalid Betaaldatum for Rekening: ${item.Rekening}`);
            item.Betaaldatum = ""; // Set to empty or a default value if invalid
        }

        // Create the input for Betaaldatum
        const betaaldatumInput = `<input type="date" value="${item.Betaaldatum}" data-index="${index}" class="betaaldatum-input">`;

        // Use the Volgende field as the next payment date (already calculated by server)
        let nextPaymentDate = nextDueDate; // Use the same date we calculated above
        
        // Get the current date and calculate days until next payment
        const daysUntilNextPayment = nextPaymentDate ? Math.ceil((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24)) : 0;

       // Determine the status and icon
       let statusIcon;
       let statusColor;

       // Calculate if bill is past due or due within 7 days
       const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
       const sevenDaysFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
       const isPastDue = nextDueDate && nextDueDate < today;
       const isDueWithinWeek = nextDueDate && nextDueDate >= today && nextDueDate <= sevenDaysFromNow;

       if (item.Status === 'betaald') {
           // Always green for paid bills
           statusIcon = '<i class="fas fa-check" style="color: green;"></i>';
           statusColor = 'green';
       } else if (item.Status === 'Onbetaald' && isPastDue) {
           // Red for past due unpaid bills
           statusIcon = '<i class="fas fa-times" style="color: red;"></i>';
           statusColor = 'red';
       } else if (item.Status === 'Onbetaald' && isDueWithinWeek) {
           // Orange for unpaid bills due within a week (but not past due)
           statusIcon = '<i class="fas fa-exclamation" style="color: orange;"></i>';
           statusColor = 'orange';
       } else {
           // Red for other unpaid bills
           statusIcon = '<i class="fas fa-times" style="color: red;"></i>';
           statusColor = 'red';
       }            


        // Determine status and color
        let color = 'red'; // Default color
        let actionButton = '';

        
        // Find the correct index in currentData array
        const currentDataIndex = currentData.findIndex(dataItem => 
            dataItem.id === item.id || 
            (dataItem.Rekening === item.Rekening && dataItem.Bedrag === item.Bedrag && dataItem.Betaaldatum === item.Betaaldatum)
        );
        
        if (item.Status === 'Onbetaald') {
            actionButton = `<button style="background: ${statusColor} !important; color: white; font-size: 12px; padding: 4px 8px;" onclick="payRekening(${currentDataIndex})">${daysUntilNextPayment}</button>`;
        } else if (item.Status === 'betaald') {
            actionButton = `<button style="background: ${statusColor} !important; color: white; font-size: 12px; padding: 4px 8px;" onclick="UnpayRekening(${currentDataIndex})">${daysUntilNextPayment}</button>`;
            color = statusColor; // Use the calculated status color
        } else {
            color = statusColor; // Use the calculated status color
        }

        // Create the edit and delete buttons for swipe gestures
        const editButton = `<button onclick="editRekening(${currentDataIndex}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">E</button>`;
        const deleteButton = `<button onclick="showDeleteRekeningModal(${currentDataIndex})">X</button>`;

        const iconMapping = {
            "Oxxio": "fas fa-bolt", // Energy
            "KPN": "fas fa-wifi", // Internet
            "Mobiel": "fas fa-mobile-alt", // Mobile
            "CZV": "fas fa-heartbeat", // Health Insurance
            "Huur": "fas fa-home", // Rent
            "Toeslagen": "fas fa-money-bill-wave", // Tax
            "Boetes ": "fas fa-exclamation-triangle", // Fines
            "Auto belasting": "fas fa-car", // Car Tax
            "Lidmaatschap Moskee": "fas fa-mosque", // Mosque Membership
            "CZ": "fas fa-heartbeat", // Health Insurance Payment Arrangement
            "Park. Vergunning": "fas fa-parking", // Parking Permit
            "Drinkwater": "fas fa-tint", // Water
            "Voorschool": "fas fa-school", // Preschool
            "Easypark": "fas fa-parking", // Easypark
            "ANWB": "fas fa-car", // ANWB Membership
            "Yellowbrick": "fas fa-parking", // Yellowbrick
            "Autoverzekering": "fas fa-car", // Car Insurance
            "Zwemles": "fas fa-person-swimming",
            "Inboedel": "fas fa-house-crack",
            "Iptv": "fas fa-tv",
            "Moskee": "fas fa-mosque",
            "Belastingen": "fas fa-file-invoice-dollar"
            // Add more mappings as needed
        };
        const rekeningIcon = iconMapping[item.Rekening] || "fas fa-question-circle"; // Default icon
 
        row.innerHTML = `
            <td>
                <div class="action-buttons">
                    ${actionButton}
                    ${editButton}
                    ${deleteButton}
                </div>
            </td>
            <td>
                <i class="${rekeningIcon}"></i>
                <a href="${item.URL}" target="_blank" style="color: ${statusColor};">${item.Rekening.toUpperCase()} (${item.Periode})</a>
                <br>
                ${item.Kenmerk !== '' ? '<span>Zie kenmerk</span>' : ''}
            </td>
            <td><input type="number" value="${Math.floor(item.Bedrag)}" data-index="${currentDataIndex}" class="bedrag-input" disabled></td>
            <td><input type="date" value="${item.Betaaldatum}" data-index="${currentDataIndex}" class="appointment-date-input" disabled></td>
            <td>${statusIcon}</td>
            <td><input type="hidden" value="${item.Status}"></td>
            <td><input type="hidden" value="${item.Periode}" data-index="${currentDataIndex}" readonly></td>
            <td><input type="hidden" value="${item.URL}" readonly></td>
            <td><input type="hidden" value="${item.id}" data-index="${currentDataIndex}" readonly></td>
        `;

        const isUnpaid = item.Status === 'Onbetaald';
        const tableBody = (nextDueDate && item.Status !== 'betaald') || isUnpaid ? tableBodyUnpaid : tableBodyPaid;

        // Log each row added
        tableBody.appendChild(row); // Append the row to the table body

    });

}

