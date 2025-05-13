import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint.' })
  }
  
  // Check if user is admin
  if (session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to perform this action.' })
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPages(req, res)
    case 'POST':
      return createPage(req, res, session)
    default:
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
}

// Get all pages (with optional filtering)
async function getPages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { published } = req.query
    
    // Build filter conditions
    const where = published === 'true' 
      ? { isPublished: true }
      : published === 'false'
        ? { isPublished: false }
        : {}
    
    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })
    
    return res.status(200).json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return res.status(500).json({ error: 'An error occurred while fetching pages.' })
  }
}

// Create a new page
async function createPage(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { title, slug, content, isPublished = false } = req.body
    
    // Validate required fields
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug, and content are required.' })
    }
    
    // Check if slug is already taken
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })
    
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this slug already exists.' })
    }
    
    // Create the page
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished,
        author: {
          connect: { id: session.user.id }
        }
      }
    })
    
    return res.status(201).json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    return res.status(500).json({ error: 'An error occurred while creating the page.' })
  }
} 