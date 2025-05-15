import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Basic health check
    res.status(200).json({ status: 'healthy' })
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: 'Health check failed' })
  }
} 