const axios = require("axios");
require("dotenv").config();

const API_URL = "http://localhost:1337/api/models";
const TOKEN = process.env.API_TOKEN;

axios
  .get(API_URL, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  })
  .then((response) => {
    console.log("Данные успешно получены:", response.data);
  })
  .catch((error) => {
    console.error(
      "Произошла ошибка при запросе:",
      error.response ? error.response.data : error.message
    );
  });
