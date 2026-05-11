export type Country = { code: string; name: string; flag: string; group: string };
export type Special = { code: string; name: string; count: number; accent: string };
export type Sticker = { id: string; country: string; num: number };
export type StickerMeta = {
  kind: 'player' | 'team' | 'special' | 'city';
  title: string;
  position?: string;
  age?: number;
};

export const COUNTRIES: Country[] = [
  { code: "MEX", name: "México",          flag: "🇲🇽", group: "A" },
  { code: "RSA", name: "África do Sul",   flag: "🇿🇦", group: "A" },
  { code: "KOR", name: "Coreia do Sul",   flag: "🇰🇷", group: "A" },
  { code: "CZE", name: "Tchéquia",        flag: "🇨🇿", group: "B" },
  { code: "CAN", name: "Canadá",          flag: "🇨🇦", group: "B" },
  { code: "BIH", name: "Bósnia",          flag: "🇧🇦", group: "B" },
  { code: "QAT", name: "Catar",           flag: "🇶🇦", group: "C" },
  { code: "SUI", name: "Suíça",           flag: "🇨🇭", group: "C" },
  { code: "BRA", name: "Brasil",          flag: "🇧🇷", group: "C" },
  { code: "MAR", name: "Marrocos",        flag: "🇲🇦", group: "D" },
  { code: "HAI", name: "Haiti",           flag: "🇭🇹", group: "D" },
  { code: "SCO", name: "Escócia",         flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "D" },
  { code: "USA", name: "Estados Unidos",  flag: "🇺🇸", group: "E" },
  { code: "PAR", name: "Paraguai",        flag: "🇵🇾", group: "E" },
  { code: "AUS", name: "Austrália",       flag: "🇦🇺", group: "E" },
  { code: "TUR", name: "Turquia",         flag: "🇹🇷", group: "F" },
  { code: "GER", name: "Alemanha",        flag: "🇩🇪", group: "F" },
  { code: "CUW", name: "Curaçao",         flag: "🇨🇼", group: "F" },
  { code: "CIV", name: "Costa do Marfim", flag: "🇨🇮", group: "G" },
  { code: "ECU", name: "Equador",         flag: "🇪🇨", group: "G" },
  { code: "NED", name: "Holanda",         flag: "🇳🇱", group: "G" },
  { code: "JPN", name: "Japão",           flag: "🇯🇵", group: "H" },
  { code: "SWE", name: "Suécia",          flag: "🇸🇪", group: "H" },
  { code: "TUN", name: "Tunísia",         flag: "🇹🇳", group: "H" },
  { code: "BEL", name: "Bélgica",         flag: "🇧🇪", group: "I" },
  { code: "EGY", name: "Egito",           flag: "🇪🇬", group: "I" },
  { code: "IRN", name: "Irã",             flag: "🇮🇷", group: "I" },
  { code: "NZL", name: "Nova Zelândia",   flag: "🇳🇿", group: "J" },
  { code: "ESP", name: "Espanha",         flag: "🇪🇸", group: "J" },
  { code: "CPV", name: "Cabo Verde",      flag: "🇨🇻", group: "J" },
  { code: "KSA", name: "Arábia Saudita",  flag: "🇸🇦", group: "K" },
  { code: "URU", name: "Uruguai",         flag: "🇺🇾", group: "K" },
  { code: "FRA", name: "França",          flag: "🇫🇷", group: "K" },
  { code: "SEN", name: "Senegal",         flag: "🇸🇳", group: "L" },
  { code: "IRQ", name: "Iraque",          flag: "🇮🇶", group: "L" },
  { code: "NOR", name: "Noruega",         flag: "🇳🇴", group: "L" },
  { code: "ARG", name: "Argentina",       flag: "🇦🇷", group: "M" },
  { code: "ALG", name: "Argélia",         flag: "🇩🇿", group: "M" },
  { code: "AUT", name: "Áustria",         flag: "🇦🇹", group: "M" },
  { code: "JOR", name: "Jordânia",        flag: "🇯🇴", group: "N" },
  { code: "POR", name: "Portugal",        flag: "🇵🇹", group: "N" },
  { code: "COD", name: "Rep. do Congo",   flag: "🇨🇩", group: "N" },
  { code: "UZB", name: "Uzbequistão",     flag: "🇺🇿", group: "O" },
  { code: "COL", name: "Colômbia",        flag: "🇨🇴", group: "O" },
  { code: "ENG", name: "Inglaterra",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "O" },
  { code: "CRO", name: "Croácia",         flag: "🇭🇷", group: "P" },
  { code: "GHA", name: "Gana",            flag: "🇬🇭", group: "P" },
  { code: "PAN", name: "Panamá",          flag: "🇵🇦", group: "P" },
];

