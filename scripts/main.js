'use strict';

// private variables
let aliceTextRaw, aliceText, annotatedText, $xmlData;
let annotations = [];
const $container = $('#container');

const textFileLocation = '../data/ch08.txt';
const xmlFileLocation = '../data/ch08.txt.xml';

// multipurpose ajax data load function
// let loader = function(fileLocation, fileType) {
//   $.ajax({
//     url: fileLocation,
//     dataType: fileType
//   })
//   .done(function(resolve) {
//     console.log(resolve);
//   })
//   .fail(function(error) {
//     console.log(fileType + ' load error: ' + error.status);
//   });
// }

// multipurpose ajax data load function
const loader = function(fileLocation, fileType) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: fileLocation,
      dataType: fileType
    })
    .done(function(data) {
      // console.log(data);
      resolve(data);
    })
    .fail(function(error) {
      console.log(fileType + ' load error: ' + error.status);
    });
  });
}

// method to push locally produced annotation objects into private annotations array
function parseAnnotations () {
  const $xmlParseCollection = $xmlData.find(`span`);
  console.log($xmlParseCollection);
  // jQuery each to iterate over each value in the resulting collection object and mirror text content and character position properties in a new object
  $xmlParseCollection.each((key, value) => {
    // category property for later styling
    let category = value.attributes[0].value.toLowerCase();
    console.log("category", category);
    // position mining and integer casting
    let startPosition = parseInt(value.children[0].children[0].attributes[1].value);
    let endPosition = parseInt(value.children[0].children[0].attributes[0].value);
    let innerText = value.children[0].children[0].innerHTML;
    // aggregate local variables into annotation object
    let localAnnotation = { startPosition, endPosition, innerText, category };
    // console.log("localAnnotation", localAnnotation);
    // push to private annotations array
    addToAnnotations(localAnnotation);
  });
  console.log("annotations after parse", annotations);
}
// set private xml variable with jQuery conversion
function setXml (rawXML) {
  $xmlData = $(rawXML);
}

// set private annotations array
function addToAnnotations (arrayElement) {
  annotations.push(arrayElement);
}

// returns string
function spliceSpan(str, index, add) {
  return str.slice(0, index) + (add || "") + str.slice(index, str.length);
}
function displayAnnotations() {
  annotatedText = aliceTextRaw;
  let spanStartString, spanEndString;
  // reverse annotations to apply span tags from end of text to beginning (position information should remain relevant throughout)
  let reverseAnnotations = annotations.reverse();
  reverseAnnotations.forEach((annotation) => {
    spanStartString = `<span class='${annotation.category}'>`;
    spanEndString = `</span>`;
    // console.log("aliceTextRaw", aliceTextRaw);

    // insert ending tag first to align with reverse annotation strategy
    annotatedText = spliceSpan(annotatedText, annotation.endPosition + 1, spanEndString);
    annotatedText = spliceSpan(annotatedText, annotation.startPosition, spanStartString);

  });
  console.log("annotatedText: ", annotatedText);
}

// append passed text data to main container div innerHTML
function displayText (textData) {
  // set private text variable
  aliceTextRaw = textData;
  // console.log("aliceTextRaw", aliceTextRaw);
  // POSITION CHANGE
  // replace line breaks with html-readable <br> tags, setting private variable for processed alice text
  aliceText = aliceTextRaw.replace(/(?:\r\n|\r|\n)/g, '<br>');
  $container.html(aliceText);
}

function processAnnotations () {
  // add annotations to private annotations array
  parseAnnotations();
  // iterate over annotations array and add spans around pre-existing DOM text innerHTML
  displayAnnotations();
}

// asynchronous loading chain, calls text, then xml, adds text to DOM, then adds annotations
// loader invocations
loader(textFileLocation, 'text')
  .then(
    // resolve handler
    function(textData) {
      // console.log("textData", textData);
      // nothing done with data
      console.log('text loaded');
      // display text on page
      displayText(textData);

      return loader(xmlFileLocation, 'xml');
    },
    // reject handler
    function(reject){
      console.log("text load error");
    }
  ).then(
    // resolve handler
    function(xmlData) {
      console.log('xml loaded', xmlData);

      // handle xml data
      setXml(xmlData);
      // display text on page

      processAnnotations();
    },
    // reject handler
    function(reject){
      console.log("xml load error");
    }
    // add classes to spans, which will color elements
  );
// loader(xmlFileLocation, 'xml');



// save button logic
  // select all annotation spans on the page (inner text)
  // create an object with category titles as properties, array of objects as value (each iteration with 'start', 'end', 'text/value' properties)
