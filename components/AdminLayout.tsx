import React, { ReactNode } from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Link,
  BoxProps,
  CloseButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  HStack,
  VStack,
  Heading,
  Container,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiHome,
  FiFile,
  FiFileText,
  FiUsers,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface LinkItemProps {
  name: string;
  icon: React.ElementType;
  href: string;
}

// Admin navigation items
const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: FiHome, href: '/admin' },
  { name: 'Pages', icon: FiFile, href: '/admin/pages' },
  { name: 'Documents', icon: FiFileText, href: '/admin/documents' },
  { name: 'Document Categories', icon: FiFileText, href: '/admin/document-categories' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.900' }}>
      <SidebarContent onClose={onClose} />
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Container maxW="container.xl" py={4}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const router = useRouter();
  
  return (
    <Box
      transition="3s ease"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderRight="1px"
      borderRightColor={{ base: 'gray.200', _dark: 'gray.700' }}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="primary.500">
          Admin
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          href={link.href}
          isActive={router.pathname === link.href || router.pathname.startsWith(`${link.href}/`)}
        >
          {link.name}
        </NavItem>
      ))}
      
      {/* View Site Link */}
      <NavItem 
        icon={FiHome} 
        href="/"
      >
        View Site
      </NavItem>
      
      {/* Logout Link */}
      <Box px={4} mt={2}>
        <Link
          as="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          display="flex"
          alignItems="center"
          p={3}
          fontSize="sm"
          fontWeight="500"
          color="red.500"
          borderRadius="md"
          _hover={{
            bg: 'red.50',
            color: 'red.700',
          }}
        >
          <Icon as={FiLogOut} mr={3} />
          Log Out
        </Link>
      </Box>
    </Box>
  );
};

interface NavItemProps extends BoxProps {
  icon: React.ElementType;
  href: string;
  isActive?: boolean;
  children: ReactNode;
}

const NavItem = ({ icon, href, isActive, children, ...rest }: NavItemProps) => {
  const navBg = isActive ? 'primary.50' : 'transparent';
  const navColor = isActive ? 'primary.700' : undefined;
  const filteredRest = rest;
  return (
    <NextLink href={href} passHref>
      <Link style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={navBg}
          color={navColor}
          fontWeight={isActive ? "bold" : "normal"}
          _hover={{
            bg: 'primary.50',
            color: 'primary.700',
          }}
          {...filteredRest}>
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Link>
    </NextLink>
  );
};

interface MobileProps extends BoxProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { data: session } = useSession();
  const filteredRest = rest;
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={{ base: 'white', _dark: 'gray.900' }}
      borderBottomWidth="1px"
      borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...filteredRest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
      >
        <FiMenu />
      </IconButton>

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontWeight="bold"
        color="primary.500">
        Admin
      </Text>

      <HStack gap="6">
        <Flex alignItems={'center'}>
          <HStack>
            <VStack
              display={{ base: 'none', md: 'flex' }}
              alignItems="flex-start"
              gap="1px"
              ml="2">
              <Text fontSize="sm">
                {session?.user?.name || session?.user?.email || 'Admin User'}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Administrator
              </Text>
            </VStack>
          </HStack>
        </Flex>
      </HStack>
    </Flex>
  );
}; 