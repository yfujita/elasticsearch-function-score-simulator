# Elasticsearch Function Score シミュレーター

Elasticsearch の `function_score` クエリの挙動を視覚的にシミュレーションするWebアプリケーションです。

## 🎯 概要

Elasticsearchの`function_score`クエリは、スコアリングロジックを柔軟にカスタマイズできる強力な機能ですが、複雑なパラメータ調整が必要です。このツールを使用すると、実際にElasticsearchを実行することなく、各種関数の挙動をグラフで可視化できます。

## ✨ 主な機能

- **リアルタイムシミュレーション**: パラメータを変更すると即座にグラフが更新されます（debounce処理により300ms遅延）
- **複数の関数タイプをサポート**:
  - `field_value_factor`: フィールド値を使ったスコア計算
    - modifier: `none`, `log`, `log1p`, `log2p`, `ln`, `ln1p`, `ln2p`, `square`, `sqrt`, `reciprocal`
  - `gauss`: ガウス分布による減衰関数
  - `linear`: 線形減衰関数
  - `exp`: 指数減衰関数
- **日付フィールド対応**: 数値だけでなく日付フィールドのシミュレーションも可能
- **複数関数の同時表示**: 複数の関数を同時にグラフに表示して比較可能
- **プリセット機能**: よく使うパターンをプリセットから選択可能
- **エッジケース対応**: ゼロ除算、マイナス値、極端な値も安全に処理

## 🚀 デモ

**[デモサイトはこちら](https://yfujita.github.io/elasticsearch-function-score-simulator/)**

## 💻 ローカル開発

### 必要な環境

- Node.js 20以上
- npm

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yfujita/elasticsearch-function-score-simulator.git
cd elasticsearch-function-score-simulator

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーが起動したら、ブラウザで http://localhost:5173 にアクセスしてください。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## 📖 使い方

### 1. シミュレーション変数の設定

左パネルの「シミュレーション変数設定」で、X軸（フィールド値）の範囲を設定します。

- **フィールド名**: シミュレーション対象のフィールド名（例: `popularity`, `created_at`）
- **データ型**: `Numeric`（数値）または `Date`（日付）
- **最小値/最大値**: グラフのX軸の範囲

### 2. Function Score設定

左パネルの「Function Score設定」で、Elasticsearchの`functions`配列をJSON形式で入力します。

#### field_value_factor の例

```json
[
  {
    "field_value_factor": {
      "field": "popularity",
      "factor": 1.2,
      "modifier": "sqrt"
    },
    "weight": 1
  }
]
```

#### gauss 関数の例

```json
[
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
]
```

#### 複数関数の例

```json
[
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
]
```

### 3. グラフの確認

右パネルにリアルタイムでグラフが表示されます。複数の関数を定義した場合は、それぞれ異なる色で表示されます。

## 🔧 対応している関数とパラメータ

### field_value_factor

フィールド値にファクターと修飾子を適用してスコアを計算します。

| パラメータ | 説明 | デフォルト |
|-----------|------|-----------|
| `field` | 対象フィールド名 | - |
| `factor` | フィールド値に掛ける係数 | 1 |
| `modifier` | 変換関数（`none`, `log`, `log1p`, `ln`, `sqrt`, `square`, `reciprocal`など） | `none` |
| `missing` | フィールド値が存在しない場合の値 | 1 |

**weight**: 関数全体の重み（デフォルト: 1）

#### modifier 一覧

- `none`: 変換なし
- `log`: 常用対数（log10）
- `log1p`: log10(value + 1)
- `log2p`: log10(value + 2)
- `ln`: 自然対数
- `ln1p`: ln(value + 1)
- `ln2p`: ln(value + 2)
- `square`: 二乗
- `sqrt`: 平方根
- `reciprocal`: 逆数（1/value）

### decay 関数（gauss, linear, exp）

基準値（origin）からの距離に応じてスコアを減衰させます。

| パラメータ | 説明 | デフォルト |
|-----------|------|-----------|
| `origin` | 基準値（日付または数値） | - |
| `scale` | 減衰の範囲（日付の場合は期間文字列、例: `30d`） | - |
| `offset` | 減衰を開始しない範囲 | 0 |
| `decay` | scaleの距離でのスコア値 | 0.5 |

**weight**: 関数全体の重み（デフォルト: 1）

#### 期間文字列の形式

日付フィールドで使用できる期間文字列の形式:

- `d`: 日（例: `30d` = 30日）
- `h`: 時間（例: `12h` = 12時間）
- `m`: 分（例: `30m` = 30分）
- `s`: 秒（例: `60s` = 60秒）

## 🛠 技術スタック

- **React 18**: UIフレームワーク
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Recharts**: グラフ描画ライブラリ
- **date-fns**: 日付処理

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── Layout.tsx      # レイアウトコンポーネント
│   ├── VariableConfig.tsx  # 変数設定フォーム
│   ├── FunctionConfig.tsx  # 関数設定フォーム
│   └── ScoreChart.tsx      # グラフ表示
├── core/               # スコア計算ロジック
│   ├── types.ts        # 型定義
│   ├── calculator.ts   # メイン計算エンジン
│   └── functions/      # 各関数タイプの実装
│       ├── index.ts
│       ├── fieldValueFactor.ts
│       └── decay.ts
├── utils/              # ユーティリティ関数
│   └── dateUtils.ts    # 日付処理
├── App.tsx             # メインアプリケーション
├── App.css             # スタイルシート
└── main.tsx            # エントリーポイント
```

## 🚀 デプロイ

このプロジェクトはGitHub Pagesにデプロイされます。

### 自動デプロイ

`main`ブランチにpushすると、GitHub Actionsが自動的にビルドとデプロイを実行します。

### 手動デプロイ

```bash
# ビルド
npm run build

# dist/ディレクトリの内容をgh-pagesブランチにデプロイ
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue や Pull Request を歓迎します。

## 📚 参考資料

- [Elasticsearch Function Score Query 公式ドキュメント](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html)
- [Field Value Factor](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html#function-field-value-factor)
- [Decay Functions](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html#function-decay)
