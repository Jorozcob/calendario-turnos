export const SHIFT_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#ca8a04',
  '#9333ea',
  '#0891b2',
  '#ea580c',
  '#db2777',
  '#4f46e5',
  '#0d9488',
];

export const MIN_SHIFTS = 2;
export const MAX_SHIFTS = 10;

export function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function weeksBetween(startMonday, targetMonday) {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.round((targetMonday.getTime() - startMonday.getTime()) / msPerWeek);
}

export function normalizeShiftIndex(index, numTurnos) {
  return ((index % numTurnos) + numTurnos) % numTurnos;
}

export function getShiftName(config, index) {
  const name = config.nombres[index];
  return name && name.trim() ? name.trim() : `Turno ${index + 1}`;
}

export function getOfficeShift(weekStart, config) {
  const startMonday = getMonday(parseLocalDate(config.fechaInicio));
  const targetMonday = getMonday(weekStart);
  const weeks = weeksBetween(startMonday, targetMonday);
  const index = normalizeShiftIndex(config.turnoInicial + weeks, config.numTurnos);

  return {
    index,
    name: getShiftName(config, index),
  };
}

export function getWeekShiftStatuses(weekStart, config) {
  const office = getOfficeShift(weekStart, config);

  return Array.from({ length: config.numTurnos }, (_, index) => ({
    index,
    name: getShiftName(config, index),
    status: index === office.index ? 'oficina' : 'casa',
  }));
}

export function getShiftColor(index) {
  return SHIFT_COLORS[index % SHIFT_COLORS.length];
}
