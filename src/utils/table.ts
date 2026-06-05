export function isFirstRowOfDate<T extends { date: string }>(
  rows: T[],
  index: number,
): boolean {
  return index === 0 || rows[index - 1].date !== rows[index].date
}

export function getDateRowSpan<T extends { date: string }>(
  rows: T[],
  startIndex: number,
): number {
  const date = rows[startIndex].date
  let count = 1
  for (let i = startIndex + 1; i < rows.length; i++) {
    if (rows[i].date !== date) break
    count++
  }
  return count
}
