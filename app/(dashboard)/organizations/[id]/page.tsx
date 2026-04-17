'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">Manage organization details and preferences</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Update your organization information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Organization details form will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Manage organization members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Members list will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Manage organization teams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Teams list will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
