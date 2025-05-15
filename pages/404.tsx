import Layout from '../components/Layout'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function Custom404() {
  return (
    <Layout>
      <Box py={20} textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>404 - Page Not Found</Heading>
        <Text mb={8}>Sorry, the page you are looking for does not exist.</Text>
        <Link href="/" passHref>
          <Button colorScheme="primary" as="a">Go Home</Button>
        </Link>
      </Box>
    </Layout>
  )
} 