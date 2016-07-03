// 'use strict';

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
    // concatenate 4 character combos separated by hyphens
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  // alter private annotations array, supporting general (unshift) or specific (splice) insertion
  function addToAnnotations (annoObject, injectIndex) {
    // annotations.splice(0, 0, annoObject) is like unshift
    annotations.splice(injectIndex, 0, annoObject);
  }

  function createAnnotation (category, startPosition, endPosition, innerText, index = 0) {
    let uid = uidGenerator();
    // aggregate local variables into annotation object
    // let localAnnotation = { category, startPosition, endPosition, innerText, uid };
    // console.log("localAnnotation", localAnnotation);
    // push to private annotations array
    addToAnnotations({ category, startPosition, endPosition, innerText, uid }, index);

  }

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

      // call createAnnotation to aggregate properties into object and insert into annotations array
      createAnnotation(category, startPosition, endPosition, innerText);
    });
    // reverse array; allows for last-first string injection design in insertAnnotations forEach

    // annotations = annotations.reverse();

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


  // string splice method to add span tags via character positions
  function spliceSpan(str, index, spanTag) {
    return str.slice(0, index) + (spanTag || "") + str.slice(index, str.length);
  }

  function insertAnnotations(rawText) {
    // raw text starter string
    annotatedText = rawText;

    // helper string span variables
    let spanStartString, spanEndString, innerSpan;
    // annotation application via span tags in reverse order; back to front (position information should remain relevant throughout)
    // assumes array is already reversed
    annotations.forEach((annotation) => {
      // console.log("annotation during LOOP", annotation);
      spanStartString = `<span id='${annotation.uid}' class='${annotation.category} annotation'>`;
      spanEndString = `</span>`;
      innerSpan = `<span id='${annotation.uid}' class="tagText">[${annotation.category}] </span>`;
      // insert ending tag first to align with reverse annotation strategy
      annotatedText = spliceSpan(annotatedText, annotation.endPosition + 1, spanEndString);

      // insert block containing main annotation span open tag, then an inner span with annotation category text
      annotatedText = spliceSpan(annotatedText, annotation.startPosition, spanStartString + innerSpan);
      // console.log("insertAnnotations loop startPosition", annotation.startPosition);
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

    // DELETE ANNOTATION

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

    // ADD ANNOTATION

    $(document.body).on("mouseup", selectionHandler);

    // function selectionHandler () {
    //   let selection;
    //   // if (window.getSelection) selection = window.getSelection().toString()
    //   if (window.getSelection()) {
    //     selection = window.getSelection().toString();
    //     console.log("selection", selection);
    //     // console.log("window.getSelection", window.getSelection());
    //
    //   }
    //   // return selection;
    //
    // }

    // function to return all characters within selection, including html tags
    function selectionHandler() {
      // currently only accomodating Chrome (deleted document.getSelection coverage)
      if (typeof window.getSelection != "undefined") {
        let windowSelection = window.getSelection();

        // selection gate for span overlapping

        // pass windowSelection to getSelectionDetails and return a larger selection object with comparative annotation DOM information
        let detailedSelection = getSelectionDetails(windowSelection);

        // create new annotation *(consider adding optional index parameter to createAnnotation)
        // createAnnotation("location", newAnnoStartPosition, newAnnoEndPosition, selectionHtml);
        // inserting new annotation into already reversed array


        // this should be higher in the chain, unsure how to limit selection when mouseup triggers selection as well
        // process innerHTML and character length condition
        if (detailedSelection.selectionHtml.length > 0) popupHandler(detailedSelection);
      }
    }

    // accept DOM node, return an object with annotation information based on corresponding element in annotations array
    function getNodeDetails (nodeObject) {
      const arrayElement = annotations.filter(a => a.uid === nodeObject.id)[0];
      const arrayElementIndex = annotations.indexOf(arrayElement);
      const startPosition = arrayElement.startPosition;
      const endPosition = arrayElement.endPosition;
      return { arrayElement, arrayElementIndex, startPosition, endPosition }
    }

    // obtain comparative selection details
    function getSelectionDetails(selection) {
      // obtain selection start and end positions
      const selectionStart = selection.getRangeAt(0).startOffset;
      const selectionEnd = selection.getRangeAt(0).endOffset;
      const selectionContainerLength = selection.getRangeAt(0).commonAncestorContainer.length;
      console.log("raw selection", selection.getRangeAt(0));

      // obtain previous and next annotation siblings for RELATIONAL position gathering [Should eventuall be gathered into separate previousAnnotation and nextAnnotation objects]

      // check if previous node exists, then collect annotation node details
      const previousAnnoNode = selection.getRangeAt(0).commonAncestorContainer.previousElementSibling
        ? getNodeDetails(selection.getRangeAt(0).commonAncestorContainer.previousElementSibling)
        : null;
      console.log("previousAnnoNode: ", previousAnnoNode);

      // check if next node exists, then collect annotation node details
      const nextAnnoNode = selection.getRangeAt(0).commonAncestorContainer.nextElementSibling
        ? getNodeDetails(selection.getRangeAt(0).commonAncestorContainer.nextElementSibling)
        : null;
      console.log("nextAnnoNode: ", nextAnnoNode);

      // if previous node exists, use it for new anno positioning calculation, if not try the next node.
      // if neither, use original selection positioning
      const newAnnoStartPosition = previousAnnoNode ? previousAnnoNode.endPosition + selectionStart + 1 // previous
        : selectionStart; // original selection (non-comparative, in case of no previous/any annotations)
      console.log("new anno start: ", newAnnoStartPosition);

      const newAnnoEndPosition = previousAnnoNode ? newAnnoStartPosition + (selectionEnd - selectionStart) - 1 // previous
        : selectionEnd - 1;
      console.log("new anno end: ", newAnnoEndPosition);

      const newAnnoIndex = previousAnnoNode ? previousAnnoNode.arrayElementIndex // insert/splice into annotations array at current index
        : nextAnnoNode ? nextAnnoNode.arrayElementIndex + 1 // place after other annotations
        : 0; // no surrounding nodes (unshift to annotations)

      // temporary div to capture exact contents including children span nodes
      let tempDiv = document.createElement("div");
      tempDiv.appendChild(selection.getRangeAt(0).cloneContents());
      console.log("tempDiv", tempDiv);

      let selectionHtml = tempDiv.innerHTML;

      console.log("selection HTML: ", selectionHtml);

      // return a detailed selection object
      return { selectionStart, selectionEnd, newAnnoIndex, selectionHtml, newAnnoStartPosition, newAnnoEndPosition }
    }

    // accepts selectionDetails object passed in through getSelectionHtml and displays one of two popups, passes back response if any
    function popupHandler(selectionDetails) {
      let popupResponse;
      // check if selection has any characters
      if (selectionDetails.selectionHtml.length > 0) {
        // check if selection contains child nodes (spans)
        // popupResponse = selectionDetails.selectionHtml.children.length > 0
        popupResponse = (selectionDetails.selectionHtml.children)
        // warning about combining annotations
        ? alert("Please reselect outside existing notations")
        // prompt to enter new annotation of three choices
        : window.prompt("Enter annotation type: \n  [O]rganization \n  [P]erson \n  [L]ocation")
      }
      // iron response and create annotation
      if (popupResponse) {
        popupResponse = popupResponse.toLowerCase();
        console.log("ironed popupResponse", popupResponse);

        // createAnnotation with OPTIONAL INDEX argument (index of previous, bumping previous one higher in index)
        createAnnotation(popupResponse.toLowerCase(), selectionDetails.newAnnoStartPosition,
           selectionDetails.newAnnoEndPosition, selectionDetails.selectionHtml, selectionDetails.newAnnoIndex);
         console.log("annotations post popup", annotations);

         insertAnnotations(aliceTextRaw);
         displayText(annotatedText);

      }
      console.log("popupResponse", popupResponse);
      // return popupResponse;
    }

    // create temp annotation without absolute/document positioning
    // identify positioning based on previous span (add character count to prev annotation start/end props)


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
