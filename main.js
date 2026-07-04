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
    rendertable();
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
 let cryptoIds = cryptoAssests.map((assets) => assets.coinId);
 let { frecheEnought, needToFetching } = getChachedPrices(cryptoIds);
 let CryptoResult = await getUpdatedPrices(needToFetching, frecheEnought);
  let cryptoWithePrice = cryptoAssests.map((asset) => {
    let price = parseFloat(CryptoResult[asset.coinId].toFixed(4));
    let value = parseFloat((asset.amount * price).toFixed(4));
    return { ...asset, livePrice: price, value: value };
  });

  let fiatAssests = portfolio.filter((assets) => assets.type === "Fiat");
  let fiatIds = fiatAssests.map((assest) => assest.id).join(",");
  let fiatResults = await fetchingFiat(fiatIds);
  let fiatWithePrice = fiatAssests.map((asset) => {
    let price = parseFloat((1 / fiatResults.rates[asset.id]).toFixed(4));
    let value = parseFloat((asset.amount * price).toFixed(4));
    return { ...asset, livePrice: price, value: value };
  });
  let fullportfolio = [...cryptoWithePrice, ...fiatWithePrice];
  console.log(fullportfolio);
  let totalValue = fullportfolio.reduce((accumulator, asset) => {
    return accumulator + asset.value;
  }, 0);
  // i use this algorithme for store deffrent color every time and calcule the allocation
  let startPosition = Math.floor(Math.random() * 360);
  let step = 360 / fullportfolio.length;
  let jitterRange = step * 0.3;
  let thePrortfolio = fullportfolio.map((asset, index) => {
    let jitter = Math.floor(Math.random() * jitterRange * 2) - jitterRange;
    let hue = (startPosition + index * step + jitter) % 360;
    let allocation = parseFloat(((asset.value / totalValue) * 100).toFixed(2));
    return { ...asset, allocation: allocation, hue: hue };
  });
  return thePrortfolio;
}
let tbody = document.querySelector("tbody");
async function rendertable() {
  let portfolioData = await loadPortfolio();
  console.log(portfolioData);
  tbody.innerHTML = portfolioData
    .map(
      (asset) =>
        `<tr class="h-16.75 px-4.5 py-3.5 border-b border-b-borderb">
      <td class="w-57.25">
                  <div class="flex items-center gap-2 pl-4.5">
                      <span span style="background-color: hsl(${asset.hue}, 50%, 50%); color: hsla(${asset.hue}, 70%, 30%, 0.9);" class="h-9.5 w-9.5 rounded-[10px]  text-[11px]  font-bold flex justify-center items-center tracking-wide"> ${asset.id} </span>
                    <div class="flex flex-col ">
                      <span class="font-semibold text-[14px]">${asset.name}</span>
                      <span class="text-[11px] font-mono text-bbb ">${asset.type} .${asset.id}</span>
                    </div>
                  </div>
                </td>
                <td class="w-28.75 pl-4.5" >
                  <p class="text-[13px] text-aaa font-mono">${asset.amount}</p>
                </td>
                <td class="w-28.75 ">
                  <p class="text-[13px] font-mono ">$${asset.livePrice}</p>
                </td>
                <td class="w-28.75">
                  <p class="text-[13px] font-mono " >$${asset.value}</p>
                </td>
                <td class="w-32.25">
                <div class="flex items-center gap-2.5">
                  <span class="relative w-15 h-1 bg-aaa rounded-[10px] overflow-hidden inline-block">
                  <span style="width: ${asset.allocation}%; background-color: hsl(${asset.hue}, 50%, 50%);"
                      class="absolute top-0 left-0 h-full rounded-[10px]"></span>
                    </span>
                  <span class="font-mono text-xs text-bbb">${asset.allocation}%</span>
                </div>
                </td>
                <td>
                  <input id="cancelBtn" data-id="${asset.id}" class="text-xl text-bbb hover:text-red-500 cursor-pointer hover:ring-1 hover:ring-red-500 px-2 hover:bg-red-200" type="button" value="x">
        </td>
     </tr>

  `,
    )
    .join("");
}
rendertable();
function removeAssets(idtoremove) {
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  let updatePortfolio = portfolio.filter((asset) => asset.id !== idtoremove);
  localStorage.setItem("portfolio", JSON.stringify(updatePortfolio));
  rendertable();
}
tbody.addEventListener("click", function (asset) {
  let assestClicked = asset.target;
  if (assestClicked.id === "cancelBtn") {
    let idtoremove = assestClicked.dataset.id;
    removeAssets(idtoremove);
  }
});
const STALE_WINDOW =60000;
function getChachedPrices(ids){
let priceChache = JSON.parse(localStorage.getItem("priceChache")) || {};
  let frecheEnought ={};
  let needToFetching =[];
    for(let id of ids){

      let isFreche = priceChache[id] && (Date.now() - priceChache[id].fetchedAt <= STALE_WINDOW);
      if(isFreche){
        frecheEnought[id]=priceChache[id].price;
      }else{
        needToFetching.push(id)
      }
    }
    return {frecheEnought , needToFetching };
}
async function getUpdatedPrices(needToFetching , frecheEnought ){
  let priceChache = JSON.parse(localStorage.getItem("priceChache")) || {};
  let newResult ={};
    if (needToFetching.length !== 0){
        newResult = await fetchingCryptoPrices(needToFetching);
  }
  let frecheFetched = {};
  for(let id of Object.keys(newResult)){
    let price = newResult[id].usd;
    priceChache[id]={price:price , fetchedAt:Date.now()};
    frecheFetched[id]= price;
  }
  localStorage.setItem("priceChache", JSON.stringify(priceChache));
  return {...frecheEnought , ...frecheFetched}

}
