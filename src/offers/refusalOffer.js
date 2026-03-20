function round2(n) {
  return Math.round(n * 100) / 100;
}

function buildRefusalOffer({ product, products, regionKey }) {
  const group = product.category;
  const sameGroup = products.filter((p) => p.category === group);
  if (sameGroup.length === 0) {
    // На практике не должно быть, но пусть будет явная ошибка.
    throw new Error(`Не найдена группа товаров для категории "${group}".`);
  }

  const originalPrice = product.prices?.[regionKey];
  const minPrice = sameGroup.reduce((min, p) => {
    const pPrice = p.prices?.[regionKey];
    return pPrice < min ? pPrice : min;
  }, sameGroup[0].prices?.[regionKey]);

  // Выбираем конкретный товар с минимальной ценой (для вывода).
  const cheapestProduct = sameGroup.find((p) => p.prices?.[regionKey] === minPrice) ?? sameGroup[0];

  if (originalPrice === minPrice) {
    // Текущий товар и так самый дешевый (или с равной минимальной ценой) -> скидка 5%.
    const finalPrice = round2(originalPrice * 0.95);
    return {
      offerType: "DISCOUNT_5_PERCENT",
      group,
      offeredProduct: product,
      offeredPrice: finalPrice,
      discountApplied: true,
      discountRate: 0.05,
      cheapestProduct: cheapestProduct,
    };
  }

  return {
    offerType: "CHEAPER_ANALOG",
    group,
    offeredProduct: cheapestProduct,
    offeredPrice: minPrice,
    discountApplied: false,
    discountRate: 0,
    cheapestProduct: cheapestProduct,
  };
}

module.exports = { buildRefusalOffer };

