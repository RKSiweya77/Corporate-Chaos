// Order Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeOrderManagement();
});

function initializeOrderManagement() {
    // Initialize search functionality
    initializeSearch();
    
    // Initialize status filter
    initializeStatusFilter();
    
    // Initialize order actions
    initializeOrderActions();
    
    // Initialize export functionality
    initializeExport();
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('input[placeholder="Search orders..."]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const orderRows = document.querySelectorAll('tbody tr');
            
            orderRows.forEach(row => {
                const orderId = row.querySelector('.text-sm.font-medium').textContent.toLowerCase();
                const customerName = row.querySelector('td:nth-child(2) .text-gray-900').textContent.toLowerCase();
                const customerEmail = row.querySelector('td:nth-child(2) .text-gray-500').textContent.toLowerCase();
                
                if (orderId.includes(searchTerm) || 
                    customerName.includes(searchTerm) || 
                    customerEmail.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Status filter functionality
function initializeStatusFilter() {
    const statusFilter = document.querySelector('select');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const selectedStatus = this.value.toLowerCase();
            const orderRows = document.querySelectorAll('tbody tr');
            
            orderRows.forEach(row => {
                const status = row.querySelector('td:nth-child(6) span').textContent.toLowerCase();
                if (!selectedStatus || status.includes(selectedStatus)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Order actions
function initializeOrderActions() {
    // View order details
    document.querySelectorAll('button.text-blue-600').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const orderId = row.querySelector('.text-sm.font-medium').textContent;
            showOrderDetails(orderId, row);
        });
    });

    // Update order status
    document.querySelectorAll('button.text-green-600').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const orderId = row.querySelector('.text-sm.font-medium').textContent;
            showUpdateStatusModal(orderId, row);
        });
    });
}

// Export functionality
function initializeExport() {
    const exportBtn = document.querySelector('button.bg-black');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportOrders);
    }
}

function showOrderDetails(orderId, row) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Get order data from row
    const customerName = row.querySelector('td:nth-child(2) .text-gray-900').textContent;
    const customerEmail = row.querySelector('td:nth-child(2) .text-gray-500').textContent;
    const product = row.querySelector('td:nth-child(3) .text-gray-900').textContent;
    const quantity = row.querySelector('td:nth-child(3) .text-gray-500').textContent;
    const total = row.querySelector('td:nth-child(4)').textContent;
    const date = row.querySelector('td:nth-child(5) .text-gray-900').textContent;
    const time = row.querySelector('td:nth-child(5) .text-gray-500').textContent;
    const status = row.querySelector('td:nth-child(6) span').textContent;

    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Order Details - ${orderId}</h3>
                <button class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold mb-2">Customer Information</h4>
                        <p class="text-gray-600">${customerName}</p>
                        <p class="text-gray-600">${customerEmail}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-2">Order Information</h4>
                        <p class="text-gray-600">Date: ${date}</p>
                        <p class="text-gray-600">Time: ${time}</p>
                        <p class="text-gray-600">Status: ${status}</p>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Products</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-medium">${product}</p>
                                <p class="text-gray-600">${quantity}</p>
                            </div>
                            <p class="font-medium">${total}</p>
                        </div>
                    </div>
                </div>
                <div class="border-t pt-4">
                    <h4 class="font-semibold mb-2">Shipping Address</h4>
                    <p class="text-gray-600">123 Main Street</p>
                    <p class="text-gray-600">Apt 4B</p>
                    <p class="text-gray-600">New York, NY 10001</p>
                </div>
                <div class="flex justify-end space-x-4">
                    <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Close
                    </button>
                    <button class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        Print Order
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('button');
    const closeModal = () => modal.remove();

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
}

function showUpdateStatusModal(orderId, row) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Update Order Status</h3>
                <button class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Order ID: ${orderId}
                    </label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"></textarea>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        Update Status
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
        const newStatus = this.querySelector('select').value;
        updateOrderStatus(orderId, row, newStatus);
        closeModal();
    });
}

function updateOrderStatus(orderId, row, newStatus) {
    // Update status badge in the row
    const statusBadge = row.querySelector('td:nth-child(6) span');
    statusBadge.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(newStatus)}`;
    statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    
    // Show success message
    alert(`Order ${orderId} status updated to ${newStatus}`);
}

function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'bg-purple-100 text-purple-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

function exportOrders() {
    // Simulate export functionality
    alert('Exporting orders...');
    // Here you would typically generate a CSV/Excel file with order data
}

// Export functions for external use
window.orderManagement = {
    initialize: initializeOrderManagement,
    showOrderDetails,
    showUpdateStatusModal,
    exportOrders
};
