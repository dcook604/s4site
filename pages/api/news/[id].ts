import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' })

  if (req.method === 'GET') {
    const news = await prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    if (!news) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(news)
  }
  if (req.method === 'PUT') {
    const session = await getSession({ req })
    const user = (session && (session as any).user) || null
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // TODO: Validate input
    const { title, slug, content, isPublished } = req.body
    const news = await prisma.news.update({
      where: { id },
      data: { title, slug, content, isPublished: !!isPublished },
    })
    return res.status(200).json(news)
  }
  if (req.method === 'DELETE') {
    const session = await getSession({ req })
    const user = (session && (session as any).user) || null
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await prisma.news.delete({ where: { id } })
    return res.status(204).end()
  }
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 