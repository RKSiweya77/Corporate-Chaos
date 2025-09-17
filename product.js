// Product Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeProductManagement();
});

function initializeProductManagement() {
    // Initialize search functionality
    initializeSearch();
    
    // Initialize product actions
    initializeProductActions();
    
    // Initialize filter functionality
    initializeFilter();
    
    // Initialize add product functionality
    initializeAddProduct();
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('input[placeholder="Search products..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const productRows = document.querySelectorAll('tbody tr');
            
            productRows.forEach(row => {
                const productName = row.querySelector('.text-sm.font-medium').textContent.toLowerCase();
                const productSKU = row.querySelector('.text-sm.text-gray-500').textContent.toLowerCase();
                
                if (productName.includes(searchTerm) || productSKU.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Product actions (Edit/Delete)
function initializeProductActions() {
    // Edit buttons
    document.querySelectorAll('button.text-blue-600').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const productName = row.querySelector('.text-sm.font-medium').textContent;
            showEditProductModal(productName, row);
        });
    });

    // Delete buttons
    document.querySelectorAll('button.text-red-600').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const productName = row.querySelector('.text-sm.font-medium').textContent;
            showDeleteConfirmation(productName, row);
        });
    });
}

// Filter functionality
function initializeFilter() {
    const filterSelect = document.querySelector('select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const category = this.value.toLowerCase();
            const productRows = document.querySelectorAll('tbody tr');
            
            productRows.forEach(row => {
                const productCategory = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                if (!category || productCategory.includes(category)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Add Product Modal
function initializeAddProduct() {
    const addButton = document.querySelector('button.bg-black');
    if (addButton) {
        addButton.addEventListener('click', showAddProductModal);
    }
}

function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Add New Product</h3>
                <button class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                    </label>
                    <input type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                    </label>
                    <input type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Living</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Price
                    </label>
                    <input type="number" required min="0" step="0.01"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                    </label>
                    <input type="number" required min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea rows="4" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Product Images
                    </label>
                    <input type="file" multiple accept="image/*"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('button.text-gray-500');
    const cancelBtn = modal.querySelector('button[type="button"]');
    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission
        console.log('Adding new product...');
        // Here you would typically send the data to your backend
        alert('Product added successfully!');
        closeModal();
    });
}

function showEditProductModal(productName, row) {
    // Similar to showAddProductModal but pre-filled with product data
    console.log(`Editing product: ${productName}`);
}

function showDeleteConfirmation(productName, row) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 class="text-xl font-bold mb-4">Delete Product</h3>
            <p class="text-gray-600 mb-6">
                Are you sure you want to delete "${productName}"? This action cannot be undone.
            </p>
            <div class="flex justify-end space-x-4">
                <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                </button>
                <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Delete
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle button clicks
    const [cancelBtn, deleteBtn] = modal.querySelectorAll('button');
    const closeModal = () => modal.remove();

    cancelBtn.addEventListener('click', closeModal);
    deleteBtn.addEventListener('click', () => {
        // Here you would typically send a delete request to your backend
        row.remove();
        closeModal();
        alert('Product deleted successfully!');
    });

    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
}

// Export functions for external use
window.productManagement = {
    initialize: initializeProductManagement,
    showAddProductModal,
    showEditProductModal,
    showDeleteConfirmation
};
