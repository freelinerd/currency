document.addEventListener('DOMContentLoaded', () => {
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const amountInput = document.getElementById('amount');
    const resultElement = document.getElementById('conversion-result');
    const convertButton = document.querySelector('.convert-btn');
    const historyList = document.getElementById('conversion-history');
    const apiKey = '936c66a0fb2b9236128fd1cf';
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    const currenciesUrl = 'currencies.json';

    // Listamos las divisas
    const currencies = [
        { code: 'USD', name: 'Dólar Estadounidense' },
        { code: 'EUR', name: 'Euro' },
        { code: 'JPY', name: 'Yen Japonés' },
        { code: 'GBP', name: 'Libra Esterlina' },
        { code: 'AUD', name: 'Dólar Australiano' },
        { code: 'CAD', name: 'Dólar Canadiense' },
        { code: 'CHF', name: 'Franco Suizo' },
        { code: 'CNY', name: 'Yuan Chino' },
        { code: 'SEK', name: 'Corona Sueca' },
        { code: 'NZD', name: 'Dólar Neozelandés' },
        { code: 'DOP', name: 'Peso Dominicano'}

    ];

    // Agregamos las opciones a las listas desplegables
    const populateCurrencySelect = (selectElement) => {
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            selectElement.appendChild(option);
        });
    };

    // Inicializamos las listas desplegables
    populateCurrencySelect(fromCurrencySelect);
    populateCurrencySelect(toCurrencySelect);

    // Cargamos las tasas de cambio
    const loadRates = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.result === 'success') {
                return data.conversion_rates;
            } else {
                throw new Error('Error en la respuesta de la API');
            }
        } catch (error) {
            console.error('Error al obtener las tasas de cambio:', error);
            resultElement.textContent = 'Error al obtener las tasas de cambio.';
        }
    };

    // Realizamos la conversión de divisas
    const convertCurrency = async () => {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            resultElement.textContent = 'Por favor ingrese una cantidad válida.';
            return;
        }

        try {
            const rates = await loadRates();
            const fromRate = rates[fromCurrency];
            const toRate = rates[toCurrency];

            if (fromRate && toRate) {
                const convertedAmount = (amount / fromRate) * toRate;
                resultElement.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
                
                // Agregamos los datos al historial
                const listItem = document.createElement('li');
                listItem.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
                historyList.appendChild(listItem);
            } else {
                resultElement.textContent = 'Error al obtener las tasas de cambio.';
            }
        } catch (error) {
            console.error('Error al realizar la conversión:', error);
            resultElement.textContent = 'Error al realizar la conversión.';
        }
    };

    // Manejamos el evento de clic en el botón de conversión
    convertButton.addEventListener('click', convertCurrency);
});