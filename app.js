let chart = null;
let selectedCrypto = "";
let selectedInterval = "";

function handleCryptoChange() {
  selectedCrypto = document.getElementById("cryptoSelect").value;
  updateChart();
}

function handleIntervalChange() {
  selectedInterval = document.getElementById("intervalSelect").value;
  updateChart();
}

function updateChart() {
  if (selectedCrypto && selectedInterval) {
    let ajaxUrl = `https://min-api.cryptocompare.com/data/histoday?fsym=${selectedCrypto}&tsym=USD&limit=${selectedInterval}`;
    ajax_request(ajaxUrl);
    let titleText = `${selectedCrypto} Price / ${selectedInterval} Days chart`;
    updateChartTitle(titleText);
  }
}

function ajax_request(url) {
  let xhttp;
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      handle_chart(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function handle_chart(data) {
  let parsed_data = JSON.parse(data.responseText);
  parsed_data = parsed_data.Data;

  let dataSet = parsed_data.map((value) => [value.time * 1000, value.high]);

  let options = {
    chart: {
      type: "area",
      height: 350,
    },
    title: {
      text: `${selectedCrypto} Price / ${selectedInterval} Days chart`,
      align: "left",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "24px",
      },
    },
    toolbar: {
      show: false,
      tools: {
        download: false,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
      fixed: {
        enabled: false,
        position: "topRight",
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
    },
    colors: ["#89CFF0"],
    series: [
      {
        name: `${selectedCrypto} Price (USD)`,
        data: dataSet,
      },
    ],
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
  };

  if (chart) {
    chart.updateOptions(options);
  } else {
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }
}

// Crypto coins

async function fetchCryptoData() {
  try {
    const response = await fetch("https://api.coinranking.com/v2/coins");
    const data = await response.json();
    return data.data.coins;
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    return [];
  }
}

function displayCryptoData(coins) {
  const cryptoTable = document.getElementById("cryptoTable");
  cryptoTable.innerHTML = "";

  coins.forEach((coin) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${coin.iconUrl}" class="crypto-logo" alt="${
      coin.name
    }"></td>
      <td>${coin.name}</td>
      <td>${coin.symbol}</td>
      <td>${formatPrice(coin.price)}</td>
      <td>${coin.change}%</td>
      <td>$${formatVolume(coin["24hVolume"])}</td>
      <td>${coin.marketCap ? formatMarketCap(coin.marketCap) : "-"}</td>
      `;
    cryptoTable.appendChild(row);
  });
}

// format price to show .00
function formatPrice(price) {
  return (
    "$" +
    parseFloat(price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// market cap volume fix
function formatMarketCap(marketCap) {
  return parseFloat(marketCap).toLocaleString();
}

// volume fix coin
function formatVolume(volume) {
  return parseFloat(volume).toLocaleString();
}

// search bar
function filterCryptoData(coins, searchTerm) {
  searchTerm = searchTerm.toLowerCase();

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm) ||
      coin.symbol.toLowerCase().includes(searchTerm)
  );

  return filteredCoins;
}

function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value.trim();

  fetchCryptoData().then((coins) => {
    const filteredCoins = filterCryptoData(coins, searchTerm);
    displayCryptoData(filteredCoins);
  });
}

async function initializeApp() {
  const coins = await fetchCryptoData();
  displayCryptoData(coins);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", handleSearchInput);
}

document.addEventListener("DOMContentLoaded", initializeApp);
