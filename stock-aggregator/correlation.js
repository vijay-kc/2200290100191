function avg(data) {
    const sum = data.reduce((a, b) => a + b.price, 0);
    return parseFloat((sum / data.length).toFixed(6));
  }
  
  function compute(stockA, stockB) {
    const minLen = Math.min(stockA.length, stockB.length);
    const a = stockA.slice(-minLen);
    const b = stockB.slice(-minLen);
  
    const avgA = avg(a);
    const avgB = avg(b);
  
    let covariance = 0, varA = 0, varB = 0;
  
    for (let i = 0; i < minLen; i++) {
      const x = a[i].price - avgA;
      const y = b[i].price - avgB;
      covariance += x * y;
      varA += x * x;
      varB += y * y;
    }
  
    const denominator = Math.sqrt(varA * varB);
    return denominator === 0 ? 0 : covariance / denominator;
  }
  
  module.exports = { compute, avg };
  