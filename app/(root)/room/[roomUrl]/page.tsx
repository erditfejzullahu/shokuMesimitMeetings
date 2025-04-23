import Header from '@/components/Header'
import MeetingComponent from '@/components/MeetingComponent';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({params}: {params: {roomUrl: string}}) => {
  const {roomUrl} = await params;
  // const response = await fetch(`https://localhost:3000/api/room/${roomUrl}`, {
  //   cache: "no-store"
  // })
  // if(!response.ok){
  //   redirect('/404')
  // }
  // const meetingDetails = await response.json();
  return (
    <>
      <Header title={`${roomUrl}`}/>
      <MeetingComponent roomUrl={roomUrl}/>
    </>
  )
}

export default page