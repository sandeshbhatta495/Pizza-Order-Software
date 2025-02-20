document.addEventListener('DOMContentLoaded', function() {
    let selectedSize = null;
    let selectedExtras = new Set();
    let menu = null;

    // Fetch menu data
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            menu = data;
            renderPizzaSizes(data.pizzas);
            renderExtras(data.extras);
        });

    // Render pizza sizes
    function renderPizzaSizes(pizzas) {
        const container = document.getElementById('pizzaSizes');
        Object.entries(pizzas).forEach(([size, details]) => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="size-card text-center" data-size="${size}">
                    <i class="fas fa-pizza-slice"></i>
                    <h5>${size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'}</h5>
                    <p>${details.description}</p>
                    <span class="price-tag">Rs. ${details.price}</span>
                </div>
            `;
            container.appendChild(col);
        });

        // Add click handlers for size selection
        document.querySelectorAll('.size-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.size-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.dataset.size;
                updateTotal();
            });
        });
    }

    // Render extras
    function renderExtras(extras) {
        const container = document.getElementById('extraToppings');
        Object.entries(extras).forEach(([name, details]) => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="extra-card text-center" data-extra="${name}">
                    <i class="fas fa-${name === 'pepperoni' ? 'pepper-hot' : name === 'cheese' ? 'cheese' : 'bottle-water'}"></i>
                    <h5>${details.description}</h5>
                    <span class="price-tag">Rs. ${details.price}</span>
                </div>
            `;
            container.appendChild(col);
        });

        // Add click handlers for extras selection
        document.querySelectorAll('.extra-card').forEach(card => {
            card.addEventListener('click', function() {
                this.classList.toggle('selected');
                const extra = this.dataset.extra;
                if (selectedExtras.has(extra)) {
                    selectedExtras.delete(extra);
                } else {
                    selectedExtras.add(extra);
                }
                updateTotal();
            });
        });
    }

    // Update total price
    function updateTotal() {
        let total = 0;
        if (selectedSize && menu) {
            total += menu.pizzas[selectedSize].price;
            selectedExtras.forEach(extra => {
                total += menu.extras[extra].price;
            });
        }
        document.getElementById('totalPrice').textContent = total;
    }

    // Handle form submission
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedSize) {
            alert('Please select a pizza size!');
            return;
        }

        const orderData = {
            size: selectedSize,
            extras: Array.from(selectedExtras)
        };

        fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            // Show success modal
            const modal = new bootstrap.Modal(document.getElementById('orderModal'));
            modal.show();
            
            // Reset form
            selectedSize = null;
            selectedExtras.clear();
            document.querySelectorAll('.size-card, .extra-card').forEach(card => {
                card.classList.remove('selected');
            });
            updateTotal();
            
            // Update orders list
            fetchOrders();
        });
    });

    // Fetch and display orders
    function fetchOrders() {
        fetch('/api/orders')
            .then(response => response.json())
            .then(orders => {
                const container = document.getElementById('ordersList');
                container.innerHTML = orders.reverse().map(order => `
                    <div class="order-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="status">${order.status}</span>
                            <small>${order.timestamp}</small>
                        </div>
                        <div class="mt-2">
                            <strong>${order.size === 'S' ? 'Small' : order.size === 'M' ? 'Medium' : 'Large'} Pizza</strong>
                            ${order.extras.length ? `<br>Extras: ${order.extras.join(', ')}` : ''}
                        </div>
                        <div class="mt-2 text-end">
                            <strong>Total: Rs. ${order.total}</strong>
                        </div>
                    </div>
                `).join('');
            });
    }

    // Initial orders fetch
    fetchOrders();

    // Fetch orders every 30 seconds
    setInterval(fetchOrders, 30000);
});
