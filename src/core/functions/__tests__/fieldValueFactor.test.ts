import { describe, it, expect } from 'vitest';
import { calculateFieldValueFactor } from '../fieldValueFactor';
import { FieldValueFactorFunction } from '../../types';

describe('calculateFieldValueFactor', () => {
  describe('基本動作', () => {
    it('デフォルト値で計算する (factor=1, modifier=none, weight=1)', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
        },
      };

      // weight * modifier(factor * field_value) = 1 * (1 * 10) = 10
      expect(calculateFieldValueFactor(func, 10)).toBe(10);
    });

    it('factorを適用する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2.5,
        },
      };

      // 1 * (2.5 * 10) = 25
      expect(calculateFieldValueFactor(func, 10)).toBe(25);
    });

    it('weightを適用する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2,
        },
        weight: 3,
      };

      // 3 * (2 * 10) = 60
      expect(calculateFieldValueFactor(func, 10)).toBe(60);
    });

    it('weight, factor両方を適用する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 1.5,
        },
        weight: 2,
      };

      // 2 * (1.5 * 10) = 30
      expect(calculateFieldValueFactor(func, 10)).toBe(30);
    });
  });

  describe('modifier: none', () => {
    it('値をそのまま返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'none',
        },
      };

      expect(calculateFieldValueFactor(func, 100)).toBe(100);
    });
  });

  describe('modifier: log (底10)', () => {
    it('log10(100) = 2', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log',
        },
      };

      expect(calculateFieldValueFactor(func, 100)).toBeCloseTo(2, 10);
    });

    it('log10(1000) = 3', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log',
        },
      };

      expect(calculateFieldValueFactor(func, 1000)).toBeCloseTo(3, 10);
    });

    it('0以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log',
        },
      };

      expect(calculateFieldValueFactor(func, 0)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: log1p', () => {
    it('log10(1 + 99) = log10(100) = 2', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log1p',
        },
      };

      expect(calculateFieldValueFactor(func, 99)).toBeCloseTo(2, 10);
    });

    it('log10(1 + 0) = 0', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log1p',
        },
      };

      expect(calculateFieldValueFactor(func, 0)).toBe(0);
    });

    it('-1以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log1p',
        },
      };

      expect(calculateFieldValueFactor(func, -1)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: log2p', () => {
    it('log10(2 + 98) = log10(100) = 2', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log2p',
        },
      };

      expect(calculateFieldValueFactor(func, 98)).toBeCloseTo(2, 10);
    });

    it('-2以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'log2p',
        },
      };

      expect(calculateFieldValueFactor(func, -2)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: ln (自然対数)', () => {
    it('ln(e) = 1', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln',
        },
      };

      expect(calculateFieldValueFactor(func, Math.E)).toBeCloseTo(1, 10);
    });

    it('ln(e^2) = 2', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln',
        },
      };

      expect(calculateFieldValueFactor(func, Math.E ** 2)).toBeCloseTo(2, 10);
    });

    it('0以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln',
        },
      };

      expect(calculateFieldValueFactor(func, 0)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: ln1p', () => {
    it('ln(1 + (e-1)) = ln(e) = 1', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln1p',
        },
      };

      expect(calculateFieldValueFactor(func, Math.E - 1)).toBeCloseTo(1, 10);
    });

    it('-1以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln1p',
        },
      };

      expect(calculateFieldValueFactor(func, -1)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: ln2p', () => {
    it('ln(2 + (e-2)) = ln(e) = 1', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln2p',
        },
      };

      expect(calculateFieldValueFactor(func, Math.E - 2)).toBeCloseTo(1, 10);
    });

    it('-2以下の値は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'ln2p',
        },
      };

      expect(calculateFieldValueFactor(func, -2)).toBe(0);
      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: square', () => {
    it('5の2乗 = 25', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'square',
        },
      };

      expect(calculateFieldValueFactor(func, 5)).toBe(25);
    });

    it('負の数の2乗は正の数', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'square',
        },
      };

      expect(calculateFieldValueFactor(func, -3)).toBe(9);
    });
  });

  describe('modifier: sqrt (平方根)', () => {
    it('sqrt(100) = 10', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'sqrt',
        },
      };

      expect(calculateFieldValueFactor(func, 100)).toBe(10);
    });

    it('sqrt(25) = 5', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'sqrt',
        },
      };

      expect(calculateFieldValueFactor(func, 25)).toBe(5);
    });

    it('負の数は0を返す', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'sqrt',
        },
      };

      expect(calculateFieldValueFactor(func, -10)).toBe(0);
    });
  });

  describe('modifier: reciprocal (逆数)', () => {
    it('1/2 = 0.5', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'reciprocal',
        },
      };

      expect(calculateFieldValueFactor(func, 2)).toBe(0.5);
    });

    it('1/4 = 0.25', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'reciprocal',
        },
      };

      expect(calculateFieldValueFactor(func, 4)).toBe(0.25);
    });

    it('0の場合は0を返す (ゼロ除算回避)', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'reciprocal',
        },
      };

      expect(calculateFieldValueFactor(func, 0)).toBe(0);
    });

    it('負の数の逆数', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'reciprocal',
        },
      };

      expect(calculateFieldValueFactor(func, -2)).toBe(-0.5);
    });
  });

  describe('マイナスweightの対応', () => {
    it('負のweightを適用できる', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2,
        },
        weight: -1.5,
      };

      // -1.5 * (2 * 10) = -30
      expect(calculateFieldValueFactor(func, 10)).toBe(-30);
    });
  });

  describe('missing値のハンドリング', () => {
    it('フィールド値がnullの場合、missing値を使用する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2,
          missing: 5,
        },
      };

      // 1 * (2 * 5) = 10
      expect(calculateFieldValueFactor(func, null as any)).toBe(10);
    });

    it('フィールド値がundefinedの場合、missing値を使用する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2,
          missing: 3,
        },
      };

      // 1 * (2 * 3) = 6
      expect(calculateFieldValueFactor(func, undefined as any)).toBe(6);
    });
  });

  describe('エッジケース', () => {
    it('ゼロ値を正しく処理する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'none',
        },
      };

      expect(calculateFieldValueFactor(func, 0)).toBe(0);
    });

    it('非常に大きな値を処理する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'none',
        },
      };

      const largeValue = 1e10;
      expect(calculateFieldValueFactor(func, largeValue)).toBe(largeValue);
    });

    it('小数値を正しく処理する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 0.5,
        },
        weight: 1.5,
      };

      // 1.5 * (0.5 * 10.5) = 7.875
      expect(calculateFieldValueFactor(func, 10.5)).toBeCloseTo(7.875, 10);
    });

    it('modifier適用後にInfinityやNaNが発生しないことを確認', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          modifier: 'sqrt',
        },
      };

      const result = calculateFieldValueFactor(func, -100);
      expect(Number.isFinite(result)).toBe(true);
      expect(Number.isNaN(result)).toBe(false);
    });
  });

  describe('modifier と weight の組み合わせ', () => {
    it('log modifier + weight', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 1,
          modifier: 'log',
        },
        weight: 2,
      };

      // 2 * log10(100) = 2 * 2 = 4
      expect(calculateFieldValueFactor(func, 100)).toBeCloseTo(4, 10);
    });

    it('square modifier + weight + factor', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'testField',
          factor: 2,
          modifier: 'square',
        },
        weight: 3,
      };

      // 3 * ((2 * 5)^2) = 3 * 100 = 300
      expect(calculateFieldValueFactor(func, 5)).toBe(300);
    });
  });
});
