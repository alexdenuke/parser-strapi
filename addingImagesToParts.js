//* Скрипт должен читать json файл и добавлять изображения в таблицу parts.
//* Нужно получить part_number и image_url из json файла? затем получить id изображения и на основе этих данных загрузить изображения в таблицу parts.
//* Что бы добавить изображение нужно получить id изображения из Media librarry и добавить его в таблицу parts.

const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const API_URL = "http://localhost:1337/api";
const jwtToken = process.env.API_TOKEN; // JWT-токен для аутентификации

// Файлы для логирования
const foundLogFilePath = "./logs/found_log.txt";
const notFoundLogFilePath = "./logs/not_found_log.txt";

// Функция для записи логов в файл
function logToFile(filePath, message) {
  fs.appendFileSync(filePath, message + "\n", "utf8");
}

// Функция для чтения JSON файла
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return [];
  }
}

// Функция для поиска ID изображения по имени в Strapi
async function fetchImageIdByName(fileName) {
  try {
    const response = await axios.get(`${API_URL}/upload/files`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      params: { "filters[name][$eq]": fileName },
    });
    if (response.data.length > 0) {
      const message = `Found image ID for ${fileName}: ${response.data[0].id}`;
      console.log(message);
      logToFile(foundLogFilePath, message);
      return response.data[0].id;
    } else {
      const message = `Image not found for file name: ${fileName}`;
      console.log(message);
      logToFile(notFoundLogFilePath, message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching image ID from Strapi:", error);
    return null;
  }
}

async function updatePartWithImage(partNumber, imageId) {
  try {
    const partResponse = await axios.get(`${API_URL}/parts`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      params: { "filters[part_number][$eq]": partNumber },
    });

    if (partResponse.data.data && partResponse.data.data.length > 0) {
      const partId = partResponse.data.data[0].id;

      const updateResponse = await axios.put(
        `${API_URL}/parts/${partId}`,
        {
          data: {
            img: [imageId], 
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (updateResponse.status === 200) {
        console.log(
          `Successfully updated part ${partNumber} with image ID ${imageId}`
        );
      } else {
        console.log(
          `Failed to update part ${partNumber}: ${updateResponse.statusText}`
        );
      }
    } else {
      console.log(`No part found for part number: ${partNumber}`);
    }
  } catch (error) {
    console.error(
      `Error updating part ${partNumber} with image:`,
      error.response ? error.response.data : error.message
    );
  }
}

async function processPartsData(jsonFilePath) {
  const partsData = readJsonFile(jsonFilePath);
  for (const part of partsData) {
    const imageId = await fetchImageIdByName(part.image_url);
    if (imageId) {
      await updatePartWithImage(part.part_number, imageId);
    } else {
      console.log(`No image found for part_number ${part.part_number}`);
    }
  }
}

// Путь к JSON файлу с данными запчастей
const jsonFilePath = "./json/last2.json";

processPartsData(jsonFilePath);
