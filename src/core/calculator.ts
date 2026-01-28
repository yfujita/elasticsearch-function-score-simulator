import { SimulationVariable, FunctionScoreFunction, DataPoint } from './types';
import { calculateFieldValueFactor } from './functions/fieldValueFactor';
import { calculateDecayScore } from './functions/decay';
import { dateToTimestamp } from '../utils/dateUtils';

/**
 * シミュレーション変数と関数定義に基づいて、グラフ用のデータポイントを生成する
 *
 * @param variable - シミュレーション変数(X軸の定義)
 * @param functions - Function Score の関数配列
 * @param points - 生成するデータポイント数(デフォルト: 100)
 * @returns グラフ描画用のデータポイント配列
 */
export function generateDataPoints(
  variable: SimulationVariable,
  functions: FunctionScoreFunction[],
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

    functions.forEach((func, index) => {
      const score = calculateFunctionScore(func, xValue);
      // 関数のインデックスをキーとしてスコアを格納
      point[`function${index}`] = score;
    });

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
