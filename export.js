document.getElementById('export-rekeningen-button').addEventListener('click', () => {

    console.log('FUNCTION: exportRekening');
    const rekeningenData = currentData.map(item => ({
        Rekening: item.Rekening,
        Bedrag: item.Bedrag,
        Periode: item.Periode,
        Status: item.Status,
        Betaaldatum: item.Betaaldatum,
        Kenmerk: item.Kenmerk,
        URL: item.URL
    }));

    fetch('export_rekeningen.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rekeningenData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to export rekeningen');
        }
        return response.json();
    })
    .then(data => {
        console.log('Rekeningen exported successfully:', data);
        alert('Rekeningen exported to data.json successfully!');
    })
    .catch(error => {
        console.error('Error exporting rekeningen:', error);
    });
});

