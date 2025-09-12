function deleteRekening(index) {
    const rekeningId = currentData[index].id; // Get the rekening ID to delete
    console.log('FUNCTION: deleteRekening - Attempting to delete rekening with ID:', rekeningId); // Log the ID being deleted

    fetch(`delete_rekeningen.php?id=${rekeningId}`, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Response received from delete_rekeningen.php:', response); // Log the response from the server
        if (!response.ok) {
            console.error('Failed to delete rekening:', response.statusText); // Log if the response is not ok
            throw new Error('Failed to delete rekening');
        }
        return response.json(); // Parse the response as JSON
    })
    .then(data => {
        console.log('Delete response data:', data); // Log the data returned from the delete operation
        if (data.message) {
            console.log('Rekening deleted successfully:', data.message); // Log success message
        } else {
            console.error('Error message from delete response:', data.error); // Log error message if present
        }
        // Refresh rekeningen from server to ensure data consistency
        debouncedFetchData(); // This will update currentData and call displayData automatically with debouncing
        console.log('Rekening deleted and data refreshed from server'); // Log the successful refresh
    })
    .catch(error => {
        console.error('Error deleting rekening:', error); // Log any errors that occur during the fetch
    });
}

function showDeleteRekeningModal(index) {
    rekeningToDeleteIndex = index; // Store the index of the rekening to delete
    const rekeningName = currentData[index].Rekening; // Get the rekening name
    document.getElementById('delete-rekening-name').innerText = rekeningName; // Display the name in the modal
    document.getElementById('delete-rekening-modal').style.display = 'block'; // Show the modal
}

// Event listener for the confirm delete button
document.getElementById('confirm-delete-rekening-button').addEventListener('click', () => {
    if (rekeningToDeleteIndex !== null) {
        deleteRekening(rekeningToDeleteIndex); // Call the delete function
        closeDeleteRekeningModal(); // Close the modal
    }
});

// Function to close the delete modal
function closeDeleteRekeningModal() {
    document.getElementById('delete-rekening-modal').style.display = 'none'; // Hide the modal
}

// Event listener for the cancel button
document.getElementById('cancel-delete-rekening-button').addEventListener('click', closeDeleteRekeningModal);

