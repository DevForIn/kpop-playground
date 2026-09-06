#!/usr/bin/env python3
# YouTube Data API로 아이돌 직캠(fancam) 수집 → src/data/fancam.ts
# 공식 무대 직캠 채널 우선. 사용: YT_KEY=... python3 scripts/collect_fancam.py
import urllib.request, urllib.parse, json, os, sys, time

KEY=os.environ.get('YT_KEY','')
if not KEY: print("YT_KEY 필요",file=sys.stderr); sys.exit(1)

# 공식 직캠/무대 채널 힌트
OFFICIAL=['M2','Mnet','MPD','스브스케이팝','SBS KPOP','MBCkpop','KBS Kpop','1theK',
    'STARSHIP','SMTOWN','HYBE','JYP','it\'s Live','문화방송','SM ','YG']

# (멤버, 그룹, 검색쿼리)  — 인기 멤버 위주로 세로직캠
MEMBERS=[
    ("카리나","aespa"),("윈터","aespa"),("닝닝","aespa"),("지젤","aespa"),
    ("장원영","IVE"),("안유진","IVE"),("리즈","IVE"),("가을","IVE"),("레이","IVE"),
    ("민지","NewJeans"),("하니","NewJeans"),("해린","NewJeans"),("혜인","NewJeans"),("다니엘","NewJeans"),
    ("사쿠라","LE SSERAFIM"),("카즈하","LE SSERAFIM"),("김채원","LE SSERAFIM"),("허윤진","LE SSERAFIM"),("홍은채","LE SSERAFIM"),
    ("미연","(G)I-DLE"),("민니","(G)I-DLE"),("소연","(G)I-DLE"),("우기","(G)I-DLE"),("슈화","(G)I-DLE"),
    ("채령","ITZY"),("예지","ITZY"),("류진","ITZY"),("유나","ITZY"),
    ("나연","TWICE"),("쯔위","TWICE"),("사나","TWICE"),("모모","TWICE"),("지효","TWICE"),
    ("지수","BLACKPINK"),("제니","BLACKPINK"),("로제","BLACKPINK"),("리사","BLACKPINK"),
    ("아이린","Red Velvet"),("슬기","Red Velvet"),("조이","Red Velvet"),("웬디","Red Velvet"),
    ("루카","BABYMONSTER"),("아현","BABYMONSTER"),("치키타","BABYMONSTER"),
    ("이로하","ILLIT"),("민주","ILLIT"),("원희","ILLIT"),
    ("나띠","KISS OF LIFE"),("줄리","KISS OF LIFE"),
    # 보이그룹
    ("정국","BTS"),("뷔","BTS"),("지민","BTS"),
    ("현진","Stray Kids"),("필릭스","Stray Kids"),("한","Stray Kids"),("리노","Stray Kids"),
    ("희승","ENHYPEN"),("제이","ENHYPEN"),("성훈","ENHYPEN"),("니키","ENHYPEN"),
    ("연준","TOMORROW X TOGETHER"),("휴닝카이","TOMORROW X TOGETHER"),("범규","TOMORROW X TOGETHER"),
    ("호시","SEVENTEEN"),("민규","SEVENTEEN"),("도겸","SEVENTEEN"),("디에잇","SEVENTEEN"),
    ("쇼타로","RIIZE"),("성찬","RIIZE"),("원빈","RIIZE"),("앤톤","RIIZE"),
    ("명재현","BOYNEXTDOOR"),("이한","BOYNEXTDOOR"),
    ("성한빈","ZEROBASEONE"),("김지웅","ZEROBASEONE"),("장하오","ZEROBASEONE"),
    ("마틴","CORTIS"),("성현","CORTIS"),
]

def search(q):
    qq=urllib.parse.quote(q)
    url=f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={qq}&type=video&maxResults=6&order=relevance&videoDuration=short&key={KEY}"
    try: return json.load(urllib.request.urlopen(url,timeout=15)).get('items',[])
    except Exception as e: print(f"  실패 {q}: {e}",file=sys.stderr); return []

def is_official(ch):
    c=ch.lower()
    return any(h.lower() in c for h in OFFICIAL)

def oembed_ok(vid):
    url=f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try: urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=8); return True
    except: return False

seen=set(); final=[]
for member,group in MEMBERS:
    items=search(f"{member} {group} 직캠 fancam"); time.sleep(0.2)
    pick=None
    for it in items:
        t=it['snippet']['title']
        # 직캠/fancam 키워드 + 공식 채널 우선
        if ('직캠' in t or 'fancam' in t.lower() or 'FanCam' in t) and is_official(it['snippet']['channelTitle']):
            pick=it; break
    if not pick:  # 공식 못 찾으면 직캠 키워드라도
        for it in items:
            t=it['snippet']['title']
            if '직캠' in t or 'fancam' in t.lower():
                pick=it; break
    if not pick: print(f"❌ {member}({group}): 없음",file=sys.stderr); continue
    vid=pick['id']['videoId']; ch=pick['snippet']['channelTitle']
    if vid in seen: continue
    if not oembed_ok(vid): print(f"❌ {member}: 임베드불가",file=sys.stderr); continue
    seen.add(vid); final.append({'member':member,'group':group,'videoId':vid})
    print(f"✅ {member}({group}) [{ch}] {vid}",file=sys.stderr)

lines=',\n'.join(f"  {{ member: {json.dumps(m['member'],ensure_ascii=False)}, group: {json.dumps(m['group'],ensure_ascii=False)}, videoId: '{m['videoId']}' }}" for m in final)
ts=f"""// 직캠 월드컵 — 유튜브 공식 무대 직캠 임베드 (YouTube Data API 수집 + oEmbed 검증)
// 수집일 {time.strftime('%Y-%m-%d')}.
export interface Fancam {{ member: string; group: string; videoId: string; }}

export const FANCAMS: Fancam[] = [
{lines},
];
"""
open('src/data/fancam.ts','w',encoding='utf-8').write(ts)
print(f"\n최종 {len(final)}개 → src/data/fancam.ts",file=sys.stderr)
