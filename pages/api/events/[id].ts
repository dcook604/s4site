import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' })

  if (req.method === 'GET') {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    if (!event) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(event)
  }
  if (req.method === 'PUT') {
    const session = await getSession({ req })
    const user = (session && (session as any).user) || null
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // TODO: Validate input
    const { title, description, startDate, endDate, location, isPublished } = req.body
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        isPublished: !!isPublished,
      },
    })
    return res.status(200).json(event)
  }
  if (req.method === 'DELETE') {
    const session = await getSession({ req })
    const user = (session && (session as any).user) || null
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await prisma.event.delete({ where: { id } })
    return res.status(204).end()
  }
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 