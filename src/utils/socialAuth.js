function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
    document.head.appendChild(script);
  });
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function loginWithKakao() {
  const key = import.meta.env.VITE_KAKAO_LOGIN_JS_KEY;
  const redirectUri = `${window.location.origin}/oauth/kakao.html`;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem('kakao_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: key,
    redirect_uri: redirectUri,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  const authUrl = `https://kauth.kakao.com/oauth/authorize?${params}`;

  return new Promise((resolve, reject) => {
    const popup = window.open(authUrl, 'kakaoLogin', 'width=500,height=600,scrollbars=yes,resizable=yes');

    if (!popup) {
      reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'));
      return;
    }

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'KAKAO_OAUTH') return;

      window.removeEventListener('message', handleMessage);
      clearInterval(closedChecker);

      const { code, error } = event.data.payload;

      if (error) {
        reject(new Error(`카카오 로그인 거부: ${error}`));
        return;
      }
      if (!code) {
        reject(new Error('인가 코드를 받지 못했습니다.'));
        return;
      }

      try {
        const verifier = sessionStorage.getItem('kakao_code_verifier');
        sessionStorage.removeItem('kakao_code_verifier');

        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: key,
            redirect_uri: redirectUri,
            code,
            code_verifier: verifier,
          }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          throw new Error(tokenData.error_description || '토큰 발급 실패');
        }

        const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const user = await userRes.json();

        resolve({
          provider: 'kakao',
          socialId: String(user.id),
          email: user.kakao_account?.email ?? '',
          nickname: user.kakao_account?.profile?.nickname ?? user.properties?.nickname ?? '',
          profileImage: user.kakao_account?.profile?.profile_image_url ?? user.properties?.profile_image ?? '',
        });
      } catch (e) {
        reject(e);
      }
    };

    window.addEventListener('message', handleMessage);

    const closedChecker = setInterval(() => {
      if (popup.closed) {
        clearInterval(closedChecker);
        window.removeEventListener('message', handleMessage);
        reject(new Error('로그인 창이 닫혔습니다.'));
      }
    }, 1000);
  });
}

export async function loginWithGoogle() {
  await loadScript('https://accounts.google.com/gsi/client');
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) { reject(new Error(tokenResponse.error)); return; }
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          const user = await res.json();
          resolve({
            provider: 'google',
            socialId: user.sub,
            email: user.email ?? '',
            nickname: user.name ?? '',
            profileImage: user.picture ?? '',
          });
        } catch (e) { reject(e); }
      },
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}
