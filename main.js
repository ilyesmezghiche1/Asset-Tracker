async function trying() {
    try{
       let result = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd`);
       if (!result.ok) new Error("Failed");
       let data = await result.json();
       console.log(data);
       return data;
    }
    catch{
        console.error("failed")
        return [];
    }
}

trying();
const ctx = document.getElementById('myChart').getContext('2d');

new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Bitcoin', 'Ethereum', 'Euro', 'Solana'],
    datasets: [{
      data: [68.2, 16.0, 13.5, 2.5],
      backgroundColor: ['#22c55e', '#a855f7', '#3b82f6', '#f59e0b'],
      borderWidth: 0
    }]
  },
  options: {
    responsive: false,
    cutout: '70%',  // controls the hole size
    plugins: {
      legend: { display: false }  // you'll build your own legend below
    }
  }
});
