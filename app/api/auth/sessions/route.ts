import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, session.user.id))

    return Response.json(userSessions)
  } catch (error) {
    console.error('[v0] Error fetching sessions:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch sessions' }), { status: 500 })
  }
}
