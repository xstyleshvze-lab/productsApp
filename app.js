const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const regions = {
  1: "spb",
  2: "msk",
  3: "krd"
};

// ================== КАТАЛОГ ТОВАРОВ (12 товаров, 6 категорий) ==================
const products = [
  { name: "Утеплитель Роквул Скандик 50 мм",          category: "Утеплитель", prices: { spb: 1075, msk: 1100, krd: 950 } },
  { name: "Утеплитель Кнауф ТеплоКНАУФ 50 мм",        category: "Утеплитель", prices: { spb: 860,  msk: 900,  krd: 1300 } },
  { name: "Газобетон СК D400 100х250х625 мм",         category: "Газобетон",  prices: { spb: 450,  msk: 430,  krd: 420 } },
  { name: "Газобетон ЛСР D400 100х250х625 мм",        category: "Газобетон",  prices: { spb: 580,  msk: 550,  krd: 580 } },
  { name: "Газобетон Ytong D400 100х250х625 мм",      category: "Газобетон",  prices: { spb: 520,  msk: 500,  krd: 490 } },
  { name: "Кирпич керамический М100 полнотелый",      category: "Кирпич",     prices: { spb: 25,   msk: 28,   krd: 22 } },
  { name: "Кирпич силикатный одинарный",              category: "Кирпич",     prices: { spb: 18,   msk: 20,   krd: 17 } },
  { name: "Цемент М500 50 кг",                        category: "Цемент",     prices: { spb: 450,  msk: 480,  krd: 420 } },
  { name: "Цемент М400 50 кг",                        category: "Цемент",     prices: { spb: 380,  msk: 400,  krd: 360 } },
  { name: "Гипсокартон Кнауф 12.5 мм",                category: "Гипсокартон", prices: { spb: 320,  msk: 340,  krd: 300 } },
  { name: "Гипсокартон Волма 12.5 мм",                category: "Гипсокартон", prices: { spb: 280,  msk: 290,  krd: 270 } },
  { name: "Керамогранит 60×60 см матовый",            category: "Плитка",     prices: { spb: 1200, msk: 1300, krd: 1100 } }
];

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log("Выберите регион:");
  console.log("1 - СПБ\n2 - МСК\n3 - КРД");

  const regionInput = await ask("> ");
  const regionKey = parseInt(regionInput.trim());
  const region = regions[regionKey];

  if (!region) {
    console.log("Неверный регион!");
    return rl.close();
  }

  // Вывод списка товаров
  console.log("\nСписок товаров:");
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} - ${p.prices[region]} руб.`);
  });

  // Выбор товара
  const productInput = await ask("\nВыберите товар (номер): ");
  const productIndex = parseInt(productInput.trim());

  if (isNaN(productIndex) || productIndex < 1 || productIndex > products.length) {
    console.log("Ошибка выбора товара!");
    return rl.close();
  }

  const product = products[productIndex - 1];
  const price = product.prices[region];

  console.log(`\nВаш заказ: ${product.name} - ${price} руб.`);

  // Подтверждение
  let confirm = await ask("Оформляем заявку? (y/n): ");
  confirm = confirm.trim().toLowerCase();

  let finalProduct = product;
  let finalPrice = price;
  let discountApplied = false;

  // === Логика удержания клиента при отказе ===
  if (confirm === "n") {
    const sameCategory = products.filter(p => p.category === product.category);

    // Находим самый дешёвый товар в категории
    const cheapest = sameCategory.reduce((min, p) => {
      return p.prices[region] < min.prices[region] ? p : min;
    }, sameCategory[0]);

    if (cheapest.name !== product.name) {
      // Предлагаем более дешёвый аналог
      console.log("\nПредлагаем более дешевый аналог:");
      console.log(`${cheapest.name} - ${cheapest.prices[region]} руб.`);

      finalProduct = cheapest;
      finalPrice = cheapest.prices[region];
    } else {
      // Товар уже самый дешёвый → даём скидку 5%
      finalPrice = +(price * 0.95).toFixed(2);
      discountApplied = true;

      console.log("\nПредлагаем скидку 5%:");
      console.log(`${product.name} - ${finalPrice} руб.`);
    }
  }

  // Сохранение заявки
  const order = {
    region,
    product: finalProduct.name,
    price,           // исходная цена выбранного товара
    finalPrice,
    discountApplied
  };

  fs.writeFileSync("order.json", JSON.stringify(order, null, 2));

  console.log("\nЗаявка успешно сохранена в order.json");
  rl.close();
}

main();