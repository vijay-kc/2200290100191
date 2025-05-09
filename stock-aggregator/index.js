const express = require("express");
const axios = require("axios");
const correlation = require("./correlation");

const app = express();
const BASE_URL = "http://20.244.56.144/evaluation-service/stocks";
const PORT = 3000;

app.get("/stocks/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const { minutes } = req.query;
  

  try {
    const url = `${BASE_URL}/${ticker}?minutes=${minutes}`;
    const response = await axios.get(url ,{
        headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`
        },
        timeout: 500 
    });
    const prices = response.data;

    const avg = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

    res.json({
      averageStockPrice: parseFloat(avg.toFixed(6)),
      priceHistory: prices
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.get("/stockcorrelation", async (req, res) => {
  const { minutes, ticker: tickers } = req.query;
  if (!Array.isArray(tickers) || tickers.length !== 2)
    return res.status(400).json({ error: "Exactly two tickers are required" });

  try {
    const [dataA, dataB] = await Promise.all(
      tickers.map(t => axios.get(`${BASE_URL}/${t}?minutes=${minutes}`))
    );

    const stockA = dataA.data;
    const stockB = dataB.data;

    const corr = correlation.compute(stockA, stockB);

    res.json({
      correlation: parseFloat(corr.toFixed(4)),
      stocks: {
        [tickers[0]]: {
          averagePrice: correlation.avg(stockA),
          priceHistory: stockA
        },
        [tickers[1]]: {
          averagePrice: correlation.avg(stockB),
          priceHistory: stockB
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch or process stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Stock Aggregator running on http://localhost:${PORT}`);
});
