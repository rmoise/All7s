
import { CameraIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import {PortableText} from '@portabletext/react'
import about from '../../sanity_staksite/schemas/about'
import doc from '../../doc.json'

export default function About({sectionCopy}) {
  // {console.log(sectionCopy)}
  return (
  <>
      <div className=" absolute w-screen h-screen z-20 lg:text-[5.25rem] text-[2.5rem]" id="about">
        <div className="w-screen lg:h-screen flex content-center justify-center px-24 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 md:mt-24">
        {/* <p className="bg-black/5">{sectionCopy[0].body[0].children[0].text}</p> */}
        {/* {console.log(doc)}  */}
      <p className="font-Headline font-bold">{sectionCopy[0].body[0].children[0].text}</p>
        {/* <PortableText value={sectionCopy[0].body[0].children[0].text}/>  */}
        {/* <PortableText value={sectionCopy}/>  */}
       
     
       </div>
      </div>
    <div className="w-screen h-screen object-cover">
      <Image
        alt="Two photos of the artist Stak on vintage film that looks like its burning"
        src="https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-about-page.png"
        layout="responsive"
        width={1440}
        height={900}
        
      />
</div>
  </>
  )
}
