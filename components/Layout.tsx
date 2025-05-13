import { ReactNode, useEffect, useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Header from './Header'
import Footer from './Footer'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

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
  
  return (
    <Flex direction="column" minH="100vh">
      <Header menuItems={menuItems} />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  )
} 