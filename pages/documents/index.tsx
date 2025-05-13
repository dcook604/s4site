import { GetServerSideProps } from 'next';
import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  useColorModeValue,
  Flex,
  Divider,
  SimpleGrid,
  Button,
  Wrap,
  WrapItem,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Checkbox,
  CheckboxGroup,
  Stack,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import prisma from '@/lib/prisma';
import { Document } from '@prisma/client';
import Fuse from 'fuse.js';

// Add new types for categories
type DocumentCategory = {
  id: string;
  name: string;
  color: string | null;
};

type DocumentWithCategories = Document & {
  categories: {
    category: DocumentCategory;
  }[];
};

type DocumentsPageProps = {
  documents: DocumentWithCategories[];
  categories: DocumentCategory[];
};

export default function DocumentsPage({ documents, categories }: DocumentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const filterBg = useColorModeValue('gray.50', 'gray.700');

  // Set up Fuse.js for client-side search
  const fuse = new Fuse(documents, {
    keys: ['title', 'fileName'],
    threshold: 0.4,
  });

  // Filter documents based on search query and selected categories
  const filteredDocuments = documents
    .filter(doc => {
      // Filter by categories if any are selected
      if (selectedCategories.length > 0) {
        const docCategoryIds = doc.categories.map(c => c.category.id);
        return selectedCategories.some(id => docCategoryIds.includes(id));
      }
      return true;
    })
    .filter(doc => {
      // Then filter by search query if present
      if (searchQuery) {
        const searchResults = fuse.search(searchQuery);
        return searchResults.some(result => result.item.id === doc.id);
      }
      return true;
    });

  // Handle category selection/deselection
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Clear all selected category filters
  const clearCategoryFilters = () => {
    setSelectedCategories([]);
  };

  // Helper to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return FaFilePdf;
    }
    return FaFileAlt;
  };

  // Get category badge for a document
  const getCategoryBadges = (doc: DocumentWithCategories) => {
    const docCategories = doc.categories.map(c => c.category);
    return docCategories.slice(0, 2).map(category => (
      <Badge 
        key={category.id} 
        mr={1} 
        colorScheme="primary"
        bg={category.color || undefined}
        color={category.color ? 'white' : undefined}
      >
        {category.name}
      </Badge>
    ));
  };

  // Show "more" indicator if there are more than 2 categories
  const getMoreCategoriesIndicator = (doc: DocumentWithCategories) => {
    const totalCategories = doc.categories.length;
    if (totalCategories > 2) {
      return (
        <Badge colorScheme="gray" fontSize="xs">
          +{totalCategories - 2} more
        </Badge>
      );
    }
    return null;
  };

  return (
    <Layout>
      <Container maxW="container.lg" py={6}>
        <Breadcrumbs />
        
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>
            Documents
          </Heading>
          <Text color="gray.500">
            Access and download important documents
          </Text>
          
          {/* Categories link */}
          <Button 
            as="a" 
            href="/documents/categories" 
            size="sm" 
            colorScheme="primary" 
            variant="link" 
            mt={2}
          >
            Browse by category
          </Button>
        </Box>

        {/* Search and filter area */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          mb={6}
          align={{ base: 'stretch', md: 'center' }}
        >
          {/* Search input */}
          <InputGroup flex={{ base: '1', md: '2' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
            />
          </InputGroup>

          {/* Category filter */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button 
                rightIcon={<ChevronDownIcon />} 
                variant="outline" 
                colorScheme={selectedCategories.length > 0 ? "primary" : "gray"}
                flex={{ base: '1', md: 'initial' }}
              >
                {selectedCategories.length > 0 
                  ? `${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'}` 
                  : 'Filter by Category'}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="250px" shadow="lg" p={1}>
              <PopoverArrow />
              <PopoverHeader fontWeight="medium">
                <Flex justify="space-between" align="center">
                  <Text>Filter by Category</Text>
                  {selectedCategories.length > 0 && (
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      onClick={clearCategoryFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </Flex>
              </PopoverHeader>
              <PopoverBody maxH="300px" overflowY="auto" py={2} px={1}>
                <CheckboxGroup value={selectedCategories}>
                  <Stack spacing={1}>
                    {categories.map(category => (
                      <Checkbox 
                        key={category.id} 
                        value={category.id}
                        onChange={() => handleCategoryToggle(category.id)}
                      >
                        <HStack>
                          <Text fontSize="sm">{category.name}</Text>
                          {category.color && (
                            <Box
                              w="10px"
                              h="10px"
                              borderRadius="full"
                              bg={category.color}
                            />
                          )}
                        </HStack>
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>

        {/* Selected category filters display */}
        {selectedCategories.length > 0 && (
          <Box mb={4}>
            <Wrap spacing={2}>
              {selectedCategories.map(catId => {
                const category = categories.find(c => c.id === catId);
                if (!category) return null;
                return (
                  <WrapItem key={catId}>
                    <Badge 
                      display="flex" 
                      alignItems="center" 
                      px={2} 
                      py={1} 
                      borderRadius="full"
                      bg={category.color || 'primary.100'}
                      color={category.color ? 'white' : 'primary.800'}
                    >
                      <Text fontSize="sm">{category.name}</Text>
                      <IconButton
                        aria-label={`Remove ${category.name} filter`}
                        icon={<SmallCloseIcon />}
                        size="xs"
                        variant="ghost"
                        ml={1}
                        borderRadius="full"
                        onClick={() => handleCategoryToggle(catId)}
                      />
                    </Badge>
                  </WrapItem>
                );
              })}
              <WrapItem>
                <Button 
                  size="xs" 
                  variant="ghost" 
                  onClick={clearCategoryFilters}
                >
                  Clear all
                </Button>
              </WrapItem>
            </Wrap>
          </Box>
        )}

        {/* Documents list */}
        {filteredDocuments.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No documents found</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {filteredDocuments.map((doc) => (
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
                >
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
                    
                    {doc.categories.length > 0 && (
                      <HStack>
                        {getCategoryBadges(doc)}
                        {getMoreCategoriesIndicator(doc)}
                      </HStack>
                    )}
                    
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch documents with their categories
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Fetch all categories for filtering
    const categories = await prisma.documentCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Convert dates to strings for serialization
    return {
      props: {
        documents: JSON.parse(JSON.stringify(documents)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      props: {
        documents: [],
        categories: [],
      },
    };
  }
}; 