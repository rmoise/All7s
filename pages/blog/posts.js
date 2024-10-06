import AllPosts from '../../components/Blog'
import { client } from '../../lib/client'

export default function Blog(allPosts) {
    return (
     
      <div className="">
       <AllPosts postInfo = {allPosts.allPosts} />
      
       {/* //passes the array of objects to the allPost component */}
      </div>
    )
  }
  
  export const getServerSideProps = async () => {
      const query = '*[_type == "post"]'
      
    
      const allPosts = await client.fetch(query)
     
      
      //returns object with an array of objects in it
      return {
        props: {
          allPosts,
         
        }
      }
    }
     

      
    
   
