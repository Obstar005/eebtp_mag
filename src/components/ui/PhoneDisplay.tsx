import React from "react";
import { useCountries } from "../../hooks/useCountries";

interface PhoneDisplayProps {
  phoneNumber?: string;
  className?: string;
  showFullNumber?: boolean; // Si true, affiche le numéro complet, sinon seulement l'indicatif
}

export const PhoneDisplay: React.FC<PhoneDisplayProps> = ({
  phoneNumber,
  className = "",
  showFullNumber = false,
}) => {
  const { countries, getTogoCountry } = useCountries();

  // Fonction pour trouver le pays par le numéro de téléphone
  const findCountryByPhone = (phone: string) => {
    // Nettoyer le numéro (supprimer espaces, tirets, etc.)
    const cleanPhone = phone.replace(/[\s\-()]/g, "");

    // Chercher le pays avec l'indicatif le plus long qui correspond
    let matchedCountry = null;
    let longestMatch = 0;

    for (const country of countries) {
      const dialCode = country.code.replace("+", "");
      if (cleanPhone.startsWith(dialCode) && dialCode.length > longestMatch) {
        matchedCountry = country;
        longestMatch = dialCode.length;
      }
    }

    return matchedCountry;
  };

  // Fonction pour extraire l'indicatif du numéro
  const extractCountryInfo = (phone?: string) => {
    if (!phone) {
      // Valeur par défaut : Togo
      const togo = getTogoCountry();
      return {
        countryCode: "TG",
        dialCode: "+228",
        flagUrl: "/flags/tg.svg",
        localNumber: "90 90 90 90",
        country: togo,
      };
    }

    // Essayer de trouver le pays par le numéro
    const country = findCountryByPhone(phone);

    if (country) {
      // Extraire le numéro local (sans l'indicatif pays)
      const cleanDialCode = country.code.replace("+", "");
      const localNumber = phone
        .replace(/^\+?/, "")
        .replace(new RegExp(`^${cleanDialCode}`), "")
        .trim();

      return {
        countryCode: country.abbreviation,
        dialCode: country.code,
        flagUrl: `/flags/${country.abbreviation.toLowerCase()}.svg`,
        localNumber: localNumber || "90 90 90 90",
        country,
      };
    }

    // Si aucun pays trouvé, utiliser Togo par défaut
    const togo = getTogoCountry();
    return {
      countryCode: "TG",
      dialCode: "+228",
      flagUrl: "/flags/tg.svg",
      localNumber: phone.replace(/^\+?228\s?/, "") || "90 90 90 90",
      country: togo,
    };
  };

  const { countryCode, dialCode, flagUrl, localNumber } =
    extractCountryInfo(phoneNumber);

  if (showFullNumber) {
    // Mode affichage complet avec numéro local
    return (
      <div
        className={`flex border border-gray-300 rounded-lg bg-gray-50 ${className}`}
      >
        {/* Indicateur de pays */}
        <div className="flex items-center px-3 py-3 border-r border-gray-300">
          <img
            src={flagUrl}
            alt={countryCode}
            className="w-5 h-4 mr-2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-sm text-gray-600">{dialCode}</span>
        </div>

        {/* Numéro local */}
        <div className="flex-1 px-4 py-3 text-gray-900 bg-transparent">
          {localNumber}
        </div>
      </div>
    );
  }

  // Mode affichage simple (juste l'indicateur de pays)
  return (
    <div
      className={`flex items-center px-3 py-3 border-r border-gray-300 ${className}`}
    >
      <img
        src={flagUrl}
        alt={countryCode}
        className="w-5 h-4 mr-2"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="text-sm text-gray-600">{dialCode}</span>
    </div>
  );
};
