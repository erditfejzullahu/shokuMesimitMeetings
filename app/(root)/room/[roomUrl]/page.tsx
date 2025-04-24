import Header from '@/components/Header'
import MeetingComponent from '@/components/MeetingComponent';
import SocketConnection from '@/components/SocketConnection';
import { redirect } from 'next/navigation';
import React from 'react'


const Page = async ({params}: {params: {roomUrl: string}}) => {
  const {roomUrl} = await params;
  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/OnlineMeetings/GetMeetingInformtions/${roomUrl}`, {method: "GET"})
  // if(!response.ok){
  //   redirect('/404')
  // }
  // const meetingDetails = await response.json();
  return (
    <>
      <Header meetingDetails={null}/>
      {/* <MeetingComponent roomUrl={roomUrl}/> */}
      <SocketConnection roomUrl={roomUrl}/>
    </>
  )
}

export default Page