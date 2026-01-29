import { memo } from 'react';
import { SimulationVariable, DataType, ScoreMode } from '../core/types';

interface VariableConfigProps {
  variable: SimulationVariable;
  scoreMode: ScoreMode;
  onChange: (variable: SimulationVariable) => void;
  onScoreModeChange: (mode: ScoreMode) => void;
}

/**
 * シミュレーション変数の設定フォーム
 */
export const VariableConfig = memo(function VariableConfig({
  variable,
  scoreMode,
  onChange,
  onScoreModeChange,
}: VariableConfigProps) {
  const handleFieldNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...variable,
      fieldName: e.target.value,
    });
  };

  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDataType = e.target.value as DataType;
    // データ型を変更したら、min/maxもリセット
    onChange({
      ...variable,
      dataType: newDataType,
      min: newDataType === 'date' ? '2024-01-01' : 0,
      max: newDataType === 'date' ? '2024-12-31' : 100,
    });
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...variable,
      min: variable.dataType === 'date' ? e.target.value : parseFloat(e.target.value) || 0,
    });
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...variable,
      max: variable.dataType === 'date' ? e.target.value : parseFloat(e.target.value) || 0,
    });
  };

  const handleScoreModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onScoreModeChange(e.target.value as ScoreMode);
  };

  return (
    <div className="variable-config">
      <h3>シミュレーション変数設定</h3>

      <div className="form-group">
        <label htmlFor="fieldName">フィールド名</label>
        <input
          id="fieldName"
          type="text"
          value={variable.fieldName}
          onChange={handleFieldNameChange}
          placeholder="例: popularity, created_at"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dataType">データ型</label>
        <select id="dataType" value={variable.dataType} onChange={handleDataTypeChange}>
          <option value="numeric">Numeric (数値)</option>
          <option value="date">Date (日付)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="min">最小値</label>
        <input
          id="min"
          type={variable.dataType === 'date' ? 'date' : 'number'}
          value={variable.min.toString()}
          onChange={handleMinChange}
          step={variable.dataType === 'numeric' ? '0.1' : undefined}
        />
      </div>

      <div className="form-group">
        <label htmlFor="max">最大値</label>
        <input
          id="max"
          type={variable.dataType === 'date' ? 'date' : 'number'}
          value={variable.max.toString()}
          onChange={handleMaxChange}
          step={variable.dataType === 'numeric' ? '0.1' : undefined}
        />
      </div>

      <div className="form-group">
        <label htmlFor="scoreMode">Score Mode</label>
        <select id="scoreMode" value={scoreMode} onChange={handleScoreModeChange}>
          <option value="sum">sum (合計)</option>
          <option value="multiply">multiply (乗算)</option>
          <option value="avg">avg (平均)</option>
          <option value="first">first (最初)</option>
          <option value="max">max (最大)</option>
          <option value="min">min (最小)</option>
        </select>
      </div>
    </div>
  );
});
