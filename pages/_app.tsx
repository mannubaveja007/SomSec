import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../public/styles/tailwind-output.css'
import '../public/styles/styles.css'
import '../public/styles/chat-styles.css'

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Somnia Smart Contract Security Analyzer</title>
            </Head>
            <Component {...pageProps} />
        </>
    )
}
