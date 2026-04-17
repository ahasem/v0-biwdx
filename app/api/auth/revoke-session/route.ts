import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()
    const session = await auth.api.getSession()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    await db.delete(sessions).where(eq(sessions.id, sessionId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Error revoking session:', error)
    return new Response(JSON.stringify({ error: 'Failed to revoke session' }), { status: 500 })
  }
}
