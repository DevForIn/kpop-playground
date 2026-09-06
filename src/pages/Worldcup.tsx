import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { IDOLS, type Idol } from '../data/idols';
import { shuffle } from '../utils';
import { MoreGames } from '../components/MoreGames';
import { ShareButton } from '../components/ShareButton';

type Mode = 'select' | 'play' | 'done';

// 라운드 이름
function roundName(n: number): string {
  if (n === 2) return '결승';
  if (n === 4) return '4강';
  if (n === 8) return '8강';
  if (n === 16) return '16강';
  return `${n}강`;
}

export default function Worldcup() {
  const [mode, setMode] = useState<Mode>('select');
  const [selGender, setSelGender] = useState<'F' | 'M' | null>(null);
  const [selGens, setSelGens] = useState<number[]>([]);  // 다중 선택된 세대
  const [pool, setPool] = useState<Idol[]>([]);   // 현재 라운드 후보
  const [next, setNext] = useState<Idol[]>([]);   // 다음 라운드 진출자
  const [i, setI] = useState(0);                  // 현재 매치 인덱스 (2명씩)
  const [winner, setWinner] = useState<Idol | null>(null);

  function start(gender: 'F' | 'M', gens: number[]) {
    let cand = IDOLS.filter((x) => x.gender === gender);
    if (gens.length > 0) cand = cand.filter((x) => gens.includes(x.gen));
    cand = shuffle(cand);
    const size = cand.length >= 16 ? 16 : cand.length >= 8 ? 8 : cand.length;
    setPool(cand.slice(0, size)); setNext([]); setI(0); setWinner(null); setMode('play');
  }

  function toggleGen(g: number) {
    setSelGens((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  // 선택된 세대 후보 수 (16강 가능 여부 표시용)
  const availCount = selGender
    ? IDOLS.filter((x) => x.gender === selGender && (selGens.length === 0 || selGens.includes(x.gen))).length
    : 0;

  function choose(picked: Idol) {
    const nx = [...next, picked];
    if (i + 2 >= pool.length) {
      // 라운드 종료
      if (nx.length === 1) { setWinner(nx[0]); setMode('done'); return; }
      setPool(nx); setNext([]); setI(0);
    } else {
      setNext(nx); setI(i + 2);
    }
  }

  const total = pool.length;
  const a = pool[i];
  const b = pool[i + 1];

  return (
    <div className="wrap">
      <Head>
        <title>아이돌 이상형 월드컵 💗 - 내 최애는 누구? | KPOP 놀이터</title>
        <meta name="description" content="여자·남자 아이돌 이상형 월드컵! 16강 토너먼트로 내 최애를 뽑아보세요. 회원가입 없이 무료로 즐기고 친구에게 공유하세요." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/worldcup" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      {mode === 'select' && (
        <>
          <div className="page-head">
            <div className="page-title">💗 아이돌 이상형 월드컵</div>
            <div className="page-sub">
              {selGender ? '세대를 골라줘!' : '누구로 할까?'}
            </div>
          </div>

          {!selGender ? (
            <div className="game-list" style={{ marginTop: 20 }}>
              <button className="btn" onClick={() => setSelGender('F')}>👩 여자 아이돌</button>
              <button className="btn ghost" onClick={() => setSelGender('M')}>👨 남자 아이돌</button>
            </div>
          ) : (
            <>
              <div className="page-sub" style={{ marginTop: 4, fontSize: 13 }}>
                세대를 골라줘 (여러 개 선택 가능, 안 고르면 전체)
              </div>
              <div className="gen-toggles">
                {[3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    className={`gen-toggle ${selGens.includes(g) ? 'on' : ''}`}
                    onClick={() => toggleGen(g)}
                  >
                    {g}세대
                  </button>
                ))}
              </div>
              <div className="avail-info">
                {selGens.length === 0 ? '전체 세대' : `${selGens.sort().join('·')}세대`} · 후보 {availCount}명
              </div>
              <button className="btn" style={{ marginTop: 8 }} onClick={() => start(selGender, selGens)}>
                🏆 월드컵 시작
              </button>
              <button className="back-link" onClick={() => { setSelGender(null); setSelGens([]); }}>← 성별 다시 선택</button>
            </>
          )}

          <p className="seo-text" style={{ fontSize: 12, textAlign: 'center' }}>
            데이터: 3~6세대 아이돌 · MusicBrainz 교차검증 · ⓘ 표시는 미검증(신인 등)
          </p>
          <MoreGames exclude="/worldcup" />
        </>
      )}

      {mode === 'play' && a && b && (
        <>
          <div className="page-head">
            <div className="page-title">{roundName(total)}</div>
            <div className="page-sub">{Math.floor(i / 2) + 1} / {total / 2} 경기</div>
          </div>
          <div className="vs-wrap">
            <div className="vs-card" style={{ borderColor: a.color }} onClick={() => choose(a)}>
              <div className="vc-emoji">💗</div>
              <div className="vc-text">{a.name}</div>
              <div className="vc-sub">{a.group}{!a.verified && ' ·ⓘ'}</div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="vs-card" style={{ borderColor: b.color }} onClick={() => choose(b)}>
              <div className="vc-emoji">💗</div>
              <div className="vc-text">{b.name}</div>
              <div className="vc-sub">{b.group}{!b.verified && ' ·ⓘ'}</div>
            </div>
          </div>
          <p className="verify-note">
            {(!a.verified || !b.verified)
              ? 'ⓘ MusicBrainz 미검증 (신인 등) · 정보가 부정확할 수 있어요'
              : 'MusicBrainz 교차검증 데이터'}
          </p>
        </>
      )}

      {mode === 'done' && winner && (
        <>
          <div className="result">
            <div className="result-emoji">👑</div>
            <div className="result-title">당신의 최애는</div>
            <div className="result-main">{winner.name}</div>
            <div className="result-sub">{winner.group} · 역시 취향 확실하네 😎</div>
          </div>
          <ShareButton text={`나의 아이돌 이상형 월드컵 우승자는 "${winner.name}" (${winner.group}) 👑`} />
          <div className="share-row">
            <button className="btn ghost" onClick={() => { setSelGender(null); setSelGens([]); setMode('select'); }}>다시 하기</button>
            <Link to="/mv-worldcup" className="btn">다른 게임 →</Link>
          </div>
          <MoreGames exclude="/worldcup" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
