'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InvitationList } from '@/components/organizations/invitation-list'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function InvitationsPage({ params }: { params: { id: string } }) {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground mt-2">Manage pending invitations</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>View and manage all pending member invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationList orgId={params.id} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
