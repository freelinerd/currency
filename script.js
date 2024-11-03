const API_KEY = '936c66a0fb2b9236128fd1cf';
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

let tasas = {};
let saldo = 10000; // Saldo inicial en USD

// Obtener tasas de cambio
async function obtenerTasas() {
    try {
        const respuesta = await fetch(BASE_URL);
        const datos = await respuesta.json();
        tasas = datos.rates;
        llenarSelectsMonedas();
        actualizarTicker();
        inicializarGrafico();
    } catch (error) {
        console.error('Error al obtener las tasas:', error);
    }
}

// Llenar elementos select de moneda
function llenarSelectsMonedas() {
    const selects = ['from-currency', 'to-currency', 'buy-currency', 'sell-currency'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '';
        Object.keys(tasas).forEach(moneda => {
            const opcion = document.createElement('option');
            opcion.value = moneda;
            opcion.textContent = moneda;
            select.appendChild(opcion);
        });
    });
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

// Inicializar gráfico
function inicializarGrafico() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 7 }, (_, i) => `Día ${i + 1}`),
            datasets: [{
                label: 'Tendencia de tasa de cambio',
                data: Array.from({ length: 7 }, () => Math.random() * 2),
                borderColor: '#0081dd',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#000000'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#000000' }
                },
                x: {
                    ticks: { color: '#000000' }
                }
            }
        }
    });
}

// Convertir moneda
document.getElementById('convert').addEventListener('click', () => {
    const cantidad = parseFloat(document.getElementById('amount').value);
    const monedaDesde = document.getElementById('from-currency').value;
    const monedaHasta = document.getElementById('to-currency').value;

    const resultado = cantidad * (tasas[monedaHasta] / tasas[monedaDesde]);
    document.getElementById('result').textContent =
        `${cantidad} ${monedaDesde} = ${resultado.toFixed(2)} ${monedaHasta}`;
});

// Añadir funcionalidad de flip en tarjetas
document.querySelectorAll('.card').forEach(card => {
    card.querySelectorAll('.flip-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('flipped');
        });
    });
});

// Modificar controladores de compra para nuevo flujo de trabajo de flip en tarjeta
document.getElementById('proceed-buy').addEventListener('click', () => {
    const cantidad = parseFloat(document.getElementById('buy-amount').value);
    const moneda = document.getElementById('buy-currency').value;
    const costo = cantidad * tasas[moneda];

    if (costo <= saldo) {
        document.getElementById('buy-card').classList.add('flipped');
    } else {
        document.getElementById('buy-result').textContent =
            'Balance insuficiente.';
    }
});

document.getElementById('confirm-buy').addEventListener('click', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(document.getElementById('buy-amount').value);
    const moneda = document.getElementById('buy-currency').value;
    const costo = cantidad * tasas[moneda];

    saldo -= costo;
    document.getElementById('buy-result').textContent =
        `Compra realizada ${cantidad} ${moneda}. Balance: $${saldo.toFixed(2)}`;
    document.getElementById('buy-card').classList.remove('flipped');
});

document.getElementById('proceed-sell').addEventListener('click', () => {
    document.getElementById('sell-card').classList.add('flipped');
});

document.getElementById('confirm-sell').addEventListener('click', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(document.getElementById('sell-amount').value);
    const moneda = document.getElementById('sell-currency').value;
    const valor = cantidad / tasas[moneda];

    saldo += valor;
    document.getElementById('sell-result').textContent =
        `Venta realizada ${cantidad} ${moneda}. Balance: $${saldo.toFixed(2)}`;
    document.getElementById('sell-card').classList.remove('flipped');
});

// Inicializar la aplicación
obtenerTasas();

// Actualizar tasas periódicamente
setInterval(obtenerTasas, 60000); // Actualizar cada minuto
