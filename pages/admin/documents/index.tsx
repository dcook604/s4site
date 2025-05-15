import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Badge,
  Tooltip,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FiEdit, FiTrash2, FiDownload, FiPlus, FiTag } from 'react-icons/fi';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';
import useSWR from 'swr';
import ErrorBoundary from '../../../components/ErrorBoundary';

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  isArchived: boolean;
  categories: {
    category: DocumentCategory;
  }[];
};

export default function AdminDocumentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: documents = [], isLoading, error } = useSWR<DocumentWithCategories[]>('/api/documents', fetcher);
  const [searchQuery, setSearchQuery] = useState('');

  const tableBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check for admin access
  if (status === 'loading') {
    return <AdminLayout>Loading...</AdminLayout>;
  }
  if (status === 'authenticated' && session?.user && (session.user as any).role !== 'admin') {
    router.push('/');
    return null;
  }

  // Filter documents based on search
  const lowercasedQuery = searchQuery.toLowerCase();
  const filteredDocuments = !searchQuery
    ? documents
    : documents.filter((doc) =>
        doc.title.toLowerCase().includes(lowercasedQuery) ||
        doc.fileName.toLowerCase().includes(lowercasedQuery) ||
        (doc.description?.toLowerCase().includes(lowercasedQuery) ?? false)
      );

  // Format file size in KB or MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <ErrorBoundary>
        <Container maxW="container.xl" py={8}>
          <Flex justify="space-between" align="center" mb={8}>
            <Heading as="h1" size="xl">
              Documents
            </Heading>
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="primary" 
              onClick={() => router.push('/admin/documents/upload')}
            >
              Upload Document
            </Button>
          </Flex>
          {/* Search */}
          <Box mb={6}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Box>
          {/* Documents Table */}
          <Box
            bg={tableBg}
            shadow="md"
            rounded="lg"
            overflow="hidden"
          >
            {isLoading ? (
              <Spinner my={8} />
            ) : error ? (
              <Text color="red.500" my={8}>An error occurred while fetching documents.</Text>
            ) : (
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Categories</Th>
                    <Th>File Name</Th>
                    <Th>Size</Th>
                    <Th>Uploaded</Th>
                    <Th>Status</Th>
                    <Th isNumeric>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDocuments.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={4}>
                        <Text color="gray.500">No documents found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <Tr key={doc.id}>
                        <Td fontWeight="medium">
                          <Link href={`/admin/documents/${doc.id}`} passHref>
                            {doc.title}
                          </Link>
                        </Td>
                        <Td>
                          {doc.categories.length > 0 ? (
                            <HStack spacing={1}>
                              {doc.categories.slice(0, 2).map(({ category }) => (
                                <Badge 
                                  key={category.id} 
                                  colorScheme="primary"
                                  bg={category.color || undefined}
                                  color={category.color ? 'white' : undefined}
                                >
                                  {category.name}
                                </Badge>
                              ))}
                              {doc.categories.length > 2 && (
                                <Badge colorScheme="gray" fontSize="xs">
                                  +{doc.categories.length - 2}
                                </Badge>
                              )}
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500">None</Text>
                          )}
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          {doc.fileName}
                        </Td>
                        <Td fontSize="sm">
                          {formatFileSize(doc.fileSize)}
                        </Td>
                        <Td fontSize="sm">
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </Td>
                        <Td>
                          {doc.isArchived ? (
                            <Badge colorScheme="gray">Archived</Badge>
                          ) : doc.expiresAt && new Date(doc.expiresAt) < new Date() ? (
                            <Badge colorScheme="red">Expired</Badge>
                          ) : (
                            <Badge colorScheme="green">Active</Badge>
                          )}
                        </Td>
                        <Td isNumeric>
                          <HStack spacing={1} justify="flex-end">
                            <Tooltip label="Edit document">
                              <IconButton
                                aria-label="Edit document"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/admin/documents/${doc.id}`)}
                              />
                            </Tooltip>
                            <Tooltip label="Manage categories">
                              <IconButton
                                aria-label="Manage categories"
                                icon={<FiTag />}
                                size="sm"
                                colorScheme="primary"
                                variant="ghost"
                                onClick={() => router.push(`/admin/documents/${doc.id}/categories`)}
                              />
                            </Tooltip>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<ChevronDownIcon />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<FiDownload />}
                                  onClick={() => window.open(`/api/documents/download/${doc.id}`, '_blank')}
                                >
                                  Download
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiTrash2 />} 
                                  color="red.500"
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            )}
          </Box>
        </Container>
      </ErrorBoundary>
    </AdminLayout>
  );
} 