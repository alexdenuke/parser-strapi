//* Скрипт загружает данные из JSON по restapi strapi в таблицу parts. Загружает если таблица Пустая.

const axios = require("axios");
require("dotenv").config();
const API_URL = "http://localhost:1337/api";
const API_TOKEN = process.env.API_TOKEN;

// Настройки заголовков для запросов
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
};

async function addPart(part, brandIds, modelIds, categoryId) {
  try {
    const url = `${API_URL}/parts`;
    const body = {
      data: {
        part_number: part.part_number.split(",")[0].trim(),
        sku: part.sku.toString(),
        name_ru: part.name_ru,
        name_en: part.name_en,
        part_brands: brandIds, // Массив ID брендов
        part_category: categoryId, // ID категории
        models: modelIds, // Массив ID моделей
      },
    };
    const response = await axios.post(url, body, axiosConfig);
    console.log(
      `SKU ${part.sku}: Запчасть добавлена с ID ${response.data.data.id}`
    );
  } catch (error) {
    const errorMessage = error.response
      ? `Ошибка: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      : `Ошибка: ${error.message}`;
    console.log(
      `SKU ${part.sku}: Ошибка при добавлении запчасти: ${errorMessage}`
    );
  }
}

async function findCategoryId(categoryName, sku) {
  if (!categoryName) {
    console.log(`SKU ${sku}: Категория не предоставлена`);
    return null;
  }
  try {
    const encodedCategoryName = encodeURIComponent(categoryName.trim());
    const url = `${API_URL}/part-categories?filters[name][$eq]=${encodedCategoryName}`;
    const response = await axios.get(url, axiosConfig);
    const data = response.data;
    if (data.data.length > 0) {
      console.log(
        `SKU ${sku}: Найдена категория '${categoryName.trim()}': ID ${
          data.data[0].id
        }`
      );
      return data.data[0].id;
    } else {
      console.log(`SKU ${sku}: Категория ${categoryName.trim()} не найдена`);
      return null;
    }
  } catch (error) {
    console.log(
      `SKU ${sku}: Ошибка при поиске категории ${categoryName.trim()}: ${
        error.message
      }`
    );
    return null;
  }
}

async function findBrandId(brandNames, sku) {
  if (!brandNames) {
    console.log(`SKU ${sku}: Бренды не предоставлены`);
    return [];
  }
  const ids = [];
  const brandList = brandNames.split(", ");
  for (const brandName of brandList) {
    try {
      const encodedBrandName = encodeURIComponent(brandName.trim());
      const url = `${API_URL}/part-brands?filters[name][$eq]=${encodedBrandName}`;
      const response = await axios.get(url, axiosConfig);
      const data = response.data;
      if (data.data.length > 0) {
        ids.push(data.data[0].id);
        console.log("Это IDS", ids);
        console.log(
          `Found brand '${brandName.trim()}': ID ${
            data.data[0].id
          } with attributes`,
          data.data[0].attributes
        );
      } else {
        console.log(`SKU ${sku}: Бренд ${brandName.trim()} не найден`);
      }
    } catch (error) {
      console.log(
        `SKU ${sku}: Ошибка при поиске бренда ${brandName.trim()}: ${
          error.message
        }`
      );
    }
  }
  return ids.length > 0 ? ids : null;
}

async function findModelIds(modelNames, sku) {
  const ids = [];
  if (!modelNames) {
    console.log(`SKU ${sku}: Список совместимых моделей не предоставлен`);
    return ids;
  }
  for (let name of modelNames.split(", ")) {
    try {
      const url = `${API_URL}/models?filters[name][$eq]=${name.trim()}`;
      const response = await axios.get(url, axiosConfig);
      const data = response.data;
      if (data.data.length > 0) {
        ids.push(data.data[0].id);
      } else {
        console.log(`SKU ${sku}: Модель ${name.trim()} не найдена`);
      }
    } catch (error) {
      console.log(
        `SKU ${sku}: Ошибка при поиске модели ${name.trim()}: ${error.message}`
      );
    }
  }
  return ids;
}

async function processParts() {
  const parts = require("./json/parts.json");
  for (const part of parts) {
    console.log("Это PART", part);
    const brandIds = await findBrandId(part.part_brand, part.sku);
    const modelIds = await findModelIds(part.compatible_models, part.sku);
    const categoryId = await findCategoryId(part.part_category, part.sku);

    if (brandIds && modelIds.length > 0 && categoryId) {
      await addPart(part, brandIds, modelIds, categoryId);
    } else {
      console.log(
        `SKU ${part.sku}: Обработана запчасть с проблемами: Бренды ID [${
          brandIds ? brandIds.join(", ") : "не найдены"
        }], Модели ID [${modelIds.join(", ")}], Категория ID ${
          categoryId || "не найдена"
        }`
      );
    }
  }
}

processParts();
