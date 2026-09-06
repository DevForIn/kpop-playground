#!/usr/bin/env python3
# YouTube Data API로 아티스트별 공식 MV 수집 → src/data/mv.ts 생성
# 사용: YT_KEY=... python3 scripts/collect_mv.py
import urllib.request, urllib.parse, json, os, sys, time, html

KEY=os.environ.get('YT_KEY','')
if not KEY: print("YT_KEY 환경변수 필요",file=sys.stderr); sys.exit(1)

# 공식 채널 판별 키워드 (대소문자 무시). 이 채널이면 신뢰
OFFICIAL_HINTS = ['SMTOWN','HYBE','JYP','YG','1theK','starship','pledis','BIGHIT',
    'official','entertainment','Records','WAKEONE','KOZ','ADOR','belift','SOURCE','ent']

# (검색쿼리, 곡명, 아티스트)
QUERIES = [
    # 최신 여돌
    ("aespa Whiplash MV","Whiplash","aespa"),("aespa Drama MV","Drama","aespa"),
    ("aespa Supernova MV","Supernova","aespa"),("aespa Armageddon MV","Armageddon","aespa"),
    ("IVE HEYA MV","해야 HEYA","IVE"),("IVE Accendio MV","Accendio","IVE"),
    ("IVE Baddie MV","Baddie","IVE"),("IVE I AM MV","I AM","IVE"),
    ("NewJeans How Sweet MV","How Sweet","NewJeans"),("NewJeans Supernatural MV","Supernatural","NewJeans"),
    ("NewJeans Ditto MV","Ditto","NewJeans"),("NewJeans OMG MV","OMG","NewJeans"),
    ("LE SSERAFIM EASY MV","EASY","LE SSERAFIM"),("LE SSERAFIM Smart MV","Smart","LE SSERAFIM"),
    ("LE SSERAFIM CRAZY MV","CRAZY","LE SSERAFIM"),("LE SSERAFIM Perfect Night MV","Perfect Night","LE SSERAFIM"),
    ("ILLIT Magnetic MV","Magnetic","ILLIT"),("ILLIT Cherish MV","Cherish","ILLIT"),
    ("(G)I-DLE Queencard MV","Queencard","(G)I-DLE"),("(G)I-DLE Super Lady MV","Super Lady","(G)I-DLE"),
    ("(G)I-DLE Fate MV","Fate","(G)I-DLE"),("(G)I-DLE TOMBOY MV","TOMBOY","(G)I-DLE"),
    ("BABYMONSTER SHEESH MV","SHEESH","BABYMONSTER"),("BABYMONSTER FOREVER MV","FOREVER","BABYMONSTER"),
    ("BABYMONSTER DRIP MV","DRIP","BABYMONSTER"),
    ("RESCENE UhUh MV","UhUh","RESCENE"),("Hearts2Hearts The Chase MV","The Chase","Hearts2Hearts"),
    ("KISS OF LIFE Sticky MV","Sticky","KISS OF LIFE"),("KISS OF LIFE Midas Touch MV","Midas Touch","KISS OF LIFE"),
    ("ITZY UNTOUCHABLE MV","UNTOUCHABLE","ITZY"),("ITZY Born to Be MV","Born to Be","ITZY"),
    # 보이그룹
    ("RIIZE Boom Boom Bass MV","Boom Boom Bass","RIIZE"),("RIIZE Get A Guitar MV","Get A Guitar","RIIZE"),
    ("RIIZE Impossible MV","Impossible","RIIZE"),
    ("Stray Kids Chk Chk Boom MV","Chk Chk Boom","Stray Kids"),("Stray Kids LALALALA MV","LALALALA","Stray Kids"),
    ("Stray Kids S-Class MV","S-Class","Stray Kids"),("Stray Kids God's Menu MV","God's Menu","Stray Kids"),
    ("ENHYPEN XO EW MV","XO (Only If You Say)","ENHYPEN"),("ENHYPEN Bite Me MV","Bite Me","ENHYPEN"),
    ("TXT Sugar Rush Ride MV","Sugar Rush Ride","TOMORROW X TOGETHER"),("TXT Deja Vu MV","Deja Vu","TOMORROW X TOGETHER"),
    ("SEVENTEEN MAESTRO MV","MAESTRO","SEVENTEEN"),("SEVENTEEN God of Music MV","God of Music","SEVENTEEN"),
    ("SEVENTEEN Super MV","SUPER 손오공","SEVENTEEN"),
    ("BOYNEXTDOOR Earth Wind Fire MV","Earth, Wind & Fire","BOYNEXTDOOR"),("BOYNEXTDOOR OUR MV","OUR","BOYNEXTDOOR"),
    ("TWS plot twist MV","plot twist","TWS"),("TWS Last Bell MV","오해원 Last Bell","TWS"),
    ("ZEROBASEONE Feel the POP MV","Feel the POP","ZEROBASEONE"),("ZEROBASEONE SWEAT MV","SWEAT","ZEROBASEONE"),
    ("CORTIS GO! MV","GO!","CORTIS"),("PLAVE Pump Up the Volume MV","Pump Up the Volume","PLAVE"),
    ("NCT WISH Songbird MV","Songbird","NCT WISH"),("NCT DREAM Smoothie MV","Smoothie","NCT DREAM"),
    # 대표 클래식
    ("BTS Dynamite MV","Dynamite","BTS"),("BTS Butter MV","Butter","BTS"),
    ("BLACKPINK How You Like That MV","How You Like That","BLACKPINK"),("BLACKPINK Shut Down MV","Shut Down","BLACKPINK"),
    ("TWICE FANCY MV","FANCY","TWICE"),("IU Love wins all MV","Love wins all","IU"),
]

