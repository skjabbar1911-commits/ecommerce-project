async function loadHomePage() {
  try {
    // === Deals of the Day - horizontal scroll ===
    let res = await fetch("http://localhost:5000/api/deals");
    let deals = await res.json();
    let dealsContainer = document.getElementById("deals-container");
    dealsContainer.innerHTML = "";
    if (deals.length === 0) {
      dealsContainer.innerHTML = `<p class="text-gray-500">No deals available today.</p>`;
    } else {
      deals.forEach(product => {
        const card = createProductCard(product);
        card.classList.add("min-w-[220px]"); // fixed width for horizontal scroll
        dealsContainer.appendChild(card);
      });
    }

    // === Best Sellers - horizontal scroll (limit 10) ===
    res = await fetch("http://localhost:5000/api/bestsellers");
    let bestsellers = await res.json();
    let bestContainer = document.getElementById("bestseller-container");
    bestContainer.innerHTML = "";
    if (bestsellers.length === 0) {
      bestContainer.innerHTML = `<p class="text-gray-500">No best sellers right now.</p>`;
    } else {
      bestsellers.slice(0, 10).forEach(product => {
        const card = createProductCard(product);
        card.classList.add("min-w-[220px]");
        bestContainer.appendChild(card);
      });
    }

    // Fetch current cart to update count
    fetchCart().then(updateCartCount);

  } catch (err) {
    console.error("Error loading home page data:", err);
    document.getElementById("deals-container").innerHTML =
      `<p class="text-red-500">Failed to load deals.</p>`;
    document.getElementById("bestseller-container").innerHTML =
      `<p class="text-red-500">Failed to load best sellers.</p>`;
  }
}

// Run when script loads
loadHomePage();
