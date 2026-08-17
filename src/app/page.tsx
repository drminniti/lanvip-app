import { redirect } from 'next/navigation'

/**
 * Root route "/" – redirects to /login.
 * In future phases this will render the marketing landing page.
 */
export default function Home() {
  redirect('/login')
}
