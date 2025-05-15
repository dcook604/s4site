import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'asc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    })
    return res.status(200).json(events)
  }
  if (req.method === 'POST') {
    // Placeholder: Only allow admin (implement real check later)
    const session = await getSession({ req })
    const user = (session && (session as any).user) || null
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    // TODO: Validate input
    const { title, description, startDate, endDate, location, isPublished } = req.body
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        isPublished: !!isPublished,
        authorId: user.id,
      },
    })
    return res.status(201).json(event)
  }
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 