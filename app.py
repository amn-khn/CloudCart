
from flask import Flask, jsonify, render_template, render_template_string

app = Flask(__name__)

PRODUCTS = [
    {"id": 1, "name": "Wireless Headphones", "price": 1499, "category": "Electronics", "emoji": "🎧"},
    {"id": 2, "name": "Smart Watch", "price": 2499, "category": "Electronics", "emoji": "⌚"},
    {"id": 3, "name": "Running Shoes", "price": 1999, "category": "Fashion", "emoji": "👟"},
    {"id": 4, "name": "Travel Backpack", "price": 1299, "category": "Accessories", "emoji": "🎒"},
    {"id": 5, "name": "Coffee Mug", "price": 299, "category": "Home", "emoji": "☕"},
    {"id": 6, "name": "Desk Lamp", "price": 899, "category": "Home", "emoji": "💡"},
    {"id": 7, "name": "Bluetooth Speaker", "price": 1799, "category": "Electronics", "emoji": "🔊"},
    {"id": 8, "name": "Sunglasses", "price": 799, "category": "Fashion", "emoji": "🕶️"},
]

PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudCart | Online Store</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0; font-family: Arial, sans-serif;
            background: #f4f7fb; color: #182230;
        }
        header {
            background: #142b4a; color: white;
            padding: 22px 7%; display: flex;
            justify-content: space-between; align-items: center;
        }
        header h1 { margin: 0; font-size: 26px; }
        header span { color: #77d9c8; }
        .hero {
            padding: 45px 7%; background: #dcecfb;
        }
        .hero h2 { margin: 0 0 12px; font-size: 32px; }
        .hero p { margin: 0; color: #42536a; }
        main { padding: 32px 7%; }
        .products {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 20px;
        }
        .card {
            background: white; padding: 22px;
            border-radius: 12px; box-shadow: 0 3px 12px #0000000d;
        }
        .emoji { font-size: 44px; }
        .category { color: #64748b; font-size: 13px; }
        .price { font-weight: bold; font-size: 20px; }
        button {
            background: #146bce; color: white; border: 0;
            padding: 11px 15px; border-radius: 7px;
            cursor: pointer; width: 100%;
        }
        button:hover { background: #0c4e9c; }
        #cart {
            background: white; padding: 20px;
            border-radius: 12px; margin-top: 30px;
        }
        footer {
            text-align: center; padding: 24px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <header>
        <h1>Cloud<span>Cart</span></h1>
        <strong>🛒 Cart: <span id="cart-count">0</span></strong>
    </header>

    <section class="hero">
        <h2>Shopping made simple.</h2>
        <p>Discover everyday essentials at CloudCart.</p>
    </section>

    <main>
        <h2>Featured Products</h2>
        <section class="products">
            {% for product in products %}
            <article class="card">
                <div class="emoji">{{ product.emoji }}</div>
                <p class="category">{{ product.category }}</p>
                <h3>{{ product.name }}</h3>
                <p class="price">₹{{ product.price }}</p>
                <button onclick="addToCart({{ product.id }})">
                    Add to Cart
                </button>
            </article>
            {% endfor %}
        </section>

        <section id="cart">
            <h2>Your Shopping Cart</h2>
            <div id="cart-items">Your cart is empty.</div>
            <h3 id="cart-total">Total: ₹0</h3>
            <button onclick="checkout()">Place Demo Order</button>
            <p id="order-message"></p>
        </section>
    </main>

    <footer>
        CloudCart | Cloud-Native E-Commerce Capstone Project
    </footer>

    <script>
        const products = {{ products | tojson }};
        let cart = {};

        function addToCart(id) {
            cart[id] = (cart[id] || 0) + 1;
            renderCart();
        }

        function renderCart() {
            const ids = Object.keys(cart);
            document.getElementById("cart-count").textContent =
                ids.reduce((sum, id) => sum + cart[id], 0);

            const items = ids.map(id => {
                const product = products.find(p => p.id === Number(id));
                return {product, quantity: cart[id]};
            });

            document.getElementById("cart-items").innerHTML = items.length
                ? items.map(item =>
                    `<p>${item.product.name} × ${item.quantity}
                    — ₹${item.product.price * item.quantity}</p>`
                  ).join("")
                : "Your cart is empty.";

            const total = items.reduce((sum, item) =>
                sum + item.product.price * item.quantity, 0);

            document.getElementById("cart-total").textContent =
                "Total: ₹" + total;
        }

        async function checkout() {
            if (!Object.keys(cart).length) {
                document.getElementById("order-message").textContent =
                    "Please add a product before checkout.";
                return;
            }

            try {
                const response = await fetch("/api/orders", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({items: cart})
                });
                const result = await response.json();

                document.getElementById("order-message").textContent =
                    result.message + " Order ID: " + result.order_id;

                cart = {};
                renderCart();
            } catch (error) {
                document.getElementById("order-message").textContent =
                    "Checkout failed. Please try again.";
            }
        }
    </script>
</body>
</html>
"""


@app.route("/")
def home():
    return render_template("index.html", products=PRODUCTS)


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "application": "CloudCart"})


@app.route("/api/products")
def get_products():
    return jsonify(PRODUCTS)


@app.route("/api/orders", methods=["POST"])
def create_order():
    from flask import request
    import uuid

    data = request.get_json(silent=True) or {}
    items = data.get("items", {})

    if not isinstance(items, dict) or not items:
        return jsonify({"error": "Cart is empty"}), 400

    total = 0

    try:
        for product_id, quantity in items.items():
            if not str(product_id).isdigit() or type(quantity) is not int:
                return jsonify({"error": "Invalid cart data"}), 400

            product = next(
                (p for p in PRODUCTS if p["id"] == int(product_id)), None
            )

            if product is None or not 1 <= quantity <= 100:
                return jsonify({"error": "Invalid product or quantity"}), 400

            total += product["price"] * quantity

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid cart data"}), 400

    return jsonify({
        "message": "Demo order placed successfully!",
        "order_id": uuid.uuid4().hex[:8].upper(),
        "total": total
    }), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
