//* Конвертация xlsx в json

const XLSX = require("xlsx");

// Функция для чтения файла Excel и преобразования его в JSON
function convertXLSXtoJSON(filePath) {
  // Загрузка файла
  const workbook = XLSX.readFile(filePath);

  // Получение имени первого листа (предполагаем, что данные находятся на первом листе)
  const sheetName = workbook.SheetNames[0];

  // Конвертация данных листа в JSON
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  return sheetData;
}

const filePath = "./xlsx/parts.xlsx";
const jsonData = convertXLSXtoJSON(filePath);

console.log(jsonData);

// Если нужно сохранить результат в файл JSON
const fs = require("fs");
fs.writeFileSync("parts3.json", JSON.stringify(jsonData, null, 2), "utf8");
