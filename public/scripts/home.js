$(document).ready(function(){
 
  LoadTable();

  $('#emailButton').on('click', function(e){
    $("#emailLabel").text('Email Sent.');
    e.preventDefault();
    $.ajax({
      url: "/SendMail", 
      success: function(result){
        $("#emailLabel").text('Email Sent.');
    }});
  });

});


function LoadTable() {
  var req = new XMLHttpRequest();        
  req.open('GET', './GetUsers', true);
  //req.setRequestHeader('Content-Type', 'application/json');
  req.addEventListener('load',function(){
  if(req.status >= 200 && req.status < 400){
      var response = JSON.parse(req.responseText);
      var div = document.getElementById('content');
      //clear current table
      div.innerHTML = '';
      let table = document.createElement("table");
      table.className = "mdl-data-table";
      table.id = "userTable";
      buildTable(table, response);
      div.appendChild(table);
      postSetup();
  } else {
      console.log("Error in network request: " + req.statusText);
  }});
  req.send(null);
}

function buildTable(table, response) {
  //set up headers
  let head = document.createElement("thead");
  let row = document.createElement("tr");
  let headers = ["ID", "user_name", "password", "email", "role_id", "date_created", "signature_path"];
  for(let i = 1; i < headers.length; i++) {
    let header = document.createElement("th");
    header.textContent = headers[i];
   
    row.appendChild(header);
  }
  head.appendChild(row);
  table.appendChild(head);
  let body = document.createElement("tbody");

  for(let i = 0; i < response.length; i++) {
      row = document.createElement("tr")
      for(let j = 1; j < headers.length-1; j++){
          
              let cell = document.createElement("td");
              cell.textContent = response[i][Object.keys(response[i])[j]];
              
              row.appendChild(cell);
      }

     
      body.appendChild(row);
  }
  table.appendChild(body);
      
}