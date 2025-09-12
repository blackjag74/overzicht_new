let currentData = []; // Store the current data
let editRekeningIndex = null;
currentData.sortOrder = ''; // Track the current sort order
currentData.sortAscending = true; // Track the sort direction

// Function to update the rekening on the server

// Function to show the add rekening modal
// Event listener for the close button in the modal


function writeLog(logMessage) {
    fetch('log.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logMessage: logMessage })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to write to log.txt');
        }
    })
    .catch(error => {
        // Prevent infinite recursion by not calling writeLog again
        console.error(`Error writing to log.txt: ${error.message}`);
    });
}

function sortTable(column) {
    // Determine the sort order
    const isAscending = currentData.sortOrder === column ? !currentData.sortAscending : true;

    // Sort the data based on the column
    currentData.sort((a, b) => {
        if (column === 'Rekening') {
            return isAscending ? a.Rekening.localeCompare(b.Rekening) : b.Rekening.localeCompare(a.Rekening);
        } else if (column === 'Bedrag') {
            return isAscending ? parseFloat(a.Bedrag) - parseFloat(b.Bedrag) : parseFloat(b.Bedrag) - parseFloat(a.Bedrag);
        } else if (column === 'Datum') {
            return isAscending ? new Date(a.Betaaldatum) - new Date(b.Betaaldatum) : new Date(b.Betaaldatum) - new Date(a.Betaaldatum);
        } else if (column === 'Status') {
            return isAscending ? a.Status.localeCompare(b.Status) : b.Status.localeCompare(a.Status);
        } else if (column === 'Next') {
            const currentDate = new Date();
            const getDaysUntilNextPayment = (item) => {
                if (item.Volgende) {
                    const nextPaymentDate = new Date(item.Volgende);
                    if (!isNaN(nextPaymentDate.getTime())) {
                        return Math.ceil((nextPaymentDate - currentDate) / (1000 * 60 * 60 * 24));
                    }
                }
                return 0; // Return 0 if no valid next payment date
            };
            const daysA = getDaysUntilNextPayment(a);
            const daysB = getDaysUntilNextPayment(b);
            return isAscending ? daysA - daysB : daysB - daysA;
        }
    });

    // Update the sort order and direction
    currentData.sortOrder = column;
    currentData.sortAscending = isAscending;

    // Re-display the sorted data
    displayData(currentData);
}

let rekeningToDeleteIndex = null; // Global variable to store the index of the rekening to delete


// Function to export rekeningen to data.json

// Removed duplicate DOMContentLoaded listener - keeping the comprehensive one below

// Function to calculate total unpaid bills
function calculateTotalUnpaidBills() {
    let totalUnpaid = 0;
    currentData.forEach(item => {
        if (item.Status === 'Onbetaald') {
            totalUnpaid += parseFloat(item.Bedrag);
        }
    });
    return totalUnpaid.toFixed(2);
}

// Function to calculate amount left this month after bills
function calculateLeftThisMonth() {
    // Get the current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate total of bills due this month using Volgende field
    let totalDueThisMonth = 0;
    currentData.forEach(item => {
        if (item.Status === 'Onbetaald' && item.Volgende) {
            const dueDate = new Date(item.Volgende);
            // Check if the bill is due this month
            if (!isNaN(dueDate.getTime()) && dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
                totalDueThisMonth += parseFloat(item.Bedrag);
            }
        }
    });
    
    // Get the monthly income (this could be improved by getting from user input)
    const monthlyIncome = 1000; // Default value, could be replaced with actual user input
    
    // Calculate amount left
    const leftThisMonth = monthlyIncome - totalDueThisMonth;
    
    return leftThisMonth.toFixed(2);
}


// Chart functions removed as per user request


