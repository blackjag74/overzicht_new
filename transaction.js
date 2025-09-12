function payRekening(index) {

    console.log('FUNCTION payRekening');
    // Check if the index is valid
    if (index < 0 || index >= currentData.length) {
        console.error(`Invalid index: ${index}. currentData length: ${currentData.length}`);
        return; // Exit the function if the index is invalid
    }

    const item = currentData[index]; // Get the current item based on the index
    const currentDate = new Date(); // Get the current date
    const betaalDatum = currentDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD

    console.log(`Paying rekening: ${item.Rekening}, Amount: ${item.Bedrag}, Date: ${betaalDatum}`); // Log payment details

    // Update the status and dates based on the payment period
    item.Betaaldatum = betaalDatum; // Set the Betaaldatum to the current date
    item.Status = "betaald"; // Set the status to "betaald"

    // Calculate next due date based on period (matching pay_bill.php logic)
    if (item.Periode !== "Openstaand") {
        const nextPaymentDate = new Date(betaalDatum);
        
        switch (item.Periode) {
            case 'Wekelijks':
                nextPaymentDate = new Date(nextPaymentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                break;
            case 'Maandelijks':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, nextPaymentDate.getDate());
                break;
            case 'Kwartaalijks':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 3, nextPaymentDate.getDate());
                break;
            case 'Half jaarlijks':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 6, nextPaymentDate.getDate());
                break;
            case 'Jaarlijks':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear() + 1, nextPaymentDate.getMonth(), nextPaymentDate.getDate());
                break;
            // Keep backward compatibility with old single letter codes
            case 'M':
            case 'R':
            case 'O':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, nextPaymentDate.getDate());
                break;
            case 'HJ':
            case 'H':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 6, nextPaymentDate.getDate());
                break;
            case 'J':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear() + 1, nextPaymentDate.getMonth(), nextPaymentDate.getDate());
                break;
            case 'K':
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 3, nextPaymentDate.getDate());
                break;
            default:
                nextPaymentDate = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, nextPaymentDate.getDate());
                break;
        }
        
        item.Volgende = nextPaymentDate.toISOString().split('T')[0]; // Update the Volgende date
        console.log(`Next payment date for ${item.Rekening} set to: ${item.Volgende}`); // Log next payment date
    }

    // Call the function to update the data on the server
    updateData();
    debouncedFetchData(); // Refresh the data with debouncing
    displayData(currentData); // Refresh the displayed regular accounts
}

function UnpayRekening(index) {
    console.log('FUNCTION: UnpayRekening');
    // Check if the index is valid
    if (index < 0 || index >= currentData.length) {
        console.error(`Invalid index: ${index}. currentData length: ${currentData.length}`);
        return; // Exit the function if the index is invalid
    }

    const item = currentData[index]; // Get the current item based on the index

    console.log(`Unpaying rekening: ${item.Rekening}, Amount: ${item.Bedrag}`); // Log unpayment details

    // Update the status and dates based on the payment period
    item.Betaaldatum = ""; // Set the Betaaldatum to an empty string
    item.Status = "Onbetaald"; // Set the status to "Onbetaald"

    // Optionally, reset the Volgende field or set it to a new value based on your logic
    item.Volgende = ""; // Reset the next payment date if necessary

    // Call the function to update the data on the server
    updateData();
    debouncedFetchData(); // Refresh the data with debouncing
    displayData(currentData); // Refresh the displayed regular accounts
}