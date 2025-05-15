import { GetServerSideProps } from 'next';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { FaFilePdf, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '../../../components/Breadcrumbs';
import prisma from '../../../lib/prisma';

// Define local types for DocumentWithCategory and DocumentCategory

type DocumentCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
};

type DocumentWithCategory = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
  pageId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isArchived: boolean;
  categories: { category: DocumentCategory }[];
};

type CategoryWithDocuments = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  documents: {
    document: DocumentWithCategory;
  }[];
};

type CategoryPageProps = {
  category: CategoryWithDocuments | null;
  error?: string;
};

export default function CategoryPage({ category, error }: CategoryPageProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  if (error || !category) {
    return (
      <Layout>
        <Container maxW="container.lg" py={10}>
          <Box textAlign="center" py={10}>
            <Heading as="h1" size="xl" mb={6}>
              {error || 'Category Not Found'}
            </Heading>
            <Text>
              {error ? error : 'The category you are looking for could not be found.'}
            </Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Extract documents from category
  const documents = category.documents.map(d => d.document);

  // Create breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Documents', href: '/documents' },
    { label: category.name, href: `/documents/categories/${category.id}`, isCurrentPage: true }
  ];

  // Helper to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return FaFilePdf;
    }
    return FaFileAlt;
  };

  return (
    <Layout>
      <Container maxW="container.lg" py={6}>
        <Breadcrumbs customItems={breadcrumbItems} />
        
        <Box mb={8}>
          <Flex align="center" mb={2}>
            <Heading as="h1" size="xl" mr={3}>
              {category.name}
            </Heading>
            {category.color && (
              <Box 
                w="20px" 
                h="20px" 
                borderRadius="full" 
                bg={category.color} 
                border="2px solid"
                borderColor={borderColor}
              />
            )}
          </Flex>
          
          {category.description && (
            <Text color="gray.500" mb={4}>
              {category.description}
            </Text>
          )}
          
          <Badge colorScheme="primary" fontSize="md">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </Box>

        {/* Documents list */}
        {documents.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No documents found in this category</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {documents.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`} passHref>
                <Box
                  as="a"
                  p={4}
                  bg={cardBg}
                  borderRadius="md"
                  boxShadow="sm"
                  border="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{ bg: hoverBg, transform: 'translateY(-2px)', boxShadow: 'md' }}
                  height="100%"
                  position="relative"
                >
                  {doc.expiresAt && new Date(doc.expiresAt) < new Date() && (
                    <Badge 
                      position="absolute" 
                      top={2} 
                      right={2} 
                      colorScheme="red"
                    >
                      Expired
                    </Badge>
                  )}
                  
                  {doc.isArchived && (
                    <Badge 
                      position="absolute" 
                      top={2} 
                      right={doc.expiresAt && new Date(doc.expiresAt) < new Date() ? 16 : 2} 
                      colorScheme="gray"
                    >
                      Archived
                    </Badge>
                  )}
                  
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon 
                        as={getFileIcon(doc.fileType)} 
                        color="primary.500" 
                        boxSize={5} 
                      />
                      <Heading as="h3" size="md" noOfLines={2}>
                        {doc.title}
                      </Heading>
                    </HStack>
                    
                    {doc.description && (
                      <Text color="gray.600" fontSize="sm" noOfLines={2}>
                        {doc.description}
                      </Text>
                    )}
                    
                    <Text color="gray.500" fontSize="sm" noOfLines={1}>
                      {doc.fileName}
                    </Text>
                    
                    <Divider />
                    
                    <HStack fontSize="xs" color="gray.500">
                      <Icon as={FaCalendarAlt} />
                      <Text>
                        {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        documents: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!category) {
      return {
        props: {
          category: null,
          error: 'Category not found',
        },
      };
    }

    // Convert dates to strings for serialization
    return {
      props: {
        category: JSON.parse(JSON.stringify(category)),
      },
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return {
      props: {
        category: null,
        error: 'Failed to load category',
      },
    };
  }
}; 