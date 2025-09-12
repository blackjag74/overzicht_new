// Bills Documents Integration

// Tab switching functionality
function showBillsTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName + '-content');
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    clickedButton.classList.add('active');
    
    // Load documents if documents tab is selected
    if (tabName === 'documents') {
        loadBillDocuments();
    }
}

// Bill documents storage
let billDocuments = JSON.parse(localStorage.getItem('billDocuments')) || [];

// Initialize bill documents functionality
function initializeBillDocuments() {
    // Add event listeners
    const uploadButton = document.getElementById('upload-bill-document-button');
    if (uploadButton) {
        uploadButton.addEventListener('click', showUploadBillDocumentModal);
    }
    
    const categoryFilter = document.getElementById('bill-document-category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBillDocuments);
    }
    
    const searchInput = document.getElementById('bill-document-search');
    if (searchInput) {
        searchInput.addEventListener('input', searchBillDocuments);
    }
}

// Load and display bill documents
function loadBillDocuments() {
    displayBillDocuments(billDocuments);
}

// Display bill documents in table
function displayBillDocuments(documents) {
    const tableBody = document.getElementById('bill-documents-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    documents.forEach((doc, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doc.name}</td>
            <td>${doc.category}</td>
            <td>${formatDate(doc.dateAdded)}</td>
            <td>${doc.relatedTo || 'N/A'}</td>
            <td>
                <div class="document-actions">
                    <button class="view-btn" onclick="viewBillDocument(${index})">View</button>
                    <button class="download-btn" onclick="downloadBillDocument(${index})">Download</button>
                    <button class="delete-btn" onclick="deleteBillDocument(${index})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter documents by category
function filterBillDocuments() {
    const categoryFilter = document.getElementById('bill-document-category-filter');
    const selectedCategory = categoryFilter.value;
    
    let filteredDocuments = billDocuments;
    if (selectedCategory !== 'all') {
        filteredDocuments = billDocuments.filter(doc => doc.category === selectedCategory);
    }
    
    displayBillDocuments(filteredDocuments);
}

// Search documents
function searchBillDocuments() {
    const searchInput = document.getElementById('bill-document-search');
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredDocuments = billDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm) ||
        (doc.relatedTo && doc.relatedTo.toLowerCase().includes(searchTerm))
    );
    
    displayBillDocuments(filteredDocuments);
}

// Show upload document modal
function showUploadBillDocumentModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="upload-bill-document-modal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeUploadBillDocumentModal()">&times;</span>
                <h2>Upload Bill Document</h2>
                <form id="upload-bill-document-form">
                    <label for="bill-document-name">Document Name:</label>
                    <input type="text" id="bill-document-name" required>
                    
                    <label for="bill-document-category">Category:</label>
                    <select id="bill-document-category" required>
                        <option value="bills">Bills</option>
                        <option value="contracts">Contracts</option>
                        <option value="receipts">Receipts</option>
                        <option value="other">Other</option>
                    </select>
                    
                    <label for="bill-document-related">Related To (Bill Name):</label>
                    <input type="text" id="bill-document-related" placeholder="Optional">
                    
                    <label for="bill-document-file">File:</label>
                    <input type="file" id="bill-document-file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                    
                    <div class="modal-buttons">
                        <button type="button" onclick="closeUploadBillDocumentModal()">Cancel</button>
                        <button type="submit">Upload</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    const form = document.getElementById('upload-bill-document-form');
    form.addEventListener('submit', handleBillDocumentUpload);
}

// Close upload modal
function closeUploadBillDocumentModal() {
    const modal = document.getElementById('upload-bill-document-modal');
    if (modal) {
        modal.remove();
    }
}

// Handle document upload
function handleBillDocumentUpload(event) {
    event.preventDefault();
    
    const name = document.getElementById('bill-document-name').value;
    const category = document.getElementById('bill-document-category').value;
    const relatedTo = document.getElementById('bill-document-related').value;
    const fileInput = document.getElementById('bill-document-file');
    
    if (fileInput.files.length === 0) {
        alert('Please select a file to upload.');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Create document object
    const document = {
        id: Date.now(),
        name: name,
        category: category,
        relatedTo: relatedTo,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dateAdded: new Date().toISOString()
    };
    
    // Add to documents array
    billDocuments.push(document);
    
    // Save to localStorage
    localStorage.setItem('billDocuments', JSON.stringify(billDocuments));
    
    // Refresh display
    loadBillDocuments();
    
    // Close modal
    closeUploadBillDocumentModal();
    
    // Show success message
    showNotification('Document uploaded successfully!', 'success');
}

// View document
function viewBillDocument(index) {
    const doc = billDocuments[index];
    if (doc) {
        // For now, just show document info
        alert(`Document: ${doc.name}\nCategory: ${doc.category}\nFile: ${doc.fileName}\nDate Added: ${formatDate(doc.dateAdded)}`);
    }
}

// Download document
function downloadBillDocument(index) {
    const doc = billDocuments[index];
    if (doc) {
        // For now, just show download info
        alert(`Download functionality for: ${doc.fileName}\n\nNote: In a real implementation, this would download the actual file.`);
    }
}

// Delete document
function deleteBillDocument(index) {
    const doc = billDocuments[index];
    if (doc && confirm(`Are you sure you want to delete "${doc.name}"?`)) {
        billDocuments.splice(index, 1);
        localStorage.setItem('billDocuments', JSON.stringify(billDocuments));
        loadBillDocuments();
        showNotification('Document deleted successfully!', 'success');
    }
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString('nl-NL');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 4px;
        color: white;
        z-index: 10000;
        font-size: 14px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBillDocuments();
});

// Make functions globally available
window.showBillsTab = showBillsTab;
window.viewBillDocument = viewBillDocument;
window.downloadBillDocument = downloadBillDocument;
window.deleteBillDocument = deleteBillDocument;
window.closeUploadBillDocumentModal = closeUploadBillDocumentModal;