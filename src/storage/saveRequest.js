const fs = require("fs");
const path = require("path");

function saveRequest(request, ordersDir = path.join(__dirname, "../../../node/orders")) {
  fs.mkdirSync(ordersDir, { recursive: true });

  const fileName = `${request.id}.json`;
  const filePath = path.join(ordersDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(request, null, 2), { encoding: "utf8" });

  // Дополнительно ведём единый журнал заявок.
  const indexPath = path.join(ordersDir, "orders.json");
  let all = [];
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } catch {
      // Если индекс повреждён — не ломаем сохранение индивидуального файла.
    }
  }

  all.push(request);
  fs.writeFileSync(indexPath, JSON.stringify(all, null, 2), { encoding: "utf8" });

  return filePath;
}

module.exports = { saveRequest };

