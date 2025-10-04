// utils/currencyHelper.js
import axios from "axios";

let countriesCache = [];

// Fetch and cache countries once
export async function loadCountries() {
  if (countriesCache.length === 0) {
    const { data } = await axios.get(
      "https://restcountries.com/v3.1/all?fields=name,currencies"
    );
    countriesCache = data;
    console.log("✅ Countries data cached");
  }
  return countriesCache;
}

export async function getCurrencyByCountry(countryName) {
  const countries = await loadCountries();

  const match = countries.find(
    (c) => c.name.common.toLowerCase() === countryName.toLowerCase()
  );

  if (!match) return null;

  const currencyCode = Object.keys(match.currencies)[0];
  const currency = match.currencies[currencyCode];

  return {
    code: currencyCode,
    name: currency.name,
    symbol: currency.symbol,
  };
}
