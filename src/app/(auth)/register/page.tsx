import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-gray-500">Enter your details to get started</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}