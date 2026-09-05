'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { requestPasswordReset, type AuthResult } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="btn-primary w-full" disabled={pending} type="submit">{pending ? 'Sending…' : 'Send Reset Link'}</button>;
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<AuthResult, FormData>(requestPasswordReset, {});
  const sent = useSearchParams().get('sent');
  return (
    <div>
      <h1 className="text-2xl text-maroon-900">Reset password</h1>
      <p className="mt-1 text-sm text-maroon-500">We&apos;ll email you a secure reset link.</p>
      {sent && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">If that email exists, a reset link is on its way.</p>}
      {state.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <form action={formAction} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" /></div>
        <SubmitButton />
      </form>
      <p className="mt-4 text-center text-sm"><Link href="/login" className="text-saffron-700 hover:underline">Back to sign in</Link></p>
    </div>
  );
}
