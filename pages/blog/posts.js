import AllPosts from '../../components/Blog';
import { client } from '../../lib/client';
import SEO from '../../components/common/SEO'; // Import the reusable SEO component

export default function Blog({ allPosts }) {
  return (
    <div>
      {/* SEO Component */}
      <SEO
        title="Blog - All7Z Brand"
        description="Explore our collection of blog posts covering West Coast Music, Lifestyle, and Merch."
      />

      <AllPosts postInfo={allPosts} />
    </div>
  );
}

export const getServerSideProps = async () => {
  const query = '*[_type == "post"]';

  const allPosts = await client.fetch(query);

  return {
    props: {
      allPosts,
    },
  };
};
