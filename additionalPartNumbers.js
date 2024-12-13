const axios = require("axios");
const fs = require("fs");
require("dotenv").config();
const API_URL = "http://localhost:1337/api";
const API_TOKEN = process.env.API_TOKEN;

async function loadAdditionalPartNumbers() {
  const data = JSON.parse(fs.readFileSync("./json/parts.json", "utf8"));

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  for (const item of data) {
    // Assume each part_number string might contain multiple numbers, separated by commas
    const parts = item.part_number.split(", ").map((p) => p.trim());

    // Check if there are additional part numbers beyond the first
    if (parts.length > 1) {
      const sku = item.sku; // Use SKU as the identifier

      try {
        const productResponse = await api.get(`/parts?sku=${sku}`);
        console.log(`Requesting: ${API_URL}/parts?sku=${sku}`);
        console.log(`Response from API:`, productResponse.data);

        if (productResponse.data.data.length > 0) {
          const productId = productResponse.data.data[0].id;

          for (let i = 1; i < parts.length; i++) {
            await api.post("/additional-part-numbers", {
              product: productId,
              part_number: parts[i],
            });
          }
        } else {
          console.error(`No product found with SKU ${sku}`);
        }
      } catch (error) {
        console.error("Error retrieving product by SKU:", item, error);
      }
    }
  }
}

loadAdditionalPartNumbers().catch(console.error);
