const fs = require("fs");
const path = require("path");

function loadProducts(catalogPath = path.join(__dirname, "../../../node/catalog/products.json")) {
  const raw = fs.readFileSync(catalogPath, "utf8");
  const products = JSON.parse(raw);

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Каталог товаров пуст или повреждён.");
  }

  return products;
}

module.exports = { loadProducts };

