function importRekeningen() {
    console.log('FUNCTION: importRekeningen'); // Log the start of the import process

    // Fetch the data from the data.json file
    fetch('data.json')
        .then(response => {
            console.log('Response received from data.json:', response); // Log the response from the fetch
            if (!response.ok) {
                console.error('Network response was not ok:', response.statusText); // Log if the response is not ok
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data
        })
        .then(data => {
            console.log('Fetched data:', data); // Log the fetched data

            // Ensure we are accessing the correct structure
            if (!data.Rekeningen || !Array.isArray(data.Rekeningen)) {
                console.error('Invalid data structure:', data); // Log if the data structure is not as expected
                throw new Error('Invalid data structure');
            }

            // Send the data to the server for processing
            console.log('Sending data to import_rekeningen.php:', data); // Log the data being sent
            return fetch('import_rekeningen.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // Send the JSON data
            });
        })
        .then(response => {
            console.log('Response received from import_rekeningen.php:', response); // Log the response from the server
            if (!response.ok) {
                console.error('Failed to import rekeningen:', response.statusText); // Log if the response is not ok
                throw new Error('Failed to import rekeningen');
            }
            return response.json(); // Parse the response as JSON
        })
        .then(result => {
            console.log('Import result:', result); // Log the result of the import
            // Optionally, refresh the displayed data
            fetchData(); // Fetch the latest data from the server
        })
        .catch(error => {
            console.error('Error importing rekeningen:', error); // Log any errors
        });
}

// For payment arrangements
document.getElementById('import-rekeningen-button').addEventListener('click', () => {
    document.getElementById('confirm-import-modal').style.display = 'block';
    
});

// Event listener for the confirm import button
document.getElementById('confirm-import-button').addEventListener('click', () => {
    importRekeningen(); // Call the function to import rekeningen
    closeConfirmImportModal(); // Close the modal
    fetchData();
    displayData(currentData); // Refresh the displayed regular accounts
});

// Event listener for the cancel button
document.getElementById('cancel-import-button').addEventListener('click', closeConfirmImportModal);

// Function to close the confirmation modal
function closeConfirmImportModal() {
    document.getElementById('confirm-import-modal').style.display = 'none';
    fetchData();
    displayData(currentData); // Refresh the displayed regular accounts
}
