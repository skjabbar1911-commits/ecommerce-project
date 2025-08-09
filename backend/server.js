const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Serve FRONTEND static files
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cors());
app.use(express.json());

const USD_TO_INR = 87.5;
const categories = ["electronics", "clothing", "books", "accessories", "home", "sports"];

// Use same Google Drive image for all products
const googleDriveImageURL =
  "https://drive.google.com/uc?export=view&id=1mW4cR9pc8VS9HWYRgbfdKzJ6qR7i0ZEF";

// Generate 50 products
const products = Array.from({ length: 50 }, (_, i) => {
  const category = categories[i % categories.length];
  const priceUsd = Math.random() * 100 + 10;

  return {
    id: i + 1,
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${i + 1}`,
    category,
    price: Math.round(priceUsd * USD_TO_INR),
    deal: Math.random() > 0.7,
    bestseller: Math.random() > 0.3,
    image: googleDriveImageURL,
  };
});

// In-memory cart
let cart = [];

// Products endpoint
app.get("/api/products", (req, res) => {
  let result = [...products];
  const { name, category, minPrice, maxPrice, sort } = req.query;
  if (name) result = result.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (category) result = result.filter(p => p.category === category);
  if (minPrice) result = result.filter(p => p.price >= parseInt(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= parseInt(maxPrice));
  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  res.json(result);
});

app.get("/api/deals", (req, res) => res.json(products.filter(p => p.deal)));
app.get("/api/bestsellers", (req, res) => res.json(products.filter(p => p.bestseller)));

app.get("/api/cart", (req, res) => res.json(cart));

app.post("/api/cart", (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  res.json(cart);
});

app.patch("/api/cart/:productId", (req, res) => {
  const { quantity } = req.body;
  const item = cart.find(p => p.id == req.params.productId);
  if (item) item.quantity = Math.max(1, quantity);
  res.json(cart);
});

app.delete("/api/cart/:productId", (req, res) => {
  const id = parseInt(req.params.productId);
  cart = cart.filter(p => p.id !== id);
  res.json(cart);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`Serving FRONTEND from ${path.join(__dirname, "../frontend")}`);
});
