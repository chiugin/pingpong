// FIT2102 2018 Assignment 1
// https://docs.google.com/document/d/1woMAgJVf1oL3M49Q8N3E1ykTuTu5_r28_MQPVS5QIVo/edit?usp=sharing


/*
Name : Chong Chiu Gin
Student ID : 28842022

Modification is made on file pong.html and pong.ts 

I first created some SVG elements for the paddles, ball and scoreboard. The attributes for each element is specified.
The right paddle is the player's paddle whereas the left paddle is the paddle controlled by computer. 
The right paddle will observe the mouse movement of player and move up and down the canvas following the mouse cursor.
Conditions are set so that the paddle will not exceed the lower and upper boundary of the canvas.

The ball is made to move continously until a goal is made. Ball and left paddle will return to starting position 
when a goal is made. A new round begins until either player scores 11.
When ball hits paddle, it will reflect due to change in x-coordinates. 

Left paddle follows movement of ball. If ball moves up, paddle moves up. If paddle moves down, paddles moves down. 
*/

function pong() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in pong.html, animate them, and make them interactive.
  // Study and complete the tasks in basicexamples.ts first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.

  const 
    svg:HTMLElement = document.getElementById("canvas")!,
    mousemove:Observable<MouseEvent> = Observable.fromEvent<MouseEvent>(svg, 'mousemove'),
    mouseup:Observable<MouseEvent> = Observable.fromEvent<MouseEvent>(svg, 'mouseup');
  const background:Elem = new Elem(svg, 'rect') //create element rectangle for player paddle
    .attr('x', 0)    .attr('y', 0)
    .attr('width', 600).attr('height', 600)
    .attr('fill', 'black');
  const playpaddle:Elem = new Elem(svg, 'rect') //create element rectangle for player paddle
            .attr('x', 570)    .attr('y', 255)
            .attr('width', 10).attr('height', 90)
            .attr('fill', 'blue');
  const autopaddle:Elem = new Elem(svg,'rect') //create element rectangle for automatic paddle
            .attr('x', 10)    .attr('y', 255)
            .attr('width', 10).attr('height', 90)
            .attr('fill', 'green');
  const centerline:Elem = new Elem(svg,'rect')  //create the centerline in the middle of the canvas
            .attr('x', 300)    .attr('y', 10)
            .attr('width', 2).attr('height', 580)
            .attr('fill', 'white');
  const ball:Elem = new Elem(svg, 'circle')     //create circle to represent ball
            .attr('cx',300)  .attr('cy',300)
            .attr('r', 10)
            .attr('fill', 'red');

  /*
  for rightpaddle, which is the player paddle, using reference from basicexamples.ts for dragging rectangle, 
  I implement the right paddle using the same way but only allow changes of y-coordinates to be made so it can only go up and down
  depending on the mouse. 
  */
  let rightpaddle = playpaddle.observe<MouseEvent>('mousedown')
      .map(({clientY}) => ({yOffset: Number(playpaddle.attr('y')) - clientY }))
      .flatMap(({ yOffset}) =>
          mousemove
          .takeUntil(mouseup)
          .map(({clientY}) => ({ y: clientY + yOffset })))
      rightpaddle.subscribe(({y}) =>
          playpaddle.attr('y', y));

  //this is to set condition to make sure paddle does not exceed upper boundary of canvas
  rightpaddle.filter(()=>Number(playpaddle.attr('y'))<=0)
             .subscribe(()=>playpaddle.attr('y',0));

  //this is set condition to make sure paddle will not exceed lower boundary of canvas
  rightpaddle.filter(()=>Number(playpaddle.attr('y'))+Number(playpaddle.attr('height'))>=600)
             .subscribe(()=>playpaddle.attr('y',600 - Number(playpaddle.attr('height'))));
   
  //SVG elements to display scoreboard 
  //the scoreboard will change what they're meant to display as the game continues
  const svgBoard:HTMLElement =document.getElementById("scoreboard")!,
        leftscore:HTMLElement = document.getElementById("leftscore")!,    //leftscore represents computer score
        rightscore:HTMLElement = document.getElementById("rightscore")!,  //rightscore represents player score
        gameover:HTMLElement = document.getElementById("gameover")!;

  let autoScore:number = 0,   //to keep track of computer score
      playerScore:number = 0, //keep track of player score
      ballnumX:number = 1,  //movement for ball's x-coordinate
      ballnumY:number = (Math.random()>0.5 ? 1 : -1 ) * Math.ceil(Math.random()*3), //the movement for ball's y-coordinate
      padnum:number = 1;    //for auto paddle y-coordinate movement


  //two observables are implemented: one used for ball and one used for auto paddle
  let leftpaddle:Observable<number> = Observable.interval(10)
  let o:Observable<number> = Observable.interval(10)