export const SPECIALS: Special[] = [
  { code: "FWC", name: "Mascote & Abertura", count: 19, accent: "#d4a574" },
  { code: "CC",  name: "Cidades-Sede",       count: 14, accent: "#7a9e6e" },
];

export const ALL_STICKERS: Sticker[] = (() => {
  const list: Sticker[] = [];
  for (let i = 1; i <= 19; i++) list.push({ id: `FWC${i}`, country: "FWC", num: i });
  COUNTRIES.forEach(c => {
    for (let i = 1; i <= 20; i++) list.push({ id: `${c.code}${i}`, country: c.code, num: i });
  });
  for (let i = 1; i <= 14; i++) list.push({ id: `CC${i}`, country: "CC", num: i });
  return list;
})();

export const TOTAL_STICKERS = ALL_STICKERS.length; // 993

const POSITIONS = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PTA", "ATA"];
const FIRST = ["Lucas","André","Diego","Pablo","Mateo","Tobias","Felix","Yuki","Omar","Karim","Jonas","Ali","Ivan","Hugo","Théo","Sam","Liam","Noah","Kai","Adama","Sergio","Pedro","Joao","Mikel","Anton","Viktor","Henrik","Soren","Bruno","Marco","Erik","Kenji","Mo","Asher","Tariq","Idris","Ousmane","Reza","Niall","Cole"];
const LAST  = ["Silva","Santos","Costa","Pereira","Garcia","Lopez","Hernandez","Martin","Schmidt","Müller","Tanaka","Sato","Hassan","Khaled","Diop","Mensah","Smith","Jones","Brown","Kim","Park","Singh","Rossi","Bianchi","Andersen","Berg","Novak","Horvat","Popescu","Petrov","Eze","Owusu","Fofana","Yilmaz","Demir","Almeida","Carvalho","Rios","Vargas","Mendes"];

function seededRand(seed: number) {
  let x = seed;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

export const STICKER_META: Record<string, StickerMeta> = (() => {
  const out: Record<string, StickerMeta> = {};
  const FWC_TITLES = ["Logo Oficial","Mascote Maple","Mascote Clutch","Mascote Zayu","Troféu","Bola Oficial","Pôster do Torneio","Bandeira Olímpica","Estádio Aberto","Apresentação","Cerimônia","Hino","Estádio Inaugural","Países-Sede","Calendário","Equipe Técnica FIFA","Programa de Bordo","Cápsula Histórica","Brinde Colecionável"];
  const CC_CITIES = ["Cidade do México","Toronto","Vancouver","Los Angeles","Nova York","Boston","Miami","Atlanta","Dallas","Houston","Seattle","Kansas City","Filadélfia","Guadalajara"];

  ALL_STICKERS.forEach((s, idx) => {
    const r = seededRand(idx * 17 + 3);
    if (s.country === "FWC") {
      out[s.id] = { kind: "special", title: FWC_TITLES[s.num - 1] || `Especial ${s.num}` };
    } else if (s.country === "CC") {
      out[s.id] = { kind: "city", title: CC_CITIES[s.num - 1] || `Cidade ${s.num}` };
    } else {
      const pos = s.num === 1 ? "ESCUDO" : s.num === 2 ? "TIME" : POSITIONS[Math.floor(r() * POSITIONS.length)];
      const firstName = FIRST[Math.floor(r() * FIRST.length)];
      const lastName = LAST[Math.floor(r() * LAST.length)];
      out[s.id] = {
        kind: s.num <= 2 ? "team" : "player",
        title: s.num === 1 ? "Escudo" : s.num === 2 ? "Foto Oficial" : `${firstName} ${lastName}`,
        position: pos,
        age: 20 + Math.floor(r() * 16),
      };
    }
  });
  return out;
})();

export function badgeColor(code: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360;
  return { bg: `oklch(0.65 0.14 ${h})`, fg: `oklch(0.25 0.08 ${h})` };
}

export function stickerBg(country: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < country.length; i++) h = (h * 31 + country.charCodeAt(i)) % 360;
  return { bg: `oklch(0.92 0.05 ${h})`, fg: `oklch(0.30 0.10 ${h})` };
}

export function getCountryTotal(code: string): number {
  const special = SPECIALS.find(s => s.code === code);
  return special ? special.count : 20;
}

export function getCountryStickers(code: string): Sticker[] {
  const total = getCountryTotal(code);
  return Array.from({ length: total }, (_, i) => ({ id: `${code}${i + 1}`, country: code, num: i + 1 }));
}

export function getCountryInfo(code: string): Country | Special | undefined {
  return COUNTRIES.find(c => c.code === code) ?? SPECIALS.find(s => s.code === code);
}
