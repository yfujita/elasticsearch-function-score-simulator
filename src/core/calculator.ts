import { SimulationVariable, FunctionScoreFunction, DataPoint, ScoreMode } from './types';
import { calculateFieldValueFactor } from './functions/fieldValueFactor';
import { calculateDecayScore } from './functions/decay';
import { dateToTimestamp } from '../utils/dateUtils';

/**
 * 複数のfunctionスコアをscore_modeに基づいて組み合わせる
 *
 * @param scores - 各関数のスコア配列
 * @param mode - score_mode
 * @returns 組み合わせたスコア
 */
export function calculateCombinedScore(scores: number[], mode: ScoreMode): number {
  if (scores.length === 0) return 0;

  switch (mode) {
    case 'multiply':
      return scores.reduce((acc, score) => acc * score, 1);
    case 'sum':
      return scores.reduce((acc, score) => acc + score, 0);
    case 'avg':
      return scores.reduce((acc, score) => acc + score, 0) / scores.length;
    case 'first':
      return scores[0];
    case 'max':
      return Math.max(...scores);
    case 'min':
      return Math.min(...scores);
    default:
      return scores.reduce((acc, score) => acc + score, 0);
  }
}

/**
 * シミュレーション変数と関数定義に基づいて、グラフ用のデータポイントを生成する
 *
 * @param variable - シミュレーション変数(X軸の定義)
 * @param functions - Function Score の関数配列
 * @param scoreMode - score_mode（複数関数のスコア組み合わせ方法、デフォルト: sum）
 * @param points - 生成するデータポイント数(デフォルト: 100)
 * @returns グラフ描画用のデータポイント配列
 */
export function generateDataPoints(
  variable: SimulationVariable,
  functions: FunctionScoreFunction[],
  scoreMode: ScoreMode = 'sum',
  points: number = 100
): DataPoint[] {
  // min/maxを数値に変換
  let minValue: number;
  let maxValue: number;

  if (variable.dataType === 'date') {
    // 日付型の場合はタイムスタンプに変換
    minValue = dateToTimestamp(variable.min as string);
    maxValue = dateToTimestamp(variable.max as string);
  } else {
    // 数値型の場合はそのまま使用
    minValue = variable.min as number;
    maxValue = variable.max as number;
  }

  // X軸のサンプリングポイントを生成(min〜maxをpoints個に分割)
  const dataPoints: DataPoint[] = [];
  const step = (maxValue - minValue) / (points - 1);

  for (let i = 0; i < points; i++) {
    const xValue = minValue + step * i;

    // 各関数のスコアを計算
    const point: DataPoint = { x: xValue };
    const scores: number[] = [];

    functions.forEach((func, index) => {
      const score = calculateFunctionScore(func, xValue);
      // 関数のインデックスをキーとしてスコアを格納
      point[`function${index}`] = score;
      scores.push(score);
    });

    // 関数が2つ以上の場合、combined scoreを計算
    if (functions.length >= 2) {
      point.combined = calculateCombinedScore(scores, scoreMode);
    }

    dataPoints.push(point);
  }

  return dataPoints;
}

/**
 * 単一の関数とフィールド値に対してスコアを計算する
 *
 * @param func - Function Score の関数定義
 * @param fieldValue - フィールドの値
 * @returns 計算されたスコア
 */
export function calculateFunctionScore(
  func: FunctionScoreFunction,
  fieldValue: number
): number {
  // 関数タイプを判定
  // field_value_factorの場合
  if ('field_value_factor' in func) {
    return calculateFieldValueFactor(func as any, fieldValue);
  }

  // decay関数の場合(gauss, linear, exp)
  if ('gauss' in func) {
    return calculateDecayScore(func as any, fieldValue, 'gauss');
  }
  if ('linear' in func) {
    return calculateDecayScore(func as any, fieldValue, 'linear');
  }
  if ('exp' in func) {
    return calculateDecayScore(func as any, fieldValue, 'exp');
  }

  // 未知の関数タイプの場合は0を返す
  return 0;
}
