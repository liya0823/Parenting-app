import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-TW">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#4A90E2" />
        <meta name="description" content="智能寶寶安撫助手，提供音樂、語音互動等功能" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="安心衛" />
        
        {/* iOS 圖標 */}
        <link rel="apple-touch-icon" href="/42.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/42.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/42.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/42.png" />
        
        {/* iOS 啟動畫面 */}
        <link rel="apple-touch-startup-image" href="/42.png" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/42.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/42.png" />
        <link rel="mask-icon" href="/42.png" color="#4A90E2" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#4A90E2" />
        <meta name="msapplication-TileImage" content="/42.png" />
        
        {/* 其他 meta 標籤 */}
        <meta name="application-name" content="安心衛" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script src="/fullscreen.js" defer></script>
        <style>
          {`
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #FACFC5;
            }
            #__next {
              height: 100%;
              overflow: hidden;
              background-color: #FACFC5;
            }
          `}
        </style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 