import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  Spinner,
  Flex,
  Kbd
} from '@chakra-ui/react';
import { SearchIcon, ExternalLinkIcon, LinkIcon } from '@chakra-ui/icons';
import { FaFileAlt, FaFile } from 'react-icons/fa';
import Link from 'next/link';
import { useSearch, SearchItem } from '../lib/searchContext';

const SearchModal: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResults, 
    isSearching, 
    isSearchOpen, 
    closeSearch,
    loading
  } = useSearch();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bgColor = 'white';
  const hoverBgColor = 'gray.50';
  const borderColor = 'gray.200';

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isSearchOpen) {
          // We can't call openSearch() here because it's not part of the returned values
          // This is handled in the Header component
        }
      }
      
      // Close with Escape key
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Render search result item
  const renderSearchItem = (item: SearchItem) => {
    const isPage = item.type === 'page';
    const icon = isPage ? <Icon as={FaFileAlt} color="primary.500" /> : <Icon as={FaFile} color="gray.500" />;
    const href = isPage ? `/${item.slug}` : `/documents/${item.id}`;
    
    return (
      <Link href={href} key={item.id} passHref>
        <Box
          as="a"
          p={3}
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: hoverBgColor }}
          width="100%"
          onClick={closeSearch}
        >
          <HStack spacing={3} align="flex-start">
            <Box pt={1}>
              {icon}
            </Box>
            <VStack align="flex-start" spacing={1} flex="1">
              <Text fontWeight="medium" noOfLines={1}>
                {item.title}
              </Text>
              {item.contentText && (
                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                  {item.contentText.substring(0, 150)}...
                </Text>
              )}
              <HStack fontSize="xs" color="gray.500">
                <Icon as={isPage ? LinkIcon : ExternalLinkIcon} fontSize="xs" />
                <Text>{isPage ? `/${item.slug}` : item.fileName}</Text>
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </Link>
    );
  };

  return (
    <Modal isOpen={isSearchOpen} onClose={closeSearch} size="xl">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent bg={bgColor} overflow="hidden" maxH="90vh">
        <ModalHeader pb={0}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder="Search pages and documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="unstyled"
              fontSize="lg"
              autoComplete="off"
            />
          </InputGroup>
        </ModalHeader>
        <ModalCloseButton />
        
        <Divider my={2} />
        
        <ModalBody maxH="70vh" overflow="auto" p={0}>
          {loading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="lg" color="primary.500" />
              <Text ml={3} fontWeight="medium">Loading search data...</Text>
            </Flex>
          ) : (
            <>
              {searchTerm && isSearching && searchResults.length === 0 ? (
                <Box p={6} textAlign="center">
                  <Text color="gray.500">No results found for "{searchTerm}"</Text>
                </Box>
              ) : (
                <VStack spacing={0} divider={<Divider />} align="stretch">
                  {searchResults.map(renderSearchItem)}
                </VStack>
              )}
              
              {!searchTerm && (
                <Box p={6} textAlign="center">
                  <Text color="gray.500">Type to search pages and documents</Text>
                  <HStack justify="center" mt={4} spacing={4}>
                    <HStack>
                      <Kbd>Ctrl</Kbd> <Text>+</Text> <Kbd>K</Kbd>
                    </HStack>
                    <Text color="gray.500">to open search</Text>
                  </HStack>
                </Box>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchModal; 