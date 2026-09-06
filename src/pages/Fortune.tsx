import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { IDOLS } from '../data/idols';
import { MoreGames } from '../components/MoreGames';
import { ShareButton } from '../components/ShareButton';

// 날짜 기반 시드 (같은 날 = 같은 결과, 재방문 유도)
function todaySeed(): number {
  const d = new Date();
  const s = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const COLORS = ['핑크', '퍼플', '블랙', '화이트', '레드', '블루', '민트', '옐로우', '라벤더', '실버'];
const LUCK = ['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆'];

function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[(seed + salt * 7919) % arr.length];
}

export default function Fortune() {
  const [opened, setOpened] = useState(false);
  const seed = todaySeed();
  const idol = pick(IDOLS, seed, 1);
  const color = pick(COLORS, seed, 2);
  const love = pick(LUCK, seed, 3);
  const music = pick(LUCK, seed, 4);
  const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <div className="wrap">
      <Head>
        <title>오늘의 K-POP 운세 🔮 - 오늘의 운명 아이돌은? | KPOP 놀이터</title>
        <meta name="description" content="오늘의 운명 아이돌과 덕질운, 행운의 색을 확인하세요! 매일 바뀌는 K-POP 운세. 회원가입 없이 무료." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/fortune" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      <div className="page-head">
        <div className="page-title">🔮 오늘의 K-POP 운세</div>
        <div className="page-sub">{dateStr}</div>
      </div>

      {!opened ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 70 }}>🔮</div>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => setOpened(true)}>
            오늘의 운세 보기
          </button>
        </div>
      ) : (
        <>
          <div className="result">
            <div className="result-emoji">✨</div>
            <div className="result-title">오늘의 운명 아이돌</div>
            <div className="result-main">{idol.name}</div>
            <div className="result-sub">{idol.group}</div>
          </div>
          <div className="card">
            <div className="fortune-row"><span>❤️ 덕질운</span><b>{love}</b></div>
            <div className="fortune-row"><span>🎧 음악운</span><b>{music}</b></div>
            <div className="fortune-row"><span>🍀 행운의 색</span><b>{color}</b></div>
          </div>
          <ShareButton text={`오늘 나의 운명 아이돌은 "${idol.name}" (${idol.group}) ✨ 행운의 색: ${color}`} />
          <MoreGames exclude="/fortune" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