//player needs to click on the game canvas to start playing
background.observe<MouseEvent>("click")
    .subscribe(()=>{

      //as long as non of the player or the computer score reaches 11, the game will run
      o.filter(()=>autoScore<11 && playerScore<11)
        .subscribe(()=>(ball.attr('cx', ballnumX+Number(ball.attr('cx')))
                          .attr('cy', ballnumY+Number(ball.attr('cy')))));
      
      //left paddle follow ball movement
      leftpaddle.filter(()=>autoScore<11 && playerScore<11)
                .subscribe(()=>autopaddle.attr('y', ( Number(ball.attr('cy')) - (Number(autopaddle.attr('height'))/2) ) /1.55 ));
                                
      
      //ensure computer paddle does not exceed the upper canvas boundary
      leftpaddle.filter(()=>Number(autopaddle.attr('y'))<=0)
                .subscribe(()=> autopaddle.attr('y',0)); //y-coordinate of paddle stays 0 
      
      //ensure computer paddle does not exceed the lower canvas boundary
      leftpaddle.filter(()=> Number(autopaddle.attr('y'))+Number(autopaddle.attr('height'))>=600)
                .subscribe(()=> autopaddle.attr('y',600-Number(autopaddle.attr('height'))));
                     
      //conditions to ensure ball will reflect when it hits either paddle
      //to ensure ball will not go through paddle
      //first 3 conditions refers to player paddle
      // next 3 conditions refers to auto paddle
      o.map(()=> ({
        ballX : ball.attr('cx'),
        ballY : ball.attr('cy'),
        ballR : ball.attr('r'),
        playX : playpaddle.attr('x'),
        playY : playpaddle.attr('y'),
        playH : playpaddle.attr('height'),
        autoX : autopaddle.attr('x'),
        autoY : autopaddle.attr('y'),
        autoH : autopaddle.attr('height'),
        autoW : autopaddle.attr('width')
      }))
      .filter(({ballX,ballY,ballR,playX,playY,playH,autoX,autoY,autoH, autoW})=>
      (Number(ballX)+Number(ballR))==Number(playX) 
      && Number(ballY)+Number(ballR)>= Number(playY) 
      && Number(ballY)-Number(ballR)<= Number(playY)+Number(playH)
      || (Number(ballX)-Number(ballR)==Number(autoX)+(Number(autoW)) 
      && Number(ballY)-Number(ballR)>= Number(autoY) 
      && Number(ballY)+Number(ballR)<= Number(autoY)+Number(autoH)) )
      .subscribe(()=> (ballnumX= -ballnumX));

      //ball will reflect whenever it hits the upper boundary and lower boudary of canvas to ensure ball stays in the game
      o.map(()=> ({
        ballX : ball.attr('cx'),
        ballY : ball.attr('cy'),
        ballR : ball.attr('r')
        }))
      .filter(({ballX, ballY, ballR})=>
      (Number(ballY)+Number(ballR)>=600 || Number(ballY)-Number(ballR)<=0))
      .subscribe(()=> ( ballnumY = -ballnumY));

      //when ball passes player paddle (right paddle), score for player is increased
      //ball and paddle goes back to original starting position for a new round and scoreboard is updated at HTML
      o.filter(()=> (Number(ball.attr('cx'))>=600))
      .subscribe(()=>(autoScore += 1,ball.attr('cx',300).attr('cy',300),autopaddle.attr('y', 255),
                      leftscore.innerHTML = `${autoScore}`)); //score updated using HTML

      //when ball passes auto paddle (left paddle), score for auto is increased
      //ball and paddle goes back to original starting position for a new round and scoreboard is updated at HTML
      o.filter(()=> (Number(ball.attr('cx'))<=0))
      .subscribe(()=>(playerScore += 1,ball.attr('cx',300).attr('cy',300),autopaddle.attr('y', 255),
                      rightscore.innerHTML = `${playerScore}`)); //score updated using HTML

      //when autoScore reaches 11, game ends and indicates player has lost
      o.filter(()=>autoScore==11)
      .subscribe(()=>gameover.innerHTML = `YOU LOSE :(`)

      //when playerScore reaches 11, game ends and indicate player has won!
      o.filter(()=>playerScore==11)
      .subscribe(()=>gameover.innerHTML = `YOU WON!!`)

      })
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
  }

 

 