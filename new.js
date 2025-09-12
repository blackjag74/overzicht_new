document.getElementById('save-rekening-button').addEventListener('click', () => {
    console.log('SAVE BUTTON CLICKED fronm new.js');
    const rekeningName = document.getElementById('new-rekening-name').value;
    const rekeningBedrag = document.getElementById('new-rekening-bedrag').value;
    const rekeningPeriode = document.getElementById('new-rekening-periode').value;
    const rekeningKenmerk = document.getElementById('new-rekening-kenmerk').value;
    const rekeningUrl = document.getElementById('new-rekening-url').value;
    const betaaldatumInput = document.getElementById('new-rekening-betaaldatum');
    const betaaldatum = betaaldatumInput.value ? betaaldatumInput.value : new Date().toISOString().split('T')[0];
    
    console.log('Rekening Datum:', betaaldatum);

    console.log('Rekening Name:', rekeningName);
    console.log('Rekening Bedrag:', rekeningBedrag);
    // Validate input
    if (!rekeningName || !rekeningBedrag) {
        alert("Please fill in the required fields (Name and Amount).");
        return;
    }
    
    if (isNaN(parseFloat(rekeningBedrag)) || parseFloat(rekeningBedrag) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const newRekening = {
        Rekening: rekeningName,
        Bedrag: parseFloat(rekeningBedrag),
        Periode: rekeningPeriode,
        Status: "Onbetaald", // Default status
        Betaaldatum: betaaldatum, // Set betaaldatum to the entered value or current date
        Volgende: "", // Default empty
        Kenmerk: rekeningKenmerk,
        URL: rekeningUrl
    };

    // Send the new rekening to the server
    fetch('new_rekening.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRekening) // Send the new rekening as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create rekening');
        }
        return response.json();
    })
    .then(data => {
        console.log('Rekening created successfully:', data);
        // Optionally, refresh the data displayed
        debouncedFetchData(); // Fetch updated data with debouncing
        displayData(currentData); // Refresh the displayed regular accounts
        closeAddRekeningModal(); // Close the modal
        clearRekeningInputs(); // Clear the input fields
    })
    .catch(error => {
        console.error('Error creating rekening:', error);
        alert('Failed to create new payment. Please try again.');
        // Don't close modal on error so user can retry
        // closeAddRekeningModal();
    });
});
// Function to clear rekening inputs
function clearRekeningInputs() {
    console.log('FUNCTION: clearRekeningInputs - Clearing rekening inputs');
 
    document.getElementById('new-rekening-name').value = '';
    document.getElementById('new-rekening-bedrag').value = '';
    document.getElementById('new-rekening-kenmerk').value = '';
    document.getElementById('new-rekening-url').value = '';
    document.getElementById('new-rekening-betaaldatum').value = '';
    document.getElementById('new-rekening-periode').value = 'M'; // Reset to default value
    
    // Clear any image previews
    const previewContainer = document.querySelector('#add-rekening-modal .image-preview-container');
    if (previewContainer) {
        previewContainer.remove();
    }
}

function showAddRekeningModal() {
    console.log('FUNCTION: showAddRekeningModal');
 
    document.getElementById('add-rekening-modal').style.display = 'block';
}

function closeAddRekeningModal() {
    console.log('FUNCTION: closeAddRekeningModal - Closing add rekening modal');
    document.getElementById('add-rekening-modal').style.display = 'none';
    debouncedFetchData(); // Fetch updated data with debouncing
    displayData(currentData); // Refresh the displayed regular accounts

  }

// Event listener for the add rekening button
document.getElementById('add-rekening-button').addEventListener('click', showAddRekeningModal);

document.getElementById('close-rekening-modal').addEventListener('click', closeAddRekeningModal);

