import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataPoint } from '../core/types';

interface ScoreChartProps {
  data: DataPoint[];
  functionCount: number;
}

/**
 * スコアチャートコンポーネント
 */
export const ScoreChart = memo(function ScoreChart({ data, functionCount }: ScoreChartProps) {
  // 関数ごとに異なる色を割り当て
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#a28bd4',
    '#f48fb1',
    '#81c784',
    '#64b5f6',
  ];

  // データが空の場合
  if (data.length === 0) {
    return (
      <div className="score-chart empty">
        <p>グラフを表示するには、設定を入力してください。</p>
      </div>
    );
  }

  return (
    <div className="score-chart">
      <h3>Function Score シミュレーション結果</h3>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            label={{ value: 'フィールド値', position: 'insideBottom', offset: -5 }}
            tickFormatter={(value) => {
              // 数値が大きい場合は科学的記数法で表示
              if (Math.abs(value) >= 1000000) {
                return value.toExponential(2);
              }
              return value.toFixed(0);
            }}
          />
          <YAxis label={{ value: 'スコア', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => value.toFixed(4)}
            labelFormatter={(label: number) => `フィールド値: ${label.toFixed(2)}`}
          />
          <Legend />
          {/* 各関数のラインを描画 */}
          {Array.from({ length: functionCount }).map((_, index) => (
            <Line
              key={`function${index}`}
              type="monotone"
              dataKey={`function${index}`}
              name={`Function ${index + 1}`}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
