import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Switch,
  Textarea,
} from "@chakra-ui/react";

// Page type (should match your API)
type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

const emptyPage: Partial<Page> = {
  title: "",
  slug: "",
  content: "",
  isPublished: false,
};

const AdminPagesIndex = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<Partial<Page> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch all pages
  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      setPages(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Open modal for new page
  const handleNewPage = () => {
    setEditingPage({ ...emptyPage });
    onOpen();
  };

  // Open modal for editing
  const handleEditPage = (page: Page) => {
    setEditingPage({ ...page });
    onOpen();
  };

  // Save (create or update) page
  const handleSavePage = async () => {
    if (!editingPage?.title || !editingPage?.content) {
      toast({ status: "error", title: "Title and content are required" });
      return;
    }
    setIsSaving(true);
    try {
      const method = editingPage.id ? "PUT" : "POST";
      const url = editingPage.id ? `/api/pages/${editingPage.id}` : "/api/pages";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingPage.title,
          slug: editingPage.slug,
          content: editingPage.content,
          isPublished: editingPage.isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to save page");
      toast({ status: "success", title: "Page saved" });
      onClose();
      fetchPages();
    } catch (err: any) {
      toast({ status: "error", title: err.message || "Unknown error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete page
  const handleDeletePage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete page");
      toast({ status: "success", title: "Page deleted" });
      fetchPages();
    } catch (err: any) {
      toast({ status: "error", title: err.message || "Unknown error" });
    }
  };

  // Toggle publish
  const handleTogglePublish = async (page: Page) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, isPublished: !page.isPublished }),
      });
      if (!res.ok) throw new Error("Failed to update publish status");
      fetchPages();
    } catch (err: any) {
      toast({ status: "error", title: err.message || "Unknown error" });
    }
  };

  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Manage Pages</Heading>
        <Button colorScheme="blue" onClick={handleNewPage}>
          New Page
        </Button>
      </Flex>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Box color="red.500">{error}</Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Slug</Th>
              <Th>Published</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pages.map((page) => (
              <Tr key={page.id}>
                <Td>{page.title}</Td>
                <Td>{page.slug}</Td>
                <Td>
                  <Switch
                    isChecked={page.isPublished}
                    onChange={() => handleTogglePublish(page)}
                  />
                </Td>
                <Td>
                  <Button size="sm" onClick={() => handleEditPage(page)} mr={2}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDeletePage(page.id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modal for create/edit */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingPage?.id ? "Edit Page" : "New Page"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Title"
              value={editingPage?.title || ""}
              onChange={(e) =>
                setEditingPage((p) => ({ ...p!, title: e.target.value }))
              }
              mb={3}
            />
            <Input
              placeholder="Slug (auto-generated if blank)"
              value={editingPage?.slug || ""}
              onChange={(e) =>
                setEditingPage((p) => ({ ...p!, slug: e.target.value }))
              }
              mb={3}
            />
            {/* Replace with TipTap or WYSIWYG editor as needed */}
            <Textarea
              placeholder="Page content (JSON or text)"
              value={editingPage?.content || ""}
              onChange={(e) =>
                setEditingPage((p) => ({ ...p!, content: e.target.value }))
              }
              rows={10}
              mb={3}
            />
            <Flex align="center" mb={3}>
              <Switch
                isChecked={editingPage?.isPublished || false}
                onChange={() =>
                  setEditingPage((p) => ({ ...p!, isPublished: !p?.isPublished }))
                }
                mr={2}
              />
              <Box>Published</Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} variant="ghost">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSavePage}
              isLoading={isSaving}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminPagesIndex; 