def api_search(q):
    qq=urllib.parse.quote(q)
    url=f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={qq}&type=video&maxResults=5&order=relevance&key={KEY}"
    try:
        d=json.load(urllib.request.urlopen(url,timeout=15))
        return d.get('items',[])
    except Exception as e:
        print(f"  검색실패 {q}: {e}",file=sys.stderr); return []

def is_official(ch):
    c=ch.lower()
    return any(h.strip().lower() in c for h in OFFICIAL_HINTS if h.strip())

def oembed_ok(vid):
    url=f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=8)
        return True
    except: return False

seen=set(); final=[]
for q,title,artist in QUERIES:
    items=api_search(q); time.sleep(0.2)
    pick=None
    # 공식 채널 우선, 없으면 첫 결과
    for it in items:
        if is_official(it['snippet']['channelTitle']):
            pick=it; break
    if not pick and items: pick=items[0]
    if not pick: print(f"❌ {artist}-{title}: 결과없음",file=sys.stderr); continue
    vid=pick['id']['videoId']; ch=pick['snippet']['channelTitle']
    if vid in seen: continue
    if not oembed_ok(vid): print(f"❌ {artist}-{title}: 임베드불가",file=sys.stderr); continue
    seen.add(vid); final.append({'title':title,'artist':artist,'videoId':vid})
    print(f"✅ {artist}-{title} [{ch}] {vid}",file=sys.stderr)

lines=',\n'.join(f"  {{ title: {json.dumps(m['title'],ensure_ascii=False)}, artist: {json.dumps(m['artist'],ensure_ascii=False)}, videoId: '{m['videoId']}' }}" for m in final)
ts=f"""// MV 월드컵 — 유튜브 공식 영상 임베드 (YouTube Data API 수집 + oEmbed 검증)
// 수집일 {time.strftime('%Y-%m-%d')}. 공식채널 우선 선택, 임베드 가능 확인됨.
export interface MV {{ title: string; artist: string; videoId: string; }}

export const MVS: MV[] = [
{lines},
];
"""
open('src/data/mv.ts','w',encoding='utf-8').write(ts)
print(f"\n최종 {len(final)}개 → src/data/mv.ts",file=sys.stderr)
