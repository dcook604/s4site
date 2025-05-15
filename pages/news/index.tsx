import Layout from '../../components/Layout'
import { Heading, Box, Text, Spinner, Stack, Link as ChakraLink, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { SearchIcon } from '@chakra-ui/icons'
import useSWR from 'swr'
import ErrorBoundary from '../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function NewsList() {
  const { data: news = [], isLoading, error } = useSWR<any[]>('/api/news', fetcher)
  const [search, setSearch] = useState('')

  const filtered = news.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10}>
          <Heading as="h1" size="xl" mb={6}>News & Announcements</Heading>
          <Text mb={8}>Stay up-to-date with the latest community news and important announcements.</Text>
          <InputGroup maxW="400px" mb={8}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching news.</Text>
          ) : (
            filtered.length === 0 ? (
              <Text>No news articles found.</Text>
            ) : (
              <Stack spacing={8}>
                {filtered.map((item) => (
                  <Box key={item.id} p={6} bg="gray.50" borderRadius="md" shadow="sm">
                    <Heading as="h2" size="md" mb={2}>
                      <Link href={`/news/${item.id}`} passHref>
                        <ChakraLink>{item.title}</ChakraLink>
                      </Link>
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {item.author?.name || item.author?.email || 'Unknown'} &bull; {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text noOfLines={2} mb={2}>{item.content}</Text>
                    <Link href={`/news/${item.id}`} passHref>
                      <ChakraLink color="primary.600" fontWeight="bold">Read more</ChakraLink>
                    </Link>
                  </Box>
                ))}
              </Stack>
            )
          )}
        </Box>
      </ErrorBoundary>
    </Layout>
  )
} 