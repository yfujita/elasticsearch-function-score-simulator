import { describe, it, expect } from 'vitest';
import { dateToTimestamp, timestampToDate, parseDuration } from '../dateUtils';

describe('dateToTimestamp', () => {
  it('ISO日付文字列をミリ秒タイムスタンプに変換する', () => {
    const dateString = '2024-01-01T00:00:00.000Z';
    const timestamp = dateToTimestamp(dateString);

    expect(timestamp).toBe(new Date(dateString).getTime());
  });

  it('異なる日付を正しく変換する', () => {
    const dateString1 = '2024-01-15T12:30:45.000Z';
    const dateString2 = '2023-12-31T23:59:59.999Z';

    const timestamp1 = dateToTimestamp(dateString1);
    const timestamp2 = dateToTimestamp(dateString2);

    expect(timestamp1).toBe(new Date(dateString1).getTime());
    expect(timestamp2).toBe(new Date(dateString2).getTime());
    expect(timestamp1).toBeGreaterThan(timestamp2);
  });

  it('UTCタイムゾーンの日付を処理する', () => {
    const dateString = '2024-06-15T08:30:00.000Z';
    const timestamp = dateToTimestamp(dateString);

    // 期待値と一致する
    expect(timestamp).toBe(Date.UTC(2024, 5, 15, 8, 30, 0, 0));
  });

  it('エポック時刻を返す', () => {
    const dateString = '1970-01-01T00:00:00.000Z';
    const timestamp = dateToTimestamp(dateString);

    expect(timestamp).toBe(0);
  });

  it('ミリ秒を含む日付を正確に変換する', () => {
    const dateString = '2024-01-01T00:00:00.123Z';
    const timestamp = dateToTimestamp(dateString);

    expect(timestamp).toBe(new Date(dateString).getTime());
    // ミリ秒が含まれている
    expect(timestamp % 1000).toBe(123);
  });
});

describe('timestampToDate', () => {
  it('ミリ秒タイムスタンプをISO日付文字列に変換する', () => {
    const timestamp = new Date('2024-01-01T00:00:00.000Z').getTime();
    const dateString = timestampToDate(timestamp);

    expect(dateString).toBe('2024-01-01T00:00:00.000Z');
  });

  it('異なるタイムスタンプを正しく変換する', () => {
    const timestamp1 = new Date('2024-06-15T12:30:45.678Z').getTime();
    const timestamp2 = new Date('2023-12-25T00:00:00.000Z').getTime();

    const dateString1 = timestampToDate(timestamp1);
    const dateString2 = timestampToDate(timestamp2);

    expect(dateString1).toBe('2024-06-15T12:30:45.678Z');
    expect(dateString2).toBe('2023-12-25T00:00:00.000Z');
  });

  it('エポック時刻(0)を変換する', () => {
    const dateString = timestampToDate(0);

    expect(dateString).toBe('1970-01-01T00:00:00.000Z');
  });

  it('dateToTimestampとの双方向変換が一致する', () => {
    const originalDateString = '2024-03-20T15:45:30.500Z';

    // dateString -> timestamp -> dateString
    const timestamp = dateToTimestamp(originalDateString);
    const resultDateString = timestampToDate(timestamp);

    expect(resultDateString).toBe(originalDateString);
  });

  it('ミリ秒を含むタイムスタンプを正確に変換する', () => {
    const timestamp = 1704067200123; // 2024-01-01T00:00:00.123Z
    const dateString = timestampToDate(timestamp);

    expect(dateString).toContain('.123Z');
  });
});

