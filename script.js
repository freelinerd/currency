const API_KEY = '936c66a0fb2b9236128fd1cf';
let chart;
let historicalData = {};

async function fetchExchangeRates() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error('Error fetching rates:', error);
        return null;
    }
}

// Actualizar ticker con tasas en tiempo real
function actualizarTicker() {
    const ticker = document.getElementById('ticker');
    ticker.innerHTML = '';
    Object.entries(tasas).forEach(([moneda, tasa]) => {
        const item = document.createElement('div');
        item.className = 'ticker-item';
        item.textContent = `${moneda}: ${tasa.toFixed(4)}`;
        ticker.appendChild(item);
    });
}

function updateChart(rates) {
    const currencies = ['USD', 'EUR', 'GBP'];
    const timestamps = Object.keys(historicalData);

    if (!chart) {
        const ctx = document.getElementById('ratesChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: currencies.map(currency => ({
                    label: currency,
                    data: timestamps.map(t => historicalData[t][currency]),
                    borderColor: getRandomColor(),
                    fill: false
                }))
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    } else {
        chart.data.labels = timestamps;
        chart.data.datasets.forEach((dataset, i) => {
            dataset.data = timestamps.map(t => historicalData[t][currencies[i]]);
        });
        chart.update();
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    const rates = await fetchExchangeRates();
    if (!rates) return;

    const result = amount * (rates[to] / rates[from]);

    document.getElementById('result').innerHTML = `
    <div class="result-amount">
      ${amount} ${from} =
      <span class="converted-amount">${result.toFixed(2)} ${to}</span>
    </div>
    <div class="rate-info">
      1 ${from} = ${(rates[to] / rates[from]).toFixed(4)} ${to}
    </div>
  `;

    addToHistory(amount, from, to, result);
}

function addToHistory(amount, from, to, result) {
    const historySection = document.getElementById('historySection');
    const historyDiv = document.getElementById('history');
    const date = new Date().toLocaleString();

    historySection.style.display = 'block';

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
    <div class="history-date">${date}</div>
    <div class="history-conversion">
      <span class="history-amount">${amount} ${from}</span>
      →
      <span class="history-amount">${result.toFixed(2)} ${to}</span>
    </div>
  `;

    historyDiv.prepend(historyItem);
}

function showSection(sectionId) {
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });

    const selectedSection = document.getElementById(sectionId);
    if (sectionId === 'inicio') {
        selectedSection.style.display = 'block';
        document.querySelector('.card:not(.purchase-form)').style.display = 'block';
        document.getElementById('purchaseForm').style.display = 'none';
        document.getElementById('paymentForm').style.display = 'none';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (chart) {
            setTimeout(() => {
                chart.update();
            }, 100);
        }
    } else {
        selectedSection.style.display = 'block';
        selectedSection.style.animation = 'fadeIn 0.5s ease';
    }
}

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

showSection('inicio');

function showPurchaseForm() {
    document.querySelector('.card:not(.purchase-form)').style.display = 'none';
    document.getElementById('purchaseForm').style.display = 'block';
    document.getElementById('paymentForm').style.display = 'none';
}

function showPaymentForm() {
    document.getElementById('purchaseForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'block';
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    input.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
}

function validateCard() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expDate = document.getElementById('expDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!/^\d{16}$/.test(cardNumber)) {
        alert('Número de tarjeta inválido');
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expDate)) {
        alert('Fecha de expiración inválida');
        return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
        alert('CVV inválido');
        return false;
    }

    return true;
}

function processPayment() {
    if (!validateCard()) return;

    const btn = document.getElementById('processPaymentBtn');
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('success-animation');
        alert('Pago procesado exitosamente!');
        document.getElementById('paymentForm').style.display = 'none';
    }, 2000);
}

document.getElementById('convertBtn').addEventListener('click', convertCurrency);
document.getElementById('comprarBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showPurchaseForm();
});

document.getElementById('nextToPaymentBtn').addEventListener('click', showPaymentForm);

document.getElementById('processPaymentBtn').addEventListener('click', processPayment);

document.getElementById('cardNumber').addEventListener('input', function () {
    formatCardNumber(this);
});

document.getElementById('expDate').addEventListener('input', function () {
    formatExpDate(this);
});

let currentPeriod = '24h';

function generateMockHistoricalData(period) {
    const data = {};
    const now = new Date();
    let points;
    let interval;

    switch (period) {
        case '24h':
            points = 24;
            interval = 60 * 60 * 1000; // 1 hora
            break;
        case '1w':
            points = 7;
            interval = 24 * 60 * 60 * 1000; // 1 día
            break;
        case '1m':
            points = 30;
            interval = 24 * 60 * 60 * 1000; // 1 día
            break;
        case '1y':
            points = 12;
            interval = 30 * 24 * 60 * 60 * 1000; // 1 mes
            break;
    }

    for (let i = points; i >= 0; i--) {
        const time = new Date(now - (i * interval));
        let timestamp;
        switch (period) {
            case '24h':
                timestamp = time.getHours() + ':00';
                break;
            case '1w':
                timestamp = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][time.getDay()];
                break;
            case '1m':
                timestamp = time.getDate() + '/' + (time.getMonth() + 1);
                break;
            case '1y':
                timestamp = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][time.getMonth()];
                break;
        }
        data[timestamp] = {
            USD: 1,
            EUR: 0.85 + Math.random() * 0.1,
            GBP: 0.73 + Math.random() * 0.1
        };
    }

    return data;
}

document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentPeriod = btn.dataset.period;
        historicalData = generateMockHistoricalData(currentPeriod);
        updateChart();
    });
});

function initializeChart() {
    historicalData = generateMockHistoricalData('24h');
    updateChart();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
});

async function updateRates() {
    const rates = await fetchExchangeRates();
    if (rates) {
        const now = new Date();
        const timestamp = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
        historicalData[timestamp] = rates;

        const timestamps = Object.keys(historicalData);
        if (timestamps.length > 10) {
            delete historicalData[timestamps[0]];
        }

        updateChart(rates);
    }
}

document.getElementById('currentYear').textContent = new Date().getFullYear();
updateRates();
setInterval(updateRates, 30000);