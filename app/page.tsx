'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthClient } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { data: session, isPending } = useAuthClient()

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <motion.main
        className="flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Hasem
          </h1>
          <p className="max-w-md mx-auto text-lg text-muted-foreground">
            Advanced authentication system with email OTP, 2FA, passkeys, social login, and organization management.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            size="lg"
            onClick={() => router.push('/register')}
            className="gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </motion.div>

        <motion.div
          className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
            <h3 className="font-semibold mb-2">Secure Authentication</h3>
            <p className="text-sm text-muted-foreground">Email OTP, passwords, passkeys, and social login</p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
            <h3 className="font-semibold mb-2">Two-Factor Auth</h3>
            <p className="text-sm text-muted-foreground">TOTP-based 2FA with backup codes and recovery</p>
          </div>
          <div className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
            <h3 className="font-semibold mb-2">Teams & Orgs</h3>
            <p className="text-sm text-muted-foreground">Manage organizations, teams, and member roles</p>
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
