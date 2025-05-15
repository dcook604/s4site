import { ReactNode, useEffect, useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Header from './Header'
import Footer from './Footer'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Input, InputGroup, InputLeftElement, IconButton } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

type MenuItem = {
  id: string
  label: string
  link?: string
  pageId?: string
  children?: MenuItem[]
}

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/menu')
        if (response.ok) {
          const data = await response.json()
          setMenuItems(data)
        } else {
          console.error('Failed to fetch menu items:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMenuItems()
  }, [])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`)
    }
  }

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg="white" shadow="sm" mb={8}>
        <Flex align="center" justify="space-between" maxW="container.xl" mx="auto" py={4} px={6}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
            <InputGroup maxW="300px" display={{ base: 'none', md: 'flex' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Global search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                bg="gray.50"
                borderRadius="md"
              />
            </InputGroup>
            <IconButton
              aria-label="Search"
              icon={<SearchIcon />}
              type="submit"
              ml={2}
              display={{ base: 'none', md: 'inline-flex' }}
            />
          </form>
        </Flex>
      </Box>
      <Header menuItems={menuItems} />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  )
} 