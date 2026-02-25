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
      magasinier: "Magasinier",
    };

    return roleMap[profil] || profil;
  };