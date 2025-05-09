const express = require("express");
const axios = require("axios");



const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 500;


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
      timeout: TIMEOUT,
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
