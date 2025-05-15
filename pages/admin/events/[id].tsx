import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { Heading, Box, Text, Spinner, FormControl, FormLabel, Input, Switch, Button, Textarea, useToast } from '@chakra-ui/react'
import useSWR from 'swr'
import ErrorBoundary from '../../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EditEvent() {
  const router = useRouter()
  const { id } = router.query
  const { data: event, isLoading, error, mutate } = useSWR<any>(id ? `/api/events/${id}` : null, fetcher)
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', isPublished: false })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? event.startDate.slice(0, 16) : '',
        endDate: event.endDate ? event.endDate.slice(0, 16) : '',
        location: event.location || '',
        isPublished: !!event.isPublished
      })
    }
  }, [event])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSubmitting(false)
    if (res.ok) {
      toast({ title: 'Event updated', status: 'success', duration: 3000, isClosable: true })
      mutate()
    } else {
      toast({ title: 'Failed to update event', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10} maxW="600px" mx="auto">
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching the event.</Text>
          ) : !event ? (
            <Text>Event not found.</Text>
          ) : (
            <>
              <Heading as="h1" size="xl" mb={6}>Edit Event</Heading>
              <form onSubmit={handleSave}>
                <FormControl mb={4} isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={form.title} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea name="description" value={form.description} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Location</FormLabel>
                  <Input name="location" value={form.location} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel mb={0}>Published</FormLabel>
                  <Switch name="isPublished" isChecked={form.isPublished} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <Button colorScheme="primary" type="submit" isLoading={submitting}>Save Changes</Button>
              </form>
            </>
          )}
        </Box>
      </ErrorBoundary>
    </Layout>
  )
} 