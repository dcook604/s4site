import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    return res.status(200).json(news)
  }
  if (req.method === 'POST') {
    // Placeholder: Only allow admin (implement real check later)
    const session = await getSession({ req })
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // TODO: Validate input
    const { title, slug, content, isPublished } = req.body
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        isPublished: !!isPublished,
        authorId: session.user.id,
      },
    })
    return res.status(201).json(news)
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 