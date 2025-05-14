import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

// Define local types for Page and Document
type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session to check if they're authenticated
    const session = await getServerSession(req, res, authOptions);
    
    // Get all published pages
    const pages = await prisma.page.findMany({
      where: {
        isPublished: true, // Only return published pages for search
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
      },
    });

    // Get all documents
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        fileName: true,
      },
    });

    // Process page data to extract plain text content
    const processedPages = pages.map((page: Page) => {
      // Parse the JSON content to extract text
      let contentText = '';
      try {
        const contentObj = JSON.parse(page.content);
        // This is a simple extraction method - we might need more complex parsing depending on TipTap structure
        contentText = extractTextFromTipTapContent(contentObj);
      } catch (error) {
        console.error('Error parsing page content:', error);
        contentText = '';
      }

      return {
        id: page.id,
        title: page.title,
        slug: page.slug,
        contentText,
        type: 'page' as const,
      };
    });

    // Process document data
    const processedDocuments = documents.map((doc: { id: string; title: string; fileName: string; }) => ({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      contentText: '', // No text extraction for documents
      type: 'document' as const,
    }));

    // Combine both types of data
    const searchData = [...processedPages, ...processedDocuments];

    return res.status(200).json(searchData);
  } catch (error) {
    console.error('Error fetching search data:', error);
    return res.status(500).json({ message: 'Error fetching search data' });
  }
}

// Helper function to extract text from TipTap JSON content
function extractTextFromTipTapContent(content: any): string {
  let text = '';

  // TipTap content is a JSON object with a "content" array
  if (content && content.content) {
    content.content.forEach((node: any) => {
      // Text nodes have "text" property
      if (node.text) {
        text += node.text + ' ';
      }
      
      // Recursive extraction for nested content
      if (node.content) {
        text += extractTextFromTipTapContent(node) + ' ';
      }
    });
  }

  return text.trim();
} 