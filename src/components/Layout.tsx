import { ReactNode } from 'react';

interface LayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

/**
 * ワンページレイアウトコンポーネント
 * 左側に設定エリア、右側にグラフエリアを配置
 */
export function Layout({ leftPanel, rightPanel }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1>Elasticsearch Function Score Simulator</h1>
        <p className="subtitle">
          Elasticsearch の function_score クエリのスコア計算をビジュアライズ
        </p>
      </header>
      <div className="layout-content">
        <div className="layout-left">{leftPanel}</div>
        <div className="layout-right">{rightPanel}</div>
      </div>
    </div>
  );
}
