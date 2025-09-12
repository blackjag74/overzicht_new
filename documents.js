// Document Storage Implementation

let documents = [];

// Initialize the document storage functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the documents button in the header
    const documentsButton = document.getElementById('documents-button');
    if (documentsButton) {
        documentsButton.addEventListener('click', showDocumentsSection);
    }

    // Listen for the dataLoaded event to load documents
    document.addEventListener('dataLoaded', () => {
        fetchDocuments();
    });
});

// Function to show the documents section
function showDocumentsSection() {
    // Hide all other sections
    document.getElementById('rekeningen-section').style.display = 'none';
    document.getElementById('taken-section').style.display = 'none';
    document.getElementById('transacties-section').style.display = 'none';
    document.getElementById('mail-section').style.display = 'none';
    document.getElementById('saldo-section').style.display = 'none';
    
    // Hide other sections if they exist
    const dataSection = document.getElementById('data-section');
    if (dataSection) {
        dataSection.style.display = 'none';
    }
    
    const calendarSection = document.getElementById('calendar-section');
    if (calendarSection) {
        calendarSection.style.display = 'none';
    }
    
    // Create or show the documents section
    let documentsSection = document.getElementById('documents-section');
    
    if (!documentsSection) {
        // Create the documents section if it doesn't exist
        documentsSection = document.createElement('div');
        documentsSection.id = 'documents-section';
        documentsSection.className = 'section';
        
        // Add content to the documents section
        documentsSection.innerHTML = `
            <h2>Document Storage</h2>
            <div class="documents-controls">
                <button id="upload-document-button">Upload Document</button>
                <select id="document-category-filter">
                    <option value="all">All Categories</option>
                    <option value="bills">Bills</option>
                    <option value="contracts">Contracts</option>
                    <option value="receipts">Receipts</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" id="document-search" placeholder="Search documents...">
            </div>
            <div class="documents-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Date Added</th>
                            <th>Related To</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="documents-table-body">
                        <!-- Documents will be populated here -->
                    </tbody>
                </table>
            </div>
            
            <!-- Modal for uploading documents -->
            <div id="upload-document-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span id="close-upload-document-modal" class="close">&times;</span>
                    <h2>Upload Document</h2>
                    <form id="document-upload-form">
                        <label for="document-name">Document Name:</label>
                        <input type="text" id="document-name" required>
                        
                        <label for="document-category">Category:</label>
                        <select id="document-category" required>
                            <option value="bills">Bills</option>
                            <option value="contracts">Contracts</option>
                            <option value="receipts">Receipts</option>
                            <option value="other">Other</option>
                        </select>
                        
                        <label for="document-related-to">Related To (Optional):</label>
                        <select id="document-related-to">
                            <option value="">None</option>
                            <!-- Options will be populated dynamically -->
                        </select>
                        
                        <label for="document-file">File:</label>
                        <input type="file" id="document-file" required>
                        
                        <label for="document-notes">Notes (Optional):</label>
                        <textarea id="document-notes"></textarea>
                        
                        <button type="submit">Upload</button>
                    </form>
                </div>
            </div>
            
            <!-- Modal for viewing document details -->
            <div id="view-document-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span id="close-view-document-modal" class="close">&times;</span>
                    <h2 id="view-document-title">Document Details</h2>
                    <div id="document-details-container">
                        <!-- Document details will be populated here -->
                    </div>
                    <div id="document-preview-container">
                        <!-- Document preview will be shown here if possible -->
                    </div>
                </div>
            </div>
        `;
        
        // Append the documents section to the main container
        document.querySelector('main').appendChild(documentsSection);
        
        // Add event listeners for document controls
        document.getElementById('upload-document-button').addEventListener('click', showUploadDocumentModal);
        document.getElementById('close-upload-document-modal').addEventListener('click', hideUploadDocumentModal);
        document.getElementById('close-view-document-modal').addEventListener('click', hideViewDocumentModal);
        document.getElementById('document-upload-form').addEventListener('submit', handleDocumentUpload);
        document.getElementById('document-category-filter').addEventListener('change', filterDocuments);
        document.getElementById('document-search').addEventListener('input', filterDocuments);
    }
    
    // Show the documents section
    documentsSection.style.display = 'block';
    
    // Update the active button in the header
    updateActiveHeaderButton('documents-button');
    
    // Display documents
    displayDocuments();
    
    // Populate related-to dropdown
    populateRelatedToDropdown();
}

// Function to fetch documents from the server
function fetchDocuments() {
    // In a real implementation, this would make an AJAX request to the server
    // For now, we'll use mock data
    documents = [
        {
            id: 1,
            name: 'Electric Bill - January',
            category: 'bills',
            dateAdded: '2023-01-15',
            relatedTo: 'Electricity',
            fileName: 'electric_bill_jan.pdf',
            notes: 'Paid on January 20th'
        },
        {
            id: 2,
            name: 'Rent Contract',
            category: 'contracts',
            dateAdded: '2022-12-01',
            relatedTo: 'Rent',
            fileName: 'rent_contract_2023.pdf',
            notes: 'Valid until December 2023'
        },
        {
            id: 3,
            name: 'Grocery Receipt',
            category: 'receipts',
            dateAdded: '2023-02-05',
            relatedTo: '',
            fileName: 'grocery_receipt.jpg',
            notes: 'Monthly groceries'
        }
    ];
    
    // If the documents section is currently visible, refresh it
    if (document.getElementById('documents-section') && 
        document.getElementById('documents-section').style.display === 'block') {
        displayDocuments();
    }
}

