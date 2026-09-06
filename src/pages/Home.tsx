import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export default function Home() {
  return (
    <div className="wrap">
      <Head>
        <title>KPOP 놀이터 🎧 - 초성퀴즈·이상형월드컵·밸런스게임</title>
        <meta name="description" content="K-POP 좋아하면 여기서 놀자! 초성퀴즈, 아이돌 이상형 월드컵, 밸런스게임, MV 월드컵까지. 회원가입 없이 바로 즐기고 친구에게 공유하세요." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/" />
      </Head>

      <header className="hero">
        <div className="logo">🎧 KPOP 놀이터</div>
        <div className="tagline">오늘 뭐 하고 놀래? 😎</div>
      </header>

      <div className="game-list">
        <Link to="/quiz" className="game-card feature">
          <span className="game-emoji">🎤</span>
          <div className="game-title">K-POP 초성퀴즈</div>
          <div className="game-desc">내가 K-POP을 얼마나 잘 알까? 덕력 테스트!</div>
        </Link>
        <Link to="/worldcup" className="game-card">
          <span className="game-emoji">💗</span>
          <div className="game-title">아이돌 이상형 월드컵</div>
          <div className="game-desc">내 최애는 누구? 32강 토너먼트</div>
        </Link>
        <Link to="/balance" className="game-card">
          <span className="game-emoji">⚖️</span>
          <div className="game-title">K-POP 밸런스게임</div>
          <div className="game-desc">너라면 뭐 고를래? 극한의 선택</div>
        </Link>
        <Link to="/mv-worldcup" className="game-card">
          <span className="game-emoji">🎬</span>
          <div className="game-title">MV 월드컵</div>
          <div className="game-desc">최고의 뮤비를 뽑아라! (유튜브 영상)</div>
        </Link>
        <Link to="/fancam-worldcup" className="game-card">
          <span className="game-emoji">📹</span>
          <div className="game-title">직캠 월드컵</div>
          <div className="game-desc">최애의 직캠으로 최고의 무대 뽑기</div>
        </Link>
        <Link to="/fortune" className="game-card">
          <span className="game-emoji">🔮</span>
          <div className="game-title">오늘의 K-POP 운세</div>
          <div className="game-desc">오늘의 운명 아이돌은? 매일 바뀜</div>
        </Link>
        <Link to="/birthday" className="game-card">
          <span className="game-emoji">🎂</span>
          <div className="game-title">오늘 생일인 아이돌</div>
          <div className="game-desc">오늘 생일 맞은 아이돌 확인</div>
        </Link>
      </div>

      <section className="seo-text">
        <h2>KPOP 놀이터란?</h2>
        <p>
          KPOP 놀이터는 회원가입 없이 바로 즐기는 K-POP 게임 모음입니다. 아이돌 초성퀴즈로 덕력을 시험하고,
          이상형 월드컵으로 최애를 뽑고, 밸런스게임으로 친구와 취향을 겨뤄보세요. MV 월드컵에서는
          유튜브 공식 뮤직비디오를 보며 최고의 MV를 가릴 수 있습니다. 모든 게임은 무료이며, 결과를 친구에게 공유할 수 있어요.
        </p>
      </section>

      <footer>
        © 2026 KPOP 놀이터 · 재미로 즐기는 K-POP 게임 · by DevForIn
      </footer>
    </div>
  );
}
