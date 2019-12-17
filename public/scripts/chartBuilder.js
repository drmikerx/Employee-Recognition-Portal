// The structure of the code in this file was inspired by the following:
// https://stackoverflow.com/questions/44415130/how-can-i-send-information-from-nodejs-server-to-client-side

$(document).ready(function(){

    // Help setting up click event listeners obtained from:
    // https://stackoverflow.com/questions/1070760/javascript-function-in-href-vs-onclick
    // Help with clearing the canvas element so hover would work obtained from:
    // https://stackoverflow.com/questions/24815851/how-to-clear-a-chart-from-a-canvas-so-that-hover-events-cannot-be-triggered

    $('#noChart').click(function(){
        $('#myChart').remove();     // Clear out old chart if present
        $('#chartContainer').append('<canvas id="myChart"></canvas>');  // Put a new canvas on the page
        return false;
    });
    
    $('#chartOption1').click(function(){
        $('#myChart').remove();     // Clear out old chart if present
        $('#chartContainer').append('<canvas id="myChart"></canvas>');  // Put a new canvas on the page
        generateAwardCount(); 
        return false;
    });

    $('#chartOption2').click(function(){
        $('#myChart').remove();     // Clear out old chart if present
        $('#chartContainer').append('<canvas id="myChart"></canvas>');  // Put a new canvas on the page
        generateAmountofEachType(); 
        return false;
    });

    $('#chartOption3').click(function(){
        $('#myChart').remove();     // Clear out old chart if present
        $('#chartContainer').append('<canvas id="myChart"></canvas>');  // Put a new canvas on the page
        generateAwardsByMonth();
        return false;
    });
    
    // Close the drop down menu after user clicks a choice. Help obtained from:
    // https://stackoverflow.com/questions/18855132/close-bootstrap-dropdown-after-link-click
    
    $(".dropdown-menu a").click(function() {
        $(this).closest(".dropdown-menu").prev().dropdown("toggle");
    });

});


function LoadChart(chartToLoad) {

    var req = new XMLHttpRequest();
    var url = 'businessIntelligence/' + chartToLoad;

    req.open('GET',url,true);
    req.addEventListener('load',onLoad);
    req.addEventListener('error',onError);

    req.send(null);
}


function onLoad() {
    
    var response = this.responseText;
    var parsedResponse = JSON.parse(response);


    var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: parsedResponse['xAxis'],
            datasets: [{
                label: parsedResponse['label'],
                data: parsedResponse['yAxis'],
                backgroundColor: parsedResponse['backgroundColor'],
                borderColor: parsedResponse['borderColor'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }  
    });

}

function onError() {
    console.log('error receiving async AJAX call');
}


function generateAwardCount() {

    LoadChart("awardCount");

}


function generateAmountofEachType() {
    LoadChart("amountOfEachType");
}

function generateAwardsByMonth() {
    LoadChart("awardsByMonth");
}