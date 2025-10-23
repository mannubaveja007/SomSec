import type { NextApiRequest, NextApiResponse } from 'next'
import { name, version } from '@root/package.json'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ name, version })
}
