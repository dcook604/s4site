import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to build nested menu structure
const buildMenuTree = (items: any[], parentId: string | null = null): any[] => {
  const filtered = items.filter(item => item.parentId === parentId);
  
  return filtered.map((item: { id: string; label: string; link: string | null; pageId?: string | null; parentId?: string | null; order: number; page?: { slug?: string } | null; }) => ({
    ...item,
    children: buildMenuTree(items, item.id)
  })).sort((a, b) => a.order - b.order);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Fetch all menu items
    const menuItems = await prisma.menuItem.findMany({
      include: {
        page: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    // Process the data to include correct links
    const processedItems = menuItems.map((item: { id: string; label: string; link: string | null; pageId?: string | null; parentId?: string | null; order: number; page?: { slug?: string } | null; }) => {
      let link = item.link;
      
      // If the item is linked to a page, use the page's slug
      if (item.pageId && item.page?.slug) {
        link = `/${item.page.slug}`;
      }
      
      return {
        id: item.id,
        label: item.label,
        link,
        pageId: item.pageId || null,
        parentId: item.parentId || null,
        order: item.order,
      };
    });
    
    // Build the nested menu structure
    const menuTree = buildMenuTree(processedItems);
    
    return res.status(200).json(menuTree);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({ message: 'Error fetching menu items' });
  }
} 