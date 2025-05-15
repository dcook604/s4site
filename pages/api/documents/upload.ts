import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import prisma from '../../../lib/prisma'

// Disable default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint.' })
  }
  
  // Check if user is admin
  if (session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'You do not have permission to perform this action.' })
  }
  
  // Only handle POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }
  
  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      uploadDir: path.join(process.cwd(), 'public/uploads/tmp'),
      keepExtensions: true,
      filter: (part) => {
        // Only accept PDF files
        return part.mimetype === 'application/pdf'
      }
    })
    
    // Ensure upload directories exist
    const tmpDir = path.join(process.cwd(), 'public/uploads/tmp')
    const uploadDir = path.join(process.cwd(), 'public/uploads/pdfs')
    
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    
    // Parse the form data
    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files<string>]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        } else {
          resolve([fields, files])
        }
      })
    })
    
    // Check for file
    const fileObj = files.file?.[0]
    if (!fileObj) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }
    
    // Get form field values
    const title = fields.title?.[0] || undefined
    const pageId = fields.pageId?.[0] || undefined
    
    if (!title) {
      return res.status(400).json({ error: 'Document title is required.' })
    }
    
    // Rename and move the file
    const fileName = `${Date.now()}-${fileObj.originalFilename}`
    const oldPath = fileObj.filepath
    const newPath = path.join(uploadDir, fileName)
    
    fs.renameSync(oldPath, newPath)
    
    // Save document in database
    const document = await prisma.document.create({
      data: {
        title,
        fileName,
        fileSize: fileObj.size,
        fileType: fileObj.mimetype || 'application/pdf',
        pageId: pageId || null,
      }
    })
    
    return res.status(200).json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        url: `/uploads/pdfs/${document.fileName}`,
      }
    })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' })
    }
    
    if (error.httpCode === 400) {
      return res.status(400).json({ error: error.message || 'Invalid file.' })
    }
    
    return res.status(500).json({ error: 'An error occurred while uploading the document.' })
  }
} 