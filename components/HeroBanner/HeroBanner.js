import Link from 'next/link'
import { urlFor } from '../../lib/client'
import { AiOutlineShopping } from 'react-icons/ai'



const HeroBanner = ({ heroBanner }) => {
  
return(
<div className="mt-28">
    
    <div className="flex flex-col items-center ">
        <p className="beats-solo font-Headline ml-0">{heroBanner.smallText}</p>
        <h3 className="font-Headline md: text-5xl sm:text-2xl">{heroBanner.midText}</h3>
        <h1 className="font-Headline md:text-8xl sm:text-5xl">{heroBanner.largeText1}</h1>
        {/* <img src={urlFor(heroBanner.image)} alt="ALL7Z PRODUCT" className="hero-banner-image mt-8 md:w-1/16 md:h-1/16" /> */}
        <div>
            {/* <Link href={`/product/${heroBanner.product}`}>
            <button type='button'>{heroBanner.buttonText}</button>
            </Link> */}
            {/* <div className="desc">
                <h5>About this product</h5>
                <p>{heroBanner.desc}</p>
            </div> */}
            
        </div>
    </div>

</div>


)

}

export default HeroBanner