//* Этот скрипт загружает изображения из папки в strapi в media library
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const API_URL = "http://localhost:1337";
const API_TOKEN = process.env.API_TOKEN;
const IMAGES_FOLDER = "./imagesAll";
const LOG_FILE = "./upload.log";

// Функция для записи в лог-файл
function logToFile(message) {
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${message}\n`);
}

async function uploadImage(filePath) {
  const formData = new FormData();
  formData.append("files", fs.createReadStream(filePath));

  try {
    const response = await axios({
      method: "post",
      url: `${API_URL}/api/upload`,
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${API_TOKEN}`,
      },
      data: formData,
    });
    console.log(
      `Изображение успешно загружено: ${path.basename(filePath)}`,
      response.data
    );
    logToFile(`Изображение успешно загружено: ${path.basename(filePath)}`);
  } catch (error) {
    const errorMessage = `Ошибка при загрузке изображения ${path.basename(
      filePath
    )}: ${error.response ? error.response.data : error.message}`;
    console.error(errorMessage);
    logToFile(errorMessage);
  }
}

async function uploadImagesFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  for (let file of files) {
    if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      await uploadImage(path.join(folderPath, file));
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Задержка 5 секунд между загрузками
    }
  }
}

uploadImagesFromFolder(IMAGES_FOLDER);
