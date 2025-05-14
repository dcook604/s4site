import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Badge,
  Tooltip,
  useToast,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/AdminLayout';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

// Define local type for DocumentCategory
type DocumentCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
};

export default function DocumentCategoriesPage({ initialCategories }: { initialCategories: DocumentCategory[] }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  const [categories, setCategories] = useState<DocumentCategory[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  
  // For create/edit modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3182CE', // Default color - blue
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For delete confirmation
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useState<any>(null)[0];
  
  // Check for admin access
  useEffect(() => {
    if (status === 'authenticated' && session?.user && (session.user as any).role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  // Handle opening the create modal
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#3182CE',
    });
    onOpen();
  };

  // Handle opening the edit modal
  const handleEditCategory = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3182CE',
    });
    onOpen();
  };

  // Handle deleting a category
  const handleDeleteClick = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/document-categories/${selectedCategory.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
        toast({
          title: 'Category deleted',
          description: `${selectedCategory.name} has been deleted successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsDeleteAlertOpen(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = selectedCategory 
        ? `/api/document-categories/${selectedCategory.id}`
        : '/api/document-categories';
      
      const method = selectedCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        
        if (selectedCategory) {
          // Update existing category
          setCategories(categories.map(cat => 
            cat.id === newCategory.id ? newCategory : cat
          ));
          toast({
            title: 'Category updated',
            description: `${newCategory.name} has been updated successfully.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else {
          // Add new category
          setCategories([...categories, newCategory]);
          toast({
            title: 'Category created',
            description: `${newCategory.name} has been created successfully.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        
        onClose();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save category');
      }
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
    return <AdminLayout>Loading...</AdminLayout>;
  }

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading as="h1" size="xl">
            Document Categories
          </Heading>
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="primary" 
            onClick={handleCreateCategory}
          >
            Create Category
          </Button>
        </Flex>

        {/* Categories Table */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          shadow="md"
          rounded="lg"
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>Category Name</Th>
                <Th>Description</Th>
                <Th>Documents</Th>
                <Th>Color</Th>
                <Th isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    <Text color="gray.500">No categories found. Create one to get started.</Text>
                  </Td>
                </Tr>
              ) : (
                categories.map((category) => (
                  <Tr key={category.id}>
                    <Td fontWeight="medium">{category.name}</Td>
                    <Td>
                      {category.description ? (
                        <Text noOfLines={2}>{category.description}</Text>
                      ) : (
                        <Text color="gray.400" fontSize="sm" fontStyle="italic">
                          No description
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme="primary">
                        {category._count?.documents || 0} documents
                      </Badge>
                    </Td>
                    <Td>
                      {category.color ? (
                        <Box 
                          w="24px" 
                          h="24px" 
                          borderRadius="md" 
                          bg={category.color} 
                          border="1px solid" 
                          borderColor={useColorModeValue('gray.200', 'gray.600')} 
                        />
                      ) : (
                        <Box w="24px" h="24px" borderRadius="md" bg="gray.400" />
                      )}
                    </Td>
                    <Td isNumeric>
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Edit category">
                          <IconButton
                            icon={<FiEdit2 />}
                            aria-label="Edit category"
                            size="sm"
                            colorScheme="primary"
                            variant="ghost"
                            onClick={() => handleEditCategory(category)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete category">
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Delete category"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteClick(category)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Container>

      {/* Create/Edit Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>
            {selectedCategory ? 'Edit Category' : 'Create New Category'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Category Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description (optional)"
                resize="vertical"
                rows={3}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Color</FormLabel>
              <Flex align="center">
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  type="color"
                  w="100px"
                  p={1}
                  mr={3}
                />
                <Text fontSize="sm" color="gray.500">
                  {formData.color}
                </Text>
              </Flex>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" mr={3} type="submit" isLoading={isSubmitting}>
              {selectedCategory ? 'Update' : 'Create'}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
              {selectedCategory?._count?.documents ? (
                <Text mt={2} color="red.500">
                  This category is associated with {selectedCategory._count.documents} documents.
                </Text>
              ) : null}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Check if user is authenticated and is an admin
  if (!session || (session.user as any).role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch categories from the database
  try {
    const categories = await prisma.documentCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    return {
      props: {
        initialCategories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching document categories:', error);
    return {
      props: {
        initialCategories: [],
      },
    };
  }
} 