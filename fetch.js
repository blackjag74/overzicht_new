// Debounced version to prevent excessive calls
let fetchDataTimeout;
function debouncedFetchData(delay = 300) {
    clearTimeout(fetchDataTimeout);
    fetchDataTimeout = setTimeout(fetchData, delay);
}

function fetchData() {
    console.log("FUNCTION: fetchData"); // Log when the fetch starts

    fetch('get_rekeningen.php')
        .then(response => {
            console.log("Response received from server."); // Log when the response is received

            if (!response.ok) {
                console.error("Network response was not ok:", response.statusText); // Log if the response is not ok
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            console.log("Data parsed successfully:", data); // Log the parsed data

            // Assuming data has a structure like { RegularAccounts: [...] }
            if (data.RegularAccounts && Array.isArray(data.RegularAccounts)) {
                currentData = data.RegularAccounts; // Update the current data
                console.log("Current data updated:", currentData); // Log the updated current data
                displayData(currentData); // Call the function to display the data
                document.getElementById('total-unpaid-value').textContent = calculateTotalUnpaidBills();
                document.getElementById('left-this-month-value').textContent = calculateLeftThisMonth();
                fetchTransacties();
                
                // Check for due bills and tasks after data is loaded
                if (typeof checkAllDueItems === 'function') {
                    checkAllDueItems();
                }
                
                // Dispatch dataLoaded event for payment arrangements
                const dataLoadedEvent = new Event('dataLoaded');
                document.dispatchEvent(dataLoadedEvent);
                console.log("dataLoaded event dispatched");
            } else {
                console.error("Invalid data structure:", data); // Log if the data structure is not as expected
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error); // Log any errors that occur during the fetch
            // Show error message to user
            if (typeof showToast === 'function') {
                showToast('Failed to load data from server', 'error');
            }
            currentData = [];
            displayData(currentData);
        });
}