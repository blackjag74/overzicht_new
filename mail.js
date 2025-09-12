document.addEventListener('DOMContentLoaded', function() {
    fetch('get_mail.php')
        .then(response => response.json())
        .then(data => {
            const emailList = document.getElementById('email-list');
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';

            // Create table header
            data.forEach(email => {
                const date = new Date(email.date);
                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

                const row = document.createElement('tr');
                const subjectCell = document.createElement('td');
                subjectCell.innerHTML = `<i class="fas fa-envelope"></i> ${email.subject}`;
                subjectCell.style.padding = '4px';
                subjectCell.style.width = '50%';

                const dateCell = document.createElement('td');
                dateCell.textContent = formattedDate;
                dateCell.style.padding = '4px';
                dateCell.style.width = '25%';

                const fromCell = document.createElement('td');
                const domain = email.from.split('@')[1].replace('>', '');
                fromCell.textContent = domain;
                fromCell.style.padding = '4px';
                fromCell.style.width = '25%';

                row.appendChild(subjectCell);
                row.appendChild(dateCell);
                row.appendChild(fromCell);
                table.appendChild(row);
            });

            emailList.appendChild(table);
        });
});