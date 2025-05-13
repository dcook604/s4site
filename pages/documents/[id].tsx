import { GetServerSideProps } from 'next';
import { Box, Container, Heading, Text, Button, VStack, HStack, Icon, useColorModeValue, Flex, Badge, Wrap, WrapItem } from '@chakra-ui/react';
import { FaDownload, FaFilePdf, FaFileAlt, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import prisma from '@/lib/prisma';

type DocumentCategory = {
  id: string;
  name: string;
  color: string | null;
};

type DocumentWithCategories = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  description: string | null;
  pageId: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  isArchived: boolean;
  categories: {
    category: DocumentCategory;
  }[];
};

type DocumentDetailProps = {
  document: DocumentWithCategories | null;
  error?: string;
};

export default function DocumentDetail({ document, error }: DocumentDetailProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (error) {
    return (
      <Layout>
        <Container maxW="container.md" py={10}>
          <Box textAlign="center" py={10}>
            <Heading as="h1" size="lg" mb={6}>
              Error
            </Heading>
            <Text>{error}</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <Container maxW="container.md" py={10}>
          <Box textAlign="center" py={10}>
            <Heading as="h1" size="lg" mb={6}>
              Document Not Found
            </Heading>
            <Text>The document you are looking for could not be found.</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  // Create breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Documents', href: '/documents' },
    { label: document.title, href: `/documents/${document.id}`, isCurrentPage: true }
  ];

  // Determine icon based on file type
  const getFileIcon = () => {
    if (document.fileType === 'application/pdf') {
      return FaFilePdf;
    }
    return FaFileAlt;
  };

  // Get formatted expiration date
  const getExpirationInfo = () => {
    if (!document.expiresAt) return null;
    
    const expirationDate = new Date(document.expiresAt);
    const isExpired = expirationDate < new Date();
    
    return (
      <HStack>
        <Icon as={FaCalendarAlt} color={isExpired ? "red.500" : "yellow.500"} />
        <Text color={isExpired ? "red.500" : "yellow.500"} fontWeight="medium">
          {isExpired 
            ? `Expired on ${format(expirationDate, 'MMMM d, yyyy')}` 
            : `Expires on ${format(expirationDate, 'MMMM d, yyyy')}`}
        </Text>
      </HStack>
    );
  };

  return (
    <Layout>
      <Container maxW="container.md" py={6}>
        <Breadcrumbs customItems={breadcrumbItems} />
        
        <Box
          bg={bg}
          boxShadow="md"
          borderRadius="lg"
          overflow="hidden"
          p={6}
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            <Flex
              align="center"
              justify="space-between"
              borderBottom="1px"
              borderColor={borderColor}
              pb={4}
            >
              <HStack spacing={3}>
                <Icon as={getFileIcon()} color="primary.500" boxSize={8} />
                <Heading as="h1" size="lg">
                  {document.title}
                </Heading>
              </HStack>
              
              {document.isArchived && (
                <Badge colorScheme="gray" fontSize="md">Archived</Badge>
              )}
            </Flex>

            {document.description && (
              <Text color="gray.600">
                {document.description}
              </Text>
            )}

            <VStack align="stretch" spacing={4}>
              <HStack color="gray.500">
                <Icon as={FaCalendarAlt} />
                <Text>
                  Uploaded: {format(new Date(document.createdAt), 'MMMM d, yyyy')}
                </Text>
              </HStack>

              <HStack color="gray.500">
                <Text>
                  File: {document.fileName}
                </Text>
                <Text>
                  ({(document.fileSize / 1024).toFixed(1)} KB)
                </Text>
              </HStack>
              
              {getExpirationInfo()}
              
              {document.categories.length > 0 && (
                <Box>
                  <Text color="gray.500" mb={2} display="flex" alignItems="center">
                    <Icon as={FaTag} mr={2} />
                    Categories:
                  </Text>
                  <Wrap spacing={2}>
                    {document.categories.map(({ category }) => (
                      <WrapItem key={category.id}>
                        <Badge 
                          as="a"
                          href={`/documents/categories/${category.id}`}
                          px={2}
                          py={1}
                          borderRadius="full"
                          bg={category.color || 'primary.100'}
                          color={category.color ? 'white' : 'primary.800'}
                          _hover={{ opacity: 0.8 }}
                          cursor="pointer"
                        >
                          {category.name}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>

            <Box pt={6}>
              <Button
                as="a"
                href={`/api/documents/download/${document.id}`}
                colorScheme="primary"
                size="lg"
                leftIcon={<FaDownload />}
                width={{ base: 'full', md: 'auto' }}
              >
                Download Document
              </Button>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!document) {
      return {
        props: {
          document: null,
          error: 'Document not found',
        },
      };
    }

    // Convert dates to strings for serialization
    return {
      props: {
        document: JSON.parse(JSON.stringify(document)),
      },
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    return {
      props: {
        document: null,
        error: 'Failed to load document',
      },
    };
  }
}; 