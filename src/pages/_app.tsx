import "@/styles/globals.less";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
      <Component {...pageProps} />
      <Toaster />
    </main>
  );
}
