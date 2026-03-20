const readline = require("readline");

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askRaw = (question) =>
    new Promise((resolve) => {
      rl.question(question, resolve);
    });

  async function askYesNo(question) {
    // Принудительно валидируем ввод, чтобы не ломать сценарий.
    while (true) {
      const answer = (await askRaw(question)).trim().toLowerCase();
      if (answer === "y" || answer === "yes") return true;
      if (answer === "n" || answer === "no") return false;
      console.log("Введите `y` или `n`.");
    }
  }

  async function askRegion(regionsByKey) {
    const regionKeys = Object.keys(regionsByKey);

    while (true) {
      console.log("Выберите регион:");
      for (const key of regionKeys) {
        console.log(`${key} - ${regionsByKey[key].label}`);
      }

      const input = (await askRaw("> ")).trim();
      const keyNum = Number.parseInt(input, 10);

      if (!Number.isNaN(keyNum) && regionsByKey[keyNum]) {
        return keyNum;
      }

      console.log("Неверный регион. Попробуйте снова.\n");
    }
  }

  async function askProductIndex(products, regionKey) {
    console.log("\nСписок товаров:");
    products.forEach((p, i) => {
      const price = p.prices?.[regionKey];
      console.log(`${i + 1}. ${p.name} - ${price} руб.`);
    });

    while (true) {
      const input = (await askRaw("\nВыберите товар (номер): ")).trim();
      const index = Number.parseInt(input, 10);

      if (!Number.isNaN(index) && index >= 1 && index <= products.length) {
        return index - 1;
      }

      console.log("Ошибка выбора товара. Попробуйте снова.\n");
    }
  }

  function close() {
    rl.close();
  }

  return { askYesNo, askRegion, askProductIndex, close };
}

module.exports = { createPrompt };

