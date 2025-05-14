import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Checkbox,
  CheckboxGroup,
  Badge,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormLabel,
  useColorModeValue,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaTag, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

type DocumentCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
};

type Document = {
  id: string;
  title: string;
  fileName: string;
};

type CategoriesManagementProps = {
  document: Document | null;
  allCategories: DocumentCategory[];
  initialSelectedCategories: string[];
  error?: string;
};

export default function DocumentCategoriesManagement({
  document,
  allCategories,
  initialSelectedCategories,
  error,
}: CategoriesManagementProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for admin access
  useEffect(() => {
    if (status === 'authenticated' && session?.user && (session.user as any).role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);
  
  // Handle category selection changes
  const handleCategoryChange = (values: string[]) => {
    setSelectedCategories(values);
  };
  
  // Create new category button handler
  const handleCreateCategory = () => {
    router.push('/admin/document-categories');
  };
  
  // Save category assignments
  const handleSaveCategories = async () => {
    if (!document) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/documents/categories/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          categoryIds: selectedCategories,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to assign categories');
      }
      
      toast({
        title: 'Categories updated',
        description: 'Document categories have been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (status === 'loading') {
    return (
      <AdminLayout>
        <Container maxW="container.lg" py={8}>
          <VStack spacing={4} align="stretch">
            <Skeleton height="40px" width="50%" />
            <Skeleton height="20px" width="30%" />
            <Skeleton height="300px" />
          </VStack>
        </Container>
      </AdminLayout>
    );
  }
  
  // Error state
  if (error || !document) {
    return (
      <AdminLayout>
        <Container maxW="container.lg" py={8}>
          <Box textAlign="center" py={10}>
            <Heading as="h1" size="xl" mb={6}>
              {error || 'Document Not Found'}
            </Heading>
            <Text>
              {error ? error : 'The document you are looking for could not be found.'}
            </Text>
            <Button
              mt={6}
              colorScheme="primary"
              onClick={() => router.push('/admin/documents')}
            >
              Back to Documents
            </Button>
          </Box>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container maxW="container.lg" py={8}>
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
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href={`/admin/documents/${document.id}`}>
              {document.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Categories</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <HStack mb={8} align="center">
          <Icon as={FaTag} color="primary.500" boxSize={6} mr={2} />
          <Heading as="h1" size="xl">
            Manage Document Categories
          </Heading>
        </HStack>
        
        <Box mb={4}>
          <HStack>
            <Text fontWeight="medium">Document:</Text>
            <Text>{document.title}</Text>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            {document.fileName}
          </Text>
        </Box>
        
        <Divider my={6} />
        
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={6}
          borderRadius="md"
          boxShadow="md"
          mb={6}
        >
          <FormControl mb={4}>
            <FormLabel fontWeight="bold" fontSize="lg">
              Assign Categories
            </FormLabel>
            <Text color="gray.500" mb={4}>
              Select the categories to associate with this document. You can select multiple categories.
            </Text>
            
            {allCategories.length === 0 ? (
              <Box bg="orange.50" p={4} borderRadius="md" mb={4}>
                <Text color="orange.700">
                  No categories available. Create categories to better organize your documents.
                </Text>
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  variant="outline" 
                  mt={2}
                  onClick={handleCreateCategory}
                >
                  Create Categories
                </Button>
              </Box>
            ) : (
              <CheckboxGroup 
                colorScheme="primary" 
                value={selectedCategories}
                onChange={(values) => handleCategoryChange(values as string[])}
              >
                <VStack align="start" spacing={2} maxH="300px" overflowY="auto" p={2}>
                  {allCategories.map((category) => (
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
                        {category.description && (
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            - {category.description}
                          </Text>
                        )}
                      </HStack>
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            )}
          </FormControl>
        </Box>
        
        <Box mt={6}>
          <Text fontWeight="medium" mb={2}>
            Selected Categories:
          </Text>
          <HStack spacing={2} mb={6} flexWrap="wrap">
            {selectedCategories.length === 0 ? (
              <Text color="gray.500" fontStyle="italic">No categories selected</Text>
            ) : (
              selectedCategories.map((catId) => {
                const category = allCategories.find((c) => c.id === catId);
                if (!category) return null;
                return (
                  <Badge
                    key={category.id}
                    px={2}
                    py={1}
                    borderRadius="full"
                    bg={category.color || 'primary.100'}
                    color={category.color ? 'white' : 'primary.800'}
                  >
                    {category.name}
                  </Badge>
                );
              })
            )}
          </HStack>
          
          <Flex justify="space-between">
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => router.push(`/admin/documents/${document.id}`)}
              variant="outline"
            >
              Back to Document
            </Button>
            
            <Button
              leftIcon={<FaSave />}
              colorScheme="primary"
              onClick={handleSaveCategories}
              isLoading={isSubmitting}
              loadingText="Saving..."
              isDisabled={allCategories.length === 0}
            >
              Save Categories
            </Button>
          </Flex>
        </Box>
      </Container>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const { id } = context.params as { id: string };

  // Check if user is authenticated and is an admin
  if (!session || (session.user as any).role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    // Fetch the document
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileName: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!document) {
      return {
        props: {
          document: null,
          allCategories: [],
          initialSelectedCategories: [],
          error: 'Document not found',
        },
      };
    }

    // Fetch all available categories
    const categories = await prisma.documentCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Get the currently selected category IDs
    const selectedCategoryIds = document.categories.map(
      (category: { categoryId: string }) => category.categoryId
    );

    return {
      props: {
        document: {
          id: document.id,
          title: document.title,
          fileName: document.fileName,
        },
        allCategories: JSON.parse(JSON.stringify(categories)),
        initialSelectedCategories: selectedCategoryIds,
      },
    };
  } catch (error) {
    console.error('Error fetching document categories:', error);
    return {
      props: {
        document: null,
        allCategories: [],
        initialSelectedCategories: [],
        error: 'Failed to load document categories',
      },
    };
  }
}; 