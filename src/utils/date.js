import { MONTHS } from "@/constants/ui";

export const genId  = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
export const nowISO = () => new Date().toISOString();
export const today  = () => new Date().toISOString().slice(0,10);

export const addDays = (s, n) => {
  const d = new Date(s + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
};

export const fmtDate = s => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

export const fmtDateFull = s => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
