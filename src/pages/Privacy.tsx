import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';

export default function Privacy() {
  return (
    <div className="wrap">
      <Head>
        <title>개인정보처리방침 | KPOP 놀이터</title>
        <meta name="description" content="KPOP 놀이터 개인정보처리방침 및 쿠키·광고 안내." />
        <meta name="robots" content="noindex" />
      </Head>
      <div className="topbar"><Link to="/" className="home-link">← KPOP 놀이터</Link></div>
      <div className="page-head"><div className="page-title">개인정보처리방침</div></div>
      <section className="seo-text">
        <p>KPOP 놀이터(이하 "서비스")는 이용자의 개인정보를 소중히 다루며 아래와 같이 안내합니다.</p>

        <h2>1. 수집하는 정보</h2>
        <p>본 서비스는 회원가입이 없으며, 이름·연락처 등 개인을 식별할 수 있는 정보를 서버에 저장하지 않습니다. 게임 진행과 결과는 이용자의 브라우저 안에서만 처리됩니다.</p>

        <h2>2. 쿠키 및 분석</h2>
        <p>방문 통계 분석을 위해 Google Analytics를 사용할 수 있으며 이 과정에서 쿠키가 사용될 수 있습니다. 쿠키는 브라우저 설정에서 거부할 수 있습니다.</p>

        <h2>3. 광고</h2>
        <p>본 서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. 광고 제공업체는 관심 기반 광고를 위해 쿠키를 사용할 수 있으며, 이용자는 Google 광고 설정에서 이를 관리할 수 있습니다.</p>

        <h2>4. 콘텐츠·저작권 안내</h2>
        <p>본 서비스는 아이돌의 이름·그룹·생일 등 사실 정보와 YouTube 공식 임베드 영상만을 사용합니다. 영상 저작권은 각 저작권자에게 있으며, 본 서비스는 YouTube의 공식 임베드 기능을 통해 제공합니다.</p>

        <h2>5. 문의</h2>
        <p>관련 문의는 사이트 운영자에게 연락할 수 있습니다.</p>

        <p style={{ marginTop: 20 }}><Link to="/" className="btn">← 놀이터로 돌아가기</Link></p>
      </section>
      <footer>© 2026 KPOP 놀이터 · by DevForIn</footer>
    </div>
  );
}
