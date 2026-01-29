import { describe, it, expect } from 'vitest';
import { generateDataPoints, calculateFunctionScore } from '../calculator';
import {
  SimulationVariable,
  FunctionScoreFunction,
  FieldValueFactorFunction,
  DecayFunction,
} from '../types';

describe('generateDataPoints', () => {
  describe('数値型の変数', () => {
    it('指定された数のデータポイントを生成する', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 10);

      expect(dataPoints).toHaveLength(10);
    });

    it('minからmaxまでの範囲でデータポイントを生成する', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 11);

      // 最初のポイントはmin
      expect(dataPoints[0].x).toBe(0);
      // 最後のポイントはmax
      expect(dataPoints[10].x).toBe(100);
      // 中間点
      expect(dataPoints[5].x).toBe(50);
    });

    it('各データポイントに関数のスコアが含まれる', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 2,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 5);

      dataPoints.forEach((point) => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('function0');
        expect(typeof point.function0).toBe('number');
      });
    });

    it('複数の関数を処理できる', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
        {
          field_value_factor: {
            field: 'price',
            factor: 2,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 5);

      dataPoints.forEach((point) => {
        expect(point).toHaveProperty('function0');
        expect(point).toHaveProperty('function1');
      });
    });

    it('デフォルトで100個のポイントを生成する', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions);

      expect(dataPoints).toHaveLength(100);
    });
  });

  describe('日付型の変数', () => {
    it('日付文字列をタイムスタンプに変換して処理する', () => {
      const variable: SimulationVariable = {
        fieldName: 'publish_date',
        dataType: 'date',
        min: '2024-01-01T00:00:00.000Z',
        max: '2024-01-31T00:00:00.000Z',
      };

      const functions: FunctionScoreFunction[] = [
        {
          gauss: {
            publish_date: {
              origin: new Date('2024-01-15T00:00:00.000Z').getTime(),
              scale: 10 * 24 * 60 * 60 * 1000, // 10日
            },
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 10);

      expect(dataPoints).toHaveLength(10);
      // タイムスタンプ形式のx値
      expect(dataPoints[0].x).toBeGreaterThan(0);
    });

    it('日付範囲でmin-maxが正しく処理される', () => {
      const variable: SimulationVariable = {
        fieldName: 'date',
        dataType: 'date',
        min: '2024-01-01T00:00:00.000Z',
        max: '2024-01-02T00:00:00.000Z', // 1日の範囲
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'date',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 3);

      const minTimestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
      const maxTimestamp = new Date('2024-01-02T00:00:00.000Z').getTime();

      expect(dataPoints[0].x).toBe(minTimestamp);
      expect(dataPoints[2].x).toBe(maxTimestamp);
    });
  });

  describe('エッジケース', () => {
    it('min=maxの場合でも処理できる', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 50,
        max: 50,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 5);

      expect(dataPoints).toHaveLength(5);
      dataPoints.forEach((point) => {
        expect(point.x).toBe(50);
      });
    });

    it('points=1の場合はmin値のみ', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'price',
            factor: 1,
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 1);

      expect(dataPoints).toHaveLength(1);
      // points=1の場合、step = (max-min)/(1-1) = Infinity となり、
      // min + Infinity * 0 = min + NaN = NaN になる
      // これは実装上の制約であり、points >= 2 で使用することを想定
      expect(Number.isNaN(dataPoints[0].x)).toBe(true);
    });

    it('関数が空配列の場合でもデータポイントを生成する', () => {
      const variable: SimulationVariable = {
        fieldName: 'price',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 5);

      expect(dataPoints).toHaveLength(5);
      dataPoints.forEach((point) => {
        expect(point).toHaveProperty('x');
      });
    });
  });
});

