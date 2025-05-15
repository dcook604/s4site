import Layout from '../components/Layout'
import { Box, Heading, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function Custom500() {
  return (
    <Layout>
      <Box py={20} textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>500 - Server Error</Heading>
        <Text mb={8}>Sorry, something went wrong on our end.</Text>
        <Link href="/" passHref>
          <Button colorScheme="primary" as="a">Go Home</Button>
        </Link>
      </Box>
    </Layout>
  )
} 