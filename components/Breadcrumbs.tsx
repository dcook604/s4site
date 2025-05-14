import React from 'react';
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

export type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage?: boolean;
};

type BreadcrumbsProps = {
  items?: BreadcrumbItem[];
  customItems?: BreadcrumbItem[];
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, customItems }) => {
  const router = useRouter();
  const color = { base: 'gray.500', _dark: 'gray.400' };
  const activeColor = { base: 'primary.600', _dark: 'primary.400' };
  const bg = { base: 'gray.50', _dark: 'gray.800' };

  // Generate breadcrumbs from router path if not provided
  const breadcrumbItems = customItems || items || generateBreadcrumbsFromPath(router.asPath);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs if only home is available
  }

  return (
    <Box bg="gray.50" py={2} px={4} mb={4}>
      <Breadcrumb fontSize="sm" separator={<ChevronRightIcon color="gray.500" />}>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index} isCurrentPage={item.isCurrentPage}>
            {item.isCurrentPage ? (
              <BreadcrumbLink aria-current="page" fontWeight="semibold">{item.label}</BreadcrumbLink>
            ) : (
              <Link href={item.href} passHref>
                <BreadcrumbLink fontWeight="normal">{item.label}</BreadcrumbLink>
              </Link>
            )}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </Box>
  );
};

// Helper function to generate breadcrumb items from a path
function generateBreadcrumbsFromPath(path: string): BreadcrumbItem[] {
  const parts = path.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';

  parts.forEach((part, index) => {
    currentPath += `/${part}`;
    const isLastItem = index === parts.length - 1;
    
    // Format the label (capitalize, replace dashes with spaces)
    const label = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    
    items.push({
      label,
      href: currentPath,
      isCurrentPage: isLastItem
    });
  });

  return items;
}

export default Breadcrumbs; 