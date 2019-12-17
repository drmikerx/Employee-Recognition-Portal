$(document).ready(function(){
 
  //sig pad from:  https://www.npmjs.com/package/signature_pad
  var canvas = document.querySelector("canvas");
 
  var signaturePad = new SignaturePad(canvas);

  $('#clearButton').on('click', function(e){
    e.preventDefault();
    signaturePad.clear();
  });
  $('#saveButton').on('click', function(e){
    e.preventDefault();
      var tempData = canvas.toDataURL();
      var formData = new FormData();
      formData.append('sig',tempData);
      $.ajax({
        type: 'POST',
        url: '/editUserSig',
        data: formData,
        processData: false,
        contentType: false
      }).done(function() {
        window.location.href = '/userHome';
      });
  });

  //The statements below were modified from the following:
  //https://webplatform.github.io/docs/concepts/programming/drawing_images_onto_canvas/
   // Get a reference to the file select input field
   var sigFile = document.getElementById('sig-file');

   // When a selection is made the "change" event will be fired
   sigFile.addEventListener('change', handleFileSelect, false);
  
   function handleFileSelect(event)
   {
       // Get the FileList object from the file select event
       var files = event.target.files;

       // Check if there are files in the FileList
       if(files.length === 0)
       {
           return;
       }

       // For this example we only want one image. We'll take the first.
       var file = files[0];

       // Check that the file is an image
       if(file.type !== '' && !file.type.match('image.*'))
       {
           return;
       }
        // The URL API is vendor prefixed in Chrome
        window.URL = window.URL || window.webkitURL;

        // Create a data URL from the image file
        var imageURL = window.URL.createObjectURL(file);

        signaturePad.fromDataURL(imageURL);
    }
  
});
