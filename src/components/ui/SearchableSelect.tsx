import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchableSelectProps<T> {
  options: T[];
  value: string | number | null;
  onChange: (value: any) => void;
  placeholder?: string;
  labelKey?: keyof T;
  valueKey?: keyof T;
  className?: string;
  buttonClassName?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function SearchableSelect<T extends Record<string, any>>({
  options,
  value,
  onChange,
  placeholder = "Sélectionner",
  labelKey = "name" as keyof T,
  valueKey = "id" as keyof T,
  className = "",
  buttonClassName = "",
  isLoading = false,
  emptyMessage = "Aucun résultat",
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = options.filter((option) =>
    String(option[labelKey]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt[valueKey] === value);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600 ${buttonClassName}`}
      >
        <span className="truncate max-w-[150px]">
          {selectedOption ? String(selectedOption[labelKey]) : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-[100] max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-white flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 text-gray-700"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Chargement...
                </div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={String(option[valueKey])}
                  onClick={() => {
                    onChange(option[valueKey]);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    value === option[valueKey]
                      ? "bg-blue-50 text-blue-900 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {String(option[labelKey])}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
