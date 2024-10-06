// import Ecwid from "../components/Ecwid"
import Link from "next/link"
import { useEffect } from "react"
import HeroBanner from "../components/HeroBanner"
import Product from "../components/Product"
import FooterBanner from "../components/FooterBanner/FooterBanner"
import { client } from "../lib/client"
// import { useStateContext } from '../../context/StateContext'
import Sketch from '../components/Sketch/'
// import  { ProductBrowser } from '@ecwid/nextjs-ecwid-plugin'
// import dynamic from "next/dynamic"

// const ProductBrowserClient = dynamic(async () => (await import('@ecwid/nextjs-ecwid-plugin')).ProductBrowser, { ssr: false })
// const {mobile, setMobile } = useStateContext();


const Shop = ({products, bannerData}) => {
//   useEffect(() => {
//   if (window.innerWidth < 768) {
//     setMobile(true);
//   }
// }, []);

return (

      <div className="layout">
      <div className="main-container">

      <HeroBanner heroBanner={bannerData.length && bannerData[0]}/>
        <div className="products-heading">

          <h2 className="text-white font-Headline">SHOP ALL7Z</h2>
        </div>

        <div className="products-container">
          {products?.map((product)=> <Product key={product._id} product={product}/>)}

        </div>
        <FooterBanner footerBanner={bannerData && bannerData[0]}/>
        </div>
      </div>
    )}


  export const getServerSideProps = async () => {
    const query = '*[_type == "product"]'
    const bannerQuery = '*[_type == "banner"]'
    const products = await client.fetch(query)
    const bannerData = await client.fetch(bannerQuery)
    return {
      props: {
        products, bannerData
      }
    }
  }



    {/* <ProductBrowser
      storeId="81732001"
      /> */}

  export default Shop;