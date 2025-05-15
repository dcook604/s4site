import Layout from '../../components/Layout'
import { Heading, Box, Text, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import ErrorBoundary from '../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function NewsDetail() {
  const router = useRouter()
  const { id } = router.query
  const { data: news, isLoading, error } = useSWR<any>(id ? `/api/news/${id}` : null, fetcher)

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10} maxW="700px" mx="auto">
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching the news article.</Text>
          ) : !news || news.error ? (
            <Text>News article not found.</Text>
          ) : (
            <>
              <Heading as="h1" size="xl" mb={4}>{news.title}</Heading>
              <Text fontSize="sm" color="gray.500" mb={6}>
                {news.author?.name || news.author?.email || 'Unknown'} &bull; {new Date(news.createdAt).toLocaleDateString()}
              </Text>
              <Text whiteSpace="pre-line">{news.content}</Text>
            </>
          )}
        </Box>
      </ErrorBoundary>
    </Layout>
  )
} 