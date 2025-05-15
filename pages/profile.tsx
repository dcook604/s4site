import Layout from '../components/Layout'
import { Heading, Box, Text } from '@chakra-ui/react'

export default function Profile() {
  return (
    <Layout>
      <Box py={10}>
        <Heading as="h1" size="xl" mb={6}>My Profile</Heading>
        <Box p={6} bg="gray.50" borderRadius="md" mb={6}>User information and update form will appear here. (Coming Soon)</Box>
        <Box p={6} bg="gray.50" borderRadius="md">Change password form will appear here. (Coming Soon)</Box>
      </Box>
    </Layout>
  )
} 