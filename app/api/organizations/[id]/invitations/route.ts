import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { invitations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET({ params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const orgInvitations = await db
      .select()
      .from(invitations)
      .where(eq(invitations.organizationId, params.id))

    return Response.json(orgInvitations)
  } catch (error) {
    console.error('[v0] Error fetching invitations:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch invitations' }), { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { email, role } = await req.json()

    const invitation = await db
      .insert(invitations)
      .values({
        organizationId: params.id,
        email,
        role: role || 'member',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
      .returning()

    // TODO: Send invitation email with verification link
    console.log('[v0] Invitation created. Send email to:', email)

    return Response.json(invitation[0])
  } catch (error) {
    console.error('[v0] Error creating invitation:', error)
    return new Response(JSON.stringify({ error: 'Failed to create invitation' }), { status: 500 })
  }
}
