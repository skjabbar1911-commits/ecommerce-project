async function loadShopPage() {
  const nameInput = document.getElementById("filter-name");
  const categoryInput = document.getElementById("filter-category");
  const priceMin = document.getElementById("filter-minprice");
  const priceMax = document.getElementById("filter-maxprice");
  const sortSelect = document.getElementById("filter-sort");

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    categoryInput.value = urlParams.get('category');
  }

  async function fetchAndRender() {
    const query = new URLSearchParams();
    if (nameInput.value) query.append("name", nameInput.value);
    if (categoryInput.value) query.append("category", categoryInput.value);
    if (priceMin.value) query.append("minPrice", priceMin.value);
    if (priceMax.value) query.append("maxPrice", priceMax.value);
    if (sortSelect.value) query.append("sort", sortSelect.value);

    const res = await fetch(`http://localhost:5000/api/products?${query}`);
    const products = await res.json();
    const container = document.getElementById("products-container");
    container.innerHTML = "";
    products.forEach(p => container.appendChild(createProductCard(p)));
  }

  document.getElementById("filter-btn").onclick = fetchAndRender;
  fetchAndRender();
  fetchCart().then(updateCartCount);
}
loadShopPage();
