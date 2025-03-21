import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-gray-500">Enter your new password below</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
