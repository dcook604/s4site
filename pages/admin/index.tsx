import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  LinkBox,
  LinkOverlay,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { FaFileAlt, FaUsers, FaList, FaFileUpload } from 'react-icons/fa'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const [stats, setStats] = useState({
    pages: 0,
    documents: 0,
    menuItems: 0,
  })
  
  // Check user authentication and role
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
    } else if (session.user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      router.push('/')
    } else {
      // Fetch dashboard stats
      // In a real app, this would be an API call
      const fetchStats = async () => {
        try {
          // Mock data for now
          setStats({
            pages: 5,
            documents: 12,
            menuItems: 8,
          })
        } catch (error) {
          console.error('Failed to fetch stats:', error)
        }
      }
      
      fetchStats()
    }
  }, [session, status, router, toast])
  
  if (status === 'loading' || !session || session.user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Text>Loading...</Text>
        </Container>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        <Heading as="h1" mb={6}>
          Admin Dashboard
        </Heading>
        <Text mb={10}>
          Welcome back, {session.user.name}. Manage your website content here.
        </Text>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          <Stat bg="white" p={5} borderRadius="lg" shadow="md">
            <StatLabel>Total Pages</StatLabel>
            <StatNumber>{stats.pages}</StatNumber>
            <StatHelpText>Published content pages</StatHelpText>
          </Stat>
          
          <Stat bg="white" p={5} borderRadius="lg" shadow="md">
            <StatLabel>Total Documents</StatLabel>
            <StatNumber>{stats.documents}</StatNumber>
            <StatHelpText>Uploaded PDF documents</StatHelpText>
          </Stat>
          
          <Stat bg="white" p={5} borderRadius="lg" shadow="md">
            <StatLabel>Menu Items</StatLabel>
            <StatNumber>{stats.menuItems}</StatNumber>
            <StatHelpText>Navigation menu links</StatHelpText>
          </Stat>
        </SimpleGrid>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
          {[
            {
              title: 'Manage Pages',
              icon: FaFileAlt,
              description: 'Create and edit content pages',
              link: '/admin/pages',
            },
            {
              title: 'Manage Menus',
              icon: FaList,
              description: 'Organize navigation menus',
              link: '/admin/menus',
            },
            {
              title: 'Manage Documents',
              icon: FaFileUpload,
              description: 'Upload and manage documents',
              link: '/admin/documents',
            },
            {
              title: 'Manage Users',
              icon: FaUsers,
              description: 'Manage user accounts',
              link: '/admin/users',
            },
          ].map((item, index) => (
            <LinkBox key={index} as={Card} shadow="md" variant="outline" transition="all 0.3s" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}>
              <CardHeader>
                <Flex align="center">
                  <Icon as={item.icon} boxSize={6} color="primary.500" mr={2} />
                  <Heading size="md">{item.title}</Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text>{item.description}</Text>
              </CardBody>
              <CardFooter>
                <Link href={item.link} passHref>
                  <Button as="a" colorScheme="primary" size="sm">
                    Access
                  </Button>
                </Link>
              </CardFooter>
            </LinkBox>
          ))}
        </SimpleGrid>
        
        <Tabs colorScheme="primary" bg="white" shadow="md" p={5} borderRadius="lg">
          <TabList>
            <Tab>Recent Activity</Tab>
            <Tab>Quick Actions</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Text color="gray.600">No recent activity to display.</Text>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Button leftIcon={<Icon as={FaFileAlt} />} colorScheme="primary" variant="outline" onClick={() => router.push('/admin/pages/new')}>
                  Create New Page
                </Button>
                <Button leftIcon={<Icon as={FaFileUpload} />} colorScheme="primary" variant="outline" onClick={() => router.push('/admin/documents/upload')}>
                  Upload Document
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  )
} 