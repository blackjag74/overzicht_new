// Image Paste Functionality for Kenmerk Fields

// Initialize image paste functionality
function initializeImagePaste() {
    // Add paste event listeners to Kenmerk fields
    const newKenmerkField = document.getElementById('new-rekening-kenmerk');
    const editKenmerkField = document.getElementById('edit-rekening-kenmerk');
    
    if (newKenmerkField) {
        addImagePasteListener(newKenmerkField);
    }
    
    if (editKenmerkField) {
        addImagePasteListener(editKenmerkField);
    }
}

// Add paste event listener to a textarea
function addImagePasteListener(textarea) {
    textarea.addEventListener('paste', function(event) {
        handleImagePaste(event, textarea);
    });
    
    // Add drag and drop functionality
    textarea.addEventListener('dragover', function(event) {
        event.preventDefault();
        textarea.style.backgroundColor = '#f0f8ff';
    });
    
    textarea.addEventListener('dragleave', function(event) {
        event.preventDefault();
        textarea.style.backgroundColor = '';
    });
    
    textarea.addEventListener('drop', function(event) {
        event.preventDefault();
        textarea.style.backgroundColor = '';
        handleImageDrop(event, textarea);
    });
}

// Handle paste event for images
function handleImagePaste(event, textarea) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            
            const file = item.getAsFile();
            processImageFile(file, textarea);
            return;
        }
    }
}

// Handle drag and drop for images
function handleImageDrop(event, textarea) {
    const files = event.dataTransfer.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if the file is an image
        if (file.type.indexOf('image') !== -1) {
            processImageFile(file, textarea);
        }
    }
}

