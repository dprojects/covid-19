/* ----------------------------------------------------------------------------------------------------------------------------
   GLOBALS
   ---------------------------------------------------------------------------------------------------------------------------- */

var tPanel = '';
var tTitle = '';
var output = '';

var period = 7;
var table = "";

var lastUpdate = '';

/* ----------------------------------------------------------------------------------------------------------------------------
   CALCULATIONS
   ---------------------------------------------------------------------------------------------------------------------------- */

function getTrend(key, data, p) {
    
    let tIndex = 0, tUp = 0, tDown = 0;
    let tBefore = 0, tDiff = 0;
    let size = data.length-1;
     
    for(let i=0; i<p; i++) {
        
        let id = size-i;
          
        tDiff = data[id].confirmed - data[id-1].confirmed;
        
        if (tDiff > tBefore) { tUp++; }
        if (tDiff < tBefore) { tDown++; }
        
        tBefore = tDiff;
    }
    
    if (tUp > p/2 || tDown > p/2) {
        tIndex = tUp - tDown;
    }
    return tIndex;
}

function getGrow(key, data, p) {
    
    let tGrow = 0;
    let size = data.length-1;
     
    for(let i=0; i<p; i++) {
        
        let id = size-i;
        tGrow += ( (data[id].confirmed - data[id-1].confirmed) / data[id].confirmed ) * 100;
    }
    return tGrow/p;
}

/* ----------------------------------------------------------------------------------------------------------------------------
   BUTTONS
   ---------------------------------------------------------------------------------------------------------------------------- */
function showDeaths(){
    table.order([3, 'asc']).draw();
    tTitle = 'Best covid-19 healthcare';
    document.getElementById("TITLE").innerHTML = tTitle;
}
function showRecov(){
    table.order([5, 'dsc']).draw();
    tTitle = 'Best covid-19 population';
    document.getElementById("TITLE").innerHTML = tTitle;
}
function showConfirm(){
    table.order([1, 'asc']).draw();
    tTitle = 'Best covid-19 politics';
    document.getElementById("TITLE").innerHTML = tTitle;
}
function showTrend(){
    table.order([6, 'asc']).draw();
    tTitle = 'Last '+period+' days covid-19 trend';
    document.getElementById("TITLE").innerHTML = tTitle;
}
function showGrow(){
    table.order([7, 'asc']).draw();
    tTitle = 'Last '+period+' days covid-19 grow';
    document.getElementById("TITLE").innerHTML = tTitle;
}

/* ----------------------------------------------------------------------------------------------------------------------------
   GET DATA & BUILD PAGE
   ---------------------------------------------------------------------------------------------------------------------------- */

fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => response.json())
  .then(data => {

    var tBody = '<tbody>';
    
    Object.keys(data).forEach(function(key) {

        let size = data[key].length-1;

        let col1 = key;
        let col2 = data[key][size].confirmed;
        let col3 = data[key][size].deaths;

        let col4 = 0;
        if (col2 !== 0) {
            col4 = ( col3 / col2 ) * 100;
        }

        let col5 = data[key][size].recovered;

        let col6 = 0;
        if (col2 !== 0) {
            col6 = ( col5 / col2 ) * 100;
        }
        
        let col7 = getTrend(key, data[key], period);
        let col8 = getGrow(key, data[key], period);
        
        // build table content
        tBody += '<tr>';
        tBody += '<td class="col1">' + col1 + '</td>';
        tBody += '<td class="col2">' + col2 + '</td>';
        tBody += '<td class="col3">' + col3 + '</td>';
        tBody += '<td class="col4">' + col4.toFixed(2) + '</td>';
        tBody += '<td class="col5">' + col5 + '</td>';
        tBody += '<td class="col6">' + col6.toFixed(2) + '</td>';
        tBody += '<td class="col7">' + col7 + '</td>';
        tBody += '<td class="col8">' + col8.toFixed(2) + '</td>';
        tBody += '</tr>';
            
        lastUpdate = data[key][size].date;
    });

    tBody += '</tbody>';
    
    // header for table
    var tHead = '<thead>';
    tHead += '<tr>';
    tHead += '<th class="col1">Place</th>';
    tHead += '<th class="col2">Confirmed</th>';
    tHead += '<th class="col3">Deaths</th>';
    tHead += '<th class="col4">Deaths %</th>';
    tHead += '<th class="col5">Recovered</th>';
    tHead += '<th class="col6">Recovered %</th>';
    tHead += '<th class="col7">Trend</th>';
    tHead += '<th class="col8">Grow %</th>';
    tHead += '</tr>';
    tHead += '</thead>';

    // PAGE CONTENT
    
    // panel section
    tPanel += '<button onClick="showDeaths()">show</button> - best covid-19 healthcare (sort by Deaths % - it is default view)'+'</br>';
    tPanel += '<button onClick="showRecov()">show</button> - best covid-19 population resistent (sort by Recovered %)'+'</br>';
    tPanel += '<button onClick="showConfirm()">show</button> - best covid-19 politics (sort by Confirmed)'+'</br>';
    tPanel += '<button onClick="showTrend()">show</button> - sort by trend index (lower value is better, there is more daily confirmed small down trends during this period than jumps)'+'</br>';
    tPanel += '<button onClick="showGrow()">show</button> - sort by grow index (lower value is better, means average of confirmed % during this period is not so big)'+'</br>';
    document.getElementById("PANEL").innerHTML = tPanel;
    
    // title section 
    tTitle += 'Best covid-19 healthcare';
    document.getElementById("TITLE").innerHTML = tTitle;
    
    // just the table output section
    output += '<div class="box-table">';
        output += '<table id="covid-table" class="display">';
        output += tHead + tBody;
        output += '</table>';
    output += '</div>';
    
    // update status info
    output += '<div class="bg-info">Last update: ' + lastUpdate + '</div>';

    // show the output part
    document.getElementById("OUTPUT").innerHTML = output;
    
    // show the table
    $(document).ready( function () {
        table = $('#covid-table').DataTable( {
            "order": [[ 3, 'asc' ]],
            "orderClasses": true,
            responsive: true
        } );
        new $.fn.dataTable.FixedHeader( table );        
    } );
    
  });
  
