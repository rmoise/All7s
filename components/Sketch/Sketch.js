import React, { useEffect } from "react";
import dynamic from 'next/dynamic'
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
    ssr: false,
  })

	let x = 50;
	let y = 50;


//write a function to create the canvas with a 3d context


export default (props) => {
	const setup = (p5, canvasParentRef) => {
		// use parent to render the canvas in this ref
		// (without that p5 will render the canvas outside of your component)
      
		p5.createCanvas(p5.windowWidth/2, p5.windowHeight, p5.WEBGL).parent(canvasParentRef);
       
     
        
	};
   
	const draw = (p5) => {
		p5.background('rgba(0,0,0,0.0)');
		// p5.ellipse(x, y, 70, 70);
        let x, y;
        //write a function that creates a torus that bounces off the walls of the canvas while spinning
        //write a function that makes the torus bounce off the walls of the canvas
        //write a function that gives the torus a video texture

        //write a function to make the torus change to a random color every 5 seconds

      
            
            p5.rotateX(p5.frameCount * 0.007);
            p5.rotateY(p5.frameCount * 0.009);
            p5.rotateZ(p5.frameCount * 0.007)
            p5.translate(p5.width / 2, p5.height / 2);
            p5.translate(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);
            p5.stroke('gray')
            p5.torus(p5.windowWidth/8, p5.windowHeight/25, 16,16 );
            
            const torusColor = p5.color(p5.random(255), p5.random(255), p5.random(255))
            torusColor.setAlpha(128 + 128 * p5.sin(p5.millis() / 1000))
            p5.fill(torusColor)
            

            
            // p5.fill(255, 204, 0);
           
        
   

       


		// NOTE: Do not use setState in the draw function or in functions that are executed
		// in the draw function...
		// please use normal variables or class properties for these purposes
		x++;
	};

	return <Sketch setup={setup} draw={draw} />;
};