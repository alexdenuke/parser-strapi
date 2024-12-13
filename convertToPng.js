const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const inputDirectory = "./imgTechnics"; // Папка с исходными изображениями
const outputDirectory = "./converted_imgTechnics"; // Папка для сохранения конвертированных изображений

// Создаем папку для сохранения конвертированных файлов, если она не существует
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// Читаем директорию с исходными изображениями
fs.readdir(inputDirectory, (err, files) => {
  if (err) {
    console.error("Ошибка при чтении директории", err);
    return;
  }

  files.forEach((file) => {
    const inputFilePath = path.join(inputDirectory, file);
    const outputFilePath = path.join(
      outputDirectory,
      path.parse(file).name + ".png"
    );

    // Преобразуем каждый файл в PNG и сохраняем в новой директории
    sharp(inputFilePath)
      .toFormat("png")
      .toFile(outputFilePath, (err, info) => {
        if (err) {
          console.error(`Ошибка при конвертации файла ${file}:`, err);
        } else {
          console.log(
            `Файл ${file} конвертирован и сохранен как ${outputFilePath}`
          );
        }
      });
  });
});
