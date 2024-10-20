import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// Create the context
const NavbarContext = createContext();

// Navbar Provider
export const NavbarProvider = ({ children }) => {
  const [navbarData, setNavbarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize the Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2022-10-29',
    useCdn: false,
  });

  // Define a function to fetch the navbar data
  const fetchNavbarData = async () => {
    setLoading(true);

    try {
      const [settings, homePage] = await Promise.all([
        client.fetch(`*[_type == "settings"][0]{
          navbar{
            logo,
            navigationLinks[]{name, href},
            backgroundColor,
            isTransparent
          }
        }`),
        client.fetch(`*[_type == "home"][0]{
          contentBlocks[]{
            _type == 'musicAndVideo' => {
              lookTitle,
              listenTitle
            }
          }
        }`)
      ]);

      const fetchedNavbarData = settings.navbar;
      const musicAndVideoSection = homePage?.contentBlocks?.find(
        (block) => block.lookTitle && block.listenTitle
      );

      const updatedNavbarData = {
        ...fetchedNavbarData,
        navigationLinks: fetchedNavbarData.navigationLinks || [],
      };

      if (musicAndVideoSection) {
        const { lookTitle, listenTitle } = musicAndVideoSection;

        // Update the LOOK link if found
        const lookIndex = updatedNavbarData.navigationLinks.findIndex(
          (link) => link.href === '/#LOOK'
        );
        if (lookIndex > -1) {
          updatedNavbarData.navigationLinks[lookIndex].name = lookTitle || 'LOOK';
        }

        // Update the LISTEN link if found
        const listenIndex = updatedNavbarData.navigationLinks.findIndex(
          (link) => link.href === '/#LISTEN'
        );
        if (listenIndex > -1) {
          updatedNavbarData.navigationLinks[listenIndex].name = listenTitle || 'LISTEN';
        }
      }

      setNavbarData(updatedNavbarData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
export const useNavbar = () => useContext(NavbarContext);
