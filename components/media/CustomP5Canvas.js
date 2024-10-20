import React, { useEffect, useRef } from 'react';

const CustomP5Canvas = () => {
  const sketchRef = useRef(null);

  useEffect(() => {
    let p5Instance;

    const loadP5 = async () => {
      // Dynamically import p5.js
      const p5Module = await import('p5');
      const p5 = p5Module.default;

      // Define the sketch
      const sketch = (p) => {
        let torusColor;
        let lastColorChange = 0;

        p.setup = () => {
          p.createCanvas(p.windowWidth / 2, p.windowHeight, p.WEBGL);
          torusColor = p.color(255, 204, 0);
        };

        p.draw = () => {
          p.background('rgba(0,0,0,0.0)');
          p.rotateX(p.frameCount * 0.007);
          p.rotateY(p.frameCount * 0.009);
          p.rotateZ(p.frameCount * 0.007);
          p.stroke('gray');
          p.torus(p.windowWidth / 8, p.windowHeight / 25, 16, 16);

          if (p.millis() - lastColorChange > 5000) {
            torusColor = p.color(p.random(255), p.random(255), p.random(255));
            lastColorChange = p.millis();
          }

          torusColor.setAlpha(128 + 128 * p.sin(p.millis() / 1000));
          p.fill(torusColor);
        };
      };

      // Initialize p5 instance with the sketch
      p5Instance = new p5(sketch, sketchRef.current);
    };

    loadP5();

    // Cleanup the p5 instance on component unmount
    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={sketchRef}></div>;
};

export default CustomP5Canvas;
