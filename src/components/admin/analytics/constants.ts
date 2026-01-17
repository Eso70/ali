import type { ComponentType, SVGProps } from "react";
import { BarChart3 } from "lucide-react";

export type TabType = "overview";

export type TabDefinition = {
  id: TabType;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const COUNTRY_CODE_MAP = (() => {
  const map = new Map<string, string>();
  map.set("United States", "US"); map.set("United States of America", "US"); map.set("USA", "US");
  map.set("Canada", "CA"); map.set("Mexico", "MX");
  map.set("United Kingdom", "GB"); map.set("UK", "GB"); map.set("Great Britain", "GB");
  map.set("Germany", "DE"); map.set("France", "FR"); map.set("Italy", "IT"); map.set("Spain", "ES");
  map.set("Netherlands", "NL"); map.set("Holland", "NL"); map.set("Belgium", "BE"); map.set("Switzerland", "CH");
  map.set("Austria", "AT"); map.set("Sweden", "SE"); map.set("Norway", "NO"); map.set("Denmark", "DK");
  map.set("Finland", "FI"); map.set("Poland", "PL"); map.set("Czech Republic", "CZ"); map.set("Czechia", "CZ");
  map.set("Greece", "GR"); map.set("Portugal", "PT"); map.set("Ireland", "IE"); map.set("Russia", "RU");
  map.set("Russian Federation", "RU"); map.set("Ukraine", "UA");
  map.set("Iraq", "IQ"); map.set("Iran", "IR"); map.set("Iran, Islamic Republic of", "IR");
  map.set("Turkey", "TR"); map.set("Türkiye", "TR"); map.set("Saudi Arabia", "SA");
  map.set("United Arab Emirates", "AE"); map.set("UAE", "AE"); map.set("Kuwait", "KW"); map.set("Qatar", "QA");
  map.set("Bahrain", "BH"); map.set("Oman", "OM"); map.set("Yemen", "YE"); map.set("Jordan", "JO");
  map.set("Lebanon", "LB"); map.set("Syria", "SY"); map.set("Syrian Arab Republic", "SY");
  map.set("Palestine", "PS"); map.set("Palestinian Territory", "PS"); map.set("Israel", "IL");
  map.set("Egypt", "EG"); map.set("Libya", "LY"); map.set("Tunisia", "TN"); map.set("Algeria", "DZ");
  map.set("Morocco", "MA"); map.set("Sudan", "SD"); map.set("Kurdistan", "XK");
  map.set("China", "CN"); map.set("People's Republic of China", "CN"); map.set("India", "IN");
  map.set("Japan", "JP"); map.set("South Korea", "KR"); map.set("Korea, Republic of", "KR");
  map.set("North Korea", "KP"); map.set("Korea, Democratic People's Republic of", "KP");
  map.set("Thailand", "TH"); map.set("Vietnam", "VN"); map.set("Indonesia", "ID"); map.set("Malaysia", "MY");
  map.set("Singapore", "SG"); map.set("Philippines", "PH"); map.set("Pakistan", "PK"); map.set("Bangladesh", "BD");
  map.set("Afghanistan", "AF"); map.set("Kazakhstan", "KZ"); map.set("Uzbekistan", "UZ");
  map.set("Australia", "AU"); map.set("New Zealand", "NZ");
  map.set("Brazil", "BR"); map.set("Argentina", "AR"); map.set("Chile", "CL"); map.set("Colombia", "CO");
  map.set("Peru", "PE"); map.set("Venezuela", "VE");
  map.set("South Africa", "ZA"); map.set("Nigeria", "NG"); map.set("Kenya", "KE"); map.set("Ethiopia", "ET");
  map.set("Ghana", "GH");
  return map;
})();

export function getCountryCode(countryName: string): string | null {
  if (countryName.length === 2 && /^[A-Z]{2}$/i.test(countryName)) {
    return countryName.toUpperCase();
  }
  return COUNTRY_CODE_MAP.get(countryName) || null;
}

export function getFlagUrl(countryName: string): string {
  const countryCode = getCountryCode(countryName);
  if (countryCode) {
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
  }
  return "";
}

export const TABS: TabDefinition[] = [
  { id: "overview", label: "گشتی", icon: BarChart3 },
];
