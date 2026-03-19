export function getTodayDateString() {
  return new Date().toLocaleDateString('en-CA');
}

export function isNoviceProtectionDate(date: string) {
  return date >= '2026-03-20' && date <= '2026-03-22';
}
