'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberTable } from '@/components/organizations/member-table'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function MembersPage({ params }: { params: { id: string } }) {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground mt-2">Manage organization members and their roles</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>View and manage all members in this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberTable />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
