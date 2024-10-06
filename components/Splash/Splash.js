import { Fragment, useEffect, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import anime from 'animejs'
import styles from '../styles.js'
import Image from 'next/image'


export default function Splash() {
// const [mobile, setMobile] = useState(false)
  
//   useEffect(()=>{
//     if (window.innerWidth < 768){ setMobile(true)}
//   },[])
  
//   if (!mobile){
//   useEffect(()=> {
//     window.scrollTo(95, 95)
//   },[])
// }

// if(!mobile){
//   useEffect(()=> {
//     anime({
//       targets: '#splash-image',
//       scale:[0,1],
//       opacity:[0,1],
//       duration: 1250,
//       easing: 'easeOutQuad'
//     })
//   },[])
// }


 





    
   
   

  // const styles = {
  //   width:  500,
  //   height: 500
  // }
  // style={{display:'flex', flexDirection:'column', alignItems: 'center', alignContent:'center'}}

  return (
      <div className="w-screen h-auto scroll-smooth bg-[url('https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-main-feature-(25x16).png')] bg-contain" id="splash-image">
        <Image
          // alt="huge block letters 'S T A K' with an image of the rapper STAK inside of them"
          src="https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-main-feature-(25x16).png"
          layout='responsive'
          width={2560}
          height={1600}
          objectFit="contain"
          priority={true}
          onError={(e) => {
            e.target.src = ''
          }
        }
        />
      
      {/* { !mobile &&
        <div className="bg-black absolute top-5 w-screen h-screen opacity-40 sm:bg-cover" id="focus-mask">
        <Image
          alt="huge block letters 'S T A K' with an image of the rapper STAK inside of them"
          src="https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-main-feature-(25x16).png"
          layout='responsive'
          width={2560}
          height={1600}
          objectFit="cover"
          className="gradient"
          priority={true}
          />
        </div>
    } */}
        {/* <div className="w-full h-1/4 absolute -bottom-40 bg-gradient-to-b from-green-500/0 to-[#f1831b]">
         
          
        </div> */}
        
      </div>
  )
}
