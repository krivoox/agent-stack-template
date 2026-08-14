import { describe, expect, it } from "vitest";
import {
  CurrencyMismatchError,
  Money,
  MoneyError,
} from "./money";

describe("Money value object (ADR-005: integer minor units)", () => {
  describe("Money.of validation", () => {
    it("creates a Money from non-negative integer cents and 3-letter currency", () => {
      const money = Money.of(1_000, "USD");
      expect(money.amountCents).toBe(1_000);
      expect(money.currency).toBe("USD");
    });

    it("rejects non-integer cents", () => {
      expect(() => Money.of(1.5, "USD")).toThrow(MoneyError);
      expect(() => Money.of(0.1, "USD")).toThrow(/integer/i);
    });

    it("rejects negative amounts", () => {
      expect(() => Money.of(-1, "USD")).toThrow(MoneyError);
      expect(() => Money.of(-100, "USD")).toThrow(/non-negative/i);
    });

    it("rejects non-finite amounts", () => {
      expect(() => Money.of(Number.NaN, "USD")).toThrow(MoneyError);
      expect(() => Money.of(Number.POSITIVE_INFINITY, "USD")).toThrow(MoneyError);
    });

    it("rejects invalid currency codes", () => {
      expect(() => Money.of(100, "US")).toThrow(MoneyError);
      expect(() => Money.of(100, "DOLLAR")).toThrow(MoneyError);
      expect(() => Money.of(100, "usd")).toThrow(MoneyError);
      expect(() => Money.of(100, "")).toThrow(MoneyError);
    });

    it("accepts zero as a valid amount", () => {
      expect(() => Money.of(0, "USD")).not.toThrow();
      expect(Money.zero("USD").amountCents).toBe(0);
    });
  });

  describe("arithmetic", () => {
    it("adds two Money instances of the same currency", () => {
      const a = Money.of(1_500, "USD");
      const b = Money.of(2_500, "USD");
      const result = a.add(b);
      expect(result.amountCents).toBe(4_000);
      expect(result.currency).toBe("USD");
    });

    it("subtracts two Money instances of the same currency", () => {
      const a = Money.of(5_000, "USD");
      const b = Money.of(1_500, "USD");
      expect(a.subtract(b).amountCents).toBe(3_500);
    });

    it("throws when subtracting would produce a negative amount", () => {
      const a = Money.of(1_000, "USD");
      const b = Money.of(2_000, "USD");
      expect(() => a.subtract(b)).toThrow(MoneyError);
    });

    it("rejects arithmetic with mismatched currencies", () => {
      const usd = Money.of(1_000, "USD");
      const eur = Money.of(1_000, "EUR");
      expect(() => usd.add(eur)).toThrow(CurrencyMismatchError);
      expect(() => usd.subtract(eur)).toThrow(CurrencyMismatchError);
    });

    it("is immutable: add returns a new instance", () => {
      const a = Money.of(1_000, "USD");
      const b = Money.of(500, "USD");
      const c = a.add(b);
      expect(a.amountCents).toBe(1_000);
      expect(b.amountCents).toBe(500);
      expect(c.amountCents).toBe(1_500);
      expect(c).not.toBe(a);
    });
  });

  describe("comparison", () => {
    it("equals returns true only for same currency and amount", () => {
      expect(Money.of(100, "USD").equals(Money.of(100, "USD"))).toBe(true);
      expect(Money.of(100, "USD").equals(Money.of(200, "USD"))).toBe(false);
      expect(Money.of(100, "USD").equals(Money.of(100, "EUR"))).toBe(false);
    });

    it("compareTo returns -1, 0, or 1 for same currency", () => {
      const a = Money.of(1_000, "USD");
      const b = Money.of(2_000, "USD");
      expect(a.compareTo(b)).toBe(-1);
      expect(b.compareTo(a)).toBe(1);
      expect(a.compareTo(Money.of(1_000, "USD"))).toBe(0);
    });

    it("compareTo throws on mismatched currencies", () => {
      const usd = Money.of(100, "USD");
      const eur = Money.of(100, "EUR");
      expect(() => usd.compareTo(eur)).toThrow(CurrencyMismatchError);
    });

    it("isZero identifies the zero amount", () => {
      expect(Money.zero("USD").isZero()).toBe(true);
      expect(Money.of(1, "USD").isZero()).toBe(false);
    });
  });

  describe("serialization", () => {
    it("toJSON returns a plain MoneyLike shape", () => {
      const m = Money.of(12_345, "USD");
      expect(m.toJSON()).toEqual({ amountCents: 12_345, currency: "USD" });
    });
  });
});
