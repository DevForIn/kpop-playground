#!/usr/bin/env python3
# 기존 fancam.ts에 없는 멤버만 보충 수집 (429 방지 위해 sleep 넉넉히)
import urllib.request, urllib.parse, json, os, sys, time, re

KEY=os.environ.get('YT_KEY','')
OFFICIAL=['M2','Mnet','MPD','스브스케이팝','SBS KPOP','MBCkpop','KBS Kpop','1theK','STARSHIP','SMTOWN','HYBE','JYP']

# 지난번 실패(429)한 멤버들
MISSING=[
    ("리사","BLACKPINK"),("아이린","Red Velvet"),("원희","ILLIT"),("나띠","KISS OF LIFE"),
    ("현진","Stray Kids"),("한","Stray Kids"),("제이","ENHYPEN"),("성훈","ENHYPEN"),
    ("연준","TOMORROW X TOGETHER"),("휴닝카이","TOMORROW X TOGETHER"),
    ("호시","SEVENTEEN"),("민규","SEVENTEEN"),("도겸","SEVENTEEN"),("디에잇","SEVENTEEN"),
    ("쇼타로","RIIZE"),("원빈","RIIZE"),("앤톤","RIIZE"),
    ("명재현","BOYNEXTDOOR"),("이한","BOYNEXTDOOR"),
    ("성한빈","ZEROBASEONE"),("장하오","ZEROBASEONE"),("마틴","CORTIS"),("성현","CORTIS"),
]

def search(q):
    qq=urllib.parse.quote(q)
    url=f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={qq}&type=video&maxResults=6&videoDuration=short&key={KEY}"
    for _ in range(3):
        try: return json.load(urllib.request.urlopen(url,timeout=15)).get('items',[])
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(5); continue
            return []
        except: return []
    return []

def is_official(ch): return any(h.lower() in ch.lower() for h in OFFICIAL)
def oembed_ok(vid):
    try: urllib.request.urlopen(urllib.request.Request(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json",headers={'User-Agent':'Mozilla/5.0'}),timeout=8); return True
    except: return False

# 기존 로드
src=open('src/data/fancam.ts',encoding='utf-8').read()
existing=set(re.findall(r"member: \"([^\"]+)\"",src))
existing_ids=set(re.findall(r"videoId: '([^']+)'",src))
new=[]
for member,group in MISSING:
    if member in existing: continue
    items=search(f"{member} {group} 직캠 fancam"); time.sleep(1.5)
    pick=None
    for it in items:
        t=it['snippet']['title']
        if ('직캠' in t or 'fancam' in t.lower()) and is_official(it['snippet']['channelTitle']): pick=it; break
    if not pick:
        for it in items:
            if '직캠' in it['snippet']['title'] or 'fancam' in it['snippet']['title'].lower(): pick=it; break
    if not pick: print(f"❌ {member}",file=sys.stderr); continue
    vid=pick['id']['videoId']
    if vid in existing_ids: continue
    if not oembed_ok(vid): print(f"❌ {member} 임베드불가",file=sys.stderr); continue
    existing_ids.add(vid); new.append({'member':member,'group':group,'videoId':vid})
    print(f"✅ {member}({group}) [{pick['snippet']['channelTitle']}] {vid}",file=sys.stderr)

if new:
    # 기존 배열 끝에 추가
    add=',\n'.join(f"  {{ member: {json.dumps(m['member'],ensure_ascii=False)}, group: {json.dumps(m['group'],ensure_ascii=False)}, videoId: '{m['videoId']}' }}" for m in new)
    src=src.replace('\n];', ',\n'+add+'\n];')
    open('src/data/fancam.ts','w',encoding='utf-8').write(src)
    print(f"\n보충 {len(new)}개 추가",file=sys.stderr)
else:
    print("보충 없음",file=sys.stderr)
