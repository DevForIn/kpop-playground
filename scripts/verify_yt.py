#!/usr/bin/env python3
# 유튜브 videoId 후보를 oEmbed로 검증 → 재생가능(임베드가능)만 출력
# 사용: python3 scripts/verify_yt.py mv|fancam
import urllib.request, json, sys, time

def check(vid):
    url=f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        d=json.load(urllib.request.urlopen(req,timeout=10))
        return d.get('title','')
    except Exception:
        return None

# MV 후보 (title, artist, videoId 후보)
MV = [
    ("Ditto","NewJeans","pSUydWEqKwE"),("Hype Boy","NewJeans","11cta61wi0g"),
    ("OMG","NewJeans","sVTy_wmn5SU"),("Super Shy","NewJeans","ArmDp-zijuc"),
    ("Attention","NewJeans","js1CtxSY38I"),("ANTIFRAGILE","LE SSERAFIM","pyf8cbqyfPs"),
    ("UNFORGIVEN","LE SSERAFIM","UBURTj20HXI"),
    ("Next Level","aespa","4TWR90KJl84"),("Supernova","aespa","phuiiNCxRMg"),
    ("Savage","aespa","WPdWvnAAurg"),("Black Mamba","aespa","ZeerrnuLi5E"),
    ("LOVE DIVE","IVE","Y8JFxS1HlDo"),("I AM","IVE","6ZUIwj3FgUY"),
    ("TOMBOY","(G)I-DLE","Jh4QFaPmdss"),
    ("Dynamite","BTS","gdZLi9oWNZg"),("Butter","BTS","WMweEpGlu_U"),
    ("Boy With Luv","BTS","XsX3ATc3FbA"),("FAKE LOVE","BTS","7C2z4GqqS5E"),
    ("God's Menu","Stray Kids","TQTlCHxyuu8"),("CHEER UP","TWICE","c7rCyll5AeY"),
    ("TT","TWICE","ePpPVE-GGJw"),("FANCY","TWICE","kOHB85vDuow"),
    # 2차 추가 후보
    ("DDU-DU DDU-DU","BLACKPINK","IHNzOHi8sJs"),("How You Like That","BLACKPINK","32si5cfrCNc"),
    ("Kill This Love","BLACKPINK","2S24-y0Ij3Y"),("Pink Venom","BLACKPINK","gQlMMD8auMs"),
    ("Shut Down","BLACKPINK","POe9SOEKotk"),("붐바야 BOOMBAYAH","BLACKPINK","bwmSjveL3Lc"),
    ("Growl 으르렁","EXO","MBB1lm4qL2M"),("Love Shot","EXO","pSudEWBAYRE"),
    ("Psycho","Red Velvet","uR8Mrt1IpXg"),("Bad Boy","Red Velvet","XGdbaEDVfpU"),
    ("빨간 맛 Red Flavor","Red Velvet","WSeNSzJ2-Jw"),
    ("HANN 한","(G)I-DLE","tnwSHhw3IPU"),("LATATA","(G)I-DLE","hnf5oz5pb5Y"),
    ("Wannabe","ITZY","kzpVWM5Ffvo"),("DALLA DALLA","ITZY","pRnbBjhab3E"),
    ("Not Shy","ITZY","tOed9kZ8ln8"),("LALALALA","Stray Kids","JsOfB9Zespg"),
    ("Back Door","Stray Kids","5U1KFVUcC7c"),("Case 143","Stray Kids","513Dj2Bsu5E"),
    ("Cupid","FIFTY FIFTY","Qc7_zRjH808"),("Love Lee","AKMU","GMHnzcNlxUw"),
    ("Fighting","BSS SEVENTEEN","LWXlbLd53Bs"),("HOT","SEVENTEEN","0-q1KafFCLU"),
    ("Aju Nice 아주 NICE","SEVENTEEN","kzz3O5NAWAo"),
    ("Feel Special","TWICE","3ymwOvzhwHs"),("What is Love","TWICE","i0p1bmr0EmE"),
    ("MORE & MORE","TWICE","mH0_XpSHkZo"),("Yes or Yes","TWICE","mAKsZ26SabQ"),
    ("Celebrity","IU","3jrIw0Wc86A"),("LILAC","IU","v7bnOxV4jAc"),
    ("Eight","IU","TgOu00Mf3kI"),
    ("HELLO FUTURE","NCT DREAM","2Ah9fPZ5pV0"),("Hot Sauce","NCT DREAM","2Sw7scD6Zbg"),
    ("Rockstar","LISA","kaSCq3lqkec"),("Money","LISA","dNCWe_6HAM8"),
    ("FLOWER","JISOO","YudHcBIxlYw"),
]

# 직캠 후보 (아티스트-곡-멤버, videoId) — 공식 직캠 채널(엠카 등)
FANCAM = [
    ("aespa 카리나 - Supernova","aespa","","cZzL6QZBqDc"),
    ("IVE 장원영 - LOVE DIVE","IVE","","Jm3v8gxBhb0"),
    ("LE SSERAFIM 사쿠라 - ANTIFRAGILE","LE SSERAFIM","","xdX_2rBjT8w"),
]

def run(kind):
    data = MV if kind=='mv' else FANCAM
    ok=[]
    for row in data:
        vid=row[-1]
        t=check(vid)
        if t:
            ok.append(row); print(f"✅ {row[0]} → {t[:45]}",file=sys.stderr)
        else:
            print(f"❌ {row[0]} ({vid})",file=sys.stderr)
        time.sleep(0.3)
    print(f"\n통과 {len(ok)}/{len(data)}",file=sys.stderr)
    print(json.dumps(ok,ensure_ascii=False))

run(sys.argv[1] if len(sys.argv)>1 else 'mv')
