import { useState } from 'react';

// 결과 공유 버튼 — Web Share API(모바일) 또는 링크 복사(PC)
export function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://kpop-playground.vercel.app';
    const shareText = `${text}\n\n🎧 KPOP 놀이터에서 너도 해봐!`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'KPOP 놀이터', text: shareText, url });
        return;
      } catch { /* 취소 시 무시 */ }
    }
    // 폴백: 클립보드 복사
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  }

  return (
    <button className="btn" onClick={share}>
      {copied ? '✅ 링크 복사됨!' : '🔗 결과 공유하기'}
    </button>
  );
}
