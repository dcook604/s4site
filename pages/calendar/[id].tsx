import Layout from '../../components/Layout'
import { Heading, Box, Text, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import ErrorBoundary from '../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EventDetail() {
  const router = useRouter()
  const { id } = router.query
  const { data: event, isLoading, error } = useSWR<any>(id ? `/api/events/${id}` : null, fetcher)

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10} maxW="700px" mx="auto">
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching the event.</Text>
          ) : !event || event.error ? (
            <Text>Event not found.</Text>
          ) : (
            <>
              <Heading as="h1" size="xl" mb={4}>{event.title}</Heading>
              <Text fontSize="sm" color="gray.500" mb={2}>
                {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()} {event.location ? `@ ${event.location}` : ''}
              </Text>
              <Text whiteSpace="pre-line">{event.description}</Text>
            </>
          )}
        </Box>
      </ErrorBoundary>
    </Layout>
  )
} 