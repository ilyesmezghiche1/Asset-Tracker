const ctx = document.getElementById("myChart").getContext("2d");
new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Bitcoin", "Ethereum", "Euro", "Solana"],
    datasets: [
      {
        data: [68.2, 16.0, 13.5, 2.5],
        backgroundColor: ["#22c55e", "#a855f7", "#3b82f6", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  },
  options: {
    responsive: false,
    cutout: "70%", // controls the hole size
    plugins: {
      legend: { display: false }, // you'll build your own legend below
    },
  },
});

let nameinput = document.querySelector("#name");
let wraper = document.querySelector("#wraper");
let tricker = document.querySelector("#Ticker");
let select = document.querySelector("#select");
let coinId = document.querySelector("#coinId");
let btn = document.querySelector("#btn");
let Quantity = document.querySelector("#Quantity");
select.addEventListener("change", function () {
  console.log(select.value);
});

function getTicker() {
  let searchTerm = nameinput.value.toLowerCase();
  if (searchTerm === "") {
    wraper.querySelector(".dropdown")?.remove();
    return;
  }

  let matches = currencyList
    .filter((item) => item.name.toLowerCase().includes(searchTerm))
    .map((item) => ({ id: item.code, name: item.name }));
  // item.code ("DZD") becomes item.id so renderDropdown always sees {id, name}

  renderDropdown(matches);
}
let debounceTimer;
nameinput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  if (select.value === "Fiat") {
    debounceTimer = setTimeout(getTicker, 300);
  } else {
    wraper.querySelector(".dropdown")?.remove();
    let loading = document.createElement("div");
    loading.className =
      "dropdown w-62.75 bg-background rounded-[10px] absolute top-9.5 left-0 flex justify-center items-center h-9.5";
    loading.innerHTML = `<span class="text-[13px] text-aaa">Searching...</span>`;
    wraper.appendChild(loading);
    debounceTimer = setTimeout(getCryptoticker, 600);
  }
});

async function getCryptoticker() {
  let searchTerm = nameinput.value.toLowerCase();
  if (searchTerm === "") {
    wraper.querySelector(".dropdown")?.remove();
    return;
  }
  let results = await fetchingCrypto(searchTerm);
  if (!results.coins) return;
  let matches = results.coins.map((item) => ({
    id: item.symbol,
    name: item.name,
    coinId: item.id,
  }));
  renderDropdown(matches);
}

function renderDropdown(items) {
  let curDropDown = document.createElement("div");
  curDropDown.className =
    "w-62.75 bg-background text[13px] rounded-[10px] max-h-[300px] overflow-y-auto absolute top-9.5 left-0";
  curDropDown.innerHTML = items
    .map(
      (item) => `
              <div data-id="${item.id}" data-name="${item.name}" data-coinid="${item.coinId || ""}" class=" h-9.5 border-b border-b-borderb cursor-pointer flex justify-center items-center ">
                <span class="text-[13px] hover:text-red-300">${item.name} </span>
              </div>
`,
    )
    .join("");
  wraper.querySelector(".dropdown")?.remove();
  curDropDown.classList.add("dropdown");
  wraper.appendChild(curDropDown);
  curDropDown.addEventListener("click", function (e) {
    let clickedItem = e.target.closest("[data-id]");
    if (!clickedItem) return;
    nameinput.value = clickedItem.dataset.name;
    tricker.value = clickedItem.dataset.id;
    coinId.value = clickedItem.dataset.coinid || "";
    curDropDown.remove();
  });
}

btn.addEventListener("click", function () {
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  if (tricker.value === "" || Quantity.value === "" || nameinput.value === "") {
    Swal.fire({
      title: "field is empty !",
      text: "you need to put all the information",
      icon: "warning",
      showConfirmButton: false,
    });
  } else {
    let saveInformation = {
      id: tricker.value,
      coinId: coinId.value,
      type: select.value,
      amount: parseFloat(Quantity.value),
      name: nameinput.value,
    };
    portfolio.push(saveInformation);
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    nameinput.value = "";
    tricker.value = "";
    Quantity.value = "";
    select.value = "Crypto";
    coinId.value = "";
  }
});

async function loadPortfolio() {
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  let cryptoAssests = portfolio.filter((assest) => assest.type === "Crypto");
  let ids = cryptoAssests.map((assets) => assets.coinId).join(",");
  let CryptoResult = await fetchingCryptoPrices(ids);
  let cryptoWithePrice = cryptoAssests.map((asset) => {
    let price = parseFloat((CryptoResult[asset.coinId].usd).toFixed(3));
    let value = parseFloat((asset.amount * price).toFixed(3));
    return { ...asset, livePrice: price, value: value };
  });

  let fiatAssests = portfolio.filter((assets) => assets.type === "Fiat");
  let fiatIds = fiatAssests.map((assest) => assest.id).join(",");
  let fiatResults = await fetchingFiat(fiatIds);
  let fiatWithePrice=fiatAssests.map((asset) => {
    let price = parseFloat((1 / fiatResults.rates[asset.id]).toFixed(3));
    let value = parseFloat((asset.amount * price).toFixed(3));
     return { ...asset, livePrice: price, value: value };
  });
  let fullportfolio = [...cryptoWithePrice,...fiatWithePrice];
  console.log(fullportfolio);
  let totalValue = fullportfolio.reduce((accumulator, asset)=>{
   return accumulator + asset.value},0);
  let thePrortfolio = fullportfolio.map((asset)=>{
    let allocation = (asset.value / totalValue)* 100;
    return{...asset,allocation:allocation};
  });

  return thePrortfolio;
}


let tbody = document.querySelector("tbody");
function rendertable() {
  let tableInforamtion

  let tr = document.createElement("tr");
  tr.className = "h-16.75 px-4.5 py-3.5 border-b border-b-borderb";
  tr.innerHTML = `
    <td class="w-57.25">
                  <div class="flex items-center gap-2 pl-4.5">
                      <span class="h-9.5 w-9.5 rounded-[10px] bg-bt text-[11px] text-bttext font-bold flex justify-center items-center tracking-wide"> BTC </span>
                    <div class="flex flex-col ">
                      <span class="font-semibold text-[14px]">Bitcoin</span>
                      <span class="text-[11px] font-mono text-bbb ">Crypto .BTC</span>
                    </div>
                  </div>
                </td>
                <td class="w-28.75 pl-4.5" >
                  <p class="text-[13px] text-aaa font-mono">0.35</p>
                </td>
                <td class="w-28.75 ">
                  <p class="text-[13px] font-mono ">$28,840.00</p>
                </td>
                <td class="w-28.75">
                  <p class="text-[13px] font-mono " >$10,094.00</p>
                </td>
                <td class="w-32.25">
                  <div class="flex items-center gap-2.5">
                    <span class="w-15 h-1 bg-bitcoin rounded-[10px]"></span>
                    <span class="font-mono text-xs text-bbb">68.2%</span>
                  </div>
                </td>
                <td>
                  <input class="text-xl text-bbb hover:text-red-500 cursor-pointer hover:ring-1 hover:ring-red-500 px-2 hover:bg-red-200" type="button" value="x">
                </td>

  `;
  tbody.appendChild(tr);
}
rendertable();
