import { useState, useRef, useEffect } from "react";

export interface Option {
  value: string | number;
  label: string;
}

interface SelectWithSearchProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export function SelectWithSearch({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  label,
  disabled = false,
  className = "",
  searchable = true,
}: SelectWithSearchProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions =
    !searchable || !isOpen
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        );

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    if (!isOpen) return;
    // Focus input dès l'ouverture
    if (inputRef.current) inputRef.current.focus();
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
        setHighlighted(-1);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
        setHighlighted(-1);
      } else if (event.key === "Tab") {
        setIsOpen(false);
        setSearch("");
        setHighlighted(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      } else if (
        event.key === "Enter" &&
        highlighted >= 0 &&
        highlighted < filteredOptions.length
      ) {
        onChange(filteredOptions[highlighted].value);
        setIsOpen(false);
        setSearch("");
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [isOpen, filteredOptions, highlighted]);

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          className={`w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => setIsOpen((v) => !v)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {options.find((opt) => String(opt.value) === String(value))?.label ||
            placeholder}
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlighted(0);
                }}
                placeholder="Rechercher..."
                className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlighted((h) =>
                      Math.min(h + 1, filteredOptions.length - 1)
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlighted((h) => Math.max(h - 1, 0));
                  } else if (
                    e.key === "Enter" &&
                    highlighted >= 0 &&
                    highlighted < filteredOptions.length
                  ) {
                    onChange(filteredOptions[highlighted].value);
                    setIsOpen(false);
                    setSearch("");
                    setHighlighted(-1);
                  }
                }}
              />
            )}
            <ul role="listbox">
              <li>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    value === "" ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                    setSearch("");
                    setHighlighted(-1);
                  }}
                >
                  {placeholder}
                </button>
              </li>
              {filteredOptions.map((opt, idx) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={String(value) === String(opt.value)}
                >
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                      String(value) === String(opt.value) ? "bg-blue-50" : ""
                    } ${highlighted === idx ? "bg-blue-100" : ""}`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                      setHighlighted(-1);
                    }}
                    onMouseEnter={() => setHighlighted(idx)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
              {filteredOptions.length === 0 && (
                <li>
                  <span className="block px-3 py-2 text-gray-400">
                    Aucun résultat
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
