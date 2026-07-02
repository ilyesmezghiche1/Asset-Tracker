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

async function loadPortfolio(){
let portfolio = JSON.parse(localStorage.getItem("portfolio"))|| [];
let cryptoAssests = portfolio.filter((assest=>assest.type ==="Crypto"));
let ids = cryptoAssests.map((assets)=> assets.coinId).join(",");
console.log(cryptoAssests)
let CryptoResult = await fetchingCryptoPrices(ids);


let fiatAssests = portfolio.filter((assets)=>assets.type==="Fiat" );
let fiatIds = fiatAssests.map((assest)=>assest.id).join(",");
console.log(fiatAssests);
let fiatResults = await fetchingFiat();
fiatAssests.forEach((asset) => {
  let price = 1 / fiatResults.rates[asset.id];
  console.log(asset.id, price);
});



}
loadPortfolio();
