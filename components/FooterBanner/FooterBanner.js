import Link from 'next/link';
import { urlFor } from '../../lib/client'


const FooterBanner = ({ footerBanner: {desc, discount, largeText1, largeText2, midText, smallText, product, buttonText, image} }) =>{
    const date = new Date();
    return  (
        <div className="flex justify-center mt-10">
    <div className="w-3/4 flex justify-center rounded-xl">
        <div className="banner-desc">
            <div className="font-Headline lg:text-7xl md:text-5xl sm:text-5xl">
                {/* <p>{discount}</p> */}
                <h3 className="font-Headline tracking-tight">{largeText1}</h3>
                <h3 className="font-Headline tracking-tight">{largeText2}</h3>
            </div>
            <div>
              
            </div>
            {/* <Sketch/> */}
            {/* <div className="right"> 
                <p>{smallText}</p>
                <h3>{midText}</h3>
                <p>{desc}</p>
                <Link href={`/product/${product}`}>
                    <button type="button">{buttonText}</button>
                </Link> 
                 <img src={urlFor(image)}
                className="footer-banner-image"/>
            </div> */}
        </div>
    </div>
    </div>

    )
}

export default FooterBanner 
