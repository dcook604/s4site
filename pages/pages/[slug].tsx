import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { Box, Container, Heading, Text, Divider, VStack, Flex, Badge, Link as ChakraLink, Button, Icon } from '@chakra-ui/react'
import { ChevronLeftIcon, DownloadIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import Layout from '@/components/Layout'
import { FaFilePdf, FaCalendarAlt, FaUserEdit } from 'react-icons/fa'

// Type definitions
type Document = {
  id: string
  title: string
  fileName: string
  fileSize: number
  fileType: string
  createdAt: string
  updatedAt: string
}

type Author = {
  name: string | null
  email: string | null
  image: string | null
}

type PageProps = {
  page: {
    id: string
    title: string
    slug: string
    content: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
    author: Author
    documents: Document[]
  } | null
  error?: string
}

export default function PageView({ page, error }: PageProps) {
  const router = useRouter()
  
  if (router.isFallback) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Text>Loading...</Text>
        </Container>
      </Layout>
    )
  }
  
  if (error || !page) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Heading as="h1" mb={4} color="red.500">
            {error || 'Page not found'}
          </Heading>
          <Text mb={6}>
            The requested page could not be found or is no longer available.
          </Text>
          <Link href="/" passHref>
            <Button leftIcon={<ChevronLeftIcon />} colorScheme="primary">
              Back to Home
            </Button>
          </Link>
        </Container>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        <Link href="/" passHref>
          <Button
            leftIcon={<ChevronLeftIcon />}
            variant="outline"
            mb={6}
            size="sm"
          >
            Back to Home
          </Button>
        </Link>
        
        <Heading as="h1" mb={2}>
          {page.title}
        </Heading>
        
        <Flex 
          mb={6}
          color="gray.500"
          fontSize="sm"
          gap={4}
          flexWrap="wrap"
        >
          <Flex align="center">
            <Icon as={FaCalendarAlt} mr={1} />
            <Text>
              {new Date(page.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Flex>
          
          {page.author.name && (
            <Flex align="center">
              <Icon as={FaUserEdit} mr={1} />
              <Text>
                {page.author.name}
              </Text>
            </Flex>
          )}
        </Flex>
        
        <Divider mb={8} />
        
        <Box 
          className="content"
          mb={10}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        
        {page.documents && page.documents.length > 0 && (
          <Box mt={10}>
            <Heading as="h2" size="md" mb={4}>
              Related Documents
            </Heading>
            <Divider mb={4} />
            
            <VStack spacing={4} align="stretch">
              {page.documents.map((doc) => (
                <Flex 
                  key={doc.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  align="center"
                >
                  <Icon as={FaFilePdf} boxSize={6} color="red.500" mr={4} />
                  <Box flex="1">
                    <Text fontWeight="semibold">{doc.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • 
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                  <ChakraLink 
                    href={`/uploads/pdfs/${doc.fileName}`} 
                    isExternal
                  >
                    <Button
                      rightIcon={<DownloadIcon />}
                      colorScheme="primary"
                      variant="outline"
                      size="sm"
                    >
                      Download
                    </Button>
                  </ChakraLink>
                </Flex>
              ))}
            </VStack>
          </Box>
        )}
      </Container>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = params?.slug as string
    
    if (!slug) {
      return {
        props: {
          page: null,
          error: 'Page not found',
        },
      }
    }
    
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        documents: true,
      },
    })
    
    if (!page || !page.isPublished) {
      return {
        props: {
          page: null,
          error: 'Page not found or is not published',
        },
      }
    }
    
    return {
      props: {
        page: JSON.parse(JSON.stringify(page)), // Serialize dates
        error: null,
      },
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return {
      props: {
        page: null,
        error: 'An error occurred while fetching the page',
      },
    }
  }
} 