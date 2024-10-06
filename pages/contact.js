import Contact from "../components/Contact"
import { client } from '../lib/client'


const ContactPage = ({commentFetch}) => {
    return(
<Contact info={commentFetch}/>
    )
}

export default ContactPage

export const getServerSideProps = async() => {
    const query = "*[_type == 'comment']" 
    const commentFetch = await client.fetch(query)
    
    return {
     props: {
       commentFetch
        }
      }
    }