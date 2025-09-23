import { useState, useEffect } from "react";
import { countriesService, type Country } from "../services/countriesService";

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les données depuis l'API ou utiliser le cache
        const countriesData = await countriesService.getAllCountriesAsync();
        setCountries(countriesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur lors du chargement des pays:", err);

        // En cas d'erreur, utiliser les données par défaut
        setCountries(countriesService.getAllCountries());
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Fonctions utilitaires
  const getCountryByCode = (code: string) =>
    countries.find((country) => country.code === code);

  const getCountryByAbbreviation = (abbreviation: string) =>
    countries.find(
      (country) =>
        country.abbreviation.toLowerCase() === abbreviation.toLowerCase()
    );

  const getTogoCountry = () =>
    getCountryByAbbreviation("TG") || getCountryByCode("+228");

  const getPopularCountries = () => countriesService.getPopularCountries();

  const searchCountries = (searchTerm: string) =>
    countries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return {
    countries,
    isLoading,
    error,
    getCountryByCode,
    getCountryByAbbreviation,
    getTogoCountry,
    getPopularCountries,
    searchCountries,
    // Méthodes du service
    validatePhoneNumber: countriesService.validatePhoneNumber,
    formatPhoneNumber: countriesService.formatPhoneNumber,
    formatPhoneNumberForAPI: countriesService.formatPhoneNumberForAPI,
  };
}
