import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { FANCAMS, type Fancam } from '../data/fancam';
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

function Embed({ f }: { f: Fancam }) {
  return (
    <div className="mv-embed">
      <iframe
        src={`https://www.youtube.com/embed/${f.videoId}`}
        title={`${f.member} ${f.group} 직캠`}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// 가능한 라운드 옵션 (데이터 수 이하의 2의 거듭제곱)
function roundOptions(total: number): number[] {
  const opts = [64, 32, 16, 8].filter((n) => n <= total);
  return opts.length ? opts : [total >= 4 ? 4 : 2];
}

export default function Fancam() {
  const [size, setSize] = useState<number | null>(null);
  const [pool, setPool] = useState<Fancam[]>([]);
  const [next, setNext] = useState<Fancam[]>([]);
  const [i, setI] = useState(0);
  const [winner, setWinner] = useState<Fancam | null>(null);

  function start(n: number) {
    setPool(shuffle(FANCAMS).slice(0, n)); setNext([]); setI(0); setWinner(null); setSize(n);
  }
  function choose(picked: Fancam) {
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
        <title>아이돌 직캠 월드컵 🎬 - 최고의 직캠을 뽑아라 | KPOP 놀이터</title>
        <meta name="description" content="유튜브 공식 무대 직캠으로 즐기는 아이돌 직캠 월드컵! 최애의 직캠을 골라 최고의 직캠을 가려보세요. 회원가입 없이 무료." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/fancam-worldcup" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      {size === null ? (
        <>
          <div className="page-head">
            <div className="page-title">🎬 직캠 월드컵</div>
            <div className="page-sub">몇 강으로 할까? (총 {FANCAMS.length}개 직캠)</div>
          </div>
          <div className="gen-toggles" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {roundOptions(FANCAMS.length).map((n) => (
              <button key={n} className="gen-toggle" onClick={() => start(n)}>{roundName(n)}</button>
            ))}
          </div>
          <p className="seo-text" style={{ fontSize: 12, textAlign: 'center' }}>
            유튜브 공식 무대 직캠 · 매번 랜덤 출전
          </p>
          <MoreGames exclude="/fancam-worldcup" />
        </>
      ) : !winner ? (
        <>
          <div className="page-head">
            <div className="page-title">🎬 직캠 월드컵 · {roundName(total)}</div>
            <div className="page-sub">더 좋은 직캠을 골라줘! ({Math.floor(i / 2) + 1}/{total / 2})</div>
          </div>
          {a && b && (
            <div className="vs-wrap">
              <div>
                <Embed f={a} />
                <button className="btn mv-pick" onClick={() => choose(a)}>{a.member} · {a.group}</button>
              </div>
              <div className="vs-badge" style={{ position: 'static', margin: '4px auto', transform: 'none' }}>VS</div>
              <div>
                <Embed f={b} />
                <button className="btn ghost mv-pick" onClick={() => choose(b)}>{b.member} · {b.group}</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="result">
            <div className="result-emoji">👑</div>
            <div className="result-title">우승 직캠</div>
            <div className="result-main">{winner.member}</div>
            <div className="result-sub">{winner.group}</div>
          </div>
          <div style={{ marginTop: 16 }}><Embed f={winner} /></div>
          <ShareButton text={`나의 최고 직캠은 "${winner.member} (${winner.group})" 👑`} />
          <div className="share-row">
            <button className="btn ghost" onClick={reset}>다시 하기</button>
            <Link to="/mv-worldcup" className="btn">MV 월드컵 →</Link>
          </div>
          <MoreGames exclude="/fancam-worldcup" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
