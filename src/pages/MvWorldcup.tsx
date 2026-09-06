import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { MVS, type MV } from '../data/mv';
import { shuffle } from '../utils';
import { MoreGames } from '../components/MoreGames';
import { ShareButton } from '../components/ShareButton';

function roundName(n: number): string {
  if (n === 2) return '결승';
  if (n === 4) return '4강';
  if (n === 8) return '8강';
  if (n === 16) return '16강';
  if (n === 32) return '32강';
  if (n === 64) return '64강';
  return `${n}강`;
}
function roundOptions(total: number): number[] {
  const opts = [64, 32, 16, 8].filter((n) => n <= total);
  return opts.length ? opts : [total >= 4 ? 4 : 2];
}

function Embed({ mv }: { mv: MV }) {
  return (
    <div className="mv-embed">
      <iframe
        src={`https://www.youtube.com/embed/${mv.videoId}`}
        title={`${mv.artist} - ${mv.title}`}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default function MvWorldcup() {
  const [size, setSize] = useState<number | null>(null);
  const [pool, setPool] = useState<MV[]>([]);
  const [next, setNext] = useState<MV[]>([]);
  const [i, setI] = useState(0);
  const [winner, setWinner] = useState<MV | null>(null);

  function start(n: number) {
    setPool(shuffle(MVS).slice(0, n)); setNext([]); setI(0); setWinner(null); setSize(n);
  }
  function choose(picked: MV) {
    const nx = [...next, picked];
    if (i + 2 >= pool.length) {
      if (nx.length === 1) { setWinner(nx[0]); return; }
      setPool(nx); setNext([]); setI(0);
    } else { setNext(nx); setI(i + 2); }
  }
  function reset() { setSize(null); setWinner(null); }

  const total = pool.length;
  const a = pool[i];
  const b = pool[i + 1];

  return (
    <div className="wrap">
      <Head>
        <title>MV 월드컵 🎬 - 최고의 K-POP 뮤직비디오 뽑기 | KPOP 놀이터</title>
        <meta name="description" content="유튜브 공식 뮤직비디오로 즐기는 K-POP MV 월드컵! 최신곡부터 명곡까지, 최대 64강 토너먼트로 인생 뮤비를 가려보세요." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/mv-worldcup" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      {size === null ? (
        <>
          <div className="page-head">
            <div className="page-title">🎬 MV 월드컵</div>
            <div className="page-sub">몇 강으로 할까? (총 {MVS.length}개 MV)</div>
          </div>
          <div className="gen-toggles" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {roundOptions(MVS.length).map((n) => (
              <button key={n} className="gen-toggle" onClick={() => start(n)}>{roundName(n)}</button>
            ))}
          </div>
          <p className="seo-text" style={{ fontSize: 12, textAlign: 'center' }}>
            유튜브 공식 뮤직비디오 · 매번 랜덤 출전
          </p>
          <MoreGames exclude="/mv-worldcup" />
        </>
      ) : !winner ? (
        <>
          <div className="page-head">
            <div className="page-title">🎬 MV 월드컵 · {roundName(total)}</div>
            <div className="page-sub">더 좋은 뮤비를 골라줘! ({Math.floor(i / 2) + 1}/{total / 2})</div>
          </div>
          {a && b && (
            <div className="vs-wrap">
              <div>
                <Embed mv={a} />
                <button className="btn mv-pick" onClick={() => choose(a)}>{a.artist} - {a.title}</button>
              </div>
              <div className="vs-badge" style={{ position: 'static', margin: '4px auto', transform: 'none' }}>VS</div>
              <div>
                <Embed mv={b} />
                <button className="btn ghost mv-pick" onClick={() => choose(b)}>{b.artist} - {b.title}</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="result">
            <div className="result-emoji">👑</div>
            <div className="result-title">우승 MV</div>
            <div className="result-main">{winner.title}</div>
            <div className="result-sub">{winner.artist}</div>
          </div>
          <div style={{ marginTop: 16 }}><Embed mv={winner} /></div>
          <ShareButton text={`나의 인생 MV는 "${winner.artist} - ${winner.title}" 👑`} />
          <div className="share-row">
            <button className="btn ghost" onClick={reset}>다시 하기</button>
            <Link to="/fancam-worldcup" className="btn">직캠 월드컵 →</Link>
          </div>
          <MoreGames exclude="/mv-worldcup" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
