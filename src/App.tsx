import { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import { SimulationVariable, FunctionScoreFunction, ScoreMode } from './core/types';
import { generateDataPoints } from './core/calculator';
import { Layout } from './components/Layout';
import { VariableConfig } from './components/VariableConfig';
import { FunctionConfig } from './components/FunctionConfig';
import { ScoreChart } from './components/ScoreChart';

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  // シミュレーション変数の状態
  const [simulationVariable, setSimulationVariable] = useState<SimulationVariable>({
    fieldName: 'popularity',
    dataType: 'numeric',
    min: 0,
    max: 100,
  });

  // score_modeの状態（デフォルト: sum）
  const [scoreMode, setScoreMode] = useState<ScoreMode>('sum');

  // Functions JSON文字列の状態
  const [functionsJson, setFunctionsJson] = useState<string>(
    `[
  {
    "field_value_factor": {
      "field": "popularity",
      "factor": 1.2,
      "modifier": "sqrt"
    },
    "weight": 1
  }
]`
  );

  // debounce用の内部状態
  const [debouncedFunctionsJson, setDebouncedFunctionsJson] = useState<string>(functionsJson);

  // パース済みのFunctions配列
  const [parsedFunctions, setParsedFunctions] = useState<FunctionScoreFunction[] | null>(null);

  // JSONパースエラー
  const [jsonError, setJsonError] = useState<string | null>(null);

  // JSONの入力をdebounce（300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFunctionsJson(functionsJson);
    }, 300);

    return () => clearTimeout(timer);
  }, [functionsJson]);

  // debounce済みのJSONをパースして状態を更新
  useEffect(() => {
    try {
      const parsed = JSON.parse(debouncedFunctionsJson) as FunctionScoreFunction[];
      setParsedFunctions(parsed);
      setJsonError(null);
    } catch (error) {
      setParsedFunctions(null);
      setJsonError(error instanceof Error ? error.message : 'JSONパースエラー');
    }
  }, [debouncedFunctionsJson]);

  // シミュレーション変数または関数が変更されたらグラフデータを再計算
  // useMemoを使って不要な再計算を防ぐ
  const chartData = useMemo(() => {
    if (!parsedFunctions || parsedFunctions.length === 0) {
      return [];
    }

    try {
      return generateDataPoints(simulationVariable, parsedFunctions, scoreMode);
    } catch (error) {
      console.error('データポイント生成エラー:', error);
      return [];
    }
  }, [simulationVariable, parsedFunctions, scoreMode]);

  // コールバックをメモ化して不要な再レンダリングを防ぐ
  const handleVariableChange = useCallback((variable: SimulationVariable) => {
    setSimulationVariable(variable);
  }, []);

  const handleFunctionsJsonChange = useCallback((value: string) => {
    setFunctionsJson(value);
  }, []);

  const handleScoreModeChange = useCallback((mode: ScoreMode) => {
    setScoreMode(mode);
  }, []);

  // 左パネル: 設定エリア
  const leftPanel = (
    <div className="config-area">
      <VariableConfig
        variable={simulationVariable}
        scoreMode={scoreMode}
        onChange={handleVariableChange}
        onScoreModeChange={handleScoreModeChange}
      />
      <FunctionConfig value={functionsJson} onChange={handleFunctionsJsonChange} error={jsonError} />
    </div>
  );

  // 右パネル: グラフエリア
  const rightPanel = (
    <div className="chart-area">
      <ScoreChart data={chartData} functionCount={parsedFunctions?.length || 0} scoreMode={scoreMode} />
    </div>
  );

  return <Layout leftPanel={leftPanel} rightPanel={rightPanel} />;
}

export default App;
