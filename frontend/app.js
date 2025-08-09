let products = [];

// Fetch all products
async function getProducts() {
  const res = await fetch("http://localhost:5000/api/products");
  products = await res.json();
}

// Fetch deals
async function getDeals() {
  const res = await fetch("http://localhost:5000/api/deals");
  return await res.json();
}

// Create product card
function createProductCard(product) {
  const div = document.createElement("div");
  div.className = "bg-white shadow rounded-lg overflow-hidden flex flex-col hover:scale-[1.03] transition";
  div.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="h-44 w-full object-cover">
    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-bold text-lg mb-1">${product.name}</h3>
      <span class="text-xs text-gray-400 mb-2 capitalize">${product.category}</span>
      <div class="flex-1"></div>
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-teal-600">₹${product.price}</span>
        <button class="bg-teal-500 hover:bg-teal-700 text-white px-4 py-1.5 rounded font-semibold shadow" data-add="${product.id}">Add</button>
      </div>
    </div>
  `;
  return div;
}

// Render deals
async function renderDeals() {
  const deals = await getDeals();
  const container = document.getElementById("deals-container");
  container.innerHTML = "";
  deals.forEach(p => container.appendChild(createProductCard(p)));
}

// Render products (shop page)
function renderProducts(filter = {}) {
  const container = document.getElementById("products-container");
  if (!container) return;
  const { name = "", category = "" } = filter;
  let filtered = products;
  if (name) filtered = filtered.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (category) filtered = filtered.filter(p => p.category === category);
  container.innerHTML = "";
  filtered.forEach(p => container.appendChild(createProductCard(p)));
}

// Cart functions
async function fetchCart() {
  const res = await fetch("http://localhost:5000/api/cart");
  return await res.json();
}
async function addToCart(id) {
  await fetch("http://localhost:5000/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: id })
  });
  updateCartCount();
}
async function removeFromCart(id) {
  await fetch(`http://localhost:5000/api/cart/${id}`, { method: "DELETE" });
  updateCartCount();
  renderCartDrawer();
}
async function renderCartDrawer() {
  const cart = await fetchCart();
  const container = document.getElementById("cart-items-container");
  if (!container) return;
  container.innerHTML = cart.length === 0
    ? `<div class="text-gray-500">Your cart is empty.</div>`
    : cart.map(item => `
      <div class="flex justify-between">
        <div>
          <div class="font-medium">${item.name}</div>
          <div class="text-xs text-gray-400">${item.category}</div>
          <div class="text-sm">x${item.quantity}</div>
        </div>
        <div class="flex flex-col items-end">
          <span class="font-bold">₹${item.price * item.quantity}</span>
          <button data-remove="${item.id}" class="text-xs text-red-500">Remove</button>
        </div>
      </div>
    `).join("");
  document.getElementById("cart-total").textContent = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  container.querySelectorAll("[data-remove]").forEach(btn => {
    btn.onclick = () => removeFromCart(parseInt(btn.dataset.remove));
  });
}
async function updateCartCount() {
  const cart = await fetchCart();
  document.getElementById("cart-count").textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Event listeners
document.addEventListener("click", e => {
  if (e.target.hasAttribute("data-add")) {
    addToCart(parseInt(e.target.dataset.add));
  }
});
document.getElementById("cart-btn").onclick = async () => {
  await renderCartDrawer();
  document.getElementById("cart-drawer").classList.remove("translate-x-full");
  document.getElementById("cart-backdrop").classList.remove("hidden");
};
document.getElementById("cart-close").onclick = () => {
  document.getElementById("cart-drawer").classList.add("translate-x-full");
  document.getElementById("cart-backdrop").classList.add("hidden");
};
document.getElementById("cart-backdrop").onclick = () => {
  document.getElementById("cart-drawer").classList.add("translate-x-full");
  document.getElementById("cart-backdrop").classList.add("hidden");
};

// Init
(async function () {
  await getProducts();
  if (document.querySelector("#deals-container")) {
    renderDeals();
  }
  if (document.querySelector("#products-container")) {
    renderProducts();
    const filterBtn = document.getElementById("filter-btn");
    if (filterBtn) {
      filterBtn.onclick = () => {
        const name = document.getElementById("filter-name").value;
        const category = document.getElementById("filter-category").value;
        renderProducts({ name, category });
      };
    }
  }
  updateCartCount();
})();
