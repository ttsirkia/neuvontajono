import { withTRPC } from "@trpc/next";
import "bootstrap/dist/css/bootstrap.css";
import { setDefaultOptions } from "date-fns";
import enLocale from "date-fns/locale/en-US";
import fiLocale from "date-fns/locale/fi";
import Head from "next/head";
import { useEffect, useState } from "react";
import { DefaultToastOptions, Toaster } from "react-hot-toast";
import { IntlProvider } from "react-intl";
import { io, Socket } from "socket.io-client";
import { SessionContext } from "../components/context/SessionContext";
import { SocketContext } from "../components/context/SocketContext";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Spinner } from "../components/Spinner";
import { Tabs } from "../components/Tabs";
import type { AppRouter } from "../server/router";

import "react-datepicker/dist/react-datepicker.css";
import "../styles/globals.css";

import { NextPage } from "next";
import { AppProps } from "next/app";
import { ErrorPanel } from "../components/ErrorPanel";
import { getTranslations, Language } from "../utils/translation";
import { trpc } from "../utils/trpc";
import { ClientToServerEvents, ServerToClientEvents } from "./api/socket";

// ************************************************************************************************

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  fullScreenPage?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// ************************************************************************************************

let authKey = "";
let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

if (typeof window !== "undefined") {
  fetch("/neuvontajono/api/socket").then(() => {
    socket = io({ path: "/neuvontajono/socket.io/" });
  });
}

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const sessionQuery = trpc.useQuery(["session.getSessionInfo"], {
    onSuccess: (data) => {
      authKey = data.sessionId ?? "";
    },
  });
  const [lang, setLang] = useState((process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en") as Language);
  const strings = getTranslations(lang);

  const toastOptions: DefaultToastOptions = {
    success: {
      duration: 4000,
      style: {
        background: "green",
        color: "white",
      },
    },
    error: {
      duration: 4000,
      style: {
        background: "#700",
        color: "white",
      },
    },
  };

  // ************************************************************************************************

  useEffect(() => {
    setDefaultOptions({
      locale: lang === "fi" ? fiLocale : enLocale,
    });
    if (sessionQuery.data) {
      setLang(sessionQuery.data.language);
    }
  }, [sessionQuery.data, sessionQuery.data?.language, lang]);

  // ************************************************************************************************

  return (
    <>
      <SessionContext.Provider value={sessionQuery.data}>
        <SocketContext.Provider value={socket}>
          <IntlProvider
            messages={strings}
            key={lang.toString()}
            locale={lang.toString()}
            defaultLocale={lang.toString()}
          >
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title key="title">{strings.title}</title>
            </Head>
            <Toaster position="top-right" toastOptions={toastOptions} />
            {!Component.fullScreenPage && (
              <>
                <Header />
                <main className="flex-shrink-0">
                  <div className="container mt-4">
                    {!sessionQuery.data && <Spinner />}
                    {sessionQuery.isError && <ErrorPanel />}
                    {sessionQuery.data && !sessionQuery.isError && (
                      <>
                        <h2 className="mb-4">{sessionQuery.data.courseName}</h2>
                        <Tabs />
                        <Component {...pageProps} />
                      </>
                    )}
                  </div>
                </main>
                <Footer />
              </>
            )}
            {sessionQuery.data && Component.fullScreenPage && (
              <>
                <Component {...pageProps} />
              </>
            )}
          </IntlProvider>
        </SocketContext.Provider>
      </SessionContext.Provider>
    </>
  );
};

// ************************************************************************************************

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.browser) return "";
  return `http://localhost:${process.env.PORT ?? 3001}`;
};

// ************************************************************************************************

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/neuvontajono/api/trpc`;

    return {
      headers() {
        return { Authorization: authKey };
      },
      url,
      queryClientConfig: { defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } },
    };
  },
  ssr: false,
})(MyApp);

