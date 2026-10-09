
const productGrid = document.getElementById("product-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const emptyState = document.getElementById("empty-state");

const cartDrawer = document.getElementById("cart-drawer");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartItemsElement = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const drawerCountElement = document.getElementById("drawer-count");
const cartTotalElement = document.getElementById("cart-total");
const orderMessage = document.getElementById("order-message");

let selectedCategory = "All";
let searchTerm = "";
let cart = {};

const productCards = Array.from(
    productGrid.querySelectorAll(".product-card")
);

const products = productCards.map(card => ({
    id: Number(card.dataset.productId),
    name: card.querySelector("h3").textContent.trim(),
    category: card.dataset.category,
    price: Number(card.dataset.price),
    emoji: card.querySelector(".product-emoji").textContent.trim()
}));

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function getProduct(id) {
    return products.find(product => product.id === Number(id));
}

function openCart() {
    document.body.classList.add("cart-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "true");
    document.getElementById("close-cart").focus();
}

function closeCart() {
    document.body.classList.remove("cart-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.getElementById("cart-toggle").setAttribute("aria-expanded", "false");
    document.getElementById("cart-toggle").focus();
}

function addToCart(id) {
    const product = getProduct(id);

    if (!product) return;

    if ((cart[id] || 0) >= 100) {
        orderMessage.textContent = "Maximum quantity reached for this product.";
        openCart();
        return;
    }

    cart[id] = (cart[id] || 0) + 1;
    orderMessage.textContent = "";
    renderCart();
    openCart();
}

function changeQuantity(id, difference) {
    const nextQuantity = (cart[id] || 0) + difference;

    if (nextQuantity <= 0) {
        delete cart[id];
    } else if (nextQuantity <= 100) {
        cart[id] = nextQuantity;
    }

    renderCart();
}

function renderCart() {
    const entries = Object.entries(cart);
    const totalQuantity = entries.reduce(
        (sum, [, quantity]) => sum + quantity, 0
    );

    const total = entries.reduce((sum, [id, quantity]) => {
        const product = getProduct(id);
        return sum + (product ? product.price * quantity : 0);
    }, 0);

    cartCountElement.textContent = totalQuantity;
    drawerCountElement.textContent = `(${totalQuantity})`;
    cartTotalElement.textContent = formatPrice(total);

    if (!entries.length) {
        cartItemsElement.innerHTML =
            '<p class="cart-empty">Your bag is waiting for something good.</p>';
        return;
    }

    cartItemsElement.replaceChildren();

    entries.forEach(([id, quantity]) => {
        const product = getProduct(id);
        if (!product) return;

        const item = document.createElement("article");
        item.className = "cart-item";

        const visual = document.createElement("div");
        visual.className = "cart-item-visual";
        visual.textContent = product.emoji;

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = formatPrice(product.price * quantity);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", `Remove one ${product.name}`);
        minus.addEventListener("click", () => changeQuantity(id, -1));

        const count = document.createElement("span");
        count.textContent = quantity;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", `Add one ${product.name}`);
        plus.addEventListener("click", () => changeQuantity(id, 1));

        controls.append(minus, count, plus);
        details.append(name, price, controls);

        const remove = document.createElement("button");
        remove.className = "remove-item";
        remove.type = "button";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${product.name}`);
        remove.addEventListener("click", () => {
            delete cart[id];
            renderCart();
        });

        item.append(visual, details, remove);
        cartItemsElement.append(item);
    });
}

function filterProducts() {
    const query = searchTerm.toLowerCase().trim();

    productCards.forEach(card => {
        const matchesCategory =
            selectedCategory === "All" ||
            card.dataset.category === selectedCategory;

        const matchesSearch =
            card.dataset.name.includes(query) ||
            card.dataset.category.toLowerCase().includes(query);

        card.hidden = !(matchesCategory && matchesSearch);
    });

    const visibleCards = productCards.filter(card => !card.hidden);
    const sortMode = sortSelect.value;

    visibleCards.sort((a, b) => {
        if (sortMode === "price-low") {
            return Number(a.dataset.price) - Number(b.dataset.price);
        }

        if (sortMode === "price-high") {
            return Number(b.dataset.price) - Number(a.dataset.price);
        }

        if (sortMode === "name") {
            return a.dataset.name.localeCompare(b.dataset.name);
        }

        return Number(a.dataset.productId) - Number(b.dataset.productId);
    });

    visibleCards.forEach(card => productGrid.append(card));

    emptyState.hidden = visibleCards.length !== 0;
}

document.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
        addToCart(button.dataset.add);
    });
});

document.querySelectorAll(".category-chip").forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        document.querySelectorAll(".category-chip").forEach(chip => {
            const selected = chip === button;
            chip.classList.toggle("selected", selected);
            chip.setAttribute("aria-pressed", String(selected));
        });

        filterProducts();
    });
});

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    searchTerm = searchInput.value;
    filterProducts();
});

searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value;
    filterProducts();
});

sortSelect.addEventListener("change", filterProducts);

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" &&
        document.body.classList.contains("cart-open")) {
        closeCart();
    }
});

document.getElementById("checkout-button").addEventListener("click", async () => {
    const entries = Object.entries(cart);

    if (!entries.length) {
        orderMessage.textContent = "Add a product to your bag before checkout.";
        return;
    }

    const checkoutButton = document.getElementById("checkout-button");
    checkoutButton.disabled = true;
    orderMessage.textContent = "Placing your demo order...";

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({items: cart})
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Checkout failed.");
        }

        orderMessage.textContent =
            `${result.message} Order ID: ${result.order_id} · Total: ${formatPrice(result.total)}`;

        cart = {};
        renderCart();
    } catch (error) {
        orderMessage.textContent =
            error.message || "Checkout failed. Please try again.";
    } finally {
        checkoutButton.disabled = false;
    }
});

document.getElementById("cart-toggle").setAttribute("aria-expanded", "false");

document.querySelectorAll(".category-chip").forEach(button => {
    button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === "All")
    );
});

renderCart();
filterProducts();
