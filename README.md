# TC DR Annotations


### Original Scenario
------------------------------------------
You are a data analyst whose job is to create and correct annotations that come out of the machine-learning platform.  
Your tasks include reviewing the annotations made by the system,  removing any unnecessary or incorrect annotations - hey, it's not always 100% accurate - as well as adding annotations to text that was missed by the system.  Basically, if the system says that "The White House", e.g., is a PERSON, you can delete that annotation.  If the system did not tag "The White House" as a LOCATION you can apply that annotation to the text.  
All annotations will need to be visible at one time (excluding documents that scroll, of course).

There are only 3 categories of annotations: `PERSON`, `LOCATION`, and `ORGANIZATION`.  

1. As a developer, you will need to provide a simple web interface that displays the document in full with the text of the annotations highlighted.  
2. You will also need to provide a simple mechanism that allows the analyst to delete incorrect annotations and add annotations at will.  
3. Lastly, there will be a `SAVE` button that, when clicked, will spit out a JSON representation of the annotations to the browser console.  
4. The data can be retrieved in any manner but would be great if it was loaded via AJAX.

### Constraints
-------------------------------------------
1. The application should work in Chrome 45+
2. CSS, if used, must be separated into css files (i.e., no in-line CSS where it makes sense to segment).
3. If you choose to load the files via content-type text/xml, an external XML parser library may be used - but give credit if you do.

### Evaluation Criteria
--------------------------------------------
Your solution will be judged on the following criteria, with the most important listed first.

1. 100% coverage of all features and constraints listed above.
2. Code legibility.  This includes formatting, commenting, naming, and adherence to solid design patterns.
3. Usability.  It doesn't need a fancy user interface, but ease of use will be a factor.
4. Choice of technology - or lack thereof (libraries, frameworks, helpers, etc.)
5. Error checking and error handling.
6. Amount of time taken to return the assignment.
7. Packaging and submission style.  You may submit this assignment via Git, JSfiddle, a tarball or zip, GitHub pages or any other means of submission you feel appropriate (though it is an evaluation criteria item).
8. If you're feeling ambitious, I have the other 12 chapters' worth of docs at your request.  Allowing the user to switch chapters is powerful but not required for this assignment.

### Process
--------------------------------------------
1. Preparation
  * Read instructions carefully, convert from email into Github readme for easier reference and formatting.
  * Determine which tools were necessary. I wanted to operate with as little technology as possible to reduce time-sink risks.
2. Scaffold project with minimal directory and file structure with basic npm package.json for jQuery module.
3. Start by loading both data files through XHR promise chains.
4. Experiment with different ways of accessing and reinterpreting XML data.
5. Implement functionality to transfer XML data to local annotations array for more flexible use. This should be able to support later add/delete functionality.
6. Populate DOM with raw text, then handle the new line character html insertion.
7. Insert span tags with styling classes into raw text string in reverse order, ensuring xml positioning attributes stay usable without position adjustment tracking or annotation editing. (adding tags only de-syncs character positioning *after* the inserted text)
8. Refactor helper functions to adhere more to singular responsibility principle.
9. Refactor to IIFE pattern and modular design, exposing only a loading/initial display method for now.
10. Implement jQuery dynamic click event handling for a "delete annotation" feature.
11. Refactor annotation insertion and following display to accept parameters rather than accessing private variables. This eased troubleshooting a DOM refresh display issue after deleting an annotation, which was rooted in the original annotations array reversal location.

### Setup
--------------------------------------------
1. Clone the project
2. `cd DRAnnotaions`
3. `npm install` to install jQuery
4. Serve via localHost or opening `index.html` in the browser
5. Delete an annotation by clicking on any colored regions, then accepting the popup confirmation.

### Dependencies and Credits
--------------------------------------------
1. jQuery DOM Manipulation and XML Parsing
2. Document.Selection blog post: http://mark.koli.ch/use-javascript-and-jquery-to-get-user-selected-text
3. Document.Selection grab HTML Stack Overflow post: http://stackoverflow.com/questions/5643635/how-to-get-selected-html-text-with-javascript
3. UID Generator Stack Overflow post: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
4. Recommendation to change <br> tag insertion for line breaks to wrapping all text in <pre> tags: Thomas Buida
5. Annotation application order hint and general guidance: Jeff Stansberry
