/**
 * min ~ maxの範囲にあるvalを -1.0 ~ 1.0に正規化する
 * @param {number} val 正規化する値
 * @param {object} range 範囲
 * @property {number} min 最小値
 * @property {number} max 最大値
 */
export const normalize = (val, {min, max}) => {
  const ratio = val / (max - min);
  return ratio * 2.0 - 1.0;
}