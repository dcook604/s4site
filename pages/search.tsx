import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Heading, Box, Text, Spinner, Stack, Link as ChakraLink, Divider } from '@chakra-ui/react'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SearchPage() {
  const router = useRouter()
  const { q } = router.query
  const rawQuery = Array.isArray(q) ? q[0] : q || ''
  const query = rawQuery.toLowerCase()

  const shouldFetch = !!q
  const { data: news, isLoading: newsLoading, error: newsError } = useSWR<any[]>(shouldFetch ? '/api/news' : null, fetcher)
  const { data: events, isLoading: eventsLoading, error: eventsError } = useSWR<any[]>(shouldFetch ? '/api/events' : null, fetcher)
  const { data: documents, isLoading: docsLoading, error: docsError } = useSWR<any[]>(shouldFetch ? '/api/documents' : null, fetcher)

  const loading = newsLoading || eventsLoading || docsLoading
  const error = newsError || eventsError || docsError

  const filter = (items: any[] = [], fields: string[]) =>
    items.filter(item =>
      fields.some(f => (item[f] || '').toLowerCase().includes(query))
    )

  const filteredNews = filter(news, ['title', 'content'])
  const filteredEvents = filter(events, ['title', 'description', 'location'])
  const filteredDocs = filter(documents, ['title', 'description', 'fileName'])

  return (
    <Layout>
      <Box py={10} maxW="900px" mx="auto">
        <Heading as="h1" size="xl" mb={8}>Search Results</Heading>
        <Text mb={8}>Showing results for: <b>{q}</b></Text>
        {loading ? <Spinner /> : error ? (
          <Text color="red.500">An error occurred while fetching search results.</Text>
        ) : (
          <>
            <Heading as="h2" size="md" mt={8} mb={4}>News</Heading>
            {filteredNews.length === 0 ? <Text>No news articles found.</Text> : (
              <Stack mb={8}>
                {filteredNews.map(item => (
                  <Box key={item.id}>
                    <Link href={`/news/${item.id}`} passHref>
                      <ChakraLink fontWeight="bold">{item.title}</ChakraLink>
                    </Link>
                    <Text fontSize="sm" color="gray.500">{item.author?.name || item.author?.email || 'Unknown'} &bull; {new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text noOfLines={2}>{item.content}</Text>
                  </Box>
                ))}
              </Stack>
            )}
            <Divider />
            <Heading as="h2" size="md" mt={8} mb={4}>Events</Heading>
            {filteredEvents.length === 0 ? <Text>No events found.</Text> : (
              <Stack mb={8}>
                {filteredEvents.map(item => (
                  <Box key={item.id}>
                    <Link href={`/calendar/${item.id}`} passHref>
                      <ChakraLink fontWeight="bold">{item.title}</ChakraLink>
                    </Link>
                    <Text fontSize="sm" color="gray.500">{new Date(item.startDate).toLocaleString()} - {new Date(item.endDate).toLocaleString()} {item.location ? `@ ${item.location}` : ''}</Text>
                    <Text noOfLines={2}>{item.description}</Text>
                  </Box>
                ))}
              </Stack>
            )}
            <Divider />
            <Heading as="h2" size="md" mt={8} mb={4}>Documents</Heading>
            {filteredDocs.length === 0 ? <Text>No documents found.</Text> : (
              <Stack mb={8}>
                {filteredDocs.map(item => (
                  <Box key={item.id}>
                    <Link href={`/documents/${item.id}`} passHref>
                      <ChakraLink fontWeight="bold">{item.title}</ChakraLink>
                    </Link>
                    <Text fontSize="sm" color="gray.500">{item.fileName} &bull; {item.fileType} &bull; {item.fileSize} bytes</Text>
                    <Text noOfLines={2}>{item.description}</Text>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Layout>
  )
} 