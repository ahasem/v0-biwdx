'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function TeamsPage({ params }: { params: { id: string } }) {
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
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">Create and manage teams within this organization</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Create New Team</h2>
              <p className="text-muted-foreground">Team creation form will be displayed here</p>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Organization Teams</CardTitle>
            <CardDescription>Manage teams and their members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Teams list will be displayed here</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
