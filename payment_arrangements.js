console.log('payment_arrangements.js loaded');

// Global variables to store payment arrangements data
let paymentArrangements = [];
let paymentArrangementToEditIndex = null;
let paymentArrangementToDeleteIndex = null;

// Function to fetch payment arrangements
function fetchPaymentArrangements() {
    // Filter the current data to get only payment arrangements
    paymentArrangements = currentData.filter(item => item.Periode === 'Betalingsregeling');
    displayPaymentArrangements();
}

// Function to display payment arrangements
function displayPaymentArrangements() {
    const tableBody = document.getElementById('payment-arrangements-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    paymentArrangements.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Format the date for display
        const nextPaymentDate = item.Volgende ? new Date(item.Volgende).toLocaleDateString() : 'Niet ingesteld';
        
        row.innerHTML = `
            <td>${item.Rekening}</td>
            <td>€${parseFloat(item.Bedrag).toFixed(2)}</td>
            <td>${nextPaymentDate}</td>
            <td>
                <button onclick="editPaymentArrangement(${index})">Bewerken</button>
                <button onclick="showDeletePaymentArrangementModal(${index})">Verwijderen</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Function to show the add payment arrangement modal
function showAddPaymentArrangementModal() {
    console.log('showAddPaymentArrangementModal called');
    const modal = document.getElementById('add-payment-arrangement-modal');
    console.log('Modal element:', modal);
    
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    modal.style.display = 'block';
    
    // Set default date to today
    const dateInput = document.getElementById('payment-arrangement-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Make the function globally accessible
window.showAddPaymentArrangementModal = showAddPaymentArrangementModal;

// Function to close the add payment arrangement modal
function closeAddPaymentArrangementModal() {
    document.getElementById('add-payment-arrangement-modal').style.display = 'none';
}

// Function to calculate installment amount and update preview
function updateInstallmentPreview() {
    const totalAmount = parseFloat(document.getElementById('payment-arrangement-amount').value) || 0;
    const installments = parseInt(document.getElementById('payment-arrangement-installments').value) || 1;
    
    if (totalAmount > 0 && installments > 0) {
        const amountPerInstallment = (totalAmount / installments).toFixed(2);
        document.getElementById('amount-per-installment').textContent = `€${amountPerInstallment}`;
        document.getElementById('installment-preview').style.display = 'block';
    } else {
        document.getElementById('installment-preview').style.display = 'none';
    }
}

// Function to add a new payment arrangement
function addPaymentArrangement() {
    const name = document.getElementById('payment-arrangement-name').value;
    const totalAmount = document.getElementById('payment-arrangement-amount').value;
    const installments = parseInt(document.getElementById('payment-arrangement-installments').value) || 1;
    const firstPaymentDate = document.getElementById('payment-arrangement-date').value;
    const url = document.getElementById('payment-arrangement-url').value;
    
    // Validate input
    if (!name) {
        alert('Voer een rekeningnaam in');
        return;
    }
    
    if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0) {
        alert('Voer een geldig bedrag in');
        return;
    }
    
    if (installments < 1) {
        alert('Aantal termijnen moet minimaal 1 zijn');
        return;
    }
    
    // Calculate amount per installment
    const amountPerInstallment = parseFloat((parseFloat(totalAmount) / installments).toFixed(2));
    
    // Create promises array for all installments
    const promises = [];
    
    // Create installments
    for (let i = 0; i < installments; i++) {
        // Calculate payment date for this installment
        const paymentDate = new Date(firstPaymentDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        const formattedDate = paymentDate.toISOString().split('T')[0];
        
        // Create installment object
        const installment = {
            Rekening: `${name} (Termijn ${i+1}/${installments})`,
            Bedrag: amountPerInstallment,
            Periode: 'Betalingsregeling',
            Betaaldatum: '',
            Status: 'Onbetaald',
            Volgende: formattedDate,
            URL: url
        };
        
        // Send to server
        const promise = fetch('new_rekening.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(installment)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to create installment ${i+1}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Installment ${i+1} created successfully:`, data);
            
            // Add ID from server response if available
            if (data.id) {
                installment.id = data.id;
            }
            
            // Add to local array
            currentData.push(installment);
            return installment;
        });
        
        promises.push(promise);
    }
    
    // Wait for all installments to be created
    Promise.all(promises)
        .then(() => {
            fetchPaymentArrangements();
            closeAddPaymentArrangementModal();
            clearPaymentArrangementInputs();
            alert(`Betalingsregeling aangemaakt met ${installments} termijnen`);
        })
        .catch(error => {
            console.error('Error creating payment arrangement:', error);
            alert('Er is een fout opgetreden bij het maken van de betalingsregeling');
        });
}

// Function to clear payment arrangement inputs
function clearPaymentArrangementInputs() {
    document.getElementById('payment-arrangement-name').value = '';
    document.getElementById('payment-arrangement-amount').value = '';
    document.getElementById('payment-arrangement-url').value = '';
    document.getElementById('payment-arrangement-installments').value = '1';
    document.getElementById('installment-preview').style.display = 'none';
    // Keep the date as today
}

// Function to show the edit payment arrangement modal
function editPaymentArrangement(index) {
    paymentArrangementToEditIndex = index;
    const item = paymentArrangements[index];
    
    document.getElementById('edit-payment-arrangement-id').value = item.id || '';
    document.getElementById('edit-payment-arrangement-name').value = item.Rekening;
    document.getElementById('edit-payment-arrangement-amount').value = item.Bedrag;
    document.getElementById('edit-payment-arrangement-date').value = item.Volgende || '';
    document.getElementById('edit-payment-arrangement-url').value = item.URL || '';
    
    document.getElementById('edit-payment-arrangement-modal').style.display = 'block';
}

