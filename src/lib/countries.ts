export type Country = {
  code: string;
  name: string;
  flag: string;
};

// Curated, MENA + CIS focused list. Order matters: O'zbekiston first.
export const COUNTRIES: Country[] = [
  { code: "UZ", name: "O‘zbekiston", flag: "🇺🇿" },
  { code: "KZ", name: "Qozog‘iston", flag: "🇰🇿" },
  { code: "KG", name: "Qirg‘iziston", flag: "🇰🇬" },
  { code: "TJ", name: "Tojikiston", flag: "🇹🇯" },
  { code: "TM", name: "Turkmaniston", flag: "🇹🇲" },
  { code: "AF", name: "Afg‘oniston", flag: "🇦🇫" },
  { code: "RU", name: "Rossiya", flag: "🇷🇺" },
  { code: "TR", name: "Turkiya", flag: "🇹🇷" },
  { code: "AZ", name: "Ozarbayjon", flag: "🇦🇿" },
  { code: "GE", name: "Gruziya", flag: "🇬🇪" },
  { code: "AM", name: "Armaniston", flag: "🇦🇲" },
  { code: "UA", name: "Ukraina", flag: "🇺🇦" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },

  { code: "SA", name: "Saudiya Arabistoni", flag: "🇸🇦" },
  { code: "AE", name: "Birlashgan Arab Amirliklari", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuvayt", flag: "🇰🇼" },
  { code: "BH", name: "Bahrayn", flag: "🇧🇭" },
  { code: "OM", name: "Ummon", flag: "🇴🇲" },
  { code: "JO", name: "Iordaniya", flag: "🇯🇴" },
  { code: "EG", name: "Misr", flag: "🇪🇬" },
  { code: "IQ", name: "Iroq", flag: "🇮🇶" },
  { code: "IR", name: "Eron", flag: "🇮🇷" },
  { code: "PS", name: "Falastin", flag: "🇵🇸" },
  { code: "SY", name: "Suriya", flag: "🇸🇾" },
  { code: "LB", name: "Livan", flag: "🇱🇧" },
  { code: "MA", name: "Marokko", flag: "🇲🇦" },
  { code: "DZ", name: "Jazoir", flag: "🇩🇿" },
  { code: "TN", name: "Tunis", flag: "🇹🇳" },
  { code: "LY", name: "Liviya", flag: "🇱🇾" },
  { code: "SD", name: "Sudan", flag: "🇸🇩" },
  { code: "SO", name: "Somali", flag: "🇸🇴" },

  { code: "PK", name: "Pokiston", flag: "🇵🇰" },
  { code: "BD", name: "Banglades", flag: "🇧🇩" },
  { code: "IN", name: "Hindiston", flag: "🇮🇳" },
  { code: "ID", name: "Indoneziya", flag: "🇮🇩" },
  { code: "MY", name: "Malayziya", flag: "🇲🇾" },

  { code: "DE", name: "Germaniya", flag: "🇩🇪" },
  { code: "GB", name: "Buyuk Britaniya", flag: "🇬🇧" },
  { code: "FR", name: "Fransiya", flag: "🇫🇷" },
  { code: "IT", name: "Italiya", flag: "🇮🇹" },
  { code: "ES", name: "Ispaniya", flag: "🇪🇸" },
  { code: "PL", name: "Polsha", flag: "🇵🇱" },
  { code: "US", name: "AQSh", flag: "🇺🇸" },
  { code: "CA", name: "Kanada", flag: "🇨🇦" },
];

export function findCountryByName(name: string | null | undefined): Country | null {
  if (!name) return null;
  const norm = name.trim().toLowerCase();
  return (
    COUNTRIES.find((c) => c.name.toLowerCase() === norm) ||
    COUNTRIES.find((c) => c.name.toLowerCase().includes(norm)) ||
    null
  );
}
