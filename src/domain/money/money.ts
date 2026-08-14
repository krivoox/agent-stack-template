/**
 * Money value object — reference implementation of the pure-domain pattern.
 *
 * Immutable representation of a monetary amount. Amounts are integer minor
 * units (cents) to avoid floating-point drift (ADR-005).
 *
 * The value object itself is non-negative: direction is expressed by the
 * operation that uses it, not by the sign of the amount. Delete this module if
 * the product never handles money — it exists to show what "pure domain with
 * exhaustive tests" looks like.
 */

export const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export type CurrencyCode = string;

export type MoneyLike = {
  readonly amountCents: number;
  readonly currency: CurrencyCode;
};

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

export class CurrencyMismatchError extends MoneyError {
  constructor(a: CurrencyCode, b: CurrencyCode) {
    super(`Currency mismatch: ${a} vs ${b}`);
    this.name = "CurrencyMismatchError";
  }
}

export class Money implements MoneyLike {
  readonly amountCents: number;
  readonly currency: CurrencyCode;

  private constructor(amountCents: number, currency: CurrencyCode) {
    this.amountCents = amountCents;
    this.currency = currency;
  }

  static of(amountCents: number, currency: CurrencyCode): Money {
    if (!Number.isFinite(amountCents)) {
      throw new MoneyError(`amountCents must be a finite number: ${amountCents}`);
    }
    if (!Number.isInteger(amountCents)) {
      throw new MoneyError(
        `amountCents must be an integer (received ${amountCents}). Use cents, not decimals.`,
      );
    }
    if (amountCents < 0) {
      throw new MoneyError(
        `amountCents must be non-negative (received ${amountCents}). Direction is given by transaction type.`,
      );
    }
    if (typeof currency !== "string" || !CURRENCY_CODE_PATTERN.test(currency)) {
      throw new MoneyError(
        `currency must be a 3-letter ISO 4217 code (received "${currency}").`,
      );
    }
    return new Money(amountCents, currency);
  }

  static zero(currency: CurrencyCode): Money {
    return Money.of(0, currency);
  }

  add(other: MoneyLike): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amountCents + other.amountCents, this.currency);
  }

  subtract(other: MoneyLike): Money {
    this.assertSameCurrency(other);
    const result = this.amountCents - other.amountCents;
    if (result < 0) {
      throw new MoneyError(
        `Money.subtract would produce a negative amount (${result}). Value objects are non-negative.`,
      );
    }
    return Money.of(result, this.currency);
  }

  equals(other: MoneyLike): boolean {
    return (
      this.currency === other.currency && this.amountCents === other.amountCents
    );
  }

  compareTo(other: MoneyLike): -1 | 0 | 1 {
    this.assertSameCurrency(other);
    if (this.amountCents < other.amountCents) return -1;
    if (this.amountCents > other.amountCents) return 1;
    return 0;
  }

  isZero(): boolean {
    return this.amountCents === 0;
  }

  toJSON(): MoneyLike {
    return { amountCents: this.amountCents, currency: this.currency };
  }

  private assertSameCurrency(other: MoneyLike): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}
