import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Switch,
  Text,
  useToast,
  HStack,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormHelperText,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import Layout from '../../../components/Layout'
import Editor from '../../../components/Editor'
import Link from 'next/link'

export default function PageEditor() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'
  const { data: session, status } = useSession()
  const toast = useToast()
  
  const [page, setPage] = useState({
    title: '',
    slug: '',
    content: '<p></p>',
    isPublished: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    // Check authentication
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
    } else if (!isNew && id) {
      // Fetch page data
      setIsLoading(true)
      
      // In a real app, this would be an API call
      const fetchPage = async () => {
        try {
          // Mock data for now
          // In real implementation, we would fetch the page from the API:
          // const response = await fetch(`/api/pages/${id}`)
          // const data = await response.json()
          
          // For now, just use mock data
          setTimeout(() => {
            setPage({
              title: 'Sample Page',
              slug: 'sample-page',
              content: '<h1>Sample Page</h1><p>This is a sample page content.</p>',
              isPublished: true,
            })
            setIsLoading(false)
          }, 500)
        } catch (error) {
          console.error('Failed to fetch page:', error)
          toast({
            title: 'Error',
            description: 'Failed to load page data.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          setIsLoading(false)
        }
      }
      
      fetchPage()
    }
  }, [session, status, router, toast, id, isNew])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setPage({
      ...page,
      [name]: type === 'checkbox' ? checked : value,
    })
  }
  
  const handleContentChange = (content: string) => {
    setPage({
      ...page,
      content,
    })
  }
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPage({
      ...page,
      title: value,
      // Generate slug from title if it's a new page and the user hasn't manually edited it
      slug: isNew ? value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-') : page.slug,
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/pages/${isNew ? '' : id}`, {
      //   method: isNew ? 'POST' : 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(page),
      // })
      
      // Mock successful saving
      setTimeout(() => {
        toast({
          title: 'Success',
          description: `Page ${isNew ? 'created' : 'updated'} successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Redirect to page list
        router.push('/admin/pages')
        setIsSaving(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to save page:', error)
      toast({
        title: 'Error',
        description: `Failed to ${isNew ? 'create' : 'update'} page.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsSaving(false)
    }
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Text>Loading...</Text>
        </Container>
      </Layout>
    )
  }
  
  if (!session || session.user?.role !== 'admin') {
    return null // User will be redirected by the useEffect hook
  }
  
  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <Link href="/admin" passHref>
              <BreadcrumbLink>Admin</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link href="/admin/pages" passHref>
              <BreadcrumbLink>Pages</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">
              {isNew ? 'New Page' : 'Edit Page'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading as="h1" mb={6}>
          {isNew ? 'Create New Page' : 'Edit Page'}
        </Heading>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch" mb={8}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={page.title}
                onChange={handleTitleChange}
                placeholder="Page Title"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Slug</FormLabel>
              <Input
                name="slug"
                value={page.slug}
                onChange={handleInputChange}
                placeholder="page-url-slug"
              />
              <FormHelperText>
                This will be used in the URL: /pages/{page.slug}
              </FormHelperText>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Editor
                content={page.content}
                onChange={handleContentChange}
                placeholder="Start writing your page content..."
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is-published" mb="0">
                Published
              </FormLabel>
              <Switch
                id="is-published"
                name="isPublished"
                isChecked={page.isPublished}
                onChange={handleInputChange}
                colorScheme="primary"
              />
            </FormControl>
          </VStack>
          
          <Flex justify="flex-end" gap={4}>
            <Button
              onClick={() => router.push('/admin/pages')}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="primary"
              isLoading={isSaving}
            >
              {isNew ? 'Create Page' : 'Update Page'}
            </Button>
          </Flex>
        </Box>
      </Container>
    </Layout>
  )
} 