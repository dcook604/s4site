import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Tooltip,
  HStack,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  CloseButton,
  Text,
  useDisclosure,
  Divider,
} from '@chakra-ui/react'
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
  FaLink,
  FaUnlink,
  FaHeading,
  FaImage,
  FaCode,
} from 'react-icons/fa'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function Editor({ content, onChange, placeholder = 'Start writing...' }: EditorProps) {
  const [url, setUrl] = useState('')
  const linkPopover = useDisclosure()
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })
  
  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])
  
  if (!editor) {
    return null
  }
  
  const setLink = () => {
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      setUrl('')
      linkPopover.onClose()
    }
  }
  
  return (
    <Box
      border="1px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      borderRadius="md"
      overflow="hidden"
    >
      <Flex
        p={2}
        borderBottomWidth="1px"
        borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}
        bg={{ base: 'gray.50', _dark: 'gray.800' }}
        wrap="wrap"
        gap={1}
      >
        <ButtonGroup size="sm" isAttached variant="outline" mr={2} mb={1}>
          <Tooltip label="Bold" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              aria-label="Bold"
            >
              <Icon as={FaBold} />
            </Button>
          </Tooltip>
          <Tooltip label="Italic" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              aria-label="Italic"
            >
              <Icon as={FaItalic} />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline" mr={2} mb={1}>
          <Tooltip label="Heading 1" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
              aria-label="Heading 1"
            >
              <Text fontWeight="bold">H1</Text>
            </Button>
          </Tooltip>
          <Tooltip label="Heading 2" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              aria-label="Heading 2"
            >
              <Text fontWeight="bold">H2</Text>
            </Button>
          </Tooltip>
          <Tooltip label="Heading 3" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              aria-label="Heading 3"
            >
              <Text fontWeight="bold">H3</Text>
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline" mr={2} mb={1}>
          <Tooltip label="Bullet List" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              aria-label="Bullet List"
            >
              <Icon as={FaListUl} />
            </Button>
          </Tooltip>
          <Tooltip label="Ordered List" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
              aria-label="Ordered List"
            >
              <Icon as={FaListOl} />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline" mr={2} mb={1}>
          <Tooltip label="Blockquote" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
              aria-label="Blockquote"
            >
              <Icon as={FaQuoteLeft} />
            </Button>
          </Tooltip>
          <Tooltip label="Code Block" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
              aria-label="Code Block"
            >
              <Icon as={FaCode} />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline" mr={2} mb={1}>
          <Popover isOpen={linkPopover.isOpen} onOpen={linkPopover.onOpen} onClose={linkPopover.onClose} placement="bottom" closeOnBlur={false}>
            <PopoverTrigger>
              <Button
                className={editor.isActive('link') ? 'is-active' : ''}
                aria-label="Link"
              >
                <Icon as={FaLink} />
              </Button>
            </PopoverTrigger>
            <PopoverContent p={1} w="300px">
              <PopoverArrow />
              <CloseButton />
              <PopoverBody>
                <Box mb={2}>
                  <Text fontWeight="bold">URL</Text>
                </Box>
                <HStack>
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        setLink()
                      }
                    }}
                  />
                  <Button size="sm" onClick={setLink} colorScheme="primary">
                    Add
                  </Button>
                </HStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Tooltip label="Unlink" hasArrow placement="top">
            <Button
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
              aria-label="Unlink"
            >
              <Icon as={FaUnlink} />
            </Button>
          </Tooltip>
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline" mb={1}>
          <Tooltip content="Undo" placement="top">
            <Button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              aria-label="Undo"
            >
              <Icon as={FaUndo} />
            </Button>
          </Tooltip>
          <Tooltip content="Redo" placement="top">
            <Button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              aria-label="Redo"
            >
              <Icon as={FaRedo} />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Flex>
      
      <Box 
        borderRadius="0 0 md md"
        bg={{ base: 'white', _dark: 'gray.700' }}
        p={2}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
} 