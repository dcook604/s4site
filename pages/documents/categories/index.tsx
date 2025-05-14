import { GetServerSideProps } from 'next';
import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Icon,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import prisma from '@/lib/prisma';
import Fuse from 'fuse.js';

// Define local type for DocumentCategory
type DocumentCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: {
    documents: number;
  };
};

type CategoriesPageProps = {
  categories: DocumentCategory[];
};

export default function CategoriesPage({ categories }: CategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Set up Fuse.js for client-side search
  const fuse = new Fuse(categories, {
    keys: ['name', 'description'],
    threshold: 0.4,
  });

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? fuse.search(searchQuery).map(result => result.item)
    : categories;

  // Create breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Documents', href: '/documents' },
    { label: 'Categories', href: '/documents/categories', isCurrentPage: true }
  ];

  return (
    <Layout>
      <Container maxW="container.lg" py={6}>
        <Breadcrumbs customItems={breadcrumbItems} />
        
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>
            Document Categories
          </Heading>
          <Text color="gray.500">
            Browse documents by category
          </Text>
        </Box>

        {/* Search input */}
        <Box mb={6}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
            />
          </InputGroup>
        </Box>

        {/* Categories list */}
        {filteredCategories.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No categories found</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {filteredCategories.map((category) => (
              <Link key={category.id} href={`/documents/categories/${category.id}`} passHref>
                <Box
                  as="a"
                  p={4}
                  bg={cardBg}
                  borderRadius="md"
                  boxShadow="sm"
                  border="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{ 
                    bg: hoverBg, 
                    transform: 'translateY(-2px)', 
                    boxShadow: 'md',
                    '& .folder-icon': { transform: 'scale(1.1)' },
                  }}
                  height="100%"
                >
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon
                        as={category._count.documents > 0 ? FaFolderOpen : FaFolder}
                        color={category.color || 'primary.500'}
                        boxSize={6}
                        className="folder-icon"
                        transition="transform 0.2s"
                      />
                      <Heading as="h3" size="md" noOfLines={1}>
                        {category.name}
                      </Heading>
                    </HStack>
                    
                    {category.description && (
                      <Text color="gray.600" fontSize="sm" noOfLines={2}>
                        {category.description}
                      </Text>
                    )}
                    
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="primary">
                        {category._count.documents} document{category._count.documents !== 1 ? 's' : ''}
                      </Badge>
                      
                      {category.color && (
                        <Box 
                          w="16px" 
                          h="16px" 
                          borderRadius="full" 
                          bg={category.color} 
                          border="1px solid"
                          borderColor={borderColor}
                        />
                      )}
                    </Flex>
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
        categories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      props: {
        categories: [],
      },
    };
  }
};