export class ExchangeRate {
  constructor(date, currency, rate, amount = 1) {
    this.date = date;
    this.currency = currency;
    this.rate = rate;
    this.amount = amount;
  }

  // Convert rate to per-unit basis (Amount = 1)
  getRatePerUnit() {
    return this.amount > 1 ? this.rate / this.amount : this.rate;
  }

  // Validate rate data
  isValid() {
    return (
      this.currency && !isNaN(this.rate) && this.rate > 0 && this.amount > 0
    );
  }

  // Convert to database format
  toDbObject() {
    return {
      date: this.date,
      currency: this.currency,
      rate: this.getRatePerUnit(),
      amount: 1, // Always store as per-unit rate
    };
  }

  // Create from database row
  static fromDbRow(row) {
    return new ExchangeRate(row.date, row.currency, row.rate, row.amount);
  }

  // Create from ČNB CSV line
  static fromCnbLine(line) {
    const parts = line.split("|");
    if (parts.length !== 5) return null;

    const [, , amountStr, currency, rateStr] = parts;
    const amount = parseInt(amountStr);
    const rate = parseFloat(rateStr.replace(",", "."));

    if (isNaN(amount) || isNaN(rate) || amount <= 0 || rate <= 0) {
      return null;
    }

    return new ExchangeRate(null, currency, rate, amount);
  }
}
