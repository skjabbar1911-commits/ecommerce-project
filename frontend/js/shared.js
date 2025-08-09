let cartCache = JSON.parse(localStorage.getItem("cartCache")) || [];

function saveCart() { localStorage.setItem("cartCache", JSON.stringify(cartCache)); }

async function fetchCart() {
  const res = await fetch("http://localhost:5000/api/cart");
  cartCache = await res.json();
  saveCart();
  return cartCache;
}

function updateCartCount() {
  document.getElementById("cart-count").textContent =
    cartCache.reduce((s, item) => s + item.quantity, 0);
}

function createProductCard(p) {
  const div = document.createElement("div");
  div.className = "bg-white shadow rounded flex flex-col";
  div.innerHTML = `
    <img src="${p.image}" class="h-44 w-full object-cover">
    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-bold mb-1">${p.name}</h3>
      <span class="text-xs text-gray-500 mb-2">${p.category}</span>
      <div class="flex-1"></div>
      <div class="flex items-center justify-between">
        <span class="font-bold text-teal-700">₹${p.price}</span>
        <button data-add="${p.id}" class="bg-teal-700 text-white px-3 py-1 rounded">Add</button>
      </div>
    </div>
  `;
  return div;
}

async function renderCartDrawer() {
  const c = document.getElementById("cart-items-container");
  c.innerHTML = cartCache.length === 0
    ? `<p class="text-gray-500">Cart is empty</p>`
    : cartCache.map(item => `
      <div class="flex justify-between items-center">
        <div>${item.name} x${item.quantity}</div>
        <div>
          <button data-dec="${item.id}">-</button>
          <button data-inc="${item.id}">+</button>
          <button data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `).join("");

  document.getElementById("cart-total").textContent =
    cartCache.reduce((s, i) => s + i.price * i.quantity, 0);

  c.querySelectorAll("[data-inc]").forEach(btn =>
    btn.onclick = async () => {
      const id = btn.dataset.inc;
      const item = cartCache.find(c => c.id == id);
      await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity + 1 })
      });
      await fetchCart(); renderCartDrawer(); updateCartCount();
    });

  c.querySelectorAll("[data-dec]").forEach(btn =>
    btn.onclick = async () => {
      const id = btn.dataset.dec;
      const item = cartCache.find(c => c.id == id);
      if (item.quantity > 1) {
        await fetch(`http://localhost:5000/api/cart/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: item.quantity - 1 })
        });
        await fetchCart(); renderCartDrawer(); updateCartCount();
      }
    });

  c.querySelectorAll("[data-remove]").forEach(btn =>
    btn.onclick = async () => {
      await fetch(`http://localhost:5000/api/cart/${btn.dataset.remove}`, { method: "DELETE" });
      await fetchCart(); renderCartDrawer(); updateCartCount();
    });
}

document.addEventListener("click", e => {
  if (e.target.hasAttribute("data-add")) {
    const id = e.target.dataset.add;
    fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: parseInt(id) })
    }).then(fetchCart).then(() => {
      renderCartDrawer();
      updateCartCount();
    });
  }
});

document.getElementById("cart-btn").onclick = () => {
  renderCartDrawer();
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
