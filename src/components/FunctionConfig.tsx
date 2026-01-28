import { useState, memo } from 'react';

interface FunctionConfigProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

/**
 * Function Score設定フォーム
 */
export const FunctionConfig = memo(function FunctionConfig({ value, onChange, error }: FunctionConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // プリセット用のサンプルJSON
  const presets = {
    field_value_factor: `[
  {
    "field_value_factor": {
      "field": "popularity",
      "factor": 1.2,
      "modifier": "sqrt"
    },
    "weight": 1
  }
]`,
    gauss: `[
  {
    "gauss": {
      "created_at": {
        "origin": "2024-06-01",
        "scale": "30d",
        "offset": "5d",
        "decay": 0.5
      }
    },
    "weight": 1
  }
]`,
    linear: `[
  {
    "linear": {
      "popularity": {
        "origin": 50,
        "scale": 20,
        "offset": 0,
        "decay": 0.5
      }
    },
    "weight": 1
  }
]`,
    exp: `[
  {
    "exp": {
      "popularity": {
        "origin": 100,
        "scale": 10,
        "offset": 0,
        "decay": 0.5
      }
    },
    "weight": 1
  }
]`,
    multi: `[
  {
    "field_value_factor": {
      "field": "popularity",
      "factor": 1.2,
      "modifier": "log1p"
    },
    "weight": 2
  },
  {
    "gauss": {
      "created_at": {
        "origin": "2024-06-01",
        "scale": "30d",
        "decay": 0.5
      }
    },
    "weight": 1
  }
]`,
  };

  const handlePresetClick = (presetKey: keyof typeof presets) => {
    onChange(presets[presetKey]);
  };

  return (
    <div className="function-config">
      <h3>Function Score 設定</h3>

      <div className="preset-buttons">
        <button onClick={() => setIsExpanded(!isExpanded)} className="preset-toggle">
          {isExpanded ? '▼' : '▶'} プリセット
        </button>
        {isExpanded && (
          <div className="preset-list">
            <button onClick={() => handlePresetClick('field_value_factor')}>
              field_value_factor
            </button>
            <button onClick={() => handlePresetClick('gauss')}>gauss</button>
            <button onClick={() => handlePresetClick('linear')}>linear</button>
            <button onClick={() => handlePresetClick('exp')}>exp</button>
            <button onClick={() => handlePresetClick('multi')}>複数関数</button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="functions">Functions配列 (JSON)</label>
        <textarea
          id="functions"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={15}
          placeholder='例: [{"field_value_factor": {"field": "popularity", "factor": 1.2, "modifier": "sqrt"}, "weight": 1}]'
          spellCheck={false}
        />
        {error && (
          <div className="error-message">
            <strong>JSONエラー:</strong> {error}
            <br />
            <small>プリセットを選択するか、JSON形式を確認してください。</small>
          </div>
        )}
      </div>

      <div className="help-text">
        <p>
          <strong>ヒント:</strong> Elasticsearch の function_score の functions 配列を JSON
          形式で記述してください。
        </p>
      </div>
    </div>
  );
});
