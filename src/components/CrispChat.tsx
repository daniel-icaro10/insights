'use client'

import Script from 'next/script'

export function CrispChat() {
  const crispId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  if (!crispId?.trim()) return null

  return (
    <Script
      id="crisp-chat"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="${crispId}";
          (function(){
            var d=document;
            var s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";
            s.async=1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  )
}
