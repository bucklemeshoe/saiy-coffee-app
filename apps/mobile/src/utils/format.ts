export function formatCurrency(amount: number): string {
  return `R${amount.toFixed(2)}`
}

export function formatDateTime(value: string | number | Date): string {
  const date = new Date(value)
  return date.toLocaleString('en-ZA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

