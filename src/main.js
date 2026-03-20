const { loadProducts } = require("./catalog/loadCatalog");
const { createPrompt } = require("./ui/prompt");
const { buildRefusalOffer } = require("./offers/refusalOffer");
const { saveRequest } = require("./storage/saveRequest");

async function run() {
  const regionsByKey = {
    1: { label: "СПБ", regionKey: "spb" },
    2: { label: "МСК", regionKey: "msk" },
    3: { label: "КРД", regionKey: "krd" },
  };

  const prompt = createPrompt();

  try {
    const products = loadProducts();
    while (true) {
      const regionKeyNum = await prompt.askRegion(regionsByKey);
      const region = regionsByKey[regionKeyNum];

      const productIndex = await prompt.askProductIndex(products, region.regionKey);
      const product = products[productIndex];

      const originalPrice = product.prices[region.regionKey];
      console.log(`\nВаш заказ: ${product.name} - ${originalPrice} руб.`);

      const initialConfirmed = await prompt.askYesNo("Оформляем заявку? (y/n): ");

      let offer = null;
      let finalProduct = product;
      let finalPrice = originalPrice;

      let isSaved = false;

      if (initialConfirmed) {
        offer = {
          type: "ORIGINAL",
          group: product.category,
          discountApplied: false,
          discountRate: 0,
          cheapestProductName: null,
        };
      } else {
        const refusalOffer = buildRefusalOffer({
          product,
          products,
          regionKey: region.regionKey,
        });

        // Предлагаем “конечное предложение” после отказа.
        if (refusalOffer.offerType === "CHEAPER_ANALOG") {
          console.log("\nПредлагаем более дешевый аналог:");
        } else {
          console.log("\nПредлагаем скидку 5%:");
        }

        console.log(`${refusalOffer.offeredProduct.name} - ${refusalOffer.offeredPrice} руб.`);

        const confirmedAfterOffer = await prompt.askYesNo(
          "Оформляем заявку на предложенных условиях? (y/n): "
        );

        if (!confirmedAfterOffer) {
          console.log("\nОформление заявки отменено.");
        } else {
          finalProduct = refusalOffer.offeredProduct;
          finalPrice = refusalOffer.offeredPrice;

          offer = {
            type: refusalOffer.offerType,
            group: refusalOffer.group,
            discountApplied: refusalOffer.discountApplied,
            discountRate: refusalOffer.discountRate,
            cheapestProductName: refusalOffer.cheapestProduct?.name ?? null,
          };
        }
      }

      if (offer) {
        const request = {
          id: `order_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          region: { key: regionKeyNum, label: region.label, code: region.regionKey },
          original: {
            productName: product.name,
            category: product.category,
            price: originalPrice,
          },
          offer,
          final: {
            productName: finalProduct.name,
            category: finalProduct.category,
            price: finalPrice,
          },
        };

        const filePath = saveRequest(request);
        isSaved = true;
        console.log(`\nЗаявка успешно сохранена: ${filePath}`);
      }

      const again = await prompt.askYesNo("Оформляем ещё одну заявку? (y/n): ");
      if (!again) break;
    }
  } finally {
    prompt.close();
  }
}

module.exports = { run };

