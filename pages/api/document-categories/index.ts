import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check user session and admin role
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = session.user as any;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getDocumentCategories(req, res);
    case 'POST':
      return createDocumentCategory(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - List all document categories
async function getDocumentCategories(req: NextApiRequest, res: NextApiResponse) {
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

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Failed to fetch document categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// POST - Create a new document category
async function createDocumentCategory(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, color } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const newCategory = await prisma.documentCategory.create({
      data: {
        name,
        description,
        color,
      },
    });

    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Failed to create document category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 