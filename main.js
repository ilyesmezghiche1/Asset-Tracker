async function trying() {
  try {
    let result = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!result.ok) new Error("Failed");
    let data = await result.json();
    console.log(data);
    return data;
  } catch {
    console.error("failed");
    return [];
  }
}
async function trying() {
  try {
    let result = await fetch(`https://open.er-api.com/v6/latest/USD`);
    if (!result.ok) new Error("Failed");
    let data = await result.json();
    console.log(data);
    return data;
  } catch {
    console.error("failed");
    return [];
  }
}

trying();
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
let tricker= document.querySelector("#Ticker");

function getTicker() {
  let searchTerm = nameinput.value.toLowerCase();
  let matches = currencyList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm),
  );

  let curDropDown = document.createElement("div");
  curDropDown.className =
    "w-62.75 bg-background text[13px] rounded-[10px] max-h-[300px] overflow-y-auto absolute top-9.5 left-0";
  curDropDown.innerHTML = matches
    .map(
      (item) => `
              <div data-id="${item.code}" data-name="${item.name}" class=" h-9.5 border-b border-b-borderb cursor-pointer flex justify-center items-center ">
                <span class="text-[13px] hover:text-red-300">${item.name} </span>
              </div>
`,
    )
    .join("");
  console.log(matches);
  if (searchTerm === "") {
    curDropDown.innerHTML = "";
  }
  wraper.querySelector(".dropdown")?.remove();
  curDropDown.classList.add("dropdown");
  wraper.appendChild(curDropDown);
  curDropDown.addEventListener("click",function(e){
   let clickedItem = e.target.closest("[data-id]");
   if(!clickedItem) return;
  nameinput.value = clickedItem.dataset.name;
  tricker.value =clickedItem.dataset.id;
  curDropDown.remove();

});


}
let debounceTimer;
nameinput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(getTicker, 300);
});


