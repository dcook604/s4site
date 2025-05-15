import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check if we have any users
    const userCount = await prisma.user.count()
    
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      users: userCount,
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL ? 'configured' : 'missing',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL ? 'configured' : 'missing',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing'
    })
  }
} 