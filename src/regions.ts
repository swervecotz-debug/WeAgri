export interface Language { code: string; label: string; flag: string }

export const LANGUAGES: Language[] = [
  {
    "code": "sw",
    "label": "Kiswahili",
    "flag": "🇹🇿"
  },
  {
    "code": "en",
    "label": "English",
    "flag": "🌍"
  }
];

export interface Country { code: string; name: string; flag: string; currency: string }

export const COUNTRIES: Country[] = [
  {
    "code": "TZ",
    "name": "Tanzania",
    "flag": "🇹🇿",
    "currency": "TZS"
  },
  {
    "code": "KE",
    "name": "Kenya",
    "flag": "🇰🇪",
    "currency": "KES"
  },
  {
    "code": "UG",
    "name": "Uganda",
    "flag": "🇺🇬",
    "currency": "UGX"
  },
  {
    "code": "RW",
    "name": "Rwanda",
    "flag": "🇷🇼",
    "currency": "RWF"
  },
  {
    "code": "BI",
    "name": "Burundi",
    "flag": "🇧🇮",
    "currency": "BIF"
  },
  {
    "code": "SS",
    "name": "South Sudan",
    "flag": "🇸🇸",
    "currency": "SSP"
  },
  {
    "code": "CD",
    "name": "DR Congo",
    "flag": "🇨🇩",
    "currency": "CDF"
  }
];

export const REGIONS: Record<string, string[]> = {
  "TZ": [
    "Dar es Salaam",
    "Arusha",
    "Mwanza",
    "Dodoma",
    "Mbeya",
    "Morogoro",
    "Tanga",
    "Kilimanjaro",
    "Iringa",
    "Singida",
    "Tabora",
    "Kagera"
  ],
  "KE": [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Meru",
    "Nyeri"
  ],
  "UG": [
    "Kampala",
    "Gulu",
    "Mbarara",
    "Jinja",
    "Mbale"
  ],
  "RW": [
    "Kigali",
    "Musanze",
    "Huye",
    "Rubavu"
  ],
  "BI": [
    "Bujumbura",
    "Gitega",
    "Ngozi"
  ],
  "SS": [
    "Juba",
    "Wau",
    "Malakal"
  ],
  "CD": [
    "Kinshasa",
    "Goma",
    "Bukavu",
    "Lubumbashi"
  ]
};