describe('parseDuration', () => {
  describe('数値入力', () => {
    it('数値をそのまま返す', () => {
      expect(parseDuration(1000)).toBe(1000);
      expect(parseDuration(500)).toBe(500);
      expect(parseDuration(0)).toBe(0);
    });

    it('小数を含む数値を返す', () => {
      expect(parseDuration(1234.56)).toBe(1234.56);
    });
  });

  describe('ミリ秒 (ms)', () => {
    it('ミリ秒形式の文字列を変換する', () => {
      expect(parseDuration('500ms')).toBe(500);
      expect(parseDuration('1000ms')).toBe(1000);
      expect(parseDuration('100ms')).toBe(100);
    });

    it('小数を含むミリ秒を変換する', () => {
      expect(parseDuration('1.5ms')).toBe(1.5);
      expect(parseDuration('0.5ms')).toBe(0.5);
    });
  });

  describe('秒 (s)', () => {
    it('秒形式の文字列をミリ秒に変換する', () => {
      expect(parseDuration('1s')).toBe(1000);
      expect(parseDuration('5s')).toBe(5000);
      expect(parseDuration('30s')).toBe(30000);
    });

    it('小数を含む秒を変換する', () => {
      expect(parseDuration('1.5s')).toBe(1500);
      expect(parseDuration('0.1s')).toBe(100);
    });
  });

  describe('分 (m)', () => {
    it('分形式の文字列をミリ秒に変換する', () => {
      expect(parseDuration('1m')).toBe(60 * 1000);
      expect(parseDuration('5m')).toBe(5 * 60 * 1000);
      expect(parseDuration('15m')).toBe(15 * 60 * 1000);
    });

    it('小数を含む分を変換する', () => {
      expect(parseDuration('1.5m')).toBe(1.5 * 60 * 1000);
      expect(parseDuration('0.5m')).toBe(0.5 * 60 * 1000);
    });
  });

  describe('時間 (h)', () => {
    it('時間形式の文字列をミリ秒に変換する', () => {
      expect(parseDuration('1h')).toBe(60 * 60 * 1000);
      expect(parseDuration('2h')).toBe(2 * 60 * 60 * 1000);
      expect(parseDuration('24h')).toBe(24 * 60 * 60 * 1000);
    });

    it('小数を含む時間を変換する', () => {
      expect(parseDuration('1.5h')).toBe(1.5 * 60 * 60 * 1000);
      expect(parseDuration('0.5h')).toBe(0.5 * 60 * 60 * 1000);
    });
  });

  describe('日 (d)', () => {
    it('日形式の文字列をミリ秒に変換する', () => {
      expect(parseDuration('1d')).toBe(24 * 60 * 60 * 1000);
      expect(parseDuration('7d')).toBe(7 * 24 * 60 * 60 * 1000);
      expect(parseDuration('30d')).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it('小数を含む日を変換する', () => {
      expect(parseDuration('1.5d')).toBe(1.5 * 24 * 60 * 60 * 1000);
      expect(parseDuration('0.5d')).toBe(0.5 * 24 * 60 * 60 * 1000);
    });
  });

  describe('週 (w)', () => {
    it('週形式の文字列をミリ秒に変換する', () => {
      expect(parseDuration('1w')).toBe(7 * 24 * 60 * 60 * 1000);
      expect(parseDuration('2w')).toBe(2 * 7 * 24 * 60 * 60 * 1000);
      expect(parseDuration('4w')).toBe(4 * 7 * 24 * 60 * 60 * 1000);
    });

    it('小数を含む週を変換する', () => {
      expect(parseDuration('1.5w')).toBe(1.5 * 7 * 24 * 60 * 60 * 1000);
      expect(parseDuration('0.5w')).toBe(0.5 * 7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('Elasticsearchの実用例', () => {
    it('一般的な期間パターンを変換する', () => {
      // 30日
      expect(parseDuration('30d')).toBe(30 * 24 * 60 * 60 * 1000);

      // 2時間
      expect(parseDuration('2h')).toBe(2 * 60 * 60 * 1000);

      // 15分
      expect(parseDuration('15m')).toBe(15 * 60 * 1000);

      // 1週間
      expect(parseDuration('1w')).toBe(7 * 24 * 60 * 60 * 1000);

      // 500ミリ秒
      expect(parseDuration('500ms')).toBe(500);

      // 3秒
      expect(parseDuration('3s')).toBe(3000);
    });
  });

  describe('エッジケース', () => {
    it('パースできない文字列は数値として扱う', () => {
      // 単位なしの数値文字列
      expect(parseDuration('1234')).toBe(1234);

      // 不正なフォーマット
      expect(parseDuration('invalid')).toBe(0); // parseFloatがNaNを返し、||で0になる
      expect(parseDuration('10x')).toBe(10); // parseFloatが10を返す
    });

    it('0を含む期間を処理する', () => {
      expect(parseDuration('0ms')).toBe(0);
      expect(parseDuration('0s')).toBe(0);
      expect(parseDuration('0d')).toBe(0);
    });

    it('空文字列を処理する', () => {
      expect(parseDuration('')).toBe(0);
    });

    it('大きな値を処理する', () => {
      // 365日
      expect(parseDuration('365d')).toBe(365 * 24 * 60 * 60 * 1000);

      // 1000時間
      expect(parseDuration('1000h')).toBe(1000 * 60 * 60 * 1000);
    });
  });

  describe('単位の正規表現マッチング', () => {
    it('正しい形式のみマッチする', () => {
      // 正しい形式
      expect(parseDuration('10ms')).toBe(10);
      expect(parseDuration('10.5s')).toBe(10500);

      // 数値のみ（単位なし）は数値として解釈
      const result = parseDuration('12345');
      expect(result).toBe(12345);
    });

    it('大文字小文字を区別する (小文字のみ有効)', () => {
      // 小文字は有効
      expect(parseDuration('5d')).toBe(5 * 24 * 60 * 60 * 1000);

      // 大文字は無効なフォーマットとして扱われ、数値として解釈を試みる
      // parseFloat('5D')は5を返す（数値部分のみをパース）
      expect(parseDuration('5D')).toBe(5);
    });
  });

  describe('型の安定性', () => {
    it('常に数値を返す', () => {
      expect(typeof parseDuration(100)).toBe('number');
      expect(typeof parseDuration('10s')).toBe('number');
      expect(typeof parseDuration('invalid')).toBe('number');
    });

    it('NaNを返さない', () => {
      expect(Number.isNaN(parseDuration(100))).toBe(false);
      expect(Number.isNaN(parseDuration('10s'))).toBe(false);
      expect(Number.isNaN(parseDuration('invalid'))).toBe(false);
    });

    it('Infinityを返さない', () => {
      expect(Number.isFinite(parseDuration(100))).toBe(true);
      expect(Number.isFinite(parseDuration('10s'))).toBe(true);
      expect(Number.isFinite(parseDuration('invalid'))).toBe(true);
    });
  });
});

describe('統合テスト: 日付ユーティリティの組み合わせ', () => {
  it('dateToTimestamp と timestampToDate の往復変換', () => {
    const dates = [
      '2024-01-01T00:00:00.000Z',
      '2023-12-31T23:59:59.999Z',
      '2024-06-15T12:30:45.123Z',
    ];

    dates.forEach((originalDate) => {
      const timestamp = dateToTimestamp(originalDate);
      const resultDate = timestampToDate(timestamp);

      expect(resultDate).toBe(originalDate);
    });
  });

  it('parseDuration で日付範囲を計算する', () => {
    const baseDate = '2024-01-01T00:00:00.000Z';
    const baseTimestamp = dateToTimestamp(baseDate);

    // 30日後
    const thirtyDaysLater = baseTimestamp + parseDuration('30d');
    const resultDate = timestampToDate(thirtyDaysLater);

    expect(resultDate).toBe('2024-01-31T00:00:00.000Z');
  });

  it('decay関数のscaleとoffsetをparseDurationで処理する', () => {
    const origin = dateToTimestamp('2024-01-15T00:00:00.000Z');
    const scale = parseDuration('10d');
    const offset = parseDuration('2d');

    // origin + offset + scale
    const targetTimestamp = origin + offset + scale;
    const targetDate = timestampToDate(targetTimestamp);

    // 2024-01-15 + 2日 + 10日 = 2024-01-27
    expect(targetDate).toBe('2024-01-27T00:00:00.000Z');
  });
});
