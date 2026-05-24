export const FINE_PER_DAY = 2000;

export function calculateFine(dueDate, returnDate) {
  const due = new Date(dueDate);
  const ret = new Date(returnDate);
  const msDay = 24 * 60 * 60 * 1000;
  const overdue = Math.max(0, Math.ceil((ret - due) / msDay));
  return overdue * FINE_PER_DAY;
}
