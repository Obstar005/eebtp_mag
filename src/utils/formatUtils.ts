/**
 * Utilitaires de formatage
 */

/**
 * Formate une unité de mesure avec les exposants appropriés
 * Exemples: m2 → m², m3 → m³, cm2 → cm², etc.
 */
export function formatUnit(unit: string | undefined): string {
  if (!unit) return "unité(s)";
  
  // Remplacer les chiffres en fin de chaîne par leurs équivalents en exposant
  return unit
    .replace(/(\d)$/g, (match) => {
      const superscripts: Record<string, string> = {
        '0': '⁰',
        '1': '¹',
        '2': '²',
        '3': '³',
        '4': '⁴',
        '5': '⁵',
        '6': '⁶',
        '7': '⁷',
        '8': '⁸',
        '9': '⁹',
      };
      return superscripts[match] || match;
    })
    // Gérer aussi les cas comme "m2" au milieu du texte
    .replace(/([a-zA-Z])(\d)(?=\s|$|[^0-9])/g, (_match, letter, digit) => {
      const superscripts: Record<string, string> = {
        '0': '⁰',
        '1': '¹',
        '2': '²',
        '3': '³',
        '4': '⁴',
        '5': '⁵',
        '6': '⁶',
        '7': '⁷',
        '8': '⁸',
        '9': '⁹',
      };
      return letter + (superscripts[digit] || digit);
    });
}



  // Fonction pour formater le rôle
 export function  formatRole(profil: string | undefined): string {
    if (!profil) return "Utilisateur";

    const roleMap: Record<string, string> = {
      dtx: "Directeur des Travaux",
      dt: "Directeur Technique",
      dga: "Directeur Général Adjoint",
      dg: "Directeur Général",
      df: "Directeur Financier",
      chef_appro: "Chef Approvisionnement",
      Admin: "Administrateur",
      superadmin: "Super Administrateur",
      magasinier: "Magasinier",
    };

    return roleMap[profil] || profil;
  };

  /**
 * Formater une date API pour l'affichage
 */
export function formatApiDate(apiDate: string|Date, noHours: boolean = false): string {
  try {
    const date = typeof apiDate === "string" ? new Date(apiDate) : apiDate;
    return date
      .toLocaleDateString("fr-FR",
        {
          // weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          ...(noHours ? {} : { hour: "2-digit", minute: "2-digit" }),
        })
      .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase()).replace(",", " à");
  } catch {
    return apiDate.toString();
  }
}

/**
 * Formater une durée backend (HH:MM:SS ou HH:MM:SS.microseconds)
 * en texte lisible (ex: 02:51:12.364177 -> 2 h 51 min 12 s)
 */
export function formatProcessingDuration(duration?: string): string {
  if (!duration || !duration.trim()) return "-";

  const normalized = duration.trim();
  const regex = /^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))?$/;
  const match = normalized.match(regex);

  if (!match) {
    return normalized;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} s`);

  return parts.join(" ");
}