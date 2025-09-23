import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="stable-scrollbar">
      <Head>
        <link rel="stylesheet" href="/fonts/inter-local.css" />
        {/* 防止布局抖动的meta标签 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
        {/* 预加载关键资源以减少布局抖动 */}
        <link rel="preload" href="/fonts/inter-local.css" as="style" />
      </Head>
      <body className="language-transition">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
