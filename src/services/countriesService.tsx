import { africaCountriesData } from "../data/countries";

export interface Country {
  name: string;
  code: string; // Code téléphonique (ex: +228)
  abbreviation: string; // Abréviation (ex: TG)
  flag: string; // Emoji ou URL du drapeau SVG
}

// Interface pour l'API REST Countries
interface RestCountryData {
  name: {
    common: string;
    official: string;
  };
  cca2: string; // Code ISO à 2 lettres
  idd: {
    root: string;
    suffixes: string[];
  };
  flags: {
    svg: string;
    png: string;
  };
}

// Données des pays (chargées depuis le fichier de données ou l'API)
let countriesData: Country[] = [...africaCountriesData];

// Cache pour éviter les appels répétés à l'API
let apiDataLoaded = false;

export const countriesService = {
  // Récupérer les données depuis l'API REST Countries
  async loadCountriesFromAPI(): Promise<void> {
    if (apiDataLoaded) return; // Éviter les appels multiples

    try {
      console.log("🌍 Chargement des pays depuis l'API REST Countries...");

      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL ||
          "https://restcountries.com/v3.1/region/africa"
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const apiCountries: RestCountryData[] = await response.json();

      const formattedCountries: Country[] = apiCountries
        .map((country) => {
          // Construire le code téléphonique
          const phoneCode =
            country.idd?.root && country.idd?.suffixes?.[0]
              ? `${country.idd.root}${country.idd.suffixes[0]}`
              : "";

          return {
            name: country.name.common,
            code: phoneCode,
            abbreviation: country.cca2,
            flag: country.flags.svg,
          };
        })
        .filter((country) => country.code) // Garder seulement les pays avec un code téléphonique
        .sort((a, b) => a.name.localeCompare(b.name)); // Trier par nom

      countriesData = formattedCountries;
      apiDataLoaded = true;

      console.log(`✅ ${formattedCountries.length} pays chargés depuis l'API`);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des pays depuis l'API:",
        error
      );
      console.log("📦 Utilisation des données de fallback...");
      // En cas d'erreur, on garde les données par défaut
    }
  },

  // Récupérer tous les pays
  getAllCountries(): Country[] {
    return countriesData;
  },

  // Récupérer tous les pays avec chargement automatique depuis l'API
  async getAllCountriesAsync(): Promise<Country[]> {
    await countriesService.loadCountriesFromAPI();
    return countriesData;
  },

  // Rechercher un pays par son code téléphonique
  getCountryByCode(phoneCode: string): Country | undefined {
    return countriesData.find((country) => country.code === phoneCode);
  },

  // Rechercher un pays par son abréviation
  getCountryByAbbreviation(abbreviation: string): Country | undefined {
    return countriesData.find(
      (country) =>
        country.abbreviation.toLowerCase() === abbreviation.toLowerCase()
    );
  },

  // Rechercher des pays par nom (recherche partielle)
  searchCountriesByName(searchTerm: string): Country[] {
    const term = searchTerm.toLowerCase();
    return countriesData.filter((country) =>
      country.name.toLowerCase().includes(term)
    );
  },

  // Récupérer les pays les plus utilisés (pour affichage prioritaire)
  getPopularCountries(): Country[] {
    const popularCodes = ["+228", "+225", "+233", "+234"];
    return countriesData.filter((country) =>
      popularCodes.includes(country.code)
    );
  },

  // Valider un numéro de téléphone avec le code pays
  validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
    const country = countriesService.getCountryByCode(countryCode);
    if (!country) return false;

    // Logique de validation basique (à adapter selon les règles de chaque pays)
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // La plupart des pays africains ont entre 8 et 10 chiffres après le code pays
    return cleanNumber.length >= 8 && cleanNumber.length <= 10;
  },

  // Formater un numéro de téléphone
  formatPhoneNumber(phoneNumber: string, countryCode: string): string {
    const country = countriesService.getCountryByCode(countryCode);
    if (!country) return phoneNumber;

    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // Format basique: +XXX XX XX XX XX
    if (cleanNumber.length === 8) {
      return `${countryCode} ${cleanNumber.slice(0, 2)} ${cleanNumber.slice(
        2,
        4
      )} ${cleanNumber.slice(4, 6)} ${cleanNumber.slice(6, 8)}`;
    }

    return `${countryCode} ${cleanNumber}`;
  },

  // Ajouter/remplacer la liste des pays avec votre JSON
  updateCountriesData(countries: Country[]): void {
    countriesData = [...countries];
  },
};
