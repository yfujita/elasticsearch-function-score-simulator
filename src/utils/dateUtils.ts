import { parseISO, getTime } from 'date-fns';

/**
 * 日付文字列（ISO形式）をミリ秒タイムスタンプに変換する
 *
 * @param dateString - ISO形式の日付文字列
 * @returns ミリ秒タイムスタンプ
 */
export function dateToTimestamp(dateString: string): number {
  return getTime(parseISO(dateString));
}

/**
 * ミリ秒タイムスタンプを日付文字列（ISO形式）に変換する
 *
 * @param timestamp - ミリ秒タイムスタンプ
 * @returns ISO形式の日付文字列
 */
export function timestampToDate(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Elasticsearch の期間文字列（例: "30d", "1h", "5m"）をミリ秒に変換する
 *
 * @param duration - 期間文字列（例: "30d", "2h", "15m"）
 * @returns ミリ秒
 */
export function parseDuration(duration: string | number): number {
  // 数値の場合はそのまま返す
  if (typeof duration === 'number') {
    return duration;
  }

  // 文字列の場合は単位を解析
  const match = duration.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d|w)$/);
  if (!match) {
    // パースできない場合は数値として扱う
    return parseFloat(duration) || 0;
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  // 単位に応じてミリ秒に変換
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
}
