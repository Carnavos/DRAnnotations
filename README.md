# DRAnnotations


### Scenario
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
5. *Error checking and error handling*.
6. Amount of time taken to return the assignment.
7. Packaging and submission style.  You may submit this assignment via Git, JSfiddle, a tarball or zip, GitHub pages or any other means of submission you feel appropriate (though it is an evaluation criteria item).
8. If you're feeling ambitious, I have the other 12 chapters' worth of docs at your request.  Allowing the user to switch chapters is powerful but not required for this assignment.
