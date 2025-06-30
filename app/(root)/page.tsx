import Header from '@/components/Header'
import InstructorsSlider from '@/components/InstructorsSlider'
import MeetingsSlider from '@/components/MeetingsSlider'
import StudentsSlider from '@/components/StudentsSlider'
import SwiperInformationRower from '@/components/SwiperInformationRower'
import Image from 'next/image'
import React from 'react'

const Page = () => {

  return (
    <>
    <Header meetingDetails={null}/>
    <section className="flex flex-row max-w-screen overflow-hidden shadow-xl" >
      <SwiperInformationRower 
        parentStyle={null}
        title='Behuni instruktor'
        paragraph1={`Shfrytezoni mundesine <span className="text-mob-secondary font-semibold">FALAS</span> per tu bere Instruktor.`}
        paragraph2={`Me ane te te behurit instruktor, ju keni mundesine e krijimit te mledhjeve online, grumbullimin e studenteve, krijimit te kurseve dhe leksioneve te ndryshme te cilat mund ti paraqitni me ane te mbledhjeve online, etj.`}
      />
      <div className="w-full">
        <InstructorsSlider/>
      </div>
    </section>
    <section>
      <MeetingsSlider />
    </section>
    <section className="flex flex-row-reverse max-w-screen overflow-hidden" >
      <SwiperInformationRower 
        parentStyle={"!mr-4 !ml-0"}
        title='Behuni studente'
        paragraph1={`Kurre nuk ka qene me lehte me u be profesionist me nje lami. Behuni <span className="text-mob-secondary font-semibold">Studente</span> tani.`}
        paragraph2={"Mund te percillni te gjitha veprimet tua, dhe sfundmi nga angazhimi juaj mund edhe te punesoheni diku!"}
      />
      <div className="w-full">
        <StudentsSlider/>
      </div>
    </section>
    </>
  )
}

export default Page