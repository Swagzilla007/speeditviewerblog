'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Palette,
  Type,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
             <div className="flex items-center space-x-1">
         {/* Text Size/Heading */}
         <button
           type="button"
           onClick={() => editor.chain().focus().setParagraph().run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('paragraph') ? 'bg-gray-300' : ''}`}
           title="Paragraph"
         >
           <Type className="h-4 w-4" />
         </button>
         
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
           title="Heading 1"
         >
           <Heading1 className="h-4 w-4" />
         </button>
         
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
           title="Heading 2"
         >
           <Heading2 className="h-4 w-4" />
         </button>
         
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
           title="Heading 3"
         >
           <Heading3 className="h-4 w-4" />
         </button>

         <div className="w-px h-6 bg-gray-300 mx-2"></div>

         {/* Text Formatting */}
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleBold().run()}
           disabled={!editor.can().chain().focus().toggleBold().run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
           title="Bold"
         >
           <Bold className="h-4 w-4" />
         </button>
         
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleItalic().run()}
           disabled={!editor.can().chain().focus().toggleItalic().run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
           title="Italic"
         >
           <Italic className="h-4 w-4" />
         </button>
         
         <button
           type="button"
           onClick={() => editor.chain().focus().toggleUnderline().run()}
           disabled={!editor.can().chain().focus().toggleUnderline().run()}
           className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
           title="Underline"
         >
           <UnderlineIcon className="h-4 w-4" />
         </button>

         <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''}`}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const color = prompt('Enter color (e.g., #ff0000, red, blue):')
              if (color) {
                editor.chain().focus().setColor(color).run()
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Image Upload */}
        <div className="relative">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              
              try {
                // Create form data for upload
                const formData = new FormData()
                formData.append('image', file)
                
                // Upload image
                let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                if (!baseURL.endsWith('/api')) {
                  baseURL = baseURL + '/api'
                }
                // Get the token if available (user may be logged in)
                let headers = {};
                // Use safe storage for token access
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (token) {
                  headers = {
                    'Authorization': `Bearer ${token}`
                  };
                }
                
                const response = await fetch(`${baseURL}/files/content-images`, {
                  method: 'POST',
                  body: formData,
                  // Not using credentials to avoid CORS issues
                  headers
                })
                
                if (!response.ok) {
                  const errorData = await response.text()
                  console.error('Server error response:', errorData)
                  throw new Error(`Image upload failed: ${response.status} ${response.statusText}`)
                }
                
                const data = await response.json()
                const url = data.url
                
                // Create a full URL for the image
                const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                const serverBase = serverUrl.endsWith('/api') 
                  ? serverUrl.slice(0, -4) // Remove /api
                  : serverUrl
                  
                // Insert image at current cursor position with full URL
                const fullImageUrl = url.startsWith('http') ? url : `${serverBase}${url}`
                editor.chain().focus().setImage({ src: fullImageUrl }).run()
                
                // Reset input
                event.target.value = ''
              } catch (error) {
                console.error('Image upload failed:', error)
                alert('Failed to upload image. Please try again.')
              }
            }}
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[300px] focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
} 