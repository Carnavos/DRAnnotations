'use strict';

// private variables
let aliceText, $xmlData;
let annotations = [];

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
      console.log(data);
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
    annotations.push(localAnnotation);
  });
  console.log("annotations after parse", annotations);
}
// set private xml variable with jQuery conversion
function setXml (rawXML) {
  $xmlData = $(rawXML);
}

function createAnnotationArray () {
  // jQuery XML parsing: returns array of all spans with PERSON category
  // const $personSpans = $rawXML.find("span[category='PERSON']");

  // add annotations to annotations
  parseAnnotations();


  // // dive to the charseq level within the XML, then jQuery each to create local Annotation objects and push into separate array
  // const $personSpans = $rawXML.find("span[category='PERSON'] > extent > charseq");
  // let testAnnotations = [];
  // $personSpans.each((key, value) => {
  //   let startPosition = value.attributes[1].value;
  //   let endPosition = value.attributes[0].value;
  //   let innerText = value.innerHTML;
  //   let localAnnotation = { startPosition, endPosition, innerText };
  //   console.log("localAnnotation", localAnnotation);
  //   testAnnotations.push(localAnnotation);
  // });
  //
  //
  // // jQuery XML parsing: returns array of all spans with LOCATION category
  // const $locationSpans = $rawXML.find("span[category='LOCATION']");
  // // jQuery XML parsing: returns array of all spans with ORGANIZATION category
  // const $organizationSpans = $rawXML.find("span[category='ORGANIZATION']");
  // console.log("$personSpans", $personSpans);
  // console.log("typeof $personSpans", typeof $personSpans);
  // console.log($personSpans[0]);
  // console.log("$locationSpans", $locationSpans);
  // console.log("$organizationSpans", $organizationSpans);
}

// asynchronous loading chain, calls text, then xml, adds text to DOM, then adds annotations
// loader invocations
loader(textFileLocation, 'text')
  .then(
    // resolve handler
    function(resolve) {
      // nothing done with data
      console.log('text loaded');
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
      // createAnnotationArray(xmlData);

      // handle xml data
      setXml(xmlData);
      createAnnotationArray();
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
