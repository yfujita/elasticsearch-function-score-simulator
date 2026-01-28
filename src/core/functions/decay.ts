import { DecayFunction, DecayType } from '../types';
import { parseDuration } from '../../utils/dateUtils';

/**
 * decay 関数（gauss, linear, exp）のスコアを計算する
 *
 * @param func - decay 関数定義
 * @param fieldValue - フィールドの値
 * @param decayType - decay の種類（gauss, linear, exp）
 * @returns 計算されたスコア
 */
export function calculateDecayScore(
  func: DecayFunction,
  fieldValue: number,
  decayType: DecayType
): number {
  const weight = func.weight ?? 1;

  // decay 関数のフィールド情報を取得
  // func は { gauss: { field: {...} }, weight: 1 } のような構造
  const decayParams = func[decayType];
  if (!decayParams || typeof decayParams === 'number') {
    return 0;
  }

  // フィールド名を取得（最初のキー）
  const fieldName = Object.keys(decayParams)[0];
  const params = decayParams[fieldName];

  // origin, scale, offsetを数値に変換（日付の場合や期間文字列の場合を考慮）
  const origin = typeof params.origin === 'string' ? parseFloat(params.origin) : params.origin;
  const scale = parseDuration(params.scale);
  const offset = params.offset ? parseDuration(params.offset) : 0;
  const decay = params.decay ?? 0.5;

  // origin からの距離を計算
  const distance = Math.abs(fieldValue - origin);

  // offset 以内の場合は最大スコア（1.0）
  if (distance <= offset) {
    return weight * 1.0;
  }

  // offset を超えた距離
  const effectiveDistance = distance - offset;

  // decay タイプに応じた計算
  let score: number;

  switch (decayType) {
    case 'gauss':
      score = calculateGaussDecay(effectiveDistance, scale, decay);
      break;
    case 'linear':
      score = calculateLinearDecay(effectiveDistance, scale, decay);
      break;
    case 'exp':
      score = calculateExpDecay(effectiveDistance, scale, decay);
      break;
    default:
      score = 0;
  }

  return weight * score;
}

/**
 * Gaussian decay の計算
 *
 * 計算式: exp(-0.5 * ((distance / (scale / sqrt(-2 * ln(decay)))) ^ 2))
 */
function calculateGaussDecay(distance: number, scale: number, decay: number): number {
  // scaleが0や負の場合、decayが0以下や1以上の場合のエッジケースをチェック
  if (scale <= 0 || decay <= 0 || decay >= 1) {
    return 0;
  }

  const sigma = scale / Math.sqrt(-2 * Math.log(decay));
  const result = Math.exp(-0.5 * Math.pow(distance / sigma, 2));

  // NaNやInfinityをチェック
  return isFinite(result) ? result : 0;
}

/**
 * Linear decay の計算
 *
 * 計算式: max(0, (scale - distance) / scale * (1 - decay) + decay)
 */
function calculateLinearDecay(distance: number, scale: number, decay: number): number {
  // scaleが0や負の場合のエッジケースをチェック
  if (scale <= 0) {
    return 0;
  }

  const result = Math.max(0, ((scale - distance) / scale) * (1 - decay) + decay);
  return isFinite(result) ? result : 0;
}

/**
 * Exponential decay の計算
 *
 * 計算式: exp(ln(decay) * distance / scale)
 */
function calculateExpDecay(distance: number, scale: number, decay: number): number {
  // scaleが0や負の場合、decayが0以下の場合のエッジケースをチェック
  if (scale <= 0 || decay <= 0) {
    return 0;
  }

  const result = Math.exp((Math.log(decay) * distance) / scale);
  return isFinite(result) ? result : 0;
}
