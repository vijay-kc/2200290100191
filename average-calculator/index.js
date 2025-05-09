const express = require("express");
const axios = require("axios");



const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 500;
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2Nzk2MTc1LCJpYXQiOjE3NDY3OTU4NzUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImIyODJjMjIzLWMzNjItNGJkNi1iZDJmLTE1NTU5YWUzMjE5YiIsInN1YiI6InZpamF5LjIyMjZjc2UxMTYyQGtpZXQuZWR1In0sImVtYWlsIjoidmlqYXkuMjIyNmNzZTExNjJAa2lldC5lZHUiLCJuYW1lIjoidmlqYXkga3VtYXIgY2hhdXJhc2l5YSIsInJvbGxObyI6IjIyMDAyOTAxMDAxOTEiLCJhY2Nlc3NDb2RlIjoiU3hWZWphIiwiY2xpZW50SUQiOiJiMjgyYzIyMy1jMzYyLTRiZDYtYmQyZi0xNTU1OWFlMzIxOWIiLCJjbGllbnRTZWNyZXQiOiJyZld4SFpHdUtiZEdtaENOIn0.ne5NVAn3mSK3uUH2aUatIw7FUbp5iWhAu7baCgehBhI';

const apiMap = {
  p: "primes",
  f: "fibo",
  e: "even",
  r: "rand"
};

const windowStore = []; 

app.get("/numbers/:type", async (req, res) => {
  const type = req.params.type;
  if (!apiMap[type]) return res.status(400).json({ error: "Invalid type" });

  const prevState = [...windowStore];

  let numbers = [];
  try {
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => source.cancel(), TIMEOUT_MS);

    const response = await axios.get(`http://20.244.56.144/evaluation-service/${apiMap[type]}`, {
      timeout: TIMEOUT_MS,
      cancelToken: source.token,
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });
    clearTimeout(timeout);
    numbers = response.data.numbers || [];
  } catch (err) {
    return res.json({
      windowPrevState: prevState,
      windowCurrState: windowStore,
      numbers: [],
      avg: calcAverage(windowStore),
    });
  }

  // Update window
  for (const num of numbers) {
    if (!windowStore.includes(num)) {
      if (windowStore.length >= WINDOW_SIZE) windowStore.shift();
      windowStore.push(num);
    }
  }

  res.json({
    windowPrevState: prevState,
    windowCurrState: [...windowStore],
    numbers,
    avg: calcAverage(windowStore)
  });
});

function calcAverage(arr) {
  if (!arr.length) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(2));
}

app.listen(PORT, () => {
  console.log(`Average Calculator running on http://localhost:${PORT}`);
});
