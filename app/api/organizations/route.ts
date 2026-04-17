import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { organizations, organizationMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const userOrgs = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, session.user.id))

    return Response.json(userOrgs)
  } catch (error) {
    console.error('[v0] Error fetching organizations:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch organizations' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { name, slug } = await req.json()

    const org = await db
      .insert(organizations)
      .values({
        name,
        slug,
        createdAt: new Date(),
      })
      .returning()

    await db.insert(organizationMembers).values({
      organizationId: org[0].id,
      userId: session.user.id,
      role: 'owner',
      createdAt: new Date(),
    })

    return Response.json(org[0])
  } catch (error) {
    console.error('[v0] Error creating organization:', error)
    return new Response(JSON.stringify({ error: 'Failed to create organization' }), { status: 500 })
  }
}
