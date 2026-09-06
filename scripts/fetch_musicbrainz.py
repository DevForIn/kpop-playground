#!/usr/bin/env python3
# MusicBrainz에서 K-POP 그룹+멤버+생일 수집 → 우리 스키마 JSON 생성
# 사용: python3 scripts/fetch_musicbrainz.py
# ⚠️ MusicBrainz rate limit: 초당 1요청 (sleep 1.1s 준수)
import urllib.request, urllib.parse, json, time, sys

UA = {'User-Agent': 'KpopPlayground/1.0 (https://kpop-playground.vercel.app)'}
CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

def get(url):
    req = urllib.request.Request(url, headers=UA)
    return json.load(urllib.request.urlopen(req))

def chosung(s):
    out = ''
    for ch in s:
        c = ord(ch)
        if 0xac00 <= c <= 0xd7a3:
            out += CHO[(c - 0xac00) // 588]
        elif ch == ' ':
            out += ' '
    return out

# 수집할 그룹: (검색명, 세대) — 세대별로 계속 추가 가능
GROUPS_TO_FETCH = [
    # 3세대
    ("BTS", 3), ("BLACKPINK", 3), ("TWICE", 3), ("SEVENTEEN", 3),
    ("Red Velvet", 3), ("GFRIEND", 3), ("Mamamoo", 3), ("EXO", 3),
    ("NCT 127", 3), ("MONSTA X", 3), ("OH MY GIRL", 3), ("GOT7", 3),
    # 4세대
    ("aespa", 4), ("IVE", 4), ("NewJeans", 4), ("LE SSERAFIM", 4),
    ("ITZY", 4), ("Stray Kids", 4), ("ENHYPEN", 4), ("TOMORROW X TOGETHER", 4),
    ("(G)I-DLE", 4), ("NMIXX", 4), ("Kep1er", 4), ("STAYC", 4),
    # 5세대
    ("RIIZE", 5), ("BABYMONSTER", 5), ("ILLIT", 5), ("ZEROBASEONE", 5),
    ("BOYNEXTDOOR", 5), ("TWS", 5), ("KISS OF LIFE", 5),
]

def search_group(name):
    q = urllib.parse.quote(name)
    url = f"https://musicbrainz.org/ws/2/artist/?query={q}%20AND%20type:group&fmt=json&limit=5"
    d = get(url)
    for a in d.get('artists', []):
        if a.get('type') == 'Group' and a.get('country') == 'KR':
            return a
    # KR 필터 실패 시 최상위
    arts = d.get('artists', [])
    return arts[0] if arts else None

def fetch_members(gid):
    url = f"https://musicbrainz.org/ws/2/artist/{gid}?inc=artist-rels&fmt=json"
    d = get(url)
    out = []
    for r in d.get('relations', []):
        if r.get('type') == 'member of band':
            a = r.get('artist', {})
            out.append({'id': a.get('id'), 'name': a.get('name'), 'sort': a.get('sort-name'), 'end': r.get('end')})
    return d, out

def fetch_person(pid):
    url = f"https://musicbrainz.org/ws/2/artist/{pid}?fmt=json"
    return get(url)

def main():
    result = {"schemaVersion": "2.0", "dataset": "musicbrainz-kpop",
              "snapshotDate": time.strftime("%Y-%m-%d"), "source": "MusicBrainz",
              "groups": []}
    for name, gen in GROUPS_TO_FETCH:
        try:
            g = search_group(name); time.sleep(1.1)
            if not g:
                print(f"  ✗ {name}: 못 찾음", file=sys.stderr); continue
            gd, members = fetch_members(g['id']); time.sleep(1.1)
            life = gd.get('life-span', {})
            grp = {
                "id": g['id'], "name": g.get('name'), "nameKo": g.get('name'),
                "gender": None, "generation": gen,
                "debutDate": life.get('begin'), "agency": None, "status": "active",
                "members": [],
            }
            for m in members:
                pd = fetch_person(m['id']); time.sleep(1.1)
                bd = pd.get('life-span', {}).get('begin')
                nameKo = m['name']
                grp["members"].append({
                    "id": m['id'], "stageName": m.get('sort') or m['name'],
                    "stageNameKo": nameKo, "realNameKo": None,
                    "birthDate": bd if bd and len(bd) == 10 else None,
                    "positions": [], "initial": chosung(nameKo)[:1],
                    "active": not m.get('end'),
                })
            result["groups"].append(grp)
            print(f"  ✓ {name} (gen{gen}): 멤버 {len(grp['members'])}명", file=sys.stderr)
        except Exception as e:
            print(f"  ✗ {name}: {e}", file=sys.stderr)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
