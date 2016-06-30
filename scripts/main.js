'use strict';

const Annotator = (() => {
  // PRIVATE VARIABLES
  let aliceTextRaw, annotatedText, $xmlData;
  let annotations = [];
  const $container = $('#container');

  const textFileLocation = '../data/ch08.txt';
  const xmlFileLocation = '../data/ch08.txt.xml';

  // HELPER FUNCTIONS

  // multipurpose ajax data load function
  const loader = (fileLocation, fileType) => {
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
  };

  // method to push locally produced annotation objects into private annotations array
  function parseAnnotations () {
    // search through xml data and return span elements object
    const $xmlParseObject = $xmlData.find(`span`);
    // console.log($xmlParseObject);
    // jQuery each to iterate over each value in the resulting collection object and mirror text content and character position properties in a new object
    $xmlParseObject.each((key, value) => {
      // category property for later styling
      let category = value.attributes[0].value.toLowerCase();
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
  function storeXml (rawXML) {
    $xmlData = $(rawXML);
  }

  // set private text variable
  function storeText (textData) {
    aliceTextRaw = textData;
  }

  // set private annotations array
  function addToAnnotations (arrayElement) {
    annotations.push(arrayElement);
  }

  // string splice method to add span tags one at a time
  function spliceSpan(str, index, spanTag) {
    return str.slice(0, index) + (spanTag || "") + str.slice(index, str.length);
  }

  function insertAnnotations() {
    annotatedText = aliceTextRaw;
    let spanStartString, spanEndString, innerSpan;
    // reverse annotations to apply span tags from end of text to beginning (position information should remain relevant throughout)
    let reverseAnnotations = annotations.reverse();
    reverseAnnotations.forEach((annotation) => {
      spanStartString = `<span class='${annotation.category} annotation'>`;
      spanEndString = `</span>`;
      innerSpan = `<span class="tagText">[${annotation.category}] </span>`;
      // insert ending tag first to align with reverse annotation strategy
      annotatedText = spliceSpan(annotatedText, annotation.endPosition + 1, spanEndString);
      // add the Text in between span tags (possibly another span?)
      // annotatedText = spliceSpan(innerSpan, )


      annotatedText = spliceSpan(annotatedText, annotation.startPosition, spanStartString + innerSpan);

    });
    // console.log("annotatedText: ", annotatedText);
  }

  // append passed text data to main container div innerHTML
  function displayText () {
    // replace line breaks with html-readable <br> tags, setting private variable for processed alice text
    // annotatedText = annotatedText.replace(/(?:\r\n|\r|\n)/g, '<br>');

    // another option for display with line breaks: wrapping text with pre element tags, maintaining linebreaks to DOM
    annotatedText = `<pre>${annotatedText}</pre>`;
    $container.html(annotatedText);
  }

  function addEvents () {
    let $annotationSpans = $(".annotation");

    $annotationSpans.on("click", (event) => {
      console.log("event.target", event.target);
      let deleteConfirmation = window.confirm("Delete this annotation?");
      console.log("deleteConfirmation", deleteConfirmation);
      // delete from annotations array
      if (deleteConfirmation) {
        let deleteTarget = annotations.filter(element => event.target);
      }
      // delete from DOM OR redisplay?!?!?
    });
  }

  // public methods
  return {

    loadData() {
      // asynchronous loading chain, calls text, then xml, adds text to DOM, then adds annotations
      // loader invocations
      loader(textFileLocation, 'text')
        .then(
          // resolve handler
          function(textData) {
            console.log('text loaded');
            // store text and load xml
            storeText(textData);
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

            // store xml data
            storeXml(xmlData);
            // process annotation xml
            parseAnnotations();
            // add spans to text string
            insertAnnotations();
            // append annotated text string to DOM container
            displayText();

            // add events
            addEvents();
          },
          // reject handler
          function(reject){
            console.log("xml load error");
          }
        );
    }

  }

})();

// load data and display on DOM
Annotator.loadData();



// save button logic
  // select all annotation spans on the page (inner text)
  // create an object with category titles as properties, array of objects as value (each iteration with 'start', 'end', 'text/value' properties)
