import {
  Box,
  Container,
  Stack,
  Text,
  Link as ChakraLink,
  useColorModeValue,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { FaEnvelope, FaPhone, FaHome } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      mt="auto"
    >
      <Container
        as={Stack}
        maxW={'container.xl'}
        py={8}
        spacing={4}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'center', md: 'start' }}
        >
          <Stack spacing={6} align={{ base: 'center', md: 'flex-start' }}>
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                Strata Community Hub
              </Text>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Your strata information portal
              </Text>
            </Box>
            <Stack direction={'row'} spacing={6}>
              <Flex align="center">
                <Icon as={FaEnvelope} mr={2} />
                <ChakraLink href="mailto:info@example.com">
                  info@example.com
                </ChakraLink>
              </Flex>
              <Flex align="center">
                <Icon as={FaPhone} mr={2} />
                <ChakraLink href="tel:+1-555-555-5555">
                  (555) 555-5555
                </ChakraLink>
              </Flex>
            </Stack>
          </Stack>

          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={6}
            mt={{ base: 8, md: 0 }}
            align={{ base: 'center', md: 'flex-start' }}
          >
            <Stack align={'flex-start'} spacing={3}>
              <Text fontWeight={'600'} fontSize={'sm'}>
                Links
              </Text>
              <Link href="/" passHref>
                <ChakraLink>Home</ChakraLink>
              </Link>
              <Link href="/pages/about" passHref>
                <ChakraLink>About</ChakraLink>
              </Link>
              <Link href="/pages/contact" passHref>
                <ChakraLink>Contact</ChakraLink>
              </Link>
            </Stack>

            <Stack align={'flex-start'} spacing={3}>
              <Text fontWeight={'600'} fontSize={'sm'}>
                Resources
              </Text>
              <Link href="/pages/documents" passHref>
                <ChakraLink>Documents</ChakraLink>
              </Link>
              <Link href="/pages/faq" passHref>
                <ChakraLink>FAQ</ChakraLink>
              </Link>
              <Link href="/pages/policies" passHref>
                <ChakraLink>Policies</ChakraLink>
              </Link>
            </Stack>
          </Stack>
        </Flex>

        <Box 
          borderTopWidth={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          pt={4}
          textAlign="center"
        >
          <Text fontSize="sm">
            © {new Date().getFullYear()} Strata Community Hub. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  )
} 