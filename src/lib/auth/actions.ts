'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function fazerLogin() {
  const store = await cookies()
  store.set('mock_session', 'adm', {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  redirect('/home')
}

export async function fazerLogout() {
  const store = await cookies()
  store.delete('mock_session')
  redirect('/login')
}
