import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowIcon, SoundIcon } from './components/Icons';
import { useIdentity } from './hooks/useIdentity';
import { locale, t } from './i18n';
import { sounds } from './audio';
import type { Cue, Direction, Feedback, Phase, RunStats } from './types';

const RUN_MS = 20_000;
const EMPTY_STATS: RunStats = { score: 0, correct: 0, mistakes: 0, fooled: 0, streak: 0, bestMs: null };
const opposite = (direction: Direction): Direction => direction === 'left' ? 'right' : 'left';

function randomDirection(): Direction { return Math.random() < .5 ? 'left' : 'right'; }

export function FollowMyFace() {
  const identity = useIdentity();
  const [phase, setPhase] = useState<Phase>('cover');
  const [cue, setCue] = useState<Cue>(() => ({ face: 'right', sign: 'left', startedAt: 0, deadlineMs: 1350, index: 0 }));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [wasFooled, setWasFooled] = useState(false);
  const [stats, setStats] = useState<RunStats>(EMPTY_STATS);
  const [remainingMs, setRemainingMs] = useState(RUN_MS);
  const [muted, setMuted] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('follow_my_face_best') || 0));
  const phaseRef = useRef<Phase>('cover');
  const cueRef = useRef(cue);
  const statsRef = useRef(stats);
  const runStartedAt = useRef(0);
  const locked = useRef(false);
  const transitionTimer = useRef<number>();

  const commitPhase = (next: Phase) => { phaseRef.current = next; setPhase(next); };
  const commitStats = (next: RunStats) => { statsRef.current = next; setStats(next); };

  const finish = useCallback(() => {
    window.clearTimeout(transitionTimer.current);
    locked.current = true;
    const final = statsRef.current;
    if (final.score > bestScore) {
      localStorage.setItem('follow_my_face_best', String(final.score));
      setBestScore(final.score);
    }
    commitPhase('result');
    sounds.finish(final.correct >= 12);
  }, [bestScore]);

  const nextCue = useCallback((index: number) => {
    const elapsed = Math.max(0, performance.now() - runStartedAt.current);
    if (elapsed >= RUN_MS) { finish(); return; }
    const face = randomDirection();
    const conflictChance = index < 2 ? 0 : Math.min(.75, .45 + elapsed / RUN_MS * .30);
    const sign = Math.random() < conflictChance ? opposite(face) : face;
    const next: Cue = {
      face, sign, index,
      startedAt: performance.now(),
      deadlineMs: Math.max(620, 1350 - elapsed * .0365),
    };
    cueRef.current = next;
    setCue(next);
    setFeedback(null);
    setWasFooled(false);
    locked.current = false;
    commitPhase('playing');
    sounds.flip();
  }, [finish]);

  const begin = useCallback(() => {
    sounds.unlock(); sounds.start();
    window.clearTimeout(transitionTimer.current);
    const fresh = { ...EMPTY_STATS };
    commitStats(fresh);
    setRemainingMs(RUN_MS);
    runStartedAt.current = performance.now();
    nextCue(0);
  }, [nextCue]);

  const answer = useCallback((choice: Direction | null) => {
    if (phaseRef.current !== 'playing' || locked.current) return;
    locked.current = true;
    const activeCue = cueRef.current;
    const responseMs = Math.round(performance.now() - activeCue.startedAt);
    const correct = choice === activeCue.face;
    const timedOut = choice === null;
    const prior = statsRef.current;
    let next: RunStats;
    if (correct) {
      const streak = prior.streak + 1;
      const reactionBonus = Math.max(0, Math.round(120 * (1 - responseMs / activeCue.deadlineMs)));
      next = { ...prior, correct: prior.correct + 1, streak, score: prior.score + 100 + reactionBonus + streak * 15, bestMs: prior.bestMs === null ? responseMs : Math.min(prior.bestMs, responseMs) };
      setFeedback('correct'); sounds.correct(streak);
    } else {
      const followedSign = !timedOut && activeCue.sign !== activeCue.face && choice === activeCue.sign;
      next = { ...prior, mistakes: prior.mistakes + 1, fooled: prior.fooled + (followedSign ? 1 : 0), streak: 0 };
      setWasFooled(followedSign);
      setFeedback(timedOut ? 'timeout' : 'wrong'); sounds.wrong();
    }
    commitStats(next);
    commitPhase('feedback');
    const shouldFinish = next.mistakes >= 3 || performance.now() - runStartedAt.current >= RUN_MS;
    transitionTimer.current = window.setTimeout(() => shouldFinish ? finish() : nextCue(activeCue.index + 1), correct ? 350 : 460);
  }, [finish, nextCue]);

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'feedback') return;
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const remaining = Math.max(0, RUN_MS - (now - runStartedAt.current));
      setRemainingMs(remaining);
      if (phaseRef.current === 'playing' && now - cueRef.current.startedAt >= cueRef.current.deadlineMs) answer(null);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, answer]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm') { setMuted(value => { sounds.setMuted(!value); return !value; }); return; }
      if (phaseRef.current === 'cover' || phaseRef.current === 'result') { if (event.key === 'Enter') begin(); return; }
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') answer('left');
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') answer('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, begin]);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  const directionWord = (direction: Direction) => t(direction);
  const stamp = feedback === 'correct' ? t('correct') : feedback === 'timeout' ? t('timeout') : wasFooled ? t('wrong') : t('wrongWay');
  const rank = stats.correct >= 12 ? t('rankHigh') : stats.correct >= 7 ? t('rankMid') : t('rankLow');

  return <main className={`fmf fmf--${phase} ${feedback ? `fmf--${feedback}` : ''}`} lang={locale === 'zh' ? 'zh-CN' : 'en'}>
    <header className="fmf-header">
      <div className="fmf-brand"><img src="./img/alteru.svg" alt="AlterU" draggable={false}/><span>{t('brand')}</span></div>
      <button className="fmf-sound" type="button" aria-label={t('mute')} onClick={() => setMuted(value => { sounds.setMuted(!value); return !value; })}><SoundIcon muted={muted}/></button>
    </header>

    {phase === 'cover' && <section className="fmf-cover">
      <span className="fmf-kicker">{t('kicker')}</span><h1>{t('title')}</h1><p>{t('rule')}</p>
      <div className="fmf-cover-demo">
        <div className="fmf-sign"><small>{identity.name}</small><strong>{directionWord('left')}</strong><ArrowIcon direction="left"/></div>
        <div className="fmf-avatar fmf-avatar--right"><i/><img src={identity.avatarUrl} alt={identity.name} draggable={false}/><ArrowIcon direction="right"/></div>
      </div>
      {identity.status === 'loading' && <span className="fmf-status">{t('loading')}</span>}
      {identity.status === 'error' && <span className="fmf-status">{t('identityError')}</span>}
      <button className="fmf-start" type="button" onPointerDown={begin}>{t('start')}<ArrowIcon direction="right"/></button>
    </section>}

    {(phase === 'playing' || phase === 'feedback') && <section className="fmf-game">
      <div className="fmf-hud"><div><span>{t('streak')}</span><strong>{stats.streak}</strong></div><div className="fmf-time"><i style={{ transform: `scaleX(${remainingMs / RUN_MS})` }}/><span>{(remainingMs / 1000).toFixed(1)}</span></div><div><span>{t('mistakes')}</span><strong>{stats.mistakes}/3</strong></div></div>
      <p className="fmf-instruction">{t('follow')}</p>
      <div className={`fmf-stage fmf-stage--${cue.face}`}>
        <div className="fmf-sign fmf-sign--cue" aria-label={t('says', { name: identity.name, direction: directionWord(cue.sign) })}><small>{identity.name}</small><strong>{directionWord(cue.sign)}</strong><ArrowIcon direction={cue.sign}/></div>
        <div className="fmf-doors" aria-hidden="true"><div className="fmf-door fmf-door--left"><ArrowIcon direction="left"/></div><div className="fmf-door fmf-door--right"><ArrowIcon direction="right"/></div></div>
        <div className={`fmf-avatar fmf-avatar--${cue.face}`}><i/><img src={identity.avatarUrl} alt={identity.name} draggable={false}/><ArrowIcon direction={cue.face}/></div>
        {feedback && <div className="fmf-stamp">{stamp}</div>}
      </div>
      <div className="fmf-controls">
        <button type="button" disabled={phase !== 'playing'} onPointerDown={() => answer('left')} aria-label={t('left')}><ArrowIcon direction="left"/><span>{t('left')}</span></button>
        <button type="button" disabled={phase !== 'playing'} onPointerDown={() => answer('right')} aria-label={t('right')}><span>{t('right')}</span><ArrowIcon direction="right"/></button>
      </div>
    </section>}

    {phase === 'result' && <section className="fmf-result">
      <span className="fmf-kicker">{t('showComplete')}</span><h1>{t('result')}</h1><div className="fmf-rank">{rank}</div>
      <div className="fmf-score"><strong>{stats.score.toLocaleString()}</strong><span>{t('score')}</span></div>
      <div className="fmf-tickets"><div>{t('correctCount', { n: stats.correct })}</div><div>{t('fooledCount', { n: stats.fooled })}</div><div>{stats.bestMs === null ? t('noBest') : t('best', { n: stats.bestMs })}</div></div>
      {bestScore > 0 && <p className="fmf-best">{t('bestShow')} · {Math.max(bestScore, stats.score).toLocaleString()}</p>}
      <button className="fmf-start" type="button" onPointerDown={begin}>{t('again')}<ArrowIcon direction="right"/></button>
    </section>}
  </main>;
}
