import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Container,
} from '@chakra-ui/react'
import Layout from '@/components/Layout'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      
      if (result?.error) {
        toast({
          title: 'Authentication failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        router.push('/')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Layout>
      <Container maxW="container.md" py={10}>
        <Center>
          <Box w="100%" maxW="md" p={8} borderWidth="1px" borderRadius="lg" boxShadow="lg">
            <VStack spacing={6} align="stretch">
              <Heading as="h1" size="xl" textAlign="center">
                Sign In
              </Heading>
              <Text textAlign="center" color="gray.600">
                Sign in to access your account
              </Text>
              
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                    />
                  </FormControl>
                  
                  <Button
                    mt={4}
                    colorScheme="primary"
                    isLoading={isLoading}
                    type="submit"
                    w="100%"
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Center>
      </Container>
    </Layout>
  )
} 