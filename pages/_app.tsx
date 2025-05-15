import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import type { AppProps } from 'next/app'
import Head from 'next/head'
import theme from '../lib/theme'
import '@/styles/globals.css'
import { SearchProvider } from '@/lib/searchContext'
import SearchModal from '@/components/SearchModal'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <SearchProvider>
          <Head>
            <title>Strata Council Community Hub</title>
            <meta name="description" content="Community website for strata council members" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <SearchModal />
          <Component {...pageProps} />
        </SearchProvider>
      </ChakraProvider>
    </SessionProvider>
  )
} 