// Process image file and convert to base64
function processImageFile(file, textarea) {
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showNotification('Image is too large. Maximum size is 5MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const base64Data = event.target.result;
        const imageId = 'img_' + Date.now();
        
        // Create image reference text
        const imageReference = `[IMAGE:${imageId}:${file.name}]`;
        
        // Add image reference to textarea
        const currentValue = textarea.value;
        const newValue = currentValue + (currentValue ? '\n' : '') + imageReference;
        textarea.value = newValue;
        
        // Store image data in localStorage
        storeImageData(imageId, base64Data, file.name, file.type);
        
        // Show success notification
        showNotification(`Image "${file.name}" added to Kenmerk field`, 'success');
        
        // Create preview
        createImagePreview(textarea, imageId, base64Data, file.name);
    };
    
    reader.onerror = function() {
        showNotification('Error reading image file', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Store image data in localStorage
function storeImageData(imageId, base64Data, fileName, fileType) {
    const imageData = {
        id: imageId,
        data: base64Data,
        fileName: fileName,
        fileType: fileType,
        timestamp: Date.now()
    };
    
    // Get existing images
    const existingImages = JSON.parse(localStorage.getItem('kenmerkImages')) || {};
    
    // Add new image
    existingImages[imageId] = imageData;
    
    // Store back to localStorage
    localStorage.setItem('kenmerkImages', JSON.stringify(existingImages));
}

// Create image preview below textarea
function createImagePreview(textarea, imageId, base64Data, fileName) {
    // Remove existing preview container if it exists
    const existingPreview = textarea.parentNode.querySelector('.image-preview-container');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'image-preview-container';
    previewContainer.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    // Create image preview
    const imagePreview = document.createElement('div');
    imagePreview.className = 'image-preview';
    imagePreview.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        background-color: white;
    `;
    
    // Create thumbnail
    const thumbnail = document.createElement('img');
    thumbnail.src = base64Data;
    thumbnail.style.cssText = `
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 3px;
        margin-right: 10px;
    `;
    
    // Create file info
    const fileInfo = document.createElement('div');
    fileInfo.style.cssText = 'flex: 1; font-size: 12px; color: #666;';
    fileInfo.innerHTML = `
        <div style="font-weight: bold; color: #333;">${fileName}</div>
        <div>ID: ${imageId}</div>
    `;
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.style.cssText = `
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 3px;
        width: 25px;
        height: 25px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
    `;
    
    removeButton.addEventListener('click', function() {
        removeImageFromKenmerk(textarea, imageId, fileName);
        imagePreview.remove();
        if (previewContainer.children.length === 0) {
            previewContainer.remove();
        }
    });
    
    // Assemble preview
    imagePreview.appendChild(thumbnail);
    imagePreview.appendChild(fileInfo);
    imagePreview.appendChild(removeButton);
    previewContainer.appendChild(imagePreview);
    
    // Insert preview after textarea
    textarea.parentNode.insertBefore(previewContainer, textarea.nextSibling);
}

// Remove image from Kenmerk field
function removeImageFromKenmerk(textarea, imageId, fileName) {
    // Remove from textarea
    const currentValue = textarea.value;
    const imageReference = `[IMAGE:${imageId}:${fileName}]`;
    const newValue = currentValue.replace(imageReference, '').replace(/\n\n+/g, '\n').trim();
    textarea.value = newValue;
    
    // Remove from localStorage
    const existingImages = JSON.parse(localStorage.getItem('kenmerkImages')) || {};
    delete existingImages[imageId];
    localStorage.setItem('kenmerkImages', JSON.stringify(existingImages));
    
    showNotification(`Image "${fileName}" removed`, 'info');
}

// Load existing images for a Kenmerk field
function loadExistingImages(textarea) {
    const kenmerkValue = textarea.value;
    const imageReferences = kenmerkValue.match(/\[IMAGE:([^:]+):([^\]]+)\]/g);
    
    if (imageReferences) {
        const existingImages = JSON.parse(localStorage.getItem('kenmerkImages')) || {};
        
        imageReferences.forEach(reference => {
            const match = reference.match(/\[IMAGE:([^:]+):([^\]]+)\]/);
            if (match) {
                const imageId = match[1];
                const fileName = match[2];
                
                if (existingImages[imageId]) {
                    createImagePreview(textarea, imageId, existingImages[imageId].data, fileName);
                }
            }
        });
    }
}

// Get image data by ID
function getImageData(imageId) {
    const existingImages = JSON.parse(localStorage.getItem('kenmerkImages')) || {};
    return existingImages[imageId] || null;
}

// Clean up old images (remove images older than 30 days)
function cleanupOldImages() {
    const existingImages = JSON.parse(localStorage.getItem('kenmerkImages')) || {};
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    let cleaned = false;
    Object.keys(existingImages).forEach(imageId => {
        if (existingImages[imageId].timestamp < thirtyDaysAgo) {
            delete existingImages[imageId];
            cleaned = true;
        }
    });
    
    if (cleaned) {
        localStorage.setItem('kenmerkImages', JSON.stringify(existingImages));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeImagePaste();
    cleanupOldImages();
    
    // Re-initialize when modals are shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.id === 'add-rekening-modal' || target.id === 'edit-rekening-modal') {
                    if (target.style.display === 'block') {
                        setTimeout(() => {
                            initializeImagePaste();
                            
                            // Load existing images for edit modal
                            if (target.id === 'edit-rekening-modal') {
                                const editKenmerkField = document.getElementById('edit-rekening-kenmerk');
                                if (editKenmerkField && editKenmerkField.value) {
                                    loadExistingImages(editKenmerkField);
                                }
                            }
                        }, 100);
                    }
                }
            }
        });
    });
    
    // Observe modal changes
    const addModal = document.getElementById('add-rekening-modal');
    const editModal = document.getElementById('edit-rekening-modal');
    
    if (addModal) {
        observer.observe(addModal, { attributes: true });
    }
    
    if (editModal) {
        observer.observe(editModal, { attributes: true });
    }
});

// Export functions for external use
window.imagepaste = {
    initializeImagePaste,
    getImageData,
    loadExistingImages
};