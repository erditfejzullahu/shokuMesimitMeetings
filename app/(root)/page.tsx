import Header from '@/components/Header'
import InstructorsSlider from '@/components/InstructorsSlider'
import MeetingsSlider from '@/components/MeetingsSlider'
import StudentsSlider from '@/components/StudentsSlider'
import React from 'react'

const Page = () => {

  return (
    <>
    <Header meetingDetails={null}/>
    <section>
      <InstructorsSlider />
    </section>
    <section>
      <MeetingsSlider />
    </section>
    <section>
      <StudentsSlider />
    </section>
    </>
  )
}

export default Page