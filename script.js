// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const imgSelector = document.getElementById("image-input");

const canvas = document.getElementById("user-image");
const canvasCtx = canvas.getContext("2d");

const generateBttn = document.querySelector("[type='submit']");
const clearBttn = document.querySelector("[type='reset']");
const readBttn = document.querySelector("[type='button']");

const topText = document.getElementById("text-top");
const bottomText = document.getElementById("text-bottom");

const form = document.getElementById("generate-meme");

const voiceSelect = document.getElementById("voice-selection");
const voiceVolume = document.getElementById("volume-group").querySelector("input");
const voiceVolumeImg = document.getElementById("volume-group").querySelector("img");
const synth = window.speechSynthesis;
let voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas
  canvasCtx.fillStyle = 'black';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);  // Create background for non-square images

  // Draw image
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);  // Use correct dimensions
  canvasCtx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);  // Draw image

  // Set buttons to correct states
  generateBttn.disabled = false;
  clearBttn.disabled = true;
  readBttn.disabled = true;
});

// Fires when an image is selected; loads image and alt data
imgSelector.addEventListener('change', () => {
  img.src = URL.createObjectURL(imgSelector.files[0]);  // Load into img src attribute

  // Set alt field
  img.alt = imgSelector.files[0].name;
});

form.addEventListener('submit', (event) => {
  // Prevent page reload
  event.preventDefault();

  // Fetch text and make uppercase
  let top = topText.value.toUpperCase();
  let bottom = bottomText.value.toUpperCase();

  // Set text styling
  canvasCtx.font = '50px impact';
  canvasCtx.fillStyle = 'white';
  canvasCtx.strokeStyle = 'black';
  canvasCtx.lineWidth = 1;
  canvasCtx.textAlign = 'center';
  
  // Write text
  canvasCtx.fillText(top, canvas.width/2, 60, canvas.width);
  canvasCtx.strokeText(top, canvas.width/2, 60, canvas.width);
  canvasCtx.fillText(bottom, canvas.width/2, canvas.height-20, canvas.width);
  canvasCtx.strokeText(bottom, canvas.width/2, canvas.height-20, canvas.width);
  bottomText.value;

  // Set buttons to correct states
  generateBttn.disabled = true;
  clearBttn.disabled = false;
  readBttn.disabled = false;
});

// Triggered on click of clear button; clear canvas and form
clearBttn.addEventListener('click', event => {
  // Prevent form from clearing
  event.preventDefault();

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas

  // Set buttons to correct states
  generateBttn.disabled = false;
  clearBttn.disabled = true;
  readBttn.disabled = true;
});

// Triggered on click of read button; read the top and bottom text
readBttn.addEventListener('click', event => {
  var utterThis = new SpeechSynthesisUtterance(topText.value + " " + bottomText.value);
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }

  utterThis.volume = voiceVolume.value/100;

  synth.speak(utterThis);
});

// Triggered on change of volume slider; change volume icon to left of slider
voiceVolume.addEventListener('change', event => {
  let value;  // Corresponds to which volume level icon to use

  if(voiceVolume.value >= 67) {
    value = 3;
  } else if(voiceVolume.value >= 34) {
    value = 2;
  } else if(voiceVolume.value >= 1) {
    value = 1;
  } else {
    value = 0;
  }

  voiceVolumeImg.src = "icons/volume-level-" + value + ".svg";  // Update icon
});

// Triggered on page load; set default button states
document.addEventListener("DOMContentLoaded", function() {
  // Set buttons to correct states
  generateBttn.disabled = false;
  clearBttn.disabled = true;
  readBttn.disabled = true;
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// From Mozilla documentation on Speech Synthesis; populate voiceSelect field in form
function populateVoiceList() {
  voices = synth.getVoices();
  if(voices.length > 1) {
    voiceSelect.disabled = false;
    voiceSelect.querySelector('option').remove();
  }

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.label = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.label += ' -- DEFAULT';
    }

    option.value = voices[i].lang;
    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}