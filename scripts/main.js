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

  // sample uid generator for branding annotations
  function uidGenerator() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  // method to push locally produced annotation objects into private annotations array
  function parseAnnotations () {
    // search through xml data and return span elements object
    const $xmlParseObject = $xmlData.find(`span`);
    // console.log($xmlParseObject);
    // jQuery each to iterate over each value in the resulting collection object and mirror text content and character position properties in a new object
    $xmlParseObject.each((key, value) => {
      let uid = uidGenerator();
      // category property for later styling
      let category = value.attributes[0].value.toLowerCase();
      // position mining and integer casting
      let startPosition = parseInt(value.children[0].children[0].attributes[1].value);
      let endPosition = parseInt(value.children[0].children[0].attributes[0].value);
      let innerText = value.children[0].children[0].innerHTML;
      // aggregate local variables into annotation object
      let localAnnotation = { startPosition, endPosition, innerText, category, uid };
      // console.log("localAnnotation", localAnnotation);
      // push to private annotations array
      addToAnnotations(localAnnotation);
    });
    // reverse array; allows for last-first string injection design in insertAnnotations forEach
    annotations = annotations.reverse();
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

  // string splice method to add span tags via character positions
  function spliceSpan(str, index, spanTag) {
    return str.slice(0, index) + (spanTag || "") + str.slice(index, str.length);
  }

  function insertAnnotations(rawText) {
    // raw text starter string
    annotatedText = rawText;

    // helper string span variables
    let spanStartString, spanEndString, innerSpan;
    // reverse annotation application via span tags in reverse order; back to front (position information should remain relevant throughout)
    annotations.forEach((annotation) => {
      // console.log("annotation during LOOP", annotation);
      spanStartString = `<span id='${annotation.uid}' class='${annotation.category} annotation'>`;
      spanEndString = `</span>`;
      innerSpan = `<span id='${annotation.uid}' class="tagText">[${annotation.category}] </span>`;
      // insert ending tag first to align with reverse annotation strategy
      annotatedText = spliceSpan(annotatedText, annotation.endPosition + 1, spanEndString);

      // insert block containing main annotation span open tag, then an inner span with annotation category text
      annotatedText = spliceSpan(annotatedText, annotation.startPosition, spanStartString + innerSpan);
      console.log("insertAnnotations loop startPosition", annotation.startPosition);
    });
    // console.log("annotatedText: ", annotatedText);
    console.log("annotations inserted");
  }

  // append passed text data to main container div innerHTML
  // accepts pre-spanned text string
  function displayText (taggedText) {
    // replace line breaks with html-readable <br> tags, setting private variable for processed alice text
    // annotatedText = annotatedText.replace(/(?:\r\n|\r|\n)/g, '<br>');

    // another option for display with line breaks: wrapping text with pre element tags, maintaining linebreaks to DOM
    let wrappedText = `<pre>${taggedText}</pre>`;
    // console.log("DISPLAY annotatedText", annotatedText);
    $container.html(wrappedText);
  }

  function addEvents () {
    // general dynamic click event handler for both annotation tag levels
    $(document.body).on("click", ".annotation", (event) => {
      // console.log("event.target", event.target);
      let deleteConfirmation = window.confirm("Delete this annotation?");
      console.log("deleteConfirmation", deleteConfirmation);
      // delete from annotations array
      if (deleteConfirmation) {
        // select target annotation from annotations array to delete
        let deleteTarget = annotations.filter(element => event.target.id === element.uid)[0];
        console.log("deleteTarget", deleteTarget);
        let annotationPostition = annotations.indexOf(deleteTarget);
        console.log("annotationPostition", annotationPostition);
        // splice annotations array
        if (annotationPostition > -1) annotations.splice(annotationPostition, 1);
        // reload DOM
        insertAnnotations(aliceTextRaw);
        displayText(annotatedText);
        // console.log("annotations post 2nd display", annotations);
      }

    });
  }

  // PRIVATE METHODS
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
            insertAnnotations(aliceTextRaw);
            // append annotated text string to DOM container
            displayText(annotatedText);

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
