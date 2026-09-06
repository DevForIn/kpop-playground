import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { GROUP_QUIZZES } from '../data/idols';
import { pickN } from '../utils';
import { MoreGames } from '../components/MoreGames';
import { ShareButton } from '../components/ShareButton';

interface QItem {
  chosung: string;
  answer: string;
  accept: string[];
}

function norm(s: string) { return s.replace(/\s+/g, '').toLowerCase(); }

function buildQuiz(): QItem[] {
  return pickN(GROUP_QUIZZES, 10);
}

const GRADES = [
  { min: 10, emoji: '👑', title: '찐덕후', sub: '당신은 K-POP 마스터! 회사 차려도 됨' },
  { min: 8, emoji: '🔥', title: '고인물', sub: '웬만한 건 다 아는 진성 팬' },
  { min: 6, emoji: '💗', title: '일반 팬', sub: '적당히 즐기는 건강한 덕질' },
  { min: 3, emoji: '🌱', title: '입문자', sub: '이제 막 입덕한 새싹' },
  { min: 0, emoji: '🐣', title: '뉴비', sub: '아직 갈 길이 멀어요 ㅋㅋ' },
];

export default function Quiz() {
  const [quiz, setQuiz] = useState<QItem[]>(() => buildQuiz());
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [done, setDone] = useState(false);

  const grade = useMemo(() => GRADES.find((g) => score >= g.min)!, [score, done]);

  function submit() {
    if (feedback) return;
    const q = quiz[idx];
    const ok = q.accept.some((ans) => norm(ans) === norm(input));
    if (ok) { setScore((s) => s + 1); setFeedback('correct'); }
    else setFeedback('wrong');
    setTimeout(nextQ, ok ? 700 : 1300);
  }

  function pass() {
    if (feedback) return;
    setFeedback('wrong');
    setTimeout(nextQ, 1300);
  }

  function nextQ() {
    if (idx + 1 >= quiz.length) setDone(true);
    else { setIdx((i) => i + 1); setInput(''); setFeedback(null); }
  }

  function restart() {
    setQuiz(buildQuiz()); setIdx(0); setScore(0); setInput(''); setFeedback(null); setDone(false);
  }

  const q = quiz[idx];

  return (
    <div className="wrap">
      <Head>
        <title>K-POP 초성퀴즈 🎤 - 아이돌 그룹 이름 맞히기 | KPOP 놀이터</title>
        <meta name="description" content="초성만 보고 K-POP 아이돌 그룹 이름 직접 입력해서 맞히기! 10문제로 알아보는 내 덕력 등급. 회원가입 없이 무료로 즐기고 친구에게 공유하세요." />
        <link rel="canonical" href="https://kpop-playground.vercel.app/quiz" />
      </Head>

      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>

      {!done ? (
        <>
          <div className="page-head">
            <div className="page-title">🎤 K-POP 초성퀴즈</div>
            <div className="page-sub">초성 보고 그룹 이름을 직접 입력!</div>
          </div>
          <div className="q-count">{idx + 1} / {quiz.length}</div>
          <div className="progress"><div style={{ width: `${(idx / quiz.length) * 100}%` }} /></div>

          <div className="quiz-q">{q.chosung}</div>

          <input
            className="quiz-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="그룹 이름 입력"
            disabled={!!feedback}
            autoFocus
          />

          {feedback === 'correct' && <div className="fb correct">정답! 🎉</div>}
          {feedback === 'wrong' && <div className="fb wrong">정답은 <b>{q.answer}</b></div>}

          {!feedback && (
            <div className="share-row">
              <button className="btn ghost" onClick={pass}>모르겠어요</button>
              <button className="btn" onClick={submit}>제출</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="result">
            <div className="result-emoji">{grade.emoji}</div>
            <div className="result-score">{score} / {quiz.length}</div>
            <div className="result-title">🏆 당신의 K-POP 덕력</div>
            <div className="result-main">{grade.title}</div>
            <div className="result-sub">{grade.sub}</div>
          </div>
          <ShareButton text={`나의 K-POP 덕력은 "${grade.title}" ${grade.emoji} (${score}/${quiz.length})`} />
          <div className="share-row">
            <button className="btn ghost" onClick={restart}>다시 풀기</button>
            <Link to="/worldcup" className="btn">다른 게임 →</Link>
          </div>
          <MoreGames exclude="/quiz" />
        </>
      )}

      <footer><Link to="/">🎧 KPOP 놀이터 더 놀러가기</Link></footer>
    </div>
  );
}
