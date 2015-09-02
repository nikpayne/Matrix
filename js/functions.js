/*
The animation model is conceptually an array of columns, or "streams". Each stream
(or column) is--itself--an array, an as pictured below (Imagine it rotated 90deg counter
clockwise, if that helps).  The stream has a length (max_stream_length), and each
value in it is a "tuple" that holds a random char and that char's "position."
The position value is necessary (rather than simply using index) because of the way
the animation is set up, corresponding to an actual location on the canvas, rather
than the position within the array.

stream n: [ [0,"char"] , [1,"char"] , [2, "char"] ... [max_stream_length - 1, "char"] ]

*/

/* -- "GLOBAL settings" ------------------------------------------------------*/
var canvas;
var context;
var columns;
var streams;
var font_size = 12;
var max_stream_length = 41; // must be greater than "afterburn" slider
/* ---------------------------------------------------------------------------*/

function getColumns() { return columns; }

function __setCanvas() {
  canvas = document.getElementById("canvas");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  context = canvas.getContext("2d");
  context.font = font_size + "px Matrix";
  columns = Math.floor(canvas.width/font_size) + 1; // # of vertical streams across canvas
  __initializeStreams();
}

function __initializeStreams() {
  model = [];
  for (var i = 0; i < columns; i++) {
    var stream = [];
    for (var j = 0; j < max_stream_length; j++) {
      stream.push([j,""]); // filling the stream with [empty] tuples
    }
    model.push(stream);
  }
  streams = model;
  return model;
}

function __decayFrame(decay_rate) {
  var background_opacity = decay_rate/500;
  context.fillStyle = "rgba(0,0,0," + background_opacity + ")";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function __getRandomChar(col) {
  var mtrxCode = "abcdefghijklmnopqrstuvwxyz1234567890_";
  streams[col][0][1] = mtrxCode[Math.floor(Math.random() * mtrxCode.length)];
}

function __shiftUp(col, max, toBeShifted ) {
  if( toBeShifted === "characters" ) {
    for(var k = max; k > 0; k--) {
      streams[col][k][1] = streams[col][k-1][1];
    }
  } else if( toBeShifted === "positions" ) {
    for(var k = max; k > 0; k--) {
      streams[col][k][0] = streams[col][k-1][0];
    }
  }
}

function __drawChar(col, char, color) {
  function randColor(intensity) { return Math.floor(Math.random() * intensity) + 1; }
  function setColor(rgba) { context.fillStyle = "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")"; }

  if(color === "random") {
    var r1 = Math.random(), r2 = Math.random(), r3 = Math.random();
    setColor( [randColor(100), randColor(255), randColor(100), .6] );
  } else if(color === "green") {
    setColor( [0, 255, 0, 1] );
  } else if(color === "white") {
    setColor( [150, 255, 150, 1] );
  }
  context.fillText(streams[col][char][1], col*font_size, streams[col][char][0]*font_size);
}

function __afterburn( col, char , overlay){
  context.fillStyle = "rgba(0,0,0,1)"; //black out the space for the new char
  context.fillRect( col * font_size, streams[col][char + 1][0] * font_size, font_size + 1, font_size + 1);
  context.fillStyle = "rgba(0,255,0,.8)"; //set color for new to-be-painted char
  context.fillText(streams[col][char][1], col * font_size, streams[col][char][0] * font_size);
  context.fillStyle = "rgba(" + overlay[0] + "," + overlay[1] + "," + overlay[2] + "," + overlay[3] + ")"; //simulate decay, based on "far-back-ness" of char
  context.fillRect( col * font_size, streams[col][char + 1][0] * font_size, font_size + 1, font_size + 1);
}

function __checkPosition(col) {
  if(streams[col][0][0] * font_size > canvas.height )
    streams[col][0][0] = 0; // reset position of leading edge of stream to the top
}

function __updatePosition(col) {
  function random_gap(max_gap) { return 1 + Math.floor( Math.random() * max_gap ); }
  if(max_gap > 0) { // if gaps are allowed
    var rand = Math.random();
    if(rand > .99) {
      streams[col][0][0] += random_gap(max_gap); // occasionally allow large gaps
    } else {
      if(rand > .95){
        streams[col][0][0] += random_gap(max_gap/2);
      } else {
        streams[col][0][0]++;
      }
    }
  } else {
    streams[col][0][0]++;
  }
}
