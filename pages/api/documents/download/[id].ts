import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get document ID from the URL
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid document ID' });
  }

  try {
    // Check if user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    // Get the document details
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Build file path - you may need to adjust this based on your upload directory structure
    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.id, document.fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file not found on server' });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(document.fileName)}`);
    res.setHeader('Content-Type', document.fileType);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({ message: 'Error downloading document' });
  }
} 