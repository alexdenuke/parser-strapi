const axios = require("axios");
require("dotenv").config();
const jsonData = require("./json/models_brands.json");

const API_URL = "http://localhost:1337/api/model-brands";
const TOKEN = process.env.API_TOKEN;

async function uploadData(data) {
  for (const item of data) {
    try {
      const response = await axios.post(
        API_URL,
        { data: item },
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Data uploaded successfully:", response.data);
    } catch (error) {
      console.error(
        "Error uploading data:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

uploadData(jsonData);
