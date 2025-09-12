// Data.js - Handles the Data section functionality

document.addEventListener('DOMContentLoaded', function() {
    // Data button click handler
    const dataButton = document.getElementById('data-button');
    if (dataButton) {
        dataButton.addEventListener('click', function() {
            showDataSection();
        });
    }
    
    // Options button click handler
    const optionsButton = document.getElementById('options-button');
    const optionsDropdown = document.getElementById('options-dropdown');
    
    if (optionsButton && optionsDropdown) {
        optionsButton.addEventListener('click', function() {
            // Toggle the options dropdown
            if (optionsDropdown.style.display === 'none' || !optionsDropdown.style.display) {
                optionsDropdown.style.display = 'block';
            } else {
                optionsDropdown.style.display = 'none';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!optionsButton.contains(event.target) && !optionsDropdown.contains(event.target)) {
                optionsDropdown.style.display = 'none';
            }
        });
    }
});

// Function to show the Data section
function showDataSection() {
    // Hide all sections
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('transacties-section').style.display = 'none';
    document.getElementById('mail-section').style.display = 'none';
    document.getElementById('saldo-section').style.display = 'none';
    
    // Create or show the data section
    let dataSection = document.getElementById('data-section');
    
    if (!dataSection) {
        // Create the data section if it doesn't exist
        dataSection = document.createElement('div');
        dataSection.id = 'data-section';
        dataSection.className = 'section';
        
        // Add content to the data section
        dataSection.innerHTML = `
            <h2>Data Overzicht</h2>
            
            <div class="data-controls">
                <h3>Import/Export Opties</h3>
                
                <div class="control-group">
                    <h4>Rekeningen (Bills)</h4>
                    <button id="import-rekening-button" class="data-btn import-btn">Import Rekeningen</button>
                    <button id="export-rekening-button" class="data-btn export-btn">Export Rekeningen</button>
                </div>
                
                <div class="control-group">
                    <h4>Taken (Tasks)</h4>
                    <button id="export-taken-button-data" class="data-btn export-btn">Export Taken</button>
                </div>
                
                <div class="control-group">
                    <h4>Betalingsregelingen</h4>
                    <button id="add-payment-arrangement-button-data" class="data-btn add-btn">Nieuwe Betalingsregeling</button>
                </div>
            </div>
            
            <div class="data-container">
                <div id="data-statistics">
                    <!-- Statistics will be populated here -->
                </div>
            </div>
        `;
        
        // Add the data section to the container
        document.querySelector('.container').appendChild(dataSection);
        
        // Add event listeners for the new buttons
        addDataSectionEventListeners();
        
        // Update the data statistics
        updateDataStatistics();
    } else {
        // Show the existing data section
        dataSection.style.display = 'block';
        
        // Update the data statistics
        updateDataStatistics();
    }
}

// Function to add event listeners for data section buttons
function addDataSectionEventListeners() {
    // Import Bills button
    const importBillsBtn = document.getElementById('import-rekening-button');
    if (importBillsBtn) {
        importBillsBtn.addEventListener('click', function() {
            // Trigger the existing import functionality
            const originalImportBtn = document.getElementById('import-rekening-button-original');
            if (originalImportBtn) {
                originalImportBtn.click();
            } else {
                // Call import function directly if available
                if (typeof showImportRekeningModal === 'function') {
                    showImportRekeningModal();
                }
            }
        });
    }
    
    // Export Bills button
    const exportBillsBtn = document.getElementById('export-rekening-button');
    if (exportBillsBtn) {
        exportBillsBtn.addEventListener('click', function() {
            // Call export function directly
            if (typeof exportRekeningen === 'function') {
                exportRekeningen();
            }
        });
    }
    
    // Export Tasks button
    const exportTasksBtn = document.getElementById('export-taken-button-data');
    if (exportTasksBtn) {
        exportTasksBtn.addEventListener('click', function() {
            // Call export tasks function directly
            if (typeof exportTaken === 'function') {
                exportTaken();
            }
        });
    }
    
    // New Payment Arrangement button
    const newPaymentBtn = document.getElementById('add-payment-arrangement-button-data');
    if (newPaymentBtn) {
        newPaymentBtn.addEventListener('click', function() {
            // Call payment arrangement function directly
            if (typeof showAddPaymentArrangementModal === 'function') {
                showAddPaymentArrangementModal();
            }
        });
    }
}

// Function to update data statistics
async function updateDataStatistics() {
    try {
        // Get data from database endpoints
        const [rekeningenResponse, takenResponse, betalingsregelingenResponse] = await Promise.all([
            fetch('get_rekeningen.php'),
        fetch('get_taken.php'),
        fetch('get_betalingsregelingen.php')
        ]);
        
        const rekeningenData = rekeningenResponse.ok ? await rekeningenResponse.json() : {RegularAccounts: []};
        const takenData = takenResponse.ok ? await takenResponse.json() : {Taken: []};
        const betalingsregelingenData = betalingsregelingenResponse.ok ? await betalingsregelingenResponse.json() : {Betalingsregelingen: []};
        
        const rekeningen = rekeningenData.RegularAccounts || [];
        const taken = takenData.Taken || [];
        const betalingsregelingen = betalingsregelingenData.Betalingsregelingen || [];
    
    // Calculate statistics
    const totalBills = rekeningen.length;
    const paidBills = rekeningen.filter(r => r.status === 'betaald').length;
    const unpaidBills = totalBills - paidBills;
    const averageBillAmount = totalBills > 0 ? 
        (rekeningen.reduce((sum, r) => sum + parseFloat(r.bedrag || 0), 0) / totalBills).toFixed(2) : '0.00';
    
    const totalTasks = taken.length;
    const completedTasks = taken.filter(t => t.status === 'Voltooid').length;
    const pendingTasks = totalTasks - completedTasks;
    
    const activeArrangements = betalingsregelingen.length;
    const totalArrangementsAmount = betalingsregelingen.reduce((sum, b) => sum + parseFloat(b.bedrag || 0), 0).toFixed(2);
    
    // Update the statistics section
    const statisticsSection = document.getElementById('data-statistics');
    if (statisticsSection) {
        statisticsSection.innerHTML = `
            <div class="data-card">
                <h3>Rekeningen Statistieken</h3>
                <p>Totaal Rekeningen: <span>${totalBills}</span></p>
                <p>Betaalde Rekeningen: <span>${paidBills}</span></p>
                <p>Onbetaalde Rekeningen: <span>${unpaidBills}</span></p>
                <p>Gemiddeld Bedrag: <span>€${averageBillAmount}</span></p>
            </div>
            <div class="data-card">
                <h3>Taken Statistieken</h3>
                <p>Totaal Taken: <span>${totalTasks}</span></p>
                <p>Voltooide Taken: <span>${completedTasks}</span></p>
                <p>Openstaande Taken: <span>${pendingTasks}</span></p>
            </div>
            <div class="data-card">
                <h3>Betalingsregelingen</h3>
                <p>Actieve Regelingen: <span>${activeArrangements}</span></p>
                <p>Totaal Bedrag: <span>€${totalArrangementsAmount}</span></p>
            </div>
        `;
    }
    } catch (error) {
        console.error('Error updating data statistics:', error);
        if (typeof showToast === 'function') {
            showToast('Error loading statistics data', 'error');
        }
    }
}