// Function to fetch and display transacties
function fetchTransacties() {
    fetch(`get_transacties.php?t=${Date.now()}`, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            const transactiesTableBody = document.getElementById('transacties-table-body');
            transactiesTableBody.innerHTML = ''; // Clear existing rows

            data.Transacties.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.rekening}</td>
                    <td>${item.taak}</td>
                    <td>${item.transaction_date}</td>
                    <td>${item.amount}</td>
                    <td>${item.description}</td>
                `;
                transactiesTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching transacties:', error);
        });
}

// Event listener for the transacties button
document.getElementById('transacties-button').addEventListener('click', () => {
    document.getElementById('transacties-section').style.display = 'block';
    fetchTransacties(); // Fetch transacties when the button is clicked
});

// Event listeners for hiding transacties section are handled in the main button listeners below

document.getElementById('bereken-saldo').addEventListener('click', () => {
    const huidigSaldo = parseFloat(document.getElementById('huidig-saldo').value);
    const salarisInkomsten = parseFloat(document.getElementById('salaris-inkomsten').value);

    const nu = new Date();
    const eenWeek = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 7);

    const onbetaaldeRekeningen = currentData.filter(rekening => {
        const betaaldatum = new Date(rekening.Betaaldatum);
        const periode = rekening.Periode;
        const status = rekening.Status;

        // Alleen rekeningen die nog betaald moeten worden
        if (status === 'Onbetaald') {
            return true;
        }

        // Alleen rekeningen die op de 24e van de maand vallen
        if (betaaldatum.getDate() === 24) {
            // Bereken het aantal dagen tot de volgende betaling
            let dagenTotVolgendeBetaling;
            switch (periode) {
                case 'M': // Monthly
                    dagenTotVolgendeBetaling = Math.ceil((new Date(betaaldatum.getFullYear(), betaaldatum.getMonth() + 1, 24) - nu) / (1000 * 60 * 60 * 24));
                    break;
                case 'O': // Monthly
                    dagenTotVolgendeBetaling = Math.ceil((new Date(betaaldatum.getFullYear(), betaaldatum.getMonth() + 1, 24) - nu) / (1000 * 60 * 60 * 24));
                    break;
                case 'K': // Quarterly
                    dagenTotVolgendeBetaling = Math.ceil((new Date(betaaldatum.getFullYear(), betaaldatum.getMonth() + 3, 24) - nu) / (1000 * 60 * 60 * 24));
                    break;
                case 'H': // Half-yearly
                    dagenTotVolgendeBetaling = Math.ceil((new Date(betaaldatum.getFullYear(), betaaldatum.getMonth() + 6, 24) - nu) / (1000 * 60 * 60 * 24));
                    break;
                case 'J': // Yearly
                    dagenTotVolgendeBetaling = Math.ceil((new Date(betaaldatum.getFullYear() + 1, betaaldatum.getMonth(), 24) - nu) / (1000 * 60 * 60 * 24));
                    break;
                default:
                    dagenTotVolgendeBetaling = Infinity;
            }

            // Alleen rekeningen die binnen 1 week betaald moeten worden
            if (dagenTotVolgendeBetaling <= 7) {
                return true;
            }
        }

        return false;
    });

    const totaleBedrag = onbetaaldeRekeningen.reduce((totaal, rekening) => totaal + parseFloat(rekening.Bedrag), 0);

    const nieuweSaldo = huidigSaldo + salarisInkomsten - totaleBedrag;

    const resultaatElement = document.getElementById('saldo-resultaat');
    resultaatElement.textContent = `Je hebt nog €${nieuweSaldo.toFixed(2)} over na het betalen van alle rekeningen.`;

    if (nieuweSaldo < 0) {
        resultaatElement.style.color = 'red';
    } else {
        resultaatElement.style.color = 'white';
    }
});

// This event listener is defined again later with hideAllSections, so we'll remove this duplicate
// and keep the more comprehensive version below

// This event listener is defined again later with hideAllSections, so we'll remove this duplicate
// and keep the more comprehensive version below


document.getElementById('mail-button').addEventListener('click', () => {
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('transacties-section').style.display = 'none';
    document.getElementById('email-header').style.display = 'block';
    document.getElementById('saldo-berekening').style.display = 'none';
});

document.getElementById('transacties-button').addEventListener('click', () => {
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('transacties-section').style.display = 'block';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('email-header').style.display = 'none';
    document.getElementById('saldo-berekening').style.display = 'none';
});

document.getElementById('saldo-button').addEventListener('click', () => {
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('email-header').style.display = 'none';
    document.getElementById('saldo-berekening').style.display = 'block';
    document.getElementById('transacties-section').style.display = 'none';

});

function hideAllSections() {
    console.log('Verberg alle secties');
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('email-header').style.display = 'none';
    document.getElementById('saldo-berekening').style.display = 'none';
    document.getElementById('transacties-section').style.display = 'none';

    // Verwijder deze regel
    // document.getElementById('email-list').style.display = 'none';
}


document.getElementById('rekeningen-button').addEventListener('click', () => {
    hideAllSections();
    document.getElementById('rekeningen-section').style.display = 'block';
    fetchData(); // Fetch data when showing the rekeningen section
    displayData(currentData); // Refresh the displayed regular accounts
});

document.getElementById('taken-button').addEventListener('click', () => {
    hideAllSections();
    document.getElementById('taken-section').style.display = 'block';
});

document.getElementById('saldo-button').addEventListener('click', () => {
    hideAllSections();
    document.getElementById('saldo-berekening').style.display = 'block';
    fetchData(); // Fetch data to ensure calculations are up-to-date
});

document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Fetch data when the page loads
    fetch('get_mail.php')
      .then(response => response.json())
      .then(data => {
        console.log('Email data:', data);
        data.forEach(mail => {
          console.log('Email:', mail);
          console.log('Status:', mail.Status);
        });
        const unreadMails = data.filter(mail => mail.Status === 'UNSEEN');
        console.log('Unread emails:', unreadMails);
        const mailCount = unreadMails.length;
        console.log('New mail count:', mailCount);
        const newMailCountElement = document.getElementById('new-mail-count');
        newMailCountElement.textContent = `(${mailCount})`;
        newMailCountElement.style.display = 'block'; // Make sure the element is visible
      })
      .catch(error => {
        console.error('Error fetching email data:', error);
      });
  });