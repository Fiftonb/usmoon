import "@/styles/globals.less";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { initializeLayoutStability } from "@/lib/layout-utils";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 初始化布局稳定性
    initializeLayoutStability();
  }, []);

  return (
    <main>
      <Component {...pageProps} />
      <Toaster />
    </main>
  );
}
