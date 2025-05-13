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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getDocumentCategory(req, res, id);
    case 'PUT':
      return updateDocumentCategory(req, res, id);
    case 'DELETE':
      return deleteDocumentCategory(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Get a single document category
async function getDocumentCategory(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        documents: {
          include: {
            document: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error('Failed to fetch document category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// PUT - Update a document category
async function updateDocumentCategory(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { name, description, color } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    const updatedCategory = await prisma.documentCategory.update({
      where: { id },
      data: {
        name,
        description,
        color,
      },
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Failed to update document category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE - Delete a document category
async function deleteDocumentCategory(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if category has documents
    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the category
    await prisma.documentCategory.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete document category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 