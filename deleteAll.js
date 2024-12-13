const axios = require("axios");
require("dotenv").config();
const API_URL = "http://localhost:1337/api/parts";
const TOKEN = process.env.API_TOKEN;

async function deleteAllRecords() {
  try {
    // Получаем все записи
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    // Массив ID записей для удаления
    const ids = response.data.data.map((item) => item.id);

    // Перебираем все ID и удаляем записи
    for (const id of ids) {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      console.log(`Record with ID ${id} deleted`);
    }

    console.log("All records have been deleted");
  } catch (error) {
    console.error(
      "Error deleting records:",
      error.response ? error.response.data : error.message
    );
  }
}

deleteAllRecords();
