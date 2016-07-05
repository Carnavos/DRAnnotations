'use strict';

const Annotator = (() => {
  // PRIVATE VARIABLES
  let aliceTextRaw, annotatedText, $xmlData;
  let annotations = [];
  const $container = $('#container');
  const $instructions = $('.instructions');

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

  // determine position of passed annotation object in annotations array and remove it
  function removeFromAnnotations (annoObject) {
    // determine annoObject position within annotations array
    const annotationPostition = annotations.indexOf(annoObject);
    console.log("annotationPostition: ", annotationPostition);
    if (annotationPostition > -1) {
      annotations.splice(annotationPostition, 1);
      console.log("annotation deleted");
    }
  }

  function editAnnotation (annoObject, categoryString) {
    // determine annoObject position within annotations array
    const annotationPostition = annotations.indexOf(annoObject);
    console.log("annotationPostition: ", annotationPostition);
    if (annotationPostition > -1) {
      annotations[annotationPostition].category = categoryString;
      console.log("annotation edited");
    }
  }

  // create annotation object, generate unique identifier, them add to annotations array with optional index insertion point
  function createAnnotation (category, startPosition, endPosition, innerText, index = 0) {
    const uid = uidGenerator();
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
      const category = value.attributes[0].value.toLowerCase();
      // position mining and integer casting
      const startPosition = parseInt(value.children[0].children[0].attributes[1].value);
      const endPosition = parseInt(value.children[0].children[0].attributes[0].value);
      const innerText = value.children[0].children[0].innerHTML;

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
    // another option for display with line breaks: wrapping text with pre element tags, maintaining linebreaks to DOM
    let wrappedText = `<pre>${taggedText}</pre>`;
    $container.html(wrappedText);
  }

  function displayInstructions () {
    const instructionsString =
    "<p><strong>Left click</strong> an Annotation to Delete.</p>"
    + "<p><strong>Right click</strong> an Annotation to Edit Category.</p>"
    + "<p><strong>Left click and drag</strong> over an un-annotated text region to add a new Annotation. (type the full word)</p>"

    $instructions.html(instructionsString);
  }

  // combo insertAnnotations and display text
  function loadDom() {
    insertAnnotations(aliceTextRaw);
    displayText(annotatedText);
    displayInstructions();
  }

  function addEvents () {

    // disable standard right click context menu
    window.oncontextmenu = () => false

    // general dynamic click event handler for both annotation tag levels
    $(document.body).on("mousedown", ".annotation", (event) => {

      console.log("event.target", event.target);
      console.log("event.which", event.which);

      // invoke getNodeDetails to serve associated annotations array index and element
      const targetNode = getNodeDetails(event.target);

      switch (event.which) {
        case 1:
          // DELETE ANNOTATION
          const deleteConfirmation = window.confirm("Delete this annotation?");
          console.log("deleteConfirmation", deleteConfirmation);
          // delete from annotations array
          if (deleteConfirmation) {
            // select target annotation from annotations array to delete
            console.log("deleteTarget", targetNode.arrayElement);
            removeFromAnnotations(targetNode.arrayElement);
            // reload DOM
            loadDom();
          }
          break;

        // EDIT ANNOTATION
        // right click -> popup meu to change category tag (no position editing intended)
        case 3:
          // const editTarget = annotations.filter(element => event.target.id === element.uid)[0];
          console.log("right click hit: edit");
          const editCategory = window.prompt("Enter new annotation type: \n  Organization \n  Person \n  Location").toLowerCase();
          if (editCategory) {
            editAnnotation(targetNode.arrayElement, editCategory);

            // reload page post annotation add
            loadDom();
          }
          break;
      }
    });

    // ADD ANNOTATION

    $(document.body).on("mouseup", selectionHandler);

    // function to return all characters within selection, including html tags
    function selectionHandler() {
      // currently only accomodating Chrome (deleted document.getSelection coverage)
      if (typeof window.getSelection != "undefined") {
        const windowSelection = window.getSelection();
        // ignore collapsed (equal start/end positions) selections
        if (!windowSelection.isCollapsed) {
          console.log(windowSelection);

          // pass windowSelection range to getSelectionDetails and return a larger selection object with comparative annotation DOM information
          const detailedSelection = getSelectionDetails(windowSelection.getRangeAt(0));

          popupHandler(detailedSelection);
        }
      }
    }

    // SAVE JSON TO CONSOLE
    $("#saveButton").click(() => {
      const jsonString = JSON.stringify({annotations: annotations});
      console.log("Annotations JSON String: ", jsonString);
    });


    // accept DOM node, return an object with annotation information based on corresponding element in annotations array
    function getNodeDetails (nodeObject) {
      const arrayElement = annotations.filter(a => a.uid === nodeObject.id)[0];
      const arrayElementIndex = annotations.indexOf(arrayElement);
      const startPosition = arrayElement.startPosition;
      const endPosition = arrayElement.endPosition;
      return { arrayElement, arrayElementIndex, startPosition, endPosition }
    }

    // obtain comparative selection details
    function getSelectionDetails(selectionRange) {
      // const selectionRange = selection.getRangeAt(0);
      // obtain selection start and end positions
      const selectionStart = selectionRange.startOffset;
      const selectionEnd = selectionRange.endOffset;
      const selectionContainerLength = selectionRange.commonAncestorContainer.length;
      console.log("raw selection", selectionRange);

      // obtain previous and next annotation siblings for RELATIONAL position gathering [Should eventuall be gathered into separate previousAnnotation and nextAnnotation objects]

      // check if previous node exists, then collect annotation node details
      const previousAnnoNode = selectionRange.commonAncestorContainer.previousElementSibling
        ? getNodeDetails(selectionRange.commonAncestorContainer.previousElementSibling)
        : null;
      console.log("previousAnnoNode: ", previousAnnoNode);

      // check if next node exists, then collect annotation node details
      const nextAnnoNode = selectionRange.commonAncestorContainer.nextElementSibling
        ? getNodeDetails(selectionRange.commonAncestorContainer.nextElementSibling)
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
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(selectionRange.cloneContents());
      console.log("tempDiv", tempDiv);

      const selectionHtml = tempDiv.innerHTML;

      console.log("selection HTML: ", selectionHtml);

      // return a detailed selection object
      return { selectionStart, selectionEnd, newAnnoIndex, tempDiv, selectionHtml, newAnnoStartPosition, newAnnoEndPosition }
    }

    // accepts selectionDetails object passed in through getSelectionHtml and displays one of two popups, passes back response if any
    function popupHandler(selectionDetails) {
      const containsTags = selectionDetails.selectionHtml.includes("<" || ">");
      console.log(containsTags);
      const popupResponse = containsTags
        // warning about combining annotations
        ? alert("Please reselect outside existing notations")
        // prompt to enter new annotation of three choices
        : window.prompt("Enter annotation type: \n  [O]rganization \n  [P]erson \n  [L]ocation")
      // iron response and create annotation
      if (popupResponse) {
        // createAnnotation with OPTIONAL INDEX argument (index of previous, bumping previous one higher in index)
        createAnnotation(popupResponse.toLowerCase(), selectionDetails.newAnnoStartPosition,
           selectionDetails.newAnnoEndPosition, selectionDetails.selectionHtml, selectionDetails.newAnnoIndex);
        console.log("annotations post popup", annotations);

        // reload page post annotation add
        loadDom();
      }
      console.log("popupResponse", popupResponse);
    }

  }

  // PUBLIC METHODS
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
            // append annotated text string to DOM container
            // display instructions
            loadDom();

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
