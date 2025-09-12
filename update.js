function updateRekening(data) {
    console.log('FUNCTION: updateRekening');
    fetch('update_rekeningen.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // Send the updated rekening data as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update rekening');
        }
        return response.json();
    })
    .then(data => {
        console.log('Rekening updated successfully:', data);
        // Optionally, refresh the displayed data or handle the response
        debouncedFetchData(); // Refresh the data after updating with debouncing
        closeEditRekeningModal(); // Close the modal
    })
    .catch(error => {
        console.error('Error updating rekening:', error);
    });

    debouncedFetchData();
    displayData(currentData); // Refresh the displayed regular accounts
    
}

function updateData() {
    console.log("Update Data function called"); // Debugging line

    // Prepare the updated data for both types
    const updatedRegularAccounts = currentData.map((item) => {
        return {
            id: item.id,
            Rekening: item.Rekening,
            Periode: item.Periode,
            Betaaldatum: item.Betaaldatum,
            Status: item.Status,
            Bedrag: item.Bedrag,
            Kenmerk: item.Kenmerk,
            URL: item.URL
        };
    });


    // Log the data being sent
    console.log('Updating data:', updatedRegularAccounts);

    // Send the updated data back to the server
    fetch('update_rekeningen.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            RegularAccounts: updatedRegularAccounts
        }) // Ensure the structure matches what the PHP script expects
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update rekeningen');
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        console.log('Rekeningen updated successfully:', data);
        // Optionally, refresh the displayed data or handle the response
    })
    .catch(error => {
        console.error('Error updating rekeningen:', error);
        // Fallback: save to localStorage when server is not available
        console.log('Saving to localStorage as fallback...');
        try {
            localStorage.setItem('rekeningen_backup', JSON.stringify({
                RegularAccounts: updatedRegularAccounts,
                timestamp: new Date().toISOString()
            }));
            console.log('Data saved to localStorage successfully');
            // Show user feedback that data was saved locally
            if (typeof window.showNotification === 'function') {
                window.showNotification('Data Saved Locally', 'Changes saved to browser storage.');
            }
        } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
        }
    });

    fetchData();
    displayData(currentData); // Refresh the displayed regular accounts
}

