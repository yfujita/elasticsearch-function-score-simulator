/**
 * データ型の定義
 */
export type DataType = 'numeric' | 'date';

/**
 * シミュレーション変数（X軸）の定義
 */
export interface SimulationVariable {
  /** フィールド名 */
  fieldName: string;
  /** データ型 */
  dataType: DataType;
  /** 最小値（数値の場合は数値、日付の場合はISO文字列） */
  min: number | string;
  /** 最大値（数値の場合は数値、日付の場合はISO文字列） */
  max: number | string;
}

/**
 * field_value_factor の modifier
 */
export type FieldValueFactorModifier =
  | 'none'
  | 'log'
  | 'log1p'
  | 'log2p'
  | 'ln'
  | 'ln1p'
  | 'ln2p'
  | 'square'
  | 'sqrt'
  | 'reciprocal';

/**
 * field_value_factor 関数の定義
 */
export interface FieldValueFactorFunction {
  field_value_factor: {
    field: string;
    factor?: number;
    modifier?: FieldValueFactorModifier;
    missing?: number;
  };
  weight?: number;
}

/**
 * decay 関数の種類
 */
export type DecayType = 'gauss' | 'linear' | 'exp';

/**
 * decay 関数（gauss, linear, exp）の定義
 */
export interface DecayFunction {
  [key: string]:
    | {
        [field: string]: {
          origin: number | string;
          scale: number | string;
          offset?: number | string;
          decay?: number;
        };
      }
    | number
    | undefined;
  weight?: number;
}

/**
 * Function Score で使用可能な関数の型
 */
export type FunctionScoreFunction = FieldValueFactorFunction | DecayFunction;

/**
 * グラフ用のデータポイント
 */
export interface DataPoint {
  /** X軸の値（フィールド値） */
  x: number;
  /** 各関数のスコア（関数のインデックスをキーとする） */
  [key: string]: number;
}
