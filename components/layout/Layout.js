import Head from 'next/head'
import Navbar from '../Navbar';
import Footer from '../Footer';

const Layout =({children})=>{
    return (
        <>
        <div className="text-white bg-black">
            <header>
                <Navbar/>
            </header>
            <div className="main-container main-layout bg-black">
            { children } 
            </div>
            <Footer/>
        </div>
        
        
        </>
    )
}

export default Layout;