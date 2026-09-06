#!/usr/bin/env python3
# 인기 그룹 전체 MV/직캠 종합 수집 → 기존 데이터에 병합(중복 제거)
# 429 방지: 요청 간 sleep 1.6s + 429시 8s 재시도. 시간 오래 걸림(정상).
# 사용: YT_KEY=... python3 scripts/collect_all.py
import urllib.request, urllib.parse, json, os, sys, time, re

KEY=os.environ.get('YT_KEY','')
if not KEY: sys.exit("YT_KEY 필요")
OFFICIAL_MV=['SMTOWN','HYBE','JYP','YG','1theK','starship','pledis','BIGHIT','ADOR',
    'official','entertainment','Records','WAKEONE','KOZ','KQ','belift','SOURCE','BLACKPINK','BABYMONSTER','i-dle','ZEROBASEONE','PLAVE','ent']
OFFICIAL_FC=['M2','Mnet','MPD','스브스','SBS KPOP','MBCkpop','KBS Kpop','1theK','STARSHIP','SMTOWN','HYBE','JYP','KQ']

# 현재 기준 인기 그룹 (그룹명, 대표 MV곡들, 대표 멤버들)
POPULAR = [
    ("BTS", ["Dynamite","Butter"], ["정국","뷔","지민"]),
    ("BLACKPINK", ["How You Like That","Shut Down"], ["지수","제니","로제","리사"]),
    ("aespa", ["Whiplash","Supernova","Drama"], ["카리나","윈터","닝닝","지젤"]),
    ("IVE", ["해야 HEYA","LOVE DIVE","Accendio"], ["장원영","안유진","리즈","가을"]),
    ("NewJeans", ["Supernatural","Ditto","How Sweet"], ["민지","하니","해린","다니엘","혜인"]),
    ("LE SSERAFIM", ["CRAZY","ANTIFRAGILE","EASY"], ["사쿠라","카즈하","김채원","허윤진","홍은채"]),
    ("(G)I-DLE", ["Queencard","TOMBOY","Super Lady"], ["미연","민니","소연","우기","슈화"]),
    ("ITZY", ["Born to Be","UNTOUCHABLE"], ["예지","류진","채령","유나"]),
    ("TWICE", ["FANCY","I CAN'T STOP ME","SET ME FREE"], ["나연","사나","쯔위","지효","모모"]),
    ("Red Velvet", ["Psycho","Feel My Rhythm"], ["아이린","슬기","웬디","조이","예리"]),
    ("Stray Kids", ["Chk Chk Boom","God's Menu","LALALALA"], ["현진","필릭스","한","리노","방찬"]),
    ("SEVENTEEN", ["MAESTRO","God of Music","손오공"], ["호시","민규","도겸","디에잇","승관"]),
    ("ENHYPEN", ["Bite Me","XO (Only If You Say)"], ["희승","제이","성훈","니키","선우"]),
    ("TOMORROW X TOGETHER", ["Sugar Rush Ride","Deja Vu"], ["연준","수빈","범규","태현","휴닝카이"]),
    ("RIIZE", ["Boom Boom Bass","Get A Guitar","Impossible"], ["쇼타로","성찬","원빈","앤톤","은석"]),
    ("ATEEZ", ["Bouncy","Crazy Form","WONDERLAND"], ["홍중","성화","윤호","여상","산","우영"]),
    ("BABYMONSTER", ["SHEESH","DRIP","FOREVER"], ["루카","아현","치키타","파리타","로라"]),
    ("ZEROBASEONE", ["SWEAT","Feel the POP"], ["성한빈","김지웅","장하오","한유진","석매튜"]),
    ("BOYNEXTDOOR", ["Earth, Wind & Fire","OUR"], ["명재현","지한","리우","성호","운학","이한"]),
    ("ILLIT", ["Magnetic","Cherish"], ["윤아","민주","모카","원희","이로하"]),
    ("KISS OF LIFE", ["Sticky","Midas Touch"], ["줄리","나띠","벨","하늘"]),
    ("NMIXX", ["DASH","Love Me Like This"], ["해원","설윤","릴리","지우","배이","규진"]),
    ("PLAVE", ["Pump Up the Volume","WAY 4 LUV"], ["예준","노아","밤비","은호","하민"]),
    ("TWS", ["plot twist","첫 만남은 계획대로 되지 않아"], ["신유","도훈","한진","지훈","경민","영재"]),
    ("NCT DREAM", ["Smoothie","Candy"], ["마크","제노","해찬","재민","천러","지성"]),
    ("IU", ["Love wins all","Celebrity"], []),
]

