function editRekening(index, item) {
    // Debugging logs
    console.log('FUNCTION: editRekening - Editing rekening at index:', index);

    // Determine which type of rekening is being edited
    if (index < 0 || index >= currentData.length) {
        console.error(`Index ${index} is out of bounds for currentData.`);
        return; // Exit if index is out of bounds
    }
    item = currentData[index]; // Access regular accounts
    console.log('Item to edit:', item); // Log the item being edited

    // Check if the item is defined
    if (!item) {
        console.error(`No item found at index ${index}`);
        return; // Exit if no item is found
    }

    // Populate the input fields with the current values
    document.getElementById('edit-rekening-id').value = item.id; // Populate rekening name
    console.log('Rekening ID set to:', item.id); // Log the ID being set

    document.getElementById('edit-rekening-status').value = item.Status; // Populate rekening name
    console.log('Rekening status set to:', item.Status); // Log the status being set

    document.getElementById('edit-rekening-name').value = item.Rekening; // Populate rekening name
    console.log('Rekening name set to:', item.Rekening); // Log the name being set

    document.getElementById('edit-rekening-bedrag').value = item.Bedrag; // Populate bedrag
    console.log('Rekening amount set to:', item.Bedrag); // Log the amount being set

    document.getElementById('edit-rekening-periode').value = item.Periode; // Populate periode
    console.log('Rekening period set to:', item.Periode); // Log the period being set

    document.getElementById('edit-rekening-kenmerk').value = item.Kenmerk; // Populate kenmerk
    console.log('Rekening kenmerk set to:', item.Kenmerk); // Log the kenmerk being set

    document.getElementById('edit-rekening-url').value = item.URL; // Populate URL
    console.log('Rekening URL set to:', item.URL); // Log the URL being set

    document.getElementById('edit-rekening-betaaldatum').value = item.Betaaldatum; // Populate betaaldatum
    console.log('Rekening betaaldatum set to:', item.Betaaldatum); // Log the betaaldatum being set

    // Show the modal for editing
    document.getElementById('edit-rekening-modal').style.display = 'block';
    console.log('Edit rekening modal displayed.'); // Log that the modal is displayed

    // Save the index and type in global variables to use when saving changes
    editRekeningIndex = index; // Store the index for later use
    console.log('Edit rekening index saved as:', editRekeningIndex); // Log the saved index
}
// For regular accounts
document.querySelectorAll('.edit-button-regular').forEach((button, index) => {
    button.addEventListener('click', () => {
        const item = currentData[index]; // Get the corresponding item for the button
        editRekening(index, item); // Pass the item to the edit function
        fetchData();
        fetchTransacties();
        displayData(currentData); // Refresh the displayed regular accounts
    });
});


// Event listener for saving the edited rekening
document.getElementById('save-edited-rekening-button').addEventListener('click', () => {
    const updatedItem = {
        Rekening: document.getElementById('edit-rekening-name').value, // Get the ID
        Status: document.getElementById('edit-rekening-status').value, // Get the ID
        Periode: document.getElementById('edit-rekening-periode').value, // Get the ID
        id: document.getElementById('edit-rekening-id').value, // Get the ID
        Bedrag: parseFloat(document.getElementById('edit-rekening-bedrag').value), // Get the updated Bedrag
        Kenmerk: document.getElementById('edit-rekening-kenmerk').value, // Get the updated Bedrag
        URL: document.getElementById('edit-rekening-url').value, // Get the updated Bedrag
        Betaaldatum: document.getElementById('edit-rekening-betaaldatum').value // Get the updated Betaaldatum
    };

    // Prepare the data to send to the server
    const dataToSend = { RegularAccounts: [updatedItem] } ;

    // Call the function to update the rekening on the server
    updateRekening(dataToSend);
    fetchData();
    fetchTransacties();
    displayData(currentData); // Refresh the displayed regular accounts
    closeEditRekeningModal(); // Close th
});

function showEditRekeningModal(index) {
    const item = currentData[index]; // Get the current item based on the index

    // Check if item is defined
    if (!item) {
        console.error(`No item found at index ${index}`);
        return; // Exit if no item is found
    }

    // Populate the input fields with the current values
    document.getElementById('edit-rekening-name').value = item.Rekening; // Populate rekening name
    document.getElementById('edit-rekening-bedrag').value = item.Bedrag; // Populate bedrag
    document.getElementById('edit-rekening-periode').value = item.Periode; // Populate periode
    document.getElementById('edit-rekening-betaaldatum').value = item.Betaaldatum; // Populate betaaldatum
    document.getElementById('edit-rekening-kenmerk').value = item.Kenmerk; // Populate betaaldatum
    document.getElementById('edit-rekening-url').value = item.URL; // Populate betaaldatum

    // Show the modal for editing
    document.getElementById('edit-rekening-modal').style.display = 'block';

    // Save the index in a global variable to use when saving changes
    editRekeningIndex = index; // Store the index for later use
    displayData(currentData); // Refresh the displayed regular accounts
}

// Function to close edit rekening modal
function closeEditRekeningModal() {
    document.getElementById('edit-rekening-modal').style.display = 'none'; // Hide the modal
}

// Event listener for close button
document.getElementById('close-edit-rekening-modal').addEventListener('click', closeEditRekeningModal);
// Event listener for closing the modal
document.getElementById('close-edit-rekening-modal').addEventListener('click', () => {
    document.getElementById('edit-rekening-modal').style.display = 'none';
});


