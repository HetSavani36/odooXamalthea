// Frontend/src/utils/currencyConverter.js

// Mock exchange rates (base: USD)
// In production, this would be fetched from an API like exchangerate-api.com or fixer.io
const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    AUD: 1.52,
    CAD: 1.36,
    JPY: 149.50,
    CNY: 7.24,
    CHF: 0.88,
    SGD: 1.34,
    AED: 3.67,
    SAR: 3.75,
    ZAR: 18.65,
    NZD: 1.64,
    MXN: 17.12,
    BRL: 4.98,
};

// Get company currency from localStorage (set during registration)
export const getCompanyCurrency = () => {
    const companyCurrency = localStorage.getItem('companyCurrency');
    return companyCurrency || 'USD'; // Default to USD if not set
};

// Set company currency in localStorage
export const setCompanyCurrency = (currency) => {
    localStorage.setItem('companyCurrency', currency);
};

// Get country to currency mapping
export const COUNTRY_CURRENCY_MAP = {
    'United States': 'USD',
    'United Kingdom': 'GBP',
    'Canada': 'CAD',
    'Australia': 'AUD',
    'India': 'INR',
    'Germany': 'EUR',
    'France': 'EUR',
    'Japan': 'JPY',
    'China': 'CNY',
    'Brazil': 'BRL',
    'Mexico': 'MXN',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'Netherlands': 'EUR',
    'Sweden': 'EUR',
    'Switzerland': 'CHF',
    'Singapore': 'SGD',
    'United Arab Emirates': 'AED',
    'Saudi Arabia': 'SAR',
    'South Africa': 'ZAR',
    'New Zealand': 'NZD',
    'Ireland': 'EUR',
    'Belgium': 'EUR',
    'Austria': 'EUR',
    'Denmark': 'EUR',
    'Norway': 'EUR',
    'Finland': 'EUR',
    'Poland': 'EUR',
    'Portugal': 'EUR',
    'Greece': 'EUR',
    'Other': 'USD',
};

// Get currency for a country
export const getCurrencyForCountry = (country) => {
    return COUNTRY_CURRENCY_MAP[country] || 'USD';
};

// Convert amount from one currency to another
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || isNaN(amount)) return 0;
    
    const fromRate = EXCHANGE_RATES[fromCurrency];
    const toRate = EXCHANGE_RATES[toCurrency];
    
    if (!fromRate || !toRate) {
        console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
        return amount; // Return original amount if conversion not available
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = parseFloat(amount) / fromRate;
    const convertedAmount = usdAmount * toRate;
    
    return convertedAmount;
};

// Format currency with symbol
export const formatCurrency = (amount, currency) => {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        JPY: '¥',
        CNY: '¥',
        AUD: 'A$',
        CAD: 'C$',
        CHF: 'CHF',
        SGD: 'S$',
        AED: 'AED',
        SAR: 'SAR',
        ZAR: 'R',
        NZD: 'NZ$',
        MXN: 'MX$',
        BRL: 'R$',
    };
    
    const symbol = symbols[currency] || currency;
    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    
    return `${symbol}${formattedAmount}`;
};

// Get all supported currencies
export const getSupportedCurrencies = () => {
    return Object.keys(EXCHANGE_RATES);
};

// Get exchange rate between two currencies
export const getExchangeRate = (fromCurrency, toCurrency) => {
    const fromRate = EXCHANGE_RATES[fromCurrency];
    const toRate = EXCHANGE_RATES[toCurrency];
    
    if (!fromRate || !toRate) return 1;
    
    return toRate / fromRate;
};

// FUTURE: Fetch live exchange rates from API
export const fetchLiveExchangeRates = async () => {
    try {
        // Example API call (you would need an API key)
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // return data.rates;
        
        console.log('Live exchange rates not implemented yet. Using mock rates.');
        return EXCHANGE_RATES;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return EXCHANGE_RATES; // Fallback to mock rates
    }
};