// Function to display documents
function displayDocuments() {
    const tableBody = document.getElementById('documents-table-body');
    if (!tableBody) return;
    
    // Get filter values
    const categoryFilter = document.getElementById('document-category-filter').value;
    const searchTerm = document.getElementById('document-search').value.toLowerCase();
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm) || 
                             doc.relatedTo.toLowerCase().includes(searchTerm) || 
                             doc.notes.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });
    
    // Create rows for each document
    filteredDocuments.forEach(doc => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${doc.name}</td>
            <td>${formatCategory(doc.category)}</td>
            <td>${formatDate(doc.dateAdded)}</td>
            <td>${doc.relatedTo || '-'}</td>
            <td>
                <button onclick="viewDocument(${doc.id})">View</button>
                <button onclick="downloadDocument(${doc.id})">Download</button>
                <button onclick="deleteDocument(${doc.id})">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show message if no documents found
    if (filteredDocuments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">No documents found</td>`;
        tableBody.appendChild(row);
    }
}

// Function to filter documents
function filterDocuments() {
    displayDocuments();
}

// Function to show the upload document modal
function showUploadDocumentModal() {
    const modal = document.getElementById('upload-document-modal');
    modal.style.display = 'block';
}

// Function to hide the upload document modal
function hideUploadDocumentModal() {
    const modal = document.getElementById('upload-document-modal');
    modal.style.display = 'none';
    document.getElementById('document-upload-form').reset();
}

// Function to show the view document modal
function viewDocument(documentId) {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    const modal = document.getElementById('view-document-modal');
    const titleElement = document.getElementById('view-document-title');
    const detailsContainer = document.getElementById('document-details-container');
    const previewContainer = document.getElementById('document-preview-container');
    
    titleElement.textContent = doc.name;
    
    detailsContainer.innerHTML = `
        <p><strong>Category:</strong> ${formatCategory(doc.category)}</p>
        <p><strong>Date Added:</strong> ${formatDate(doc.dateAdded)}</p>
        <p><strong>Related To:</strong> ${doc.relatedTo || 'None'}</p>
        <p><strong>File Name:</strong> ${doc.fileName}</p>
        <p><strong>Notes:</strong> ${doc.notes || 'None'}</p>
    `;
    
    // In a real implementation, we would show a preview of the document here
    previewContainer.innerHTML = `
        <div class="document-preview-placeholder">
            <p>Document preview not available in this demo</p>
            <p>File: ${doc.fileName}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Function to hide the view document modal
function hideViewDocumentModal() {
    const modal = document.getElementById('view-document-modal');
    modal.style.display = 'none';
}

// Function to handle document upload
function handleDocumentUpload(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('document-name').value;
    const category = document.getElementById('document-category').value;
    const relatedTo = document.getElementById('document-related-to').value;
    const fileInput = document.getElementById('document-file');
    const notes = document.getElementById('document-notes').value;
    
    // In a real implementation, we would upload the file to the server here
    // For now, we'll just add it to our local array
    const newDocument = {
        id: documents.length + 1,
        name: name,
        category: category,
        dateAdded: new Date().toISOString().split('T')[0],
        relatedTo: relatedTo,
        fileName: fileInput.files[0] ? fileInput.files[0].name : 'unknown.pdf',
        notes: notes
    };
    
    documents.push(newDocument);
    
    // Hide the modal and refresh the display
    hideUploadDocumentModal();
    displayDocuments();
    
    // Show success notification
    showNotification('Document Uploaded', `The document "${name}" has been successfully uploaded.`);
}

// Function to download a document
function downloadDocument(documentId) {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;
    
    // In a real implementation, this would trigger a file download
    // For now, we'll just show a notification
    showNotification('Download Started', `Downloading "${doc.fileName}"...`);
}

// Function to delete a document
function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    const docIndex = documents.findIndex(d => d.id === documentId);
    if (docIndex === -1) return;
    
    const docName = documents[docIndex].name;
    
    // Remove the document from the array
    documents.splice(docIndex, 1);
    
    // Refresh the display
    displayDocuments();
    
    // Show success notification
    showNotification('Document Deleted', `The document "${docName}" has been deleted.`);
}

// Function to populate the related-to dropdown
function populateRelatedToDropdown() {
    const dropdown = document.getElementById('document-related-to');
    if (!dropdown) return;
    
    // Clear existing options except the first one
    while (dropdown.options.length > 1) {
        dropdown.remove(1);
    }
    
    // Add options for bills
    if (currentData && Array.isArray(currentData)) {
        const billNames = [...new Set(currentData.map(bill => bill.Rekening))];
        billNames.sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
        });
    }
    
    // Add options for tasks
    if (window.tasks && Array.isArray(window.tasks)) {
        const taskNames = [...new Set(window.tasks.map(task => task.Taak))];
        taskNames.sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
        });
    }
}

// Helper function to format category names
function formatCategory(category) {
    switch (category) {
        case 'bills':
            return 'Bills';
        case 'contracts':
            return 'Contracts';
        case 'receipts':
            return 'Receipts';
        case 'other':
            return 'Other';
        default:
            return category;
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString();
}

// Helper function to show a notification
function showNotification(title, message) {
    // Check if the showNotification function exists in the global scope
    if (typeof window.showNotification === 'function') {
        window.showNotification(title, message);
    } else {
        // Fallback if the notification system is not available
        alert(`${title}: ${message}`);
    }
}

// Make functions globally accessible
window.showDocumentsSection = showDocumentsSection;
window.viewDocument = viewDocument;
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;