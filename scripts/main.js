console.log("hello");

// $(document).ready({

// });
var textFileLocation = '../data/ch08.txt';
var xmlFileLocation = '../data/ch08.txt.xml';

// multipurpose ajax data load function
// var loader = function(fileLocation, fileType) {
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
var loader = function(fileLocation, fileType) {
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

// function colorChanger() {
//
// }

// asynchronous loading chain, calls text, then xml, adds text to DOM, then adds annotations
// loader invocations
loader(textFileLocation, 'text')
  .then(
    function(resolve) {
      // nothing done with data
      console.log('text loaded');
      return loader(xmlFileLocation, 'xml');
    },
    function(reject){
      console.log("text load error");
    }
  ).then(
    function(resolve) {
      // nothing done with data
      console.log('xml loaded');
    },
    function(reject){
      console.log("xml load error");
    }
    // add classes to spans, which will color elements
  );
// loader(xmlFileLocation, 'xml');




// save button logic
  // select all annotation spans on the page (inner text)
  // create an object with category titles as properties, array of objects as value (each iteration with 'start', 'end', 'text/value' properties)
