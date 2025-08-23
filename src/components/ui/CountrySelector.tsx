import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { useCountries } from "../../hooks/useCountries";
import type { Country } from "../../services/countriesService";

interface CountrySelectorProps {
  value?: Country;
  onChange: (country: Country) => void;
  displayMode?: "name" | "code"; // 'name' pour afficher le nom, 'code' pour le code téléphonique
  placeholder?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  displayMode = "code",
  placeholder = "Sélectionner un pays",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    countries: allCountries,
    isLoading,
    error,
    getPopularCountries,
    searchCountries,
  } = useCountries();

  const popularCountries = getPopularCountries();

  // Filtrer les pays selon le terme de recherche
  const filteredCountries = searchTerm.trim()
    ? searchCountries(searchTerm)
    : allCountries;

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de sélection ou Input selon le displayMode */}
      {displayMode === "name" ? (
        // Format input pour displayMode="name"
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center min-w-0">
            {value && (
              <img
                src={value.flag}
                alt={`Drapeau ${value.name}`}
                className="w-5 h-4 mr-2 rounded-sm flex-shrink-0"
              />
            )}
            <span className="text-gray-900 truncate">
              {value ? value.name : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform text-gray-400 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      ) : (
        // Format bouton compact pour displayMode="code"
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-3 bg-white hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors border-0 rounded-l-lg"
        >
          <div className="flex items-center min-w-0">
            {value && (
              <img
                src={value.flag}
                alt={`Drapeau ${value.name}`}
                className="w-5 h-4 mr-2 rounded-sm flex-shrink-0"
              />
            )}
            <span className="text-sm text-gray-600 truncate">
              {value ? value.code : placeholder}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform text-gray-400 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-80">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* État de chargement */}
          {isLoading && (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-sm text-gray-500">
                Chargement des pays...
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && !isLoading && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-600">Erreur: {error}</p>
            </div>
          )}

          {/* Liste des pays */}
          {!isLoading && !error && (
            <div className="overflow-y-auto max-h-48">
              {/* Pays populaires */}
              {!searchTerm && popularCountries.length > 0 && (
                <>
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Pays populaires
                  </div>
                  {popularCountries.map((country) => (
                    <button
                      key={`popular-${country.code}`}
                      type="button"
                      onClick={() => handleSelect(country)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center"
                    >
                      <img
                        src={country.flag}
                        alt={`Drapeau ${country.name}`}
                        className="w-5 h-4 mr-3 rounded-sm"
                      />
                      <span className="font-medium">{country.name}</span>
                      <span className="ml-auto text-gray-500">
                        {country.code}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 my-1"></div>
                </>
              )}

              {/* Tous les pays */}
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center"
                  >
                    <img
                      src={country.flag}
                      alt={`Drapeau ${country.name}`}
                      className="w-5 h-4 mr-3 rounded-sm"
                    />
                    <span className="font-medium">{country.name}</span>
                    <span className="ml-auto text-gray-500">
                      {country.code}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  Aucun pays trouvé
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
