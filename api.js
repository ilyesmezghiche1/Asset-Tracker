async function fetchingCrypto(searchTerm) {
  try {
    let result = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${searchTerm}`,
    );
    if (!result.ok) throw new Error("Failed");
    let data = await result.json();
    return data;
  } catch {
    console.error("failed");
    return [];
  }
}

async function fetchingFiat() {
  try {
    let result = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!result.ok) throw new Error("Failed");
    let data = await result.json();
    console.log(data);
    return data;
  } catch {
    console.error("failed");
    return [];
  }
}
async function fetchingCryptoPrices(ids) {
  try {
    let result = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
    );
    if (!result.ok) throw new Error("Failed");
    let data = await result.json();
    console.log(data);
    return data;
  } catch {
    console.error("failed");
    return {};
  }
}