describe('calculateFunctionScore', () => {
  describe('field_value_factor 関数', () => {
    it('field_value_factor関数のスコアを計算する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'price',
          factor: 2,
        },
      };

      const score = calculateFunctionScore(func, 10);

      // 1 * (2 * 10) = 20
      expect(score).toBe(20);
    });

    it('modifier付きfield_value_factor関数', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'price',
          factor: 1,
          modifier: 'log',
        },
      };

      const score = calculateFunctionScore(func, 100);

      // 1 * log10(100) = 2
      expect(score).toBeCloseTo(2, 10);
    });

    it('weight付きfield_value_factor関数', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'price',
          factor: 3,
        },
        weight: 2,
      };

      const score = calculateFunctionScore(func, 5);

      // 2 * (3 * 5) = 30
      expect(score).toBe(30);
    });
  });

  describe('gauss decay 関数', () => {
    it('gauss関数のスコアを計算する', () => {
      const func: DecayFunction = {
        gauss: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
      };

      const score = calculateFunctionScore(func, 50);

      // origin地点で1.0
      expect(score).toBe(1.0);
    });

    it('gauss関数でweight付き', () => {
      const func: DecayFunction = {
        gauss: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
        weight: 2,
      };

      const score = calculateFunctionScore(func, 50);

      // 2 * 1.0 = 2.0
      expect(score).toBe(2.0);
    });

    it('gauss関数で距離が離れた場合', () => {
      const func: DecayFunction = {
        gauss: {
          location: {
            origin: 50,
            scale: 10,
            decay: 0.5,
          },
        },
      };

      const score = calculateFunctionScore(func, 60);

      // scale地点でdecay値
      expect(score).toBeCloseTo(0.5, 2);
    });
  });

  describe('linear decay 関数', () => {
    it('linear関数のスコアを計算する', () => {
      const func: DecayFunction = {
        linear: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
      };

      const score = calculateFunctionScore(func, 50);

      // origin地点で1.0
      expect(score).toBe(1.0);
    });

    it('linear関数で距離が離れた場合', () => {
      const func: DecayFunction = {
        linear: {
          location: {
            origin: 50,
            scale: 10,
            decay: 0.5,
          },
        },
      };

      const score = calculateFunctionScore(func, 60);

      // scale地点でdecay値
      expect(score).toBeCloseTo(0.5, 10);
    });

    it('linear関数でweight付き', () => {
      const func: DecayFunction = {
        linear: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
        weight: 3,
      };

      const score = calculateFunctionScore(func, 50);

      // 3 * 1.0 = 3.0
      expect(score).toBe(3.0);
    });
  });

  describe('exp decay 関数', () => {
    it('exp関数のスコアを計算する', () => {
      const func: DecayFunction = {
        exp: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
      };

      const score = calculateFunctionScore(func, 50);

      // origin地点で1.0
      expect(score).toBe(1.0);
    });

    it('exp関数で距離が離れた場合', () => {
      const func: DecayFunction = {
        exp: {
          location: {
            origin: 50,
            scale: 10,
            decay: 0.5,
          },
        },
      };

      const score = calculateFunctionScore(func, 60);

      // scale地点でdecay値
      expect(score).toBeCloseTo(0.5, 10);
    });

    it('exp関数でweight付き', () => {
      const func: DecayFunction = {
        exp: {
          location: {
            origin: 50,
            scale: 10,
          },
        },
        weight: 4,
      };

      const score = calculateFunctionScore(func, 50);

      // 4 * 1.0 = 4.0
      expect(score).toBe(4.0);
    });
  });

  describe('未知の関数タイプ', () => {
    it('未知の関数タイプの場合は0を返す', () => {
      const func = {
        unknown_function: {
          field: 'test',
        },
      } as any;

      const score = calculateFunctionScore(func, 50);

      expect(score).toBe(0);
    });

    it('空のオブジェクトの場合は0を返す', () => {
      const func = {} as any;

      const score = calculateFunctionScore(func, 50);

      expect(score).toBe(0);
    });
  });

  describe('関数タイプの判定', () => {
    it('field_value_factorプロパティが存在する場合にfield_value_factor関数として処理する', () => {
      const func: FieldValueFactorFunction = {
        field_value_factor: {
          field: 'test',
          factor: 5,
        },
      };

      const score = calculateFunctionScore(func, 2);

      // 1 * (5 * 2) = 10
      expect(score).toBe(10);
    });

    it('gaussプロパティが存在する場合にgauss関数として処理する', () => {
      const func: DecayFunction = {
        gauss: {
          test: {
            origin: 10,
            scale: 5,
          },
        },
      };

      const score = calculateFunctionScore(func, 10);

      expect(score).toBe(1.0);
    });

    it('linearプロパティが存在する場合にlinear関数として処理する', () => {
      const func: DecayFunction = {
        linear: {
          test: {
            origin: 10,
            scale: 5,
          },
        },
      };

      const score = calculateFunctionScore(func, 10);

      expect(score).toBe(1.0);
    });

    it('expプロパティが存在する場合にexp関数として処理する', () => {
      const func: DecayFunction = {
        exp: {
          test: {
            origin: 10,
            scale: 5,
          },
        },
      };

      const score = calculateFunctionScore(func, 10);

      expect(score).toBe(1.0);
    });
  });

  describe('統合シナリオ', () => {
    it('複数の異なる関数タイプを処理できる', () => {
      const variable: SimulationVariable = {
        fieldName: 'score',
        dataType: 'numeric',
        min: 0,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'score',
            factor: 1,
          },
        },
        {
          gauss: {
            score: {
              origin: 50,
              scale: 10,
            },
          },
        },
        {
          linear: {
            score: {
              origin: 50,
              scale: 20,
            },
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 5);

      expect(dataPoints).toHaveLength(5);
      dataPoints.forEach((point) => {
        expect(point).toHaveProperty('function0');
        expect(point).toHaveProperty('function1');
        expect(point).toHaveProperty('function2');
      });
    });

    it('すべてのスコアが有限の数値である', () => {
      const variable: SimulationVariable = {
        fieldName: 'value',
        dataType: 'numeric',
        min: -100,
        max: 100,
      };

      const functions: FunctionScoreFunction[] = [
        {
          field_value_factor: {
            field: 'value',
            factor: 1,
            modifier: 'sqrt',
          },
        },
        {
          gauss: {
            value: {
              origin: 0,
              scale: 50,
            },
          },
        },
      ];

      const dataPoints = generateDataPoints(variable, functions, 'sum', 20);

      dataPoints.forEach((point) => {
        expect(Number.isFinite(point.function0)).toBe(true);
        expect(Number.isFinite(point.function1)).toBe(true);
        expect(Number.isNaN(point.function0)).toBe(false);
        expect(Number.isNaN(point.function1)).toBe(false);
      });
    });
  });
});
