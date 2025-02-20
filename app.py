from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json

app = Flask(__name__)

# Pizza menu and prices
PIZZA_PRICES = {
    'S': {'price': 100, 'description': 'Small pizza with basic toppings'},
    'M': {'price': 300, 'description': 'Medium pizza with main course toppings'},
    'L': {'price': 500, 'description': 'Large pizza with main course toppings and a bottle of coke'}
}

EXTRAS = {
    'pepperoni': {'price': 50, 'description': 'Extra pepperoni'},
    'cheese': {'price': 30, 'description': 'Extra cheese'},
    'coke': {'price': 40, 'description': 'Bottle of coke'}
}

# Store orders in memory (in a real app, this would be a database)
orders = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/menu')
def get_menu():
    return jsonify({
        'pizzas': PIZZA_PRICES,
        'extras': EXTRAS
    })

@app.route('/api/order', methods=['POST'])
def place_order():
    data = request.json
    size = data.get('size')
    extras = data.get('extras', [])
    
    if size not in PIZZA_PRICES:
        return jsonify({'error': 'Invalid pizza size'}), 400

    # Calculate total
    total = PIZZA_PRICES[size]['price']
    selected_extras = []
    
    for extra in extras:
        if extra in EXTRAS:
            total += EXTRAS[extra]['price']
            selected_extras.append(extra)

    # Create order
    order = {
        'id': len(orders) + 1,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'size': size,
        'extras': selected_extras,
        'total': total,
        'status': 'Preparing'
    }
    orders.append(order)
    
    return jsonify(order)

@app.route('/api/orders')
def get_orders():
    return jsonify(orders)

if __name__ == '__main__':
    app.run(debug=True)
