"use strict";
function pong() {
    const svg = document.getElementById("canvas"), mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
    const background = new Elem(svg, 'rect')
        .attr('x', 0).attr('y', 0)
        .attr('width', 600).attr('height', 600)
        .attr('fill', 'black');
    const playpaddle = new Elem(svg, 'rect')
        .attr('x', 570).attr('y', 255)
        .attr('width', 10).attr('height', 90)
        .attr('fill', 'blue');
    const autopaddle = new Elem(svg, 'rect')
        .attr('x', 10).attr('y', 255)
        .attr('width', 10).attr('height', 90)
        .attr('fill', 'green');
    const centerline = new Elem(svg, 'rect')
        .attr('x', 300).attr('y', 10)
        .attr('width', 2).attr('height', 580)
        .attr('fill', 'white');
    const ball = new Elem(svg, 'circle')
        .attr('cx', 300).attr('cy', 300)
        .attr('r', 10)
        .attr('fill', 'red');
    let rightpaddle = playpaddle.observe('mousedown')
        .map(({ clientY }) => ({ yOffset: Number(playpaddle.attr('y')) - clientY }))
        .flatMap(({ yOffset }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientY }) => ({ y: clientY + yOffset })));
    rightpaddle.subscribe(({ y }) => playpaddle.attr('y', y));
    rightpaddle.filter(() => Number(playpaddle.attr('y')) <= 0)
        .subscribe(() => playpaddle.attr('y', 0));
    rightpaddle.filter(() => Number(playpaddle.attr('y')) + Number(playpaddle.attr('height')) >= 600)
        .subscribe(() => playpaddle.attr('y', 600 - Number(playpaddle.attr('height'))));
    const svgBoard = document.getElementById("scoreboard"), leftscore = document.getElementById("leftscore"), rightscore = document.getElementById("rightscore"), gameover = document.getElementById("gameover");
    let autoScore = 0, playerScore = 0, ballnumX = 1, ballnumY = (Math.random() > 0.5 ? 1 : -1) * Math.ceil(Math.random() * 3), padnum = 1;
    let leftpaddle = Observable.interval(10);
    let o = Observable.interval(10);
    background.observe("click")
        .subscribe(() => {
        o.filter(() => autoScore < 11 && playerScore < 11)
            .subscribe(() => (ball.attr('cx', ballnumX + Number(ball.attr('cx')))
            .attr('cy', ballnumY + Number(ball.attr('cy')))));
        leftpaddle.filter(() => autoScore < 11 && playerScore < 11)
            .subscribe(() => autopaddle.attr('y', (Number(ball.attr('cy')) - (Number(autopaddle.attr('height')) / 2)) / 1.55));
        leftpaddle.filter(() => Number(autopaddle.attr('y')) <= 0)
            .subscribe(() => autopaddle.attr('y', 0));
        leftpaddle.filter(() => Number(autopaddle.attr('y')) + Number(autopaddle.attr('height')) >= 600)
            .subscribe(() => autopaddle.attr('y', 600 - Number(autopaddle.attr('height'))));
        o.map(() => ({
            ballX: ball.attr('cx'),
            ballY: ball.attr('cy'),
            ballR: ball.attr('r'),
            playX: playpaddle.attr('x'),
            playY: playpaddle.attr('y'),
            playH: playpaddle.attr('height'),
            autoX: autopaddle.attr('x'),
            autoY: autopaddle.attr('y'),
            autoH: autopaddle.attr('height'),
            autoW: autopaddle.attr('width')
        }))
            .filter(({ ballX, ballY, ballR, playX, playY, playH, autoX, autoY, autoH, autoW }) => (Number(ballX) + Number(ballR)) == Number(playX)
            && Number(ballY) + Number(ballR) >= Number(playY)
            && Number(ballY) - Number(ballR) <= Number(playY) + Number(playH)
            || (Number(ballX) - Number(ballR) == Number(autoX) + (Number(autoW))
                && Number(ballY) - Number(ballR) >= Number(autoY)
                && Number(ballY) + Number(ballR) <= Number(autoY) + Number(autoH)))
            .subscribe(() => (ballnumX = -ballnumX));
        o.map(() => ({
            ballX: ball.attr('cx'),
            ballY: ball.attr('cy'),
            ballR: ball.attr('r')
        }))
            .filter(({ ballX, ballY, ballR }) => (Number(ballY) + Number(ballR) >= 600 || Number(ballY) - Number(ballR) <= 0))
            .subscribe(() => (ballnumY = -ballnumY));
        o.filter(() => (Number(ball.attr('cx')) >= 600))
            .subscribe(() => (autoScore += 1, ball.attr('cx', 300).attr('cy', 300), autopaddle.attr('y', 255),
            leftscore.innerHTML = `${autoScore}`));
        o.filter(() => (Number(ball.attr('cx')) <= 0))
            .subscribe(() => (playerScore += 1, ball.attr('cx', 300).attr('cy', 300), autopaddle.attr('y', 255),
            rightscore.innerHTML = `${playerScore}`));
        o.filter(() => autoScore == 11)
            .subscribe(() => gameover.innerHTML = `YOU LOSE :(`);
        o.filter(() => playerScore == 11)
            .subscribe(() => gameover.innerHTML = `YOU WON!!`);
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map