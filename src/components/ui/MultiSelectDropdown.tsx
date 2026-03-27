import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";

interface Option {
  id: number | string;
  name: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  isLoading = false,
  className = "",
  emptyMessage = "Aucune option disponible",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrer les options selon la recherche
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Gérer la sélection/désélection d'une option
  const toggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  // Supprimer un élément sélectionné
  const removeItem = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== optionId));
  };

  // Obtenir les options sélectionnées
  const selectedOptions = options.filter((opt) =>
    value.includes(opt.id.toString()),
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-left flex items-center justify-between gap-2"
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {option.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-blue-600"
                  onClick={(e) => removeItem(option.id.toString(), e)}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 flex flex-col overflow-hidden">
          {/* Barre de recherche */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Liste des options */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.id.toString());
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id.toString())}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span
                      className={isSelected ? "text-blue-800" : "text-gray-700"}
                    >
                      {option.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer avec nombre de sélections */}
          {selectedOptions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {selectedOptions.length} projet
                {selectedOptions.length > 1 ? "s" : ""} sélectionné
                {selectedOptions.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-red-600 hover:text-red-700 text-xs"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
