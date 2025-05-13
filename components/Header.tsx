import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link as ChakraLink,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Tooltip,
  Kbd,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon, SearchIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useSearch } from '../lib/searchContext'

// Custom session type that includes role
interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

type MenuItem = {
  id: string
  label: string
  link?: string
  pageId?: string
  children?: MenuItem[]
}

type HeaderProps = {
  menuItems: MenuItem[]
}

export default function Header({ menuItems = [] }: HeaderProps) {
  const { isOpen, onToggle } = useDisclosure()
  const { data: session } = useSession()
  const user = session?.user as CustomUser | undefined
  const { openSearch } = useSearch()
  
  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        position="sticky"
        top="0"
        zIndex="sticky"
        shadow="sm"
      >
        <Container maxW="container.xl">
          <Flex flex={{ base: 1 }} justify={{ base: 'space-between' }}>
            <Link href="/" passHref>
              <Text
                textAlign="left"
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                fontWeight="bold"
                fontSize="xl"
                cursor="pointer"
                as="a"
              >
                Strata Community Hub
              </Text>
            </Link>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav menuItems={menuItems} />
            </Flex>

            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}
              align="center"
            >
              {/* Search button */}
              <Tooltip 
                label={
                  <HStack>
                    <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
                  </HStack>
                } 
                placement="bottom"
              >
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  variant="ghost"
                  onClick={openSearch}
                  size="md"
                />
              </Tooltip>

              {session ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <Avatar
                      size={'sm'}
                      name={user?.name || 'User'}
                      src={user?.image || undefined}
                    />
                  </MenuButton>
                  <MenuList>
                    <Link href="/profile" passHref>
                      <MenuItem as="a">Profile</MenuItem>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" passHref>
                        <MenuItem as="a">Admin Dashboard</MenuItem>
                      </Link>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <>
                  <Link href="/auth/signin" passHref>
                    <Button
                      as={'a'}
                      fontSize={'sm'}
                      fontWeight={400}
                      variant={'link'}
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </Stack>
          </Flex>
        </Container>

        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav menuItems={menuItems} />
      </Collapse>
    </Box>
  )
}

const DesktopNav = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200')
  const linkHoverColor = useColorModeValue('gray.800', 'white')
  const popoverContentBgColor = useColorModeValue('white', 'gray.800')

  return (
    <Stack direction={'row'} spacing={4}>
      {menuItems.map((navItem) => (
        <Box key={navItem.id}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box>
                {navItem.link ? (
                  <Link href={navItem.link} passHref>
                    <ChakraLink
                      p={2}
                      fontSize={'sm'}
                      fontWeight={500}
                      color={linkColor}
                      _hover={{
                        textDecoration: 'none',
                        color: linkHoverColor,
                      }}
                    >
                      {navItem.label}
                    </ChakraLink>
                  </Link>
                ) : (
                  <ChakraLink
                    p={2}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={linkColor}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                    }}
                  >
                    {navItem.label}
                  </ChakraLink>
                )}
              </Box>
            </PopoverTrigger>

            {navItem.children && navItem.children.length > 0 && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.id} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, link }: MenuItem) => {
  return (
    <Link href={link || '#'} passHref>
      <ChakraLink
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('primary.50', 'gray.900') }}
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'primary.500' }}
              fontWeight={500}
            >
              {label}
            </Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'primary.500'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </ChakraLink>
    </Link>
  )
}

const MobileNav = ({ menuItems }: { menuItems: MenuItem[] }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {menuItems.map((navItem) => (
        <MobileNavItem key={navItem.id} {...navItem} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, link }: MenuItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={link ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.id} href={child.link || '#'} passHref>
                <ChakraLink py={2}>{child.label}</ChakraLink>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
} 