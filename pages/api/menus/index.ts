import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  
  // Handle GET requests (public)
  if (req.method === 'GET') {
    return getMenuItems(req, res)
  }
  
  // All other methods require authentication
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint.' })
  }
  
  // Check if user is admin for modification operations
  if (session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to perform this action.' })
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return createMenuItem(req, res)
    case 'PUT':
      return updateMenuOrder(req, res)
    default:
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

// Get all menu items
async function getMenuItems(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get only parent menu items (top level)
    const menuItems = await prisma.menuItem.findMany({
      where: {
        parentId: null
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        page: {
          select: {
            slug: true,
            title: true
          }
        },
        children: {
          include: {
            page: {
              select: {
                slug: true,
                title: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    
    return res.status(200).json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return res.status(500).json({ error: 'An error occurred while fetching menu items.' })
  }
}

// Create a new menu item
async function createMenuItem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { label, link, pageId, parentId } = req.body
    
    // Validate required fields
    if (!label) {
      return res.status(400).json({ error: 'Menu item label is required.' })
    }
    
    // If neither link nor pageId is provided, return error
    if (!link && !pageId) {
      return res.status(400).json({ error: 'Either link or pageId must be provided.' })
    }
    
    // Get current max order for proper positioning
    const where = parentId ? { parentId } : { parentId: null }
    const lastMenuItem = await prisma.menuItem.findFirst({
      where,
      orderBy: {
        order: 'desc'
      }
    })
    
    const newOrder = lastMenuItem ? lastMenuItem.order + 1 : 0
    
    // Create new menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        label,
        link,
        pageId,
        parentId,
        order: newOrder
      }
    })
    
    return res.status(201).json(menuItem)
  } catch (error) {
    console.error('Error creating menu item:', error)
    return res.status(500).json({ error: 'An error occurred while creating the menu item.' })
  }
}

// Update menu items order
async function updateMenuOrder(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format.' })
    }
    
    // Update each menu item order in a transaction
    const results = await prisma.$transaction(
      items.map((item, index) => 
        prisma.menuItem.update({
          where: { id: item.id },
          data: { 
            order: index,
            parentId: item.parentId || null
          }
        })
      )
    )
    
    return res.status(200).json({ success: true, count: results.length })
  } catch (error) {
    console.error('Error updating menu order:', error)
    return res.status(500).json({ error: 'An error occurred while updating menu order.' })
  }
} 