// Function to close the edit payment arrangement modal
function closeEditPaymentArrangementModal() {
    document.getElementById('edit-payment-arrangement-modal').style.display = 'none';
}

// Function to update a payment arrangement
function updatePaymentArrangement() {
    if (paymentArrangementToEditIndex === null) {
        console.error('No payment arrangement selected for editing');
        return;
    }
    
    const item = paymentArrangements[paymentArrangementToEditIndex];
    const originalId = item.id;
    
    // Get updated values
    item.Rekening = document.getElementById('edit-payment-arrangement-name').value;
    item.Bedrag = parseFloat(document.getElementById('edit-payment-arrangement-amount').value);
    item.Volgende = document.getElementById('edit-payment-arrangement-date').value;
    item.URL = document.getElementById('edit-payment-arrangement-url').value;
    
    // Find the index in the main data array
    const mainDataIndex = currentData.findIndex(dataItem => 
        dataItem.id === originalId || 
        (dataItem.Rekening === item.Rekening && dataItem.Periode === 'Betalingsregeling')
    );
    
    if (mainDataIndex !== -1) {
        // Update in the main data array
        currentData[mainDataIndex] = { ...item };
        
        // Send to server
        fetch('update_rekeningen.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: originalId,
                Rekening: item.Rekening,
                Bedrag: item.Bedrag,
                Periode: 'Betalingsregeling',
                Volgende: item.Volgende,
                URL: item.URL
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update payment arrangement');
            }
            return response.json();
        })
        .then(data => {
            console.log('Payment arrangement updated successfully:', data);
            fetchPaymentArrangements();
            closeEditPaymentArrangementModal();
        })
        .catch(error => {
            console.error('Error updating payment arrangement:', error);
            alert('Er is een fout opgetreden bij het bijwerken van de betalingsregeling');
        });
    } else {
        console.error('Could not find payment arrangement in main data array');
        alert('Kon de betalingsregeling niet vinden in de database');
    }
}

// Function to show the delete payment arrangement modal
function showDeletePaymentArrangementModal(index) {
    paymentArrangementToDeleteIndex = index;
    const item = paymentArrangements[index];
    
    document.getElementById('delete-payment-arrangement-name').textContent = item.Rekening;
    document.getElementById('delete-payment-arrangement-modal').style.display = 'block';
}

// Function to close the delete payment arrangement modal
function closeDeletePaymentArrangementModal() {
    document.getElementById('delete-payment-arrangement-modal').style.display = 'none';
}

// Function to delete a payment arrangement
function deletePaymentArrangement() {
    if (paymentArrangementToDeleteIndex === null) {
        console.error('No payment arrangement selected for deletion');
        return;
    }
    
    const item = paymentArrangements[paymentArrangementToDeleteIndex];
    
    // Send delete request to server
    fetch(`delete_rekeningen.php?id=${item.id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete payment arrangement');
        }
        return response.json();
    })
    .then(data => {
        console.log('Payment arrangement deleted successfully:', data);
        
        // Find and remove from main data array
        const mainDataIndex = currentData.findIndex(dataItem => 
            dataItem.id === item.id || 
            (dataItem.Rekening === item.Rekening && dataItem.Periode === 'Betalingsregeling')
        );
        
        if (mainDataIndex !== -1) {
            currentData.splice(mainDataIndex, 1);
        }
        
        // Remove from payment arrangements array
        paymentArrangements.splice(paymentArrangementToDeleteIndex, 1);
        
        // Refresh display
        displayPaymentArrangements();
        closeDeletePaymentArrangementModal();
    })
    .catch(error => {
        console.error('Error deleting payment arrangement:', error);
        alert('Er is een fout opgetreden bij het verwijderen van de betalingsregeling');
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Button to show add modal - handle multiple button IDs
    const addButtons = [
        document.getElementById('add-payment-arrangement-button'),
        document.getElementById('add-payment-arrangement-button-main'),
        document.getElementById('add-payment-arrangement-button-data')
    ];
    
    addButtons.forEach(addButton => {
        if (addButton) {
            console.log('Found add payment arrangement button:', addButton.id);
            addButton.addEventListener('click', function(e) {
                console.log('Add payment arrangement button clicked:', addButton.id);
                e.preventDefault();
                showAddPaymentArrangementModal();
            });
        }
    });
    
    if (!addButtons.some(btn => btn)) {
        console.error('Add payment arrangement button not found in DOM');
    }
    
    // Close buttons for modals
    document.getElementById('close-payment-arrangement-modal').addEventListener('click', closeAddPaymentArrangementModal);
    document.getElementById('close-edit-payment-arrangement-modal').addEventListener('click', closeEditPaymentArrangementModal);
    document.getElementById('close-delete-payment-arrangement-modal').addEventListener('click', closeDeletePaymentArrangementModal);
    
    // Save buttons
    document.getElementById('save-payment-arrangement-button').addEventListener('click', addPaymentArrangement);
    document.getElementById('update-payment-arrangement-button').addEventListener('click', updatePaymentArrangement);
    
    // Delete buttons
    document.getElementById('confirm-delete-payment-arrangement-button').addEventListener('click', deletePaymentArrangement);
    document.getElementById('cancel-delete-payment-arrangement-button').addEventListener('click', closeDeletePaymentArrangementModal);
    
    // Installment calculation
    const amountInput = document.getElementById('payment-arrangement-amount');
    const installmentsInput = document.getElementById('payment-arrangement-installments');
    
    if (amountInput && installmentsInput) {
        amountInput.addEventListener('input', updateInstallmentPreview);
        installmentsInput.addEventListener('input', updateInstallmentPreview);
    }
});

// Initialize payment arrangements when data is loaded
document.addEventListener('dataLoaded', function() {
    fetchPaymentArrangements();
});