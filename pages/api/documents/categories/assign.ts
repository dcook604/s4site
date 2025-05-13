import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { documentId, categoryIds } = req.body;

  if (!documentId || !Array.isArray(categoryIds)) {
    return res.status(400).json({ 
      message: 'Invalid request. documentId and categoryIds array are required' 
    });
  }

  try {
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Remove current category assignments
    await prisma.documentsOnCategories.deleteMany({
      where: { documentId },
    });

    // Create new assignments
    const assignments = [];
    for (const categoryId of categoryIds) {
      // Check if category exists
      const category = await prisma.documentCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ 
          message: `Category with ID ${categoryId} not found` 
        });
      }

      // Create assignment
      const assignment = await prisma.documentsOnCategories.create({
        data: {
          documentId,
          categoryId,
        },
      });
      
      assignments.push(assignment);
    }

    // Get updated document with categories
    const updatedDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('Failed to assign categories to document:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 