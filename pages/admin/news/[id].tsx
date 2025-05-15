import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import { Heading, Box, Text, Spinner, FormControl, FormLabel, Input, Switch, Button, Textarea, useToast } from '@chakra-ui/react'
import useSWR from 'swr'
import ErrorBoundary from '../../../components/ErrorBoundary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EditNews() {
  const router = useRouter()
  const { id } = router.query
  const { data: news, isLoading, error, mutate } = useSWR<any>(id ? `/api/news/${id}` : null, fetcher)
  const [form, setForm] = useState({ title: '', slug: '', content: '', isPublished: false })
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (news) {
      setForm({
        title: news.title || '',
        slug: news.slug || '',
        content: news.content || '',
        isPublished: !!news.isPublished
      })
    }
  }, [news])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch(`/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSubmitting(false)
    if (res.ok) {
      toast({ title: 'News updated', status: 'success', duration: 3000, isClosable: true })
      mutate()
    } else {
      toast({ title: 'Failed to update news', status: 'error', duration: 3000, isClosable: true })
    }
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Box py={10} maxW="600px" mx="auto">
          {isLoading ? <Spinner /> : error ? (
            <Text color="red.500">An error occurred while fetching the news article.</Text>
          ) : !news ? (
            <Text>News not found.</Text>
          ) : (
            <>
              <Heading as="h1" size="xl" mb={6}>Edit News</Heading>
              <form onSubmit={handleSave}>
                <FormControl mb={4} isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input name="title" value={form.title} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel>Slug</FormLabel>
                  <Input name="slug" value={form.slug} onChange={handleChange} disabled={submitting} />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel>Content</FormLabel>
                  <Textarea name="content" value={form.content} onChange={handleChange} disabled={submitting} />
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