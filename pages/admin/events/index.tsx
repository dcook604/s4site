import { useState } from 'react'
import Layout from '../../../components/Layout'
import { Heading, Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel, Input, Switch, Textarea, useToast } from '@chakra-ui/react'
import Link from 'next/link'
import useSWR from 'swr'
import ErrorBoundary from '../../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminEvents() {
  const { data: events = [], isLoading, error, mutate } = useSWR<any[]>('/api/events', fetcher)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', isPublished: false })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCreate = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSubmitting(false)
    if (res.ok) {
      onClose()
      setForm({ title: '', description: '', startDate: '', endDate: '', location: '', isPublished: false })
      toast({ title: 'Event created', status: 'success', duration: 3000, isClosable: true })
      mutate() // Refresh list
    } else {
      toast({ title: 'Failed to create event', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10}>
          <Stack direction="row" justify="space-between" align="center" mb={6}>
            <Heading as="h1" size="xl">Manage Events</Heading>
            <Button colorScheme="primary" onClick={onOpen}>Create Event</Button>
          </Stack>
          {isLoading ? <Spinner /> : error ? (
            <Box color="red.500" mb={4}>An error occurred while fetching events.</Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Published</Th>
                  <Th>Author</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {events.map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.title}</Td>
                    <Td>{new Date(item.startDate).toLocaleString()}</Td>
                    <Td>{new Date(item.endDate).toLocaleString()}</Td>
                    <Td>{item.isPublished ? 'Yes' : 'No'}</Td>
                    <Td>{item.author?.name || item.author?.email || 'N/A'}</Td>
                    <Td>
                      <Button as={Link} href={`./events/${item.id}`} size="sm" mr={2}>Edit</Button>
                      <Button size="sm" colorScheme="red" isDisabled>Delete</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Event</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleCreate}>
              <ModalBody>
                <FormControl mb={3} isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={form.title} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Description</FormLabel>
                  <Textarea name="description" value={form.description} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Location</FormLabel>
                  <Input name="location" value={form.location} onChange={handleChange} />
                </FormControl>
                <FormControl display="flex" alignItems="center" mb={3}>
                  <FormLabel mb={0}>Published</FormLabel>
                  <Switch name="isPublished" isChecked={form.isPublished} onChange={handleChange} />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose} mr={3} variant="ghost">Cancel</Button>
                <Button colorScheme="primary" type="submit" isLoading={submitting}>Create</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </ErrorBoundary>
    </Layout>
  )
} 