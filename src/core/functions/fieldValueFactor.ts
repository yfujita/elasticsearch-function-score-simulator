import { FieldValueFactorFunction, FieldValueFactorModifier } from '../types';

/**
 * field_value_factor 関数のスコアを計算する
 *
 * 計算式: score = weight * modifier(factor * field_value)
 *
 * @param func - field_value_factor 関数定義
 * @param fieldValue - フィールドの値
 * @returns 計算されたスコア
 */
export function calculateFieldValueFactor(
  func: FieldValueFactorFunction,
  fieldValue: number
): number {
  const { factor = 1, modifier = 'none', missing = 1 } = func.field_value_factor;
  const weight = func.weight ?? 1;

  // フィールド値が存在しない場合は missing 値を使用
  const value = fieldValue ?? missing;

  // factor を適用
  let result = factor * value;

  // modifier を適用
  result = applyModifier(result, modifier);

  // weight を適用
  return weight * result;
}

/**
 * modifier を適用する
 *
 * @param value - 入力値
 * @param modifier - modifier の種類
 * @returns modifier 適用後の値
 */
function applyModifier(value: number, modifier: FieldValueFactorModifier): number {
  switch (modifier) {
    case 'none':
      return value;
    case 'log':
      // log(0)やlog(負の数)を避けるため、値が0以下の場合は0を返す
      return value > 0 ? Math.log10(value) : 0;
    case 'log1p':
      // log1p(-1以下)を避ける
      return value > -1 ? Math.log10(value + 1) : 0;
    case 'log2p':
      // log2p(-2以下)を避ける
      return value > -2 ? Math.log10(value + 2) : 0;
    case 'ln':
      // ln(0)やln(負の数)を避ける
      return value > 0 ? Math.log(value) : 0;
    case 'ln1p':
      // ln1p(-1以下)を避ける
      return value > -1 ? Math.log(value + 1) : 0;
    case 'ln2p':
      // ln2p(-2以下)を避ける
      return value > -2 ? Math.log(value + 2) : 0;
    case 'square':
      return value * value;
    case 'sqrt':
      // sqrt(負の数)を避けるため、値が負の場合は0を返す
      return value >= 0 ? Math.sqrt(value) : 0;
    case 'reciprocal':
      // ゼロ除算を避けるため、値が0に非常に近い場合は大きな値を返す
      // Elasticsearchの実装に合わせて、0の場合はInfinityではなく大きな値を返す
      return value !== 0 ? 1 / value : 0;
    default:
      // 未知の modifier の場合は何もしない
      return value;
  }
}
