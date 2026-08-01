type Locale = 'zh' | 'en';
type Vars = Record<string, string | number>;

const saved = localStorage.getItem('game_locale');
export const locale: Locale = saved === 'zh' || saved === 'en'
  ? saved
  : navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

const copy = {
  zh: {
    brand: 'ALTERU 游戏秀', showComplete: '本场结束', bestShow: '最高分',
    kicker: '20 秒 · 方向干扰挑战', title: '跟着我的脸', rule: '跟头像走，别信文字。',
    start: '开始被骗', loading: '正在请你的脸上台…', left: '左', right: '右',
    says: '{name} 说 {direction}', follow: '头像往哪边？', streak: '连击', mistakes: '失误',
    correct: '没上当', wrong: '你信了牌子', wrongWay: '你走反了', timeout: '想太久了',
    result: '你的脑子下班了吗？', score: '分', correctCount: '识破 {n} 次',
    fooledCount: '被牌子骗 {n} 次', best: '最快 {n} ms', noBest: '还没抓到一次',
    rankHigh: '完全骗不到', rankMid: '差点免疫', rankLow: '牌子赢了', again: '再骗我一次',
    mute: '声音', identityError: '身份没赶上，但游戏照常开场',
  },
  en: {
    brand: 'ALTERU GAME SHOW', showComplete: 'SHOW COMPLETE', bestShow: 'BEST SHOW',
    kicker: '20 SEC · DIRECTION CONFLICT', title: 'FOLLOW MY FACE', rule: 'Follow the face. Ignore the words.',
    start: 'TRY TO FOOL ME', loading: 'PUTTING YOUR FACE ON STAGE…', left: 'LEFT', right: 'RIGHT',
    says: '{name} SAYS {direction}', follow: 'WHICH WAY IS THE FACE GOING?', streak: 'STREAK', mistakes: 'MISSES',
    correct: 'NICE READ', wrong: 'YOU FOLLOWED THE SIGN', wrongWay: 'WRONG WAY', timeout: 'TOO SLOW',
    result: 'DID YOUR BRAIN CLOCK OUT?', score: 'PTS', correctCount: '{n} SIGNS BEATEN',
    fooledCount: 'FOOLED {n} TIMES', best: 'BEST {n} ms', noBest: 'NO CLEAN READ YET',
    rankHigh: 'UNFOOLABLE', rankMid: 'ALMOST IMMUNE', rankLow: 'THE SIGN GOT YOU', again: 'FOOL ME AGAIN',
    mute: 'Sound', identityError: 'Your profile missed rehearsal. The show goes on.',
  },
} as const;

export type Key = keyof typeof copy.en;
export function t(key: Key, vars: Vars = {}): string {
  let value: string = copy[locale][key];
  for (const [name, replacement] of Object.entries(vars)) {
    value = value.split(`{${name}}`).join(String(replacement));
  }
  return value;
}
