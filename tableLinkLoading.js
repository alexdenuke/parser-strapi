//* Этот код загружает данные в таблицу моделей оборудования strapi используя json файл. Загружает если таблица Пустая.

const axios = require("axios");
const fs = require("fs").promises;
require("dotenv").config();

const API_URL = "http://localhost:1337/api";
const TOKEN = process.env.API_TOKEN;
const LOG_FILE = "./logs.txt"; // Путь к файлу логов

async function logToFile(message) {
  const timestamp = new Date().toISOString();
  await fs.appendFile(LOG_FILE, `${timestamp} - ${message}\n`);
}

async function getIdByName(url, name) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    };
    const response = await axios.get(
      `${url}?filters[name][$eq]=${encodeURIComponent(name)}`,
      config
    );
    return response.data.data.length > 0 ? response.data.data[0].id : null;
  } catch (error) {
    await logToFile("Ошибка при запросе: " + error);
    return null;
  }
}

async function createModel(model) {
  const brandId = await getIdByName(
    `${API_URL}/model-brands`,
    model.model_brand
  );
  const categoryId = await getIdByName(
    `${API_URL}/model-categories`,
    model.model_category
  );

  if (!brandId || !categoryId) {
    await logToFile(
      `Не удалось получить ID бренда или категории для: ${model.name}`
    );
    return;
  }

  const modelData = {
    data: {
      name: model.name,
      model_brand: brandId,
      model_category: categoryId,
    },
  };

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(`${API_URL}/models`, modelData, config);
    await logToFile("Модель успешно создана: " + JSON.stringify(response.data));
  } catch (error) {
    await logToFile("Ошибка при создании модели: " + error);
  }
}

async function loadModels() {
  try {
    const modelsData = await fs.readFile("./json/models.json", "utf-8");
    const models = JSON.parse(modelsData);
    for (const model of models) {
      await createModel(model);
    }
  } catch (error) {
    await logToFile("Ошибка при чтении файла или обработке данных: " + error);
  }
}

loadModels();
