/* ----------------------------------------------------------------------------------------------------------------------------
   GLOBALS
   ---------------------------------------------------------------------------------------------------------------------------- */

var tTitle = '';
var output = '';

var period = 7;
var table = '';

var aData = '';
var aSize = 0;

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
        
        if (data[id].confirmed === 0) {
            tGrow += 0;
        } else {
            tGrow += ( (data[id].confirmed - data[id-1].confirmed) / data[id].confirmed ) * 100;
        }
    }
    return tGrow/p;
}

/* ----------------------------------------------------------------------------------------------------------------------------
   BUTTONS
   ---------------------------------------------------------------------------------------------------------------------------- */

function showDeaths() {
    
    table.order([3, 'asc']).draw();
    tTitle = 'Best covid-19 healthcare';
    document.getElementById("TITLE").innerHTML = tTitle;
}

function showRecov() {
    
    table.order([5, 'dsc']).draw();
    tTitle = 'Best covid-19 population';
    document.getElementById("TITLE").innerHTML = tTitle;
}

function showConfirm() {
    
    table.order([1, 'asc']).draw();
    tTitle = 'Best covid-19 politics';
    document.getElementById("TITLE").innerHTML = tTitle;
}

function showTrend() {
    
    table.order([6, 'asc']).draw();
    tTitle = 'Last '+period+' days covid-19 trend';
    document.getElementById("TITLE").innerHTML = tTitle;
}

function showGrow() {
    
    table.order([7, 'asc']).draw();
    tTitle = 'Last '+period+' days covid-19 grow';
    document.getElementById("TITLE").innerHTML = tTitle;
}

/* ----------------------------------------------------------------------------------------------------------------------------
   SET PAGE
   ---------------------------------------------------------------------------------------------------------------------------- */

function setPanel() {
    
    let tPanel = '';
    
    tPanel += 'Period: ';
    tPanel += '<input type="radio" id="period1" name="period" value="7" checked="checked" onClick="setPeriod(7)" />';
    tPanel += '<label for="7">7 days</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="period2" name="period" value="14"  onClick="setPeriod(14)" />';
    tPanel += '<label for="14">14 days</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="period3" name="period" value="0"  onClick="setPeriod(0)" />';
    tPanel += '<label for="0">all available days</label>';
    tPanel += '</br>';
    
    tPanel += '<button onClick="showDeaths()">show</button>';
    tPanel += ' - best covid-19 healthcare (sort by Deaths % - it is default view)';
    tPanel += '</br>';
    tPanel += '<button onClick="showRecov()">show</button>';
    tPanel += ' - best covid-19 population resistent (sort by Recovered %)';
    tPanel += '</br>';
    tPanel += '<button onClick="showConfirm()">show</button>';
    tPanel += ' - best covid-19 politics (sort by Confirmed)';
    tPanel += '</br>';
    tPanel += '<button onClick="showTrend()">show</button>';
    tPanel += ' - sort by trend index (lower value is better, there is more daily confirmed ';
    tPanel += 'small down trends during this period than jumps)';
    tPanel += '</br>';
    tPanel += '<button onClick="showGrow()">show</button>';
    tPanel += ' - sort by grow index (lower value is better, means average of confirmed % during this period is not so big)';
    tPanel += '</br>';
    
    document.getElementById("PANEL").innerHTML = tPanel;
}

function setTitle() {
    
    tTitle = 'Best covid-19 healthcare';
    document.getElementById("TITLE").innerHTML = tTitle;
}

function setTable(data) {
    
    let tBody = '<tbody>';
    
    Object.keys(data).forEach(function(key) {

        aSize = data[key].length-1;

        let col1 = key;
        let col2 = data[key][aSize].confirmed;
        let col3 = data[key][aSize].deaths;

        let col4 = 0;
        if (col2 !== 0) {
            col4 = ( col3 / col2 ) * 100;
        }

        let col5 = data[key][aSize].recovered;

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
    });

    tBody += '</tbody>';
    
    // header for table
    let tHead = '<thead>';
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

    output = '<div class="box-table">';
        output += '<table id="covid-table" class="display">';
        output += tHead + tBody;
        output += '</table>';
    output += '</div>';
}

function setStatus(data) {
    
    let key = Object.keys(data)[0];
    let s = data[key].length-1;
    
    lastUpdate = data[key][s].date;
    output += '<div class="bg-info">Last update: ' + lastUpdate + '</div>';
}

function setOutput(data) {

    setTable(data);  
    setStatus(data);   

    document.getElementById("OUTPUT").innerHTML = output;
}

function setPeriod(p) {
    
    if (p === 0) { period = aSize; } else { period = p; }
        
    setTitle();
    setOutput(aData);    
    
    table.destroy();
    
    table = $('#covid-table').DataTable( {
        "order": [[ 3, 'asc' ]],
        "orderClasses": true,
        responsive: true
    } );
    new $.fn.dataTable.FixedHeader( table );        
}

/* ----------------------------------------------------------------------------------------------------------------------------
   GET DATA & BUILD INITIAL PAGE
   ---------------------------------------------------------------------------------------------------------------------------- */

fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => response.json())
  .then(data => {
    
    // make backup for update output section purposes
    aData = data;
    
    // INITIAL PAGE CONTENT
    setPanel();
    setTitle(); 
    setOutput(data);   

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
  
