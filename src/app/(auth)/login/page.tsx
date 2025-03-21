import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500">Enter your credentials to access your account</p>
        </div>
         <LoginForm />
         <Link href="/forgot-password">Forgot Password?</Link>
      </div>
    </div>
  )
}