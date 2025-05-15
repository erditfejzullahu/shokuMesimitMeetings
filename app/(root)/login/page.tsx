import React from 'react'
import LoginForm from '@/components/LoginForm'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

const Page = async () => {
  const session = await getSession()
  console.log(session);
  
  // if(session){
  //   redirect('/room')
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <LoginForm />
    </div>
  )
}

export default Page