// K-POP 아이돌 데이터 — 제미나이 수집 + MusicBrainz 교차검증
// kpop-verified.json: 128그룹(3~6세대). mbFound=그룹 MB존재확인, mbVerified=멤버 MB명단매칭
// 이름/그룹/생일/초성 등 사실 정보만 (저작권 없음, 사진 없음)
import raw from './kpop-verified.json';

export interface VMember {
  name: string;
  birthDate: string | null;
  initial: string;
  mbVerified: boolean;   // MusicBrainz 멤버 명단에서 확인됨
  mbNote: string | null;
}
export interface VGroup {
  nameKo: string;
  name: string;          // 영문/원문
  gender: 'male' | 'female' | 'mixed';
  generation: number;
  debutDate: string | null;
  agency: string | null;
  mbFound: boolean;      // MusicBrainz에 그룹 존재 확인
  members: VMember[];
}

const DB = raw as unknown as { groups: VGroup[]; snapshotDate: string; stats: Record<string, number> };

export const GROUPS: VGroup[] = DB.groups;
export const SNAPSHOT = DB.snapshotDate;

const PALETTE = ['#ff5db1', '#9b5cff', '#22d3ee', '#ffd166', '#06d6a0', '#f78c6b', '#c77dff', '#4ea8de'];

// ── 이상형 월드컵용: 멤버 플랫 리스트 ──
export interface Idol {
  id: string;
  name: string;
  group: string;
  gender: 'M' | 'F';
  gen: number;
  color: string;
  verified: boolean;     // 그룹 MB확인 && 멤버 MB매칭
}

export const IDOLS: Idol[] = DB.groups
  .filter((g) => g.gender !== 'mixed')
  .flatMap((g, gi) =>
    g.members.map((m, mi) => ({
      id: `${g.nameKo}-${m.name}`,
      name: m.name,
      group: g.nameKo,
      gender: g.gender === 'female' ? 'F' as const : 'M' as const,
      gen: g.generation,
      color: PALETTE[(gi + mi) % PALETTE.length],
      verified: g.mbFound && m.mbVerified,
    })),
  );

// ── 초성퀴즈용: 그룹 초성 문제 ──
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function toChosung(str: string): string {
  let out = '';
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) out += CHO[Math.floor((code - 0xac00) / 588)];
    else if (ch === ' ') out += ' ';
  }
  return out;
}

export interface GroupQuiz {
  chosung: string;
  answer: string;
  accept: string[];
  gen: number;
  verified: boolean;
}

export const GROUP_QUIZZES: GroupQuiz[] = DB.groups
  .filter((g) => g.nameKo && /[가-힣]/.test(g.nameKo))
  .map((g) => ({
    chosung: toChosung(g.nameKo),
    answer: g.nameKo,
    accept: [...new Set([g.nameKo, g.name])].filter(Boolean),
    gen: g.generation,
    verified: g.mbFound,
  }))
  .filter((q) => q.chosung.replace(/\s/g, '').length >= 2);

// ── 생일 데이터 (V2 '오늘 생일 아이돌'용) ──
export interface BirthdayIdol {
  name: string; group: string; birthDate: string; mmdd: string; verified: boolean;
}
export const BIRTHDAYS: BirthdayIdol[] = DB.groups.flatMap((g) =>
  g.members
    .filter((m) => m.birthDate && m.birthDate.length === 10)
    .map((m) => ({
      name: m.name,
      group: g.nameKo,
      birthDate: m.birthDate as string,
      mmdd: (m.birthDate as string).slice(5),
      verified: g.mbFound && m.mbVerified,
    })),
);
