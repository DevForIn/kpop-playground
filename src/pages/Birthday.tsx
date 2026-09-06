import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { BIRTHDAYS } from '../data/idols';
import { MoreGames } from '../components/MoreGames';

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function Birthday() {
  const now = new Date();
  const mmdd = `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dateStr = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  const today = BIRTHDAYS.filter((b) => b.mmdd === mmdd)
    .sort((a, b) => a.birthDate.localeCompare(b.birthDate));

  // 나이 계산
  function age(birth: string) {
    return now.getFullYear() - Number(birth.slice(0, 4));
  }

  return (
    <div className="wrap">
      <Head>
        <title>{`오늘 생일인 K-POP 아이돌 🎂 (${dateStr}) | KPOP 놀이터`}</title>
        <meta name="description" content={`${dateStr} 오늘 생일을 맞은 K-POP 아이돌을 확인하세요! 생일, 소속 그룹 정보 제공. 매일 업데이트.`} />
        <link rel="canonical" href="https://kpop-playground.vercel.app/birthday" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      <div className="page-head">
        <div className="page-title">🎂 오늘 생일인 아이돌</div>
        <div className="page-sub">{dateStr}</div>
      </div>

      {today.length > 0 ? (
        <div className="game-list">
          {today.map((b, i) => (
            <div key={i} className="game-card" style={{ cursor: 'default' }}>
              <div className="game-title">🎂 {b.name}</div>
              <div className="game-desc">{b.group} · {b.birthDate} (만 {age(b.birthDate)}세)</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 50 }}>🎈</div>
          <p>오늘 생일인 아이돌 정보가 아직 없어요.<br />내일 다시 확인해보세요!</p>
        </div>
      )}

      <p className="seo-text" style={{ fontSize: 12, textAlign: 'center' }}>
        생일 데이터: MusicBrainz 등 공개 정보 기반 · 총 {BIRTHDAYS.length}명
      </p>

      <MoreGames />
      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
