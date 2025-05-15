import Layout from '../../components/Layout'
import { Heading, Box, Text, Spinner, Stack, Link as ChakraLink, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { SearchIcon } from '@chakra-ui/icons'
import useSWR from 'swr'
import ErrorBoundary from '../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CalendarList() {
  const { data: events = [], isLoading, error } = useSWR<any[]>('/api/events', fetcher)
  const [search, setSearch] = useState('')

  const filtered = events.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10}>
          <Heading as="h1" size="xl" mb={6}>Community Calendar</Heading>
          <Text mb={8}>View upcoming events, meetings, and important dates for your community.</Text>
          <InputGroup maxW="400px" mb={8}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching events.</Text>
          ) : (
            filtered.length === 0 ? (
              <Text>No events found.</Text>
            ) : (
              <Stack spacing={8}>
                {filtered.map((item) => (
                  <Box key={item.id} p={6} bg="gray.50" borderRadius="md" shadow="sm">
                    <Heading as="h2" size="md" mb={2}>
                      <Link href={`/calendar/${item.id}`} passHref>
                        <ChakraLink>{item.title}</ChakraLink>
                      </Link>
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      {new Date(item.startDate).toLocaleString()} - {new Date(item.endDate).toLocaleString()} {item.location ? `@ ${item.location}` : ''}
                    </Text>
                    <Text noOfLines={2} mb={2}>{item.description}</Text>
                    <Link href={`/calendar/${item.id}`} passHref>
                      <ChakraLink color="primary.600" fontWeight="bold">View details</ChakraLink>
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