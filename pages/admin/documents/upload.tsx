import { useState, useRef, useEffect } from 'react'
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
  Text,
  useToast,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormHelperText,
  Select,
  Progress,
  Icon,
  Center,
  Stack,
  HStack,
  Textarea,
  CheckboxGroup,
  Checkbox,
  Badge,
  InputGroup,
  InputRightElement,
  Divider,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { FaFileUpload, FaFilePdf, FaCalendarAlt } from 'react-icons/fa'
import Layout from '@/components/Layout'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

type DocumentCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
};

export default function DocumentUpload() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [document, setDocument] = useState({
    title: '',
    pageId: '',
    description: '',
    expiresAt: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [pages, setPages] = useState<Array<{ id: string, title: string }>>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  
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
    } else {
      // Fetch pages for the dropdown
      const fetchPages = async () => {
        try {
          // In a real app, this would fetch from the API
          // For now, we'll use mock data
          setPages([
            { id: 'page1', title: 'Home Page' },
            { id: 'page2', title: 'About Us' },
            { id: 'page3', title: 'Contact Us' },
          ])
        } catch (error) {
          console.error('Failed to fetch pages:', error)
        }
      }
      
      // Fetch categories
      const fetchCategories = async () => {
        setIsLoadingCategories(true)
        try {
          const response = await fetch('/api/document-categories')
          if (response.ok) {
            const data = await response.json()
            setCategories(data)
          } else {
            console.error('Failed to fetch categories:', response.statusText)
          }
        } catch (error) {
          console.error('Failed to fetch categories:', error)
        } finally {
          setIsLoadingCategories(false)
        }
      }
      
      fetchPages()
      fetchCategories()
    }
  }, [session, status, router, toast])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocument({
      ...document,
      [name]: value,
    })
  }
  
  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        return
      }
      
      setFile(selectedFile)
      
      // Auto-populate title from filename if empty
      if (!document.title) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, '') // Remove extension
        setDocument({
          ...document,
          title: filename,
        })
      }
    }
  }
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF file to upload.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    
    setIsUploading(true)
    
    try {
      // In a real app, this would be a FormData-based file upload to an API endpoint
      // For demo, we'll simulate the upload with a progress bar
      
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        
        if (progress >= 100) {
          clearInterval(interval)
          
          // Mock successful upload
          setTimeout(() => {
            toast({
              title: 'Upload successful',
              description: 'Document uploaded successfully.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
            
            // Redirect to document list
            router.push('/admin/documents')
          }, 500)
        }
      }, 300)
    } catch (error) {
      console.error('Failed to upload document:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsUploading(false)
    }
  }
  
  if (status === 'loading') {
    return (
      <AdminLayout>
        <Container maxW="container.xl" py={10}>
          <Text>Loading...</Text>
        </Container>
      </AdminLayout>
    )
  }
  
  if (!session || session.user?.role !== 'admin') {
    return null // User will be redirected by the useEffect hook
  }
  
  return (
    <AdminLayout>
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
            <Link href="/admin/documents" passHref>
              <BreadcrumbLink>Documents</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Upload Document</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <Heading as="h1" mb={6}>
          Upload Document
        </Heading>
        
        <Box as="form" onSubmit={handleUpload}>
          <Stack direction={{ base: 'column', lg: 'row' }} spacing={10} mb={8}>
            <VStack spacing={6} align="stretch" flex="1">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={document.title}
                  onChange={handleInputChange}
                  placeholder="Document Title"
                  disabled={isUploading}
                />
                <FormHelperText>
                  A descriptive name for the document
                </FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={document.description}
                  onChange={handleInputChange}
                  placeholder="Document Description (optional)"
                  disabled={isUploading}
                  rows={3}
                />
                <FormHelperText>
                  Provide a brief description of this document
                </FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Associated Page</FormLabel>
                <Select
                  name="pageId"
                  value={document.pageId}
                  onChange={handleInputChange}
                  placeholder="Select a page (optional)"
                  disabled={isUploading}
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Link this document to a specific page
                </FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Expiration Date</FormLabel>
                <Input
                  name="expiresAt"
                  type="date"
                  value={document.expiresAt}
                  onChange={handleInputChange}
                  disabled={isUploading}
                />
                <FormHelperText>
                  Set an optional expiration date for this document
                </FormHelperText>
              </FormControl>
            </VStack>
            
            <VStack spacing={6} align="stretch" flex="1">
              <FormControl isRequired>
                <FormLabel>PDF Document</FormLabel>
                <Box
                  borderWidth={2}
                  borderRadius="md"
                  borderStyle="dashed"
                  p={6}
                  borderColor={file ? 'primary.500' : 'gray.300'}
                  bg={file ? 'primary.50' : 'transparent'}
                  onClick={() => fileInputRef.current?.click()}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: file ? 'primary.50' : 'gray.50',
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                  <Center flexDir="column" py={6}>
                    {file ? (
                      <>
                        <Icon as={FaFilePdf} boxSize={12} color="primary.500" mb={4} />
                        <Text fontWeight="medium">{file.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </>
                    ) : (
                      <>
                        <Icon as={FaFileUpload} boxSize={12} color="gray.400" mb={4} />
                        <Text fontWeight="medium">Click to select a PDF file</Text>
                        <Text fontSize="sm" color="gray.500">
                          Maximum size: 10MB
                        </Text>
                      </>
                    )}
                  </Center>
                </Box>
              </FormControl>
              
              <FormControl>
                <FormLabel>Categories</FormLabel>
                <Box
                  borderWidth={1}
                  borderRadius="md"
                  p={4}
                  borderColor="gray.200"
                  bg="white"
                  maxH="200px"
                  overflowY="auto"
                >
                  {isLoadingCategories ? (
                    <Text fontSize="sm" color="gray.500">Loading categories...</Text>
                  ) : categories.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No categories available. 
                      <Link href="/admin/document-categories">
                        <Text as="span" color="primary.500" ml={1} cursor="pointer">
                          Create categories
                        </Text>
                      </Link>
                    </Text>
                  ) : (
                    <CheckboxGroup 
                      colorScheme="primary" 
                      value={selectedCategories}
                      onChange={(values) => handleCategoryChange(values as string[])}
                    >
                      <VStack align="start" spacing={2}>
                        {categories.map((category) => (
                          <Checkbox key={category.id} value={category.id}>
                            <HStack>
                              <Text>{category.name}</Text>
                              {category.color && (
                                <Box
                                  w="12px"
                                  h="12px"
                                  borderRadius="full"
                                  bg={category.color}
                                />
                              )}
                            </HStack>
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  )}
                </Box>
                <FormHelperText>
                  Assign categories to help organize this document
                </FormHelperText>
              </FormControl>
            </VStack>
          </Stack>
          
          {isUploading && (
            <Box mb={6}>
              <Text mb={2}>Uploading... {uploadProgress}%</Text>
              <Progress value={uploadProgress} colorScheme="primary" />
            </Box>
          )}
          
          <Flex justify="flex-end">
            <Button
              variant="outline"
              mr={3}
              onClick={() => router.push('/admin/documents')}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="primary"
              isLoading={isUploading}
              loadingText="Uploading..."
              leftIcon={<FaFileUpload />}
            >
              Upload Document
            </Button>
          </Flex>
        </Box>
      </Container>
    </AdminLayout>
  )
} 