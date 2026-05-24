export function maritalLabel(v: string) {
  switch (v) {
    case "boydoq":
      return "Bo‘ydoq";
    case "ajrashgan":
      return "Ajrashgan";
    case "beva":
      return "Beva";
    default:
      return "—";
  }
}

export function childrenLabel(v: string) {
  switch (v) {
    case "yoq":
      return "Yo‘q";
    case "bor":
      return "Bor";
    default:
      return "—";
  }
}

export function educationLabel(v: string) {
  switch (v) {
    case "oliy":
      return "Oliy";
    case "orta":
      return "O‘rta";
    case "orta_maxsus":
      return "O‘rta maxsus";
    case "boshqa":
      return "Boshqa";
    default:
      return "—";
  }
}

export function aqeedaLabel(v: string) {
  switch (v) {
    case "ahli_sunna":
      return "Ahli sunna";
    case "moturidiy":
      return "Moturidiy";
    case "ashariy":
      return "Ash’ariy";
    case "boshqa":
      return "Boshqa";
    default:
      return "—";
  }
}

export function prayerLabel(v: string) {
  switch (v) {
    case "farz":
      return "Doimiy";
    case "bazan":
      return "Ba’zan";
    case "oqimaydi":
      return "O‘qimayman";
    default:
      return "—";
  }
}

export function quranLabel(v: string) {
  switch (v) {
    case "qiroat_yaxshi":
      return "Yaxshi";
    case "ortacha":
      return "O‘rtacha";
    case "oqimaydi":
      return "O‘qimayman";
    default:
      return "—";
  }
}

export function madhabLabel(v: string) {
  switch (v) {
    case "hanafiy":
      return "Hanafiy";
    case "shofiiy":
      return "Shofi’iy";
    case "molikiy":
      return "Molikiy";
    case "hanbaliy":
      return "Hanbaliy";
    case "boshqa":
      return "Boshqa";
    default:
      return "—";
  }
}

export function smokesLabel(v: "" | "yes" | "no") {
  if (v === "yes") return "Chekadi";
  if (v === "no") return "Chekmaydi";
  return "—";
}

export function sportLabel(v: number | null) {
  if (v == null) return "—";
  if (v >= 7) return "Har kuni";
  if (v <= 0) return "Yo‘q";
  return `${v} marta / hafta`;
}
