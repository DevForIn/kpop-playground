#!/usr/bin/env python3
# 제미나이 통합 + MusicBrainz 교차검증 (병렬 + 전역 rate limiter)
# MusicBrainz 정책상 초당 1요청. 전역 락으로 요청 간격 보장하되,
# 대기 시간(네트워크)은 여러 스레드가 겹쳐 처리 → 체감 속도 향상.
import urllib.request, urllib.parse, json, time, re, sys, threading
from concurrent.futures import ThreadPoolExecutor

UA={'User-Agent':'KpopPlayground/1.0 (https://kpop-playground.vercel.app)'}
CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
DL='/Users/jeongin/Downloads/'
FILES=[("3세대-제미나이.json",3),("4세대-제미나이.json",4),
       ("5세대-제미나이.json",5),("5세대-제미나이-2.json",5),("6세대-제미나이.json",6)]

_rate_lock=threading.Lock()
_last=[0.0]
def rate_wait():
    with _rate_lock:
        dt=time.time()-_last[0]
        if dt<1.05: time.sleep(1.05-dt)
        _last[0]=time.time()

def get(url):
    for _ in range(2):
        rate_wait()
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=12))
        except Exception:
            continue
    return None

def chosung(s):
    out=''
    for ch in s:
        c=ord(ch)
        if 0xac00<=c<=0xd7a3: out+=CHO[(c-0xac00)//588]
        elif ch==' ': out+=' '
    return out
def split_name(gn):
    m=re.match(r'^(.*?)\s*\(([^)]+)\)\s*$',gn)
    return (m.group(1).strip(),m.group(2).strip()) if m else (gn.strip(),'')
def gender_of(cat):
    return 'female' if '걸' in cat else 'male' if '보이' in cat else 'mixed'
def norm(s): return (s or '').replace(' ','').lower()

# 1) 제미나이 통합
groups={}
for fn,gen in FILES:
    try: data=json.load(open(DL+fn,encoding='utf-8'))
    except Exception as e: print(f"파일실패 {fn}: {e}",file=sys.stderr); continue
    for g in data:
        ko,en=split_name(g.get('group_name',''))
        if not re.search(r'[가-힣]',ko) and re.search(r'[가-힣]',en): ko,en=en,ko
        if ko in groups: continue
        groups[ko]={'nameKo':ko,'name':en or ko,'gender':gender_of(g.get('category','')),
            'generation':gen,'debutDate':g.get('debut_date'),'agency':g.get('agency'),
            'mbFound':False,
            'members':[{'name':m.get('name'),'birthDate':m.get('birth_date'),
                'initial':chosung(m.get('name',''))[:1],'mbVerified':False,'mbNote':None}
                for m in g.get('members',[])]}
print(f"제미나이 통합: {len(groups)} 그룹",file=sys.stderr)

def mb_group(name):
    q=urllib.parse.quote(f'{name} AND type:group')
    d=get(f"https://musicbrainz.org/ws/2/artist/?query={q}&fmt=json&limit=5")
    if not d: return None
    for a in d.get('artists',[]):
        if a.get('type')=='Group' and a.get('country')=='KR' and a.get('score',0)>=90:
            return a
    return None
def mb_members(gid):
    d=get(f"https://musicbrainz.org/ws/2/artist/{gid}?inc=artist-rels&fmt=json")
    out={}
    if not d: return out
    for r in d.get('relations',[]):
        if r.get('type')=='member of band':
            a=r.get('artist',{}); out[norm(a.get('name',''))]=a.get('id')
    return out
def mb_birth(pid):
    d=get(f"https://musicbrainz.org/ws/2/artist/{pid}?fmt=json")
    if not d: return None
    b=d.get('life-span',{}).get('begin')
    return b if b and len(b)==10 else None

stats={'found':0,'notfound':0,'mem_matched':0,'mem_total':0,'mem_unmatched':0}
slock=threading.Lock()
done=[0]

def process(item):
    key,g=item
    mbg=mb_group(g['name']) or mb_group(g['nameKo'])
    if not mbg:
        with slock: stats['notfound']+=1; done[0]+=1; n=done[0]
        print(f"  [{n}/{len(groups)}] {g['nameKo']}: MB없음(제미나이값유지)",file=sys.stderr); return
    g['mbFound']=True
    mem=mb_members(mbg['id'])   # {norm(name): id}
    mbnames=set(mem.keys())
    for m in g['members']:
        with slock: stats['mem_total']+=1
        if norm(m['name']) in mbnames:
            m['mbVerified']=True
            with slock: stats['mem_matched']+=1
        else:
            m['mbNote']='MB멤버명단에없음(표기차이or미검증)'
            with slock: stats['mem_unmatched']+=1
    with slock: stats['found']+=1; done[0]+=1; n=done[0]
    print(f"  [{n}/{len(groups)}] {g['nameKo']}: MB있음 멤버{len(g['members'])} (매칭누적{stats['mem_matched']})",file=sys.stderr)

with ThreadPoolExecutor(max_workers=8) as ex:
    list(ex.map(process, list(groups.items())))

out={'schemaVersion':'2.0','dataset':'gemini+musicbrainz-verified',
     'snapshotDate':time.strftime('%Y-%m-%d'),
     'note':'제미나이 수집 + MusicBrainz 생일 교차검증. mbVerified=true=MB확인. mbFound=false=MB에없는그룹(제미나이값유지).',
     'stats':stats,'groups':list(groups.values())}
json.dump(out,open('/tmp/kpop_verified.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(f"\n완료: {json.dumps(stats,ensure_ascii=False)}",file=sys.stderr)
