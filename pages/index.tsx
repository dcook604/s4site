import { Box, Container, Flex, Heading, Text, Button, Stack, SimpleGrid } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Layout from '@/components/Layout'

export default function Home() {
  const { data: session } = useSession()

  return (
    <Layout>
      <Box as="section" bg="gray.50" py={20}>
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
            <Box flex="1" pr={{ md: 10 }}>
              <Heading as="h1" size="2xl" mb={6} color="primary.700">
                Welcome to Your Strata Community Hub
              </Heading>
              <Text fontSize="xl" mb={8}>
                Your one-stop portal for strata information, resources, and community updates.
              </Text>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                {!session ? (
                  <Link href="/auth/signin" passHref>
                    <Button size="lg" colorScheme="primary" as="a">
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard" passHref>
                    <Button size="lg" colorScheme="primary" as="a">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/pages/about" passHref>
                  <Button size="lg" variant="outline" as="a">
                    Learn More
                  </Button>
                </Link>
              </Stack>
            </Box>
            <Box
              flex="1"
              mt={{ base: 12, md: 0 }}
              ml={{ md: 10 }}
              maxW={{ base: 'full', md: '500px' }}
              display="flex"
              justifyContent="center"
            >
              <Box
                w="100%"
                h="400px"
                bg="primary.100"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" color="gray.600">Building Image Placeholder</Text>
              </Box>
            </Box>
          </Flex>
        </Container>
      </Box>

      <Box as="section" py={16}>
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={10} textAlign="center">
            Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {[
              {
                title: 'News & Announcements',
                description: 'Stay up-to-date with the latest strata news and important announcements.'
              },
              {
                title: 'Documents & Resources',
                description: 'Access important documents, forms, and resources for residents.'
              },
              {
                title: 'Community Calendar',
                description: 'View upcoming events, meetings, and important dates.'
              }
            ].map((feature, index) => (
              <Box
                key={index}
                p={8}
                bg="white"
                shadow="md"
                borderRadius="lg"
                border="1px"
                borderColor="gray.100"
              >
                <Heading as="h3" size="md" mb={4}>
                  {feature.title}
                </Heading>
                <Text>{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Layout>
  )
} 