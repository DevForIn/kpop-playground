import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { BALANCE } from '../data/balance';
import { pickN } from '../utils';
import { MoreGames } from '../components/MoreGames';
import { ShareButton } from '../components/ShareButton';

const ROUNDS = 7;

const TYPES = [
  { min: 0, emoji: '💗', title: '찐사랑 덕후', sub: '덕질에 진심인 당신, 최애가 인생의 낙!' },
  { min: 3, emoji: '🎧', title: '음악 덕후', sub: '아이돌보다 노래! 음악 그 자체를 사랑하는 타입' },
  { min: 5, emoji: '✨', title: '균형잡힌 팬', sub: '현실과 덕질의 밸런스를 아는 어른 팬' },
];

export default function Balance() {
  const [qs] = useState(() => pickN(BALANCE, ROUNDS));
  const [idx, setIdx] = useState(0);
  const [aCount, setACount] = useState(0);
  const [done, setDone] = useState(false);

  function pick(side: 'a' | 'b') {
    if (side === 'a') setACount((c) => c + 1);
    if (idx + 1 >= qs.length) setDone(true);
    else setIdx((i) => i + 1);
  }

  function restart() { setIdx(0); setACount(0); setDone(false); }

  const type = TYPES.reduce((acc, t) => (aCount >= t.min ? t : acc), TYPES[0]);
  const q = qs[idx];

  return (
    <div className="wrap">
      <Head>
        <title>K-POP 밸런스게임 ⚖️ - 극한의 덕후 선택 | KPOP 놀이터</title>
        <meta name="description" content="최애 콘서트 VIP석 vs 최애와 하루 데이트? K-POP 팬이라면 고민되는 극한의 밸런스게임. 친구와 함께 즐기고 결과를 공유하세요." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/balance" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      {!done ? (
        <>
          <div className="page-head">
            <div className="page-title">⚖️ K-POP 밸런스게임</div>
            <div className="page-sub">하나만 선택해야 한다면?</div>
          </div>
          <div className="q-count">{idx + 1} / {qs.length}</div>
          <div className="progress"><div style={{ width: `${(idx / qs.length) * 100}%` }} /></div>

          <div className="vs-wrap">
            <div className="vs-card" onClick={() => pick('a')}>
              <div className="vc-emoji">{q.emoji?.[0]}</div>
              <div className="vc-text">{q.a}</div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="vs-card" onClick={() => pick('b')}>
              <div className="vc-emoji">{q.emoji?.[1]}</div>
              <div className="vc-text">{q.b}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="result">
            <div className="result-emoji">{type.emoji}</div>
            <div className="result-title">당신의 덕질 유형은</div>
            <div className="result-main">{type.title}</div>
            <div className="result-sub">{type.sub}</div>
          </div>
          <ShareButton text={`나의 K-POP 덕질 유형은 "${type.title}" ${type.emoji}`} />
          <div className="share-row">
            <button className="btn ghost" onClick={restart}>다시 하기</button>
            <Link to="/quiz" className="btn">다른 게임 →</Link>
          </div>
          <MoreGames exclude="/balance" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
