import Contact from "../components/Contact";
import CustomP5Canvas from "../components/Sketch/CustomP5Canvas";
import { client } from '../lib/client';

const ContactPage = ({ commentFetch }) => {
  return (
    <div>
      <Contact info={commentFetch} />
      <CustomP5Canvas />
    </div>
  );
};

export default ContactPage;

export const getServerSideProps = async () => {
  const query = "*[_type == 'comment']";
  const commentFetch = await client.fetch(query);

  return {
    props: {
      commentFetch
    }
  };
};
