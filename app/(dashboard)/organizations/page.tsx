'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { useAuthClient } from '@/lib/auth-client'
import { OrgForm } from '@/components/organizations/org-form'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function OrganizationsPage() {
  const { data: session } = useAuthClient()
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-2">Create and manage your organizations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <OrgForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Sample Organization</CardTitle>
            <CardDescription>Manage your team and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">1 member</p>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
