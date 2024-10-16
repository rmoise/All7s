import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// Create the context
const NavbarContext = createContext();

// Navbar Provider
export const NavbarProvider = ({ children }) => {
  const [navbarData, setNavbarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define a function to fetch the navbar data
  const fetchNavbarData = async () => {
    console.log('Starting fetchNavbarData...');

    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2022-10-29',
      useCdn: false,
    });

    try {
      setLoading(true);
      console.log('Fetching data from Sanity...');

      const navbarQuery = `*[_type == "navbar"][0]{
        logo,
        navigationLinks[]{
          name,
          href
        },
        backgroundColor,
        isTransparent
      }`;

      const musicAndVideoQuery = `*[_type == "homePage"][0]{
        contentBlocks[]{
          lookTitle,
          listenTitle
        }
      }`;

      console.log('navbarQuery:', navbarQuery);
      console.log('musicAndVideoQuery:', musicAndVideoQuery);

      const [fetchedNavbarData, musicAndVideoData] = await Promise.all([
        client.fetch(navbarQuery),
        client.fetch(musicAndVideoQuery),
      ]);

      console.log('Fetched navbar data:', fetchedNavbarData);
      console.log('Fetched music and video data:', musicAndVideoData);

      // Log the structure of contentBlocks
      console.log('contentBlocks:', musicAndVideoData?.contentBlocks);

      let updatedNavbarData = { ...fetchedNavbarData };
      updatedNavbarData.navigationLinks = [
        ...(fetchedNavbarData.navigationLinks || []),
      ];

      // Find the first block that contains lookTitle and listenTitle
      const musicAndVideoSection = musicAndVideoData?.contentBlocks?.find(
        (block) => block.lookTitle && block.listenTitle
      );

      console.log('Music and Video Section:', musicAndVideoSection);

      if (musicAndVideoSection) {
        const lookTitle = musicAndVideoSection.lookTitle;
        const listenTitle = musicAndVideoSection.listenTitle;

        console.log('Look Title:', lookTitle);
        console.log('Listen Title:', listenTitle);

        // Force update the LOOK link
        const lookIndex = updatedNavbarData.navigationLinks.findIndex(
          (link) => link.href === '/#LOOK'
        );
        if (lookIndex > -1) {
          updatedNavbarData.navigationLinks[lookIndex].name =
            lookTitle || 'LOOK';
        }

        // Force update the LISTEN link
        const listenIndex = updatedNavbarData.navigationLinks.findIndex(
          (link) => link.href === '/#LISTEN'
        );
        if (listenIndex > -1) {
          updatedNavbarData.navigationLinks[listenIndex].name =
            listenTitle || 'LISTEN';
        }

        console.log('Updated Navbar Data:', updatedNavbarData);
      }

      setNavbarData(updatedNavbarData);
      console.log('Navbar data updated successfully');
    } catch (error) {
      console.error('Error fetching navbar data:', error);
      setError(error);
    } finally {
      setLoading(false);
      console.log('Finished fetching navbar data');
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchNavbarData();
  }, []);

  return (
    <NavbarContext.Provider
      value={{ navbarData, loading, error, refreshNavbar: fetchNavbarData }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

// Custom hook for consuming the navbar context
export const useNavbar = () => {
  return useContext(NavbarContext);
};
