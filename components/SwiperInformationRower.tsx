import Image from 'next/image'
import React from 'react'

const SwiperInformationRower = ({parentStyle, title, paragraph1, paragraph2}: {parentStyle: string | null; title: string; paragraph1: string | null; paragraph2: string|null}) => {
  return (
    <div className={`border-4 flex-1 min-w-[300px] flex flex-col justify-between gap-2 border-black-200 bg-mob-primary shadow-lg shadow-black rounded-xl my-6 p-4 ml-4 ${parentStyle}`}>
    <div>
        <div className="relative">
        <h2 className="font-semibold text-xl uppercase text-center !text-white leading-5">{title}</h2>
        <Image src={"/assets/images/path.png"} width={100} height={50} alt='path' className="absolute -bottom-4 right-0"/>
        </div>
        {paragraph1 && (<p className="text-gray-200 text-sm font-normal mt-4 text-center" dangerouslySetInnerHTML={{__html: paragraph1}}></p>)}
        {paragraph2 && <br />}
        {paragraph2 && (<p className="text-gray-200 text-sm font-normal text-center" dangerouslySetInnerHTML={{__html: paragraph2}}></p>)}
    </div>
    <div>
        <button className="bg-mob-secondary cursor-pointer px-4 py-1.5 rounded-md font-medium text-white w-full border-4 border-mob-secondary hover:bg-mob-oBlack hover:border-black-200">Behuni instruktor</button>
    </div>
    </div>
  )
}

export default SwiperInformationRower