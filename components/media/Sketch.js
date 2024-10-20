import React, { useEffect, useRef } from 'react';

const Sketch = () => {
  const sketchRef = useRef(null);

  useEffect(() => {
    let p5Instance;

    const loadP5 = async () => {
      // Dynamically import p5.js
      const p5Module = await import('p5');
      const p5 = p5Module.default;

      // Define the sketch
      const sketch = (p) => {
        let xSpeed = 3;
        let ySpeed = 2;
        let torusColor;
        let lastColorChange = 0;
        let xPos, yPos;

        p.setup = () => {
          p.createCanvas(p.windowWidth / 2, p.windowHeight, p.WEBGL);
          torusColor = p.color(255, 204, 0);
        };

        p.draw = () => {
          p.background('rgba(0, 0, 0, 0.0)');

          if (p.millis() - lastColorChange > 5000) {
            torusColor = p.color(p.random(255), p.random(255), p.random(255));
            lastColorChange = p.millis();
          }

          torusColor.setAlpha(128 + 128 * p.sin(p.millis() / 1000));
          p.fill(torusColor);
          p.stroke('gray');

          p.rotateX(p.frameCount * 0.007);
          p.rotateY(p.frameCount * 0.009);
          p.rotateZ(p.frameCount * 0.007);

          xPos = (p.mouseX - p.width / 2) + xSpeed;
          yPos = (p.mouseY - p.height / 2) + ySpeed;

          if (xPos > p.width / 2 || xPos < -p.width / 2) {
            xSpeed *= -1;
          }
          if (yPos > p.height / 2 || yPos < -p.height / 2) {
            ySpeed *= -1;
          }

          p.translate(xPos, yPos);
          p.torus(p.windowWidth / 8, p.windowHeight / 25, 16, 16);
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

  return <div ref={sketchRef} />;
};

export default Sketch;
