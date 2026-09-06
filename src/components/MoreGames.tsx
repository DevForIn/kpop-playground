import { Link } from 'react-router-dom';

const GAMES = [
  { path: '/quiz', emoji: '🎤', title: '초성퀴즈' },
  { path: '/worldcup', emoji: '💗', title: '이상형 월드컵' },
  { path: '/balance', emoji: '⚖️', title: '밸런스게임' },
  { path: '/mv-worldcup', emoji: '🎬', title: 'MV 월드컵' },
  { path: '/fancam-worldcup', emoji: '📹', title: '직캠 월드컵' },
];

export function MoreGames({ exclude }: { exclude?: string }) {
  const list = GAMES.filter((g) => g.path !== exclude);
  return (
    <div className="more-games">
      <div className="more-title">🔥 이것도 해봐</div>
      <div className="game-list">
        {list.map((g) => (
          <Link key={g.path} to={g.path} className="game-card">
            <span className="game-emoji">{g.emoji}</span>
            <div className="game-title">{g.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