def search(q, dur=None):
    qq=urllib.parse.quote(q)
    url=f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={qq}&type=video&maxResults=6&key={KEY}"
    if dur: url+=f"&videoDuration={dur}"
    for _ in range(4):
        try: return json.load(urllib.request.urlopen(url,timeout=15)).get('items',[])
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(8); continue
            return []
        except: time.sleep(2)
    return []
def offi(ch,lst): return any(h.lower() in ch.lower() for h in lst)
def ok(vid):
    try: urllib.request.urlopen(urllib.request.Request(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json",headers={'User-Agent':'Mozilla/5.0'}),timeout=8);return True
    except:return False

# 기존 로드
mv_src=open('src/data/mv.ts',encoding='utf-8').read()
fc_src=open('src/data/fancam.ts',encoding='utf-8').read()
mv_ids=set(re.findall(r"videoId: '([^']+)'",mv_src))
fc_ids=set(re.findall(r"videoId: '([^']+)'",fc_src))
mv_new=[]; fc_new=[]

for group, songs, members in POPULAR:
    # MV
    for song in songs:
        its=search(f"{group} {song} MV"); time.sleep(1.6)
        pick=next((it for it in its if offi(it['snippet']['channelTitle'],OFFICIAL_MV)), its[0] if its else None)
        if not pick: continue
        vid=pick['id']['videoId']; t=pick['snippet']['title'].lower()
        gkey=group.lower().split()[0]
        if vid in mv_ids: continue
        if gkey not in t and group.lower() not in t: continue  # 제목 그룹명 확인
        if not ok(vid): continue
        mv_ids.add(vid); mv_new.append((song,group,vid))
        print(f"MV✅ {group}-{song} {vid}",file=sys.stderr)
    # 직캠 (그룹당 최대 3명)
    for member in members[:3]:
        its=search(f"{member} {group} 직캠 fancam", dur='short'); time.sleep(1.6)
        pick=next((it for it in its if ('직캠' in it['snippet']['title'] or 'fancam' in it['snippet']['title'].lower())), None)
        if not pick: continue
        vid=pick['id']['videoId']
        if vid in fc_ids: continue
        if not ok(vid): continue
        fc_ids.add(vid); fc_new.append((member,group,vid))
        print(f"FC✅ {member}({group}) {vid}",file=sys.stderr)

# 병합
if mv_new:
    add=',\n'.join(f"  {{ title: {json.dumps(t,ensure_ascii=False)}, artist: {json.dumps(g,ensure_ascii=False)}, videoId: '{v}' }}" for t,g,v in mv_new)
    mv_src=mv_src.replace('\n];',',\n'+add+'\n];',1)
    open('src/data/mv.ts','w',encoding='utf-8').write(mv_src)
if fc_new:
    add=',\n'.join(f"  {{ member: {json.dumps(m,ensure_ascii=False)}, group: {json.dumps(g,ensure_ascii=False)}, videoId: '{v}' }}" for m,g,v in fc_new)
    fc_src=fc_src.replace('\n];',',\n'+add+'\n];',1)
    open('src/data/fancam.ts','w',encoding='utf-8').write(fc_src)
print(f"\nMV +{len(mv_new)}, 직캠 +{len(fc_new)}",file=sys.stderr)
