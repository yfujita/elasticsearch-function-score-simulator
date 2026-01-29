import { describe, it, expect } from 'vitest';
import { calculateDecayScore } from '../decay';
import { DecayFunction } from '../../types';

describe('calculateDecayScore', () => {
  describe('Gauss Decay', () => {
    describe('基本動作', () => {
      it('origin地点ではスコアが1.0', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        expect(calculateDecayScore(func, 50, 'gauss')).toBe(1.0);
      });

      it('offset内ではスコアが1.0', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        // origin から offset 以内（50 ± 5）
        expect(calculateDecayScore(func, 52, 'gauss')).toBe(1.0);
        expect(calculateDecayScore(func, 48, 'gauss')).toBe(1.0);
        expect(calculateDecayScore(func, 55, 'gauss')).toBe(1.0);
        expect(calculateDecayScore(func, 45, 'gauss')).toBe(1.0);
      });

      it('scale地点でdecay値(デフォルト0.5)になる', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.5,
            },
          },
        };

        // origin + scale = 60
        const score = calculateDecayScore(func, 60, 'gauss');
        expect(score).toBeCloseTo(0.5, 2);
      });

      it('対称性: origin から同じ距離では同じスコア', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        const scorePlus = calculateDecayScore(func, 55, 'gauss');
        const scoreMinus = calculateDecayScore(func, 45, 'gauss');

        expect(scorePlus).toBeCloseTo(scoreMinus, 10);
      });

      it('距離が大きくなるほどスコアが減少する', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        const score1 = calculateDecayScore(func, 55, 'gauss');
        const score2 = calculateDecayScore(func, 60, 'gauss');
        const score3 = calculateDecayScore(func, 65, 'gauss');

        expect(score1).toBeGreaterThan(score2);
        expect(score2).toBeGreaterThan(score3);
      });
    });

    describe('パラメータバリエーション', () => {
      it('scaleが大きいほど緩やかに減衰する', () => {
        const funcSmallScale: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 5,
            },
          },
        };

        const funcLargeScale: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 20,
            },
          },
        };

        const scoreSmall = calculateDecayScore(funcSmallScale, 60, 'gauss');
        const scoreLarge = calculateDecayScore(funcLargeScale, 60, 'gauss');

        // 大きいscaleの方が同じ距離でのスコアが高い
        expect(scoreLarge).toBeGreaterThan(scoreSmall);
      });

      it('decay値を変更できる', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.3,
            },
          },
        };

        // scale地点でdecay値になる
        const score = calculateDecayScore(func, 60, 'gauss');
        expect(score).toBeCloseTo(0.3, 2);
      });

      it('offsetを考慮した減衰', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        // offset終了点(55)からscale分離れた地点(65)でdecay値
        const score = calculateDecayScore(func, 65, 'gauss');
        expect(score).toBeCloseTo(0.5, 2);
      });
    });

    describe('エッジケース', () => {
      it('scale=0の場合は0を返す', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 0,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'gauss')).toBe(0);
      });

      it('decay=0の場合は0を返す', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'gauss')).toBe(0);
      });

      it('decay=1の場合は0を返す', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 1,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'gauss')).toBe(0);
      });

      it('負のscaleの場合は0を返す', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: -10,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'gauss')).toBe(0);
      });
    });

    describe('weight適用', () => {
      it('正のweightを適用する', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: 2,
        };

        // origin地点でweight * 1.0 = 2.0
        expect(calculateDecayScore(func, 50, 'gauss')).toBe(2.0);
      });

      it('負のweightを適用する', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: -1.5,
        };

        // origin地点でweight * 1.0 = -1.5
        expect(calculateDecayScore(func, 50, 'gauss')).toBe(-1.5);
      });

      it('weightを減衰スコアに適用する', () => {
        const func: DecayFunction = {
          gauss: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.5,
            },
          },
          weight: 3,
        };

        // scale地点でweight * 0.5 = 1.5
        const score = calculateDecayScore(func, 60, 'gauss');
        expect(score).toBeCloseTo(1.5, 2);
      });
    });
  });

  describe('Linear Decay', () => {
    describe('基本動作', () => {
      it('origin地点ではスコアが1.0', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        expect(calculateDecayScore(func, 50, 'linear')).toBe(1.0);
      });

      it('offset内ではスコアが1.0', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        expect(calculateDecayScore(func, 52, 'linear')).toBe(1.0);
        expect(calculateDecayScore(func, 48, 'linear')).toBe(1.0);
      });

      it('線形に減衰する', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.5,
            },
          },
        };

        // scale地点でdecay値
        const scoreAtScale = calculateDecayScore(func, 60, 'linear');
        expect(scoreAtScale).toBeCloseTo(0.5, 10);

        // scale/2地点で(1 + decay) / 2
        const scoreAtHalf = calculateDecayScore(func, 55, 'linear');
        expect(scoreAtHalf).toBeCloseTo(0.75, 10);
      });

      it('scale超過で0になる', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.5,
            },
          },
        };

        // origin + scale を超える
        const score = calculateDecayScore(func, 70, 'linear');
        expect(score).toBe(0);
      });

      it('対称性: origin から同じ距離では同じスコア', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        const scorePlus = calculateDecayScore(func, 55, 'linear');
        const scoreMinus = calculateDecayScore(func, 45, 'linear');

        expect(scorePlus).toBeCloseTo(scoreMinus, 10);
      });
    });

    describe('パラメータバリエーション', () => {
      it('decay値を変更できる', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.2,
            },
          },
        };

        const score = calculateDecayScore(func, 60, 'linear');
        expect(score).toBeCloseTo(0.2, 10);
      });

      it('offsetを考慮した減衰', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        // offset終了点からscale分離れた地点でdecay値
        const score = calculateDecayScore(func, 65, 'linear');
        expect(score).toBeCloseTo(0.5, 2);
      });
    });

    describe('エッジケース', () => {
      it('scale=0の場合は0を返す', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 0,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'linear')).toBe(0);
      });

      it('負のscaleの場合は0を返す', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: -10,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'linear')).toBe(0);
      });
    });

    describe('weight適用', () => {
      it('正のweightを適用する', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: 2.5,
        };

        expect(calculateDecayScore(func, 50, 'linear')).toBe(2.5);
      });

      it('負のweightを適用する', () => {
        const func: DecayFunction = {
          linear: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: -2,
        };

        expect(calculateDecayScore(func, 50, 'linear')).toBe(-2);
      });
    });
  });

  describe('Exponential Decay', () => {
    describe('基本動作', () => {
      it('origin地点ではスコアが1.0', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        expect(calculateDecayScore(func, 50, 'exp')).toBe(1.0);
      });

      it('offset内ではスコアが1.0', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        expect(calculateDecayScore(func, 52, 'exp')).toBe(1.0);
        expect(calculateDecayScore(func, 48, 'exp')).toBe(1.0);
      });

      it('scale地点でdecay値になる', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.5,
            },
          },
        };

        const score = calculateDecayScore(func, 60, 'exp');
        expect(score).toBeCloseTo(0.5, 10);
      });

      it('指数関数的に減衰する', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        const score1 = calculateDecayScore(func, 55, 'exp');
        const score2 = calculateDecayScore(func, 60, 'exp');
        const score3 = calculateDecayScore(func, 70, 'exp');

        // 指数関数的に減衰 (ガウスより遅い減衰)
        expect(score1).toBeGreaterThan(score2);
        expect(score2).toBeGreaterThan(score3);
        expect(score3).toBeGreaterThan(0);
      });

      it('対称性: origin から同じ距離では同じスコア', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
        };

        const scorePlus = calculateDecayScore(func, 55, 'exp');
        const scoreMinus = calculateDecayScore(func, 45, 'exp');

        expect(scorePlus).toBeCloseTo(scoreMinus, 10);
      });
    });

    describe('パラメータバリエーション', () => {
      it('scaleが大きいほど緩やかに減衰する', () => {
        const funcSmallScale: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 5,
            },
          },
        };

        const funcLargeScale: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 20,
            },
          },
        };

        const scoreSmall = calculateDecayScore(funcSmallScale, 60, 'exp');
        const scoreLarge = calculateDecayScore(funcLargeScale, 60, 'exp');

        expect(scoreLarge).toBeGreaterThan(scoreSmall);
      });

      it('decay値を変更できる', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0.3,
            },
          },
        };

        const score = calculateDecayScore(func, 60, 'exp');
        expect(score).toBeCloseTo(0.3, 10);
      });

      it('offsetを考慮した減衰', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
              offset: 5,
            },
          },
        };

        const score = calculateDecayScore(func, 65, 'exp');
        expect(score).toBeCloseTo(0.5, 2);
      });
    });

    describe('エッジケース', () => {
      it('scale=0の場合は0を返す', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 0,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'exp')).toBe(0);
      });

      it('decay=0の場合は0を返す', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
              decay: 0,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'exp')).toBe(0);
      });

      it('負のscaleの場合は0を返す', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: -10,
            },
          },
        };

        expect(calculateDecayScore(func, 55, 'exp')).toBe(0);
      });
    });

    describe('weight適用', () => {
      it('正のweightを適用する', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: 3,
        };

        expect(calculateDecayScore(func, 50, 'exp')).toBe(3);
      });

      it('負のweightを適用する', () => {
        const func: DecayFunction = {
          exp: {
            testField: {
              origin: 50,
              scale: 10,
            },
          },
          weight: -1,
        };

        expect(calculateDecayScore(func, 50, 'exp')).toBe(-1);
      });
    });
  });

  describe('期間文字列パラメータ', () => {
    it('scale に期間文字列を使用できる', () => {
      const func: DecayFunction = {
        gauss: {
          testField: {
            origin: 0,
            scale: '10d', // 10日 = 10 * 24 * 60 * 60 * 1000 ms
          },
        },
      };

      // origin地点
      expect(calculateDecayScore(func, 0, 'gauss')).toBe(1.0);

      // 遠い地点ではスコアが下がる
      const score = calculateDecayScore(func, 10 * 24 * 60 * 60 * 1000, 'gauss');
      expect(score).toBeCloseTo(0.5, 2);
    });

    it('offset に期間文字列を使用できる', () => {
      const func: DecayFunction = {
        linear: {
          testField: {
            origin: 0,
            scale: '20d',
            offset: '5d',
          },
        },
      };

      // offset内
      const withinOffset = 3 * 24 * 60 * 60 * 1000; // 3日
      expect(calculateDecayScore(func, withinOffset, 'linear')).toBe(1.0);
    });
  });

  describe('無効な関数定義', () => {
    it('decay関数パラメータが存在しない場合は0を返す', () => {
      const func: DecayFunction = {
        weight: 2,
      };

      expect(calculateDecayScore(func, 50, 'gauss')).toBe(0);
    });

    it('decay関数パラメータがnumberの場合は0を返す', () => {
      const func: DecayFunction = {
        gauss: 123 as any,
      };

      expect(calculateDecayScore(func, 50, 'gauss')).toBe(0);
    });
  });

  describe('Decay関数間の比較', () => {
    it('同じ距離で異なる減衰特性を持つ', () => {
      const distance = 5;
      const origin = 50;
      const value = origin + distance;

      const funcGauss: DecayFunction = {
        gauss: {
          testField: {
            origin,
            scale: 10,
          },
        },
      };

      const funcExp: DecayFunction = {
        exp: {
          testField: {
            origin,
            scale: 10,
          },
        },
      };

      const funcLinear: DecayFunction = {
        linear: {
          testField: {
            origin,
            scale: 10,
          },
        },
      };

      const scoreGauss = calculateDecayScore(funcGauss, value, 'gauss');
      const scoreExp = calculateDecayScore(funcExp, value, 'exp');
      const scoreLinear = calculateDecayScore(funcLinear, value, 'linear');

      // すべてのスコアが0と1の間にある
      expect(scoreGauss).toBeGreaterThan(0);
      expect(scoreGauss).toBeLessThan(1);
      expect(scoreExp).toBeGreaterThan(0);
      expect(scoreExp).toBeLessThan(1);
      expect(scoreLinear).toBeGreaterThan(0);
      expect(scoreLinear).toBeLessThan(1);

      // 減衰特性の確認: 同じ距離でも関数ごとにスコアが異なる
      // Gaussianは中距離では比較的高いスコアを維持する
      expect(scoreGauss).toBeGreaterThan(scoreLinear);

      // Linearは一定の割合で線形に減衰する
      expect(scoreLinear).toBeGreaterThan(scoreExp);

      // Expは最も早く減衰する（低いスコア）
      expect(scoreExp).toBeLessThan(scoreGauss);
    });
  });
});
