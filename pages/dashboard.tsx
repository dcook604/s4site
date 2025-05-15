import Layout from '../components/Layout'
import { Heading, Box, Text } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Layout>
      <Box py={10}>
        <Heading as="h1" size="xl" mb={6}>Dashboard</Heading>
        <Text mb={4}>Welcome to your dashboard. Here you will find the latest news, documents, and upcoming events.</Text>
        <Box mb={8} p={6} bg="gray.50" borderRadius="md">News & Announcements (Coming Soon)</Box>
        <Box mb={8} p={6} bg="gray.50" borderRadius="md">Recent Documents (Coming Soon)</Box>
        <Box p={6} bg="gray.50" borderRadius="md">Upcoming Events (Coming Soon)</Box>
      </Box>
    </Layout>
  )
} 