import React, { useState, useEffect } from 'react';
import getYouTubeID from 'get-youtube-id';
import anime from 'animejs';
import { urlFor } from '../../lib/client';

export default function MusicAndVideo(videoPreLink) {
  const soundCloudMusic = videoPreLink?.videoPreLink?.musicLink?.map((album) => {
    switch (album?.description) {
      case 'ALLOW IT, BELIEVE IT (2022)':
        album.order = 1;
        break;
      case 'BIG STAK, BIG STAK OOOOHHH!!!!! (2021)':
        album.order = 2;
        break;
      case 'FOODSAVERS (2021)':
        album.order = 3;
        break;
      case '24/7 (2021)':
        album.order = 4;
        break;
      case 'STAK ‘N EASY (2021)':
        album.order = 5;
        break;
      case 'TEDDY EP (2020)':
        album.order = 6;
        break;
      case '777 (2016)':
        album.order = 7;
        break;
      default:
        break;
    }
    return album;
  })?.sort((a, b) => a.order - b.order) || [];

  const [play, setPlay] = useState(
    <div className="text-9xl flex flex-col justify-center items-center">
      {soundCloudMusic.map((album, index) => (
        <div key={index} className="album-div flex flex-col items-center justify-center" onClick={() => handleClick()}>
          <p className="rounded-lg text-2xl w-1/2 mb-3 font-Headline text-white">{album?.description}</p>
          <div className="flex flex-col items-center drop-shadow-2xl">
            <img
              className="bg-black/20 z-30 mb-8 w-1/2 h-auto transition-all hover:border-red-400/50 hover:scale-75 border-black/50 border-8 rounded-lg ease-linear duration-500"
              id="album"
              src={urlFor(album?.image)}
              alt={album?.description}
            />
          </div>
        </div>
      ))}
    </div>
  );

  function handleClick() {
    setPlay(
      <div className="flex items-center justify-center flex-wrap gap-x-12">
        {soundCloudMusic.map((album, index) => (
          <div key={index} className="album div w-96 mb-12" dangerouslySetInnerHTML={{ __html: album?.body?.[0]?.children?.[0]?.text || 'No content' }}></div>
        ))}
      </div>
    );

    anime({
      targets: '.album-div',
      translateX: [-10, 0],
      duration: 2000,
      easing: 'easeOutQuad',
    });
  }

  useEffect(() => {
    let elementClicked = false;
    anime({
      targets: '.album-div',
      translateX: elementClicked ? -20 : 0,
      duration: 4000,
      easing: 'easeOutQuad',
    });
  }, [play]);

  const getUrl = videoPreLink?.videoPreLink?.heroLink?.[0]?.url;
  const id = getUrl ? getYouTubeID(getUrl) : null;
  const url = id ? `https://www.youtube.com/embed/${id}` : '';

  useEffect(() => {
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const video = document.querySelector('.vid');
      let playState = null;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            video.pause();
            playState = false;
          } else {
            video.play();
            playState = true;
          }
        });
      });
      observer.observe(video);
      const onVisibilityChange = () => {
        if (document.hidden || !playState) {
          video.pause();
        } else {
          video.play();
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
  });

  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobile(true);
      } else {
        setMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {!mobile ? (
        <video className="vid sticky top-0 w-screen h-screen z-10" src="https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/smoke-transition-bg.mp4" muted></video>
      ) : (
        <img src="/stak-tape.png" className="mb-12 -z-5" alt="Stak tape" />
      )}

      <div className="parallax-container flex flex-col items-center justify-center w-full h-full z-10">
        <div className="z-30 flex flex-col items-center justify-center mb-20 w-screen">
          <div className="mb-12 rounded-lg">
            <p className="text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold" id="LOOK">
              LOOK
            </p>
          </div>
          <iframe
            className="w-3/4 h-screen border-8 border-black/50"
            src={url}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            modestbranding="1"
            frameBorder="0"
          />
        </div>

        <div className="w-screen grid-container px-12 mt-12 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-2 z-50">
          {videoPreLink?.videoPreLink?.vidLink?.map((video, i) => {
            const getVid = video?.url;
            const id2 = getYouTubeID(getVid);
            const url2 = `https://www.youtube.com/embed/${id2}`;
            return (
              <iframe
                key={i}
                className="w-full z-50 border-8 border-black/50 rounded-lg"
                src={url2}
                width={500}
                height={500}
                alt="video"
                allow="fullscreen"
              />
            );
          })}
        </div>

        <div className="w-3/4 flex mt-12 gap-y-12 flex-col items-center z-30">
          <div className="mb-12 rounded-lg flex items-center justify-center w-1/2">
            <p className="text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold" id="LISTEN">
              LISTEN
            </p>
          </div>
          <div onClick={handleClick}>{play}</div>
        </div>
      </div>
    </>
  );
}
