/* -----------------------------------------------------------------------------------------------------------------------
   GLOBALS
   -------------------------------------------------------------------------------------------------------------------- */

var gTitle = 0;
var gTable = '';

var gChart = '';
var gChKey = '';

var gData = '';
var gSize = 0;

var gPeriod = 14;

/* -----------------------------------------------------------------------------------------------------------------------
   BUTTONS
   -------------------------------------------------------------------------------------------------------------------- */

function showDeaths(type) {
    
    if (type > 0) {
        gTable.order([4, 'asc'],[2, 'dsc']).draw();
        setTitle(1);
    } else {
        gTable.order([4, 'dsc'],[2, 'asc']).draw();
        setTitle(-1);
    }
}

function showRecov(type) {
    
    if (type > 0) {
        gTable.order([6, 'dsc'],[2, 'dsc']).draw();
        setTitle(2);
    } else {
        gTable.order([6, 'asc'],[2, 'asc']).draw();
        setTitle(-2);
    }
}

function showConfirm(type) {
    
    if (type > 0) {
        gTable.order([2, 'asc'],[8, 'asc']).draw();
        setTitle(3);
    } else {
        gTable.order([2, 'dsc'],[8, 'dsc']).draw();
        setTitle(-3);
    }
}

function showTrend(type) {
    
    if (type > 0) {
        gTable.order([7, 'asc'],[6, 'dsc']).draw();
        setTitle(4);
    } else {
        gTable.order([7, 'dsc'],[6, 'asc']).draw();
        setTitle(-4);
    }
}

function showGrow(type) {
    
    if (type > 0) {
        gTable.order([8, 'asc'],[6, 'dsc']).draw();
        setTitle(5);
    } else {
        gTable.order([8, 'dsc'],[6, 'asc']).draw();
        setTitle(-5);
    }
}

function showChart(key) {
    
    setChart(key, gData[key], gPeriod);
}

/* -----------------------------------------------------------------------------------------------------------------------
   CALCULATIONS
   -------------------------------------------------------------------------------------------------------------------- */

function getTrend(key, data, p) {
    
    let tIndex = 0, tUp = 0, tDown = 0;
    let size = data.length-1;
     
    for(let i=0; i<p; i++) {
        
        let id = size-i;
        let tDiff = data[id].confirmed - data[id-1].confirmed;
        
        // skip invalid data
        if (tDiff < 0) { continue; }
        
        if (tDiff > tBefore) { tDown++; }
        if (tDiff < tBefore) { tUp++; }
        
        let tBefore = tDiff;
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
        let tDiff = data[id].confirmed - data[id-1].confirmed;
        
        // skip invalid data
        if (tDiff < 0) { continue; }
        
        if (data[id].confirmed === 0) {
            tGrow += 0;
        } else {
            tGrow += ( tDiff / data[id].confirmed ) * 100;
        }
    }
    return tGrow/p;
}

/* -----------------------------------------------------------------------------------------------------------------------
   SET PAGE
   -------------------------------------------------------------------------------------------------------------------- */

function setPanel() {
    
    let tPanel = '';
    
    tPanel += '<button onClick="showDeaths(1)" class="best">show best</button>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<button onClick="showDeaths(-1)" class="worst">show worst</button>';
    tPanel += ' - covid-19 healthcare (multi-sort by Deaths %, Confirmed)';
    tPanel += '</br>';
    
    tPanel += '<button onClick="showRecov(2)" class="best">show best</button>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<button onClick="showRecov(-2)" class="worst">show worst</button>';
    tPanel += ' - covid-19 population resistance (multi-sort by Recovered %, Confirmed)';
    tPanel += '</br>';
    
    tPanel += '<button onClick="showConfirm(3)" class="best">show best</button>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<button onClick="showConfirm(-3)" class="worst">show worst</button>';
    tPanel += ' - covid-19 politics (multi-sort by Confirmed, Grow %)';
    tPanel += '</br>';
    
    tPanel += 'Period: ';
    tPanel += '<input type="radio" id="period1" name="period" value="7" onClick="setPeriod(7)" />';
    tPanel += '<label for="7">7 days</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="period2" name="period" value="14" checked="checked" onClick="setPeriod(14)" />';
    tPanel += '<label for="14">14 days</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="period3" name="period" value="30" onClick="setPeriod(30)" />';
    tPanel += '<label for="30">30 days</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="period4" name="period" value="0" onClick="setPeriod(0)" />';
    tPanel += '<label for="0">all available</label>';
    tPanel += '</br>';
        
    tPanel += '<button onClick="showTrend(4)" class="best">show best</button>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<button onClick="showTrend(-4)" class="worst">show worst</button>';
    tPanel += ' - multi-sort by Trend index (daily confirmed small trends during this period) and Recovered %';
    tPanel += '</br>';
    
    tPanel += '<button onClick="showGrow(5)" class="best">show best</button>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<button onClick="showGrow(-5)" class="worst">show worst</button>';
    tPanel += ' - multi-sort by Grow % index (daily average of confirmed % during this period) and Recovered %';
    
    document.getElementById("PANEL").innerHTML = tPanel;
}

function setTitle(t) {
    
    let tTitle = ''; gTitle = t;
    
    if (t === 1) { tTitle = 'Best covid-19 healthcare'; }
    if (t === 2) { tTitle = 'Best covid-19 population resistance'; }
    if (t === 3) { tTitle = 'Best covid-19 politics'; }
    if (t === 4) { tTitle = 'Best covid-19 trend (for last '+gPeriod+' days)'; }
    if (t === 5) { tTitle = 'Best covid-19 grow % (for last '+gPeriod+' days)'; }
    
    if (t === -1) { tTitle = 'Worst covid-19 healthcare'; }
    if (t === -2) { tTitle = 'Worst covid-19 population resistance'; }
    if (t === -3) { tTitle = 'Worst covid-19 politics'; }
    if (t === -4) { tTitle = 'Worst covid-19 trend (for last '+gPeriod+' days)'; }
    if (t === -5) { tTitle = 'Worst covid-19 grow % (for last '+gPeriod+' days)'; }
        
    document.getElementById("TITLE").innerHTML = tTitle;
}

function setTable(data) {
    
    let tBody = '<tbody>';
    
    Object.keys(data).forEach(function(key) {

        gSize = data[key].length-1;
                
        let col0 = key;
        let col1 = '<button onClick="showChart(\''+key+'\')">show</button>';
        let col2 = data[key][gSize].confirmed;
        let col3 = data[key][gSize].deaths;

        let col4 = 0;
        if (col2 !== 0) {
            col4 = ( col3 / col2 ) * 100;
        }

        let col5 = data[key][gSize].recovered;

        let col6 = 0;
        if (col2 !== 0) {
            col6 = ( col5 / col2 ) * 100;
        }
        
        let col7 = getTrend(key, data[key], gPeriod);
        let col8 = getGrow(key, data[key], gPeriod);
        
        // build table content
        tBody += '<tr>';
        tBody += '<td class="col0">' + col0 + '</td>';
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
    tHead += '<th class="col0">Place</th>';
    tHead += '<th class="col1">Chart</th>';
    tHead += '<th class="col2">Confirmed</th>';
    tHead += '<th class="col3">Deaths</th>';
    tHead += '<th class="col4">Deaths %</th>';
    tHead += '<th class="col5">Recovered</th>';
    tHead += '<th class="col6">Recovered %</th>';
    tHead += '<th class="col7">Trend</th>';
    tHead += '<th class="col8">Grow %</th>';
    tHead += '</tr>';
    tHead += '</thead>';
    
    let tTable = '<table id="covid-table" class="display">';
    tTable += tHead + tBody;
    tTable += '</table>';

    document.getElementById("TABLE").innerHTML = tTable;
}

function setChart(key, data, p) {
    
    let tX = []
    let tYc = [], tYd = [], tYr = [];
    
    gChKey = key;
    
    // calculation
    for(let i=p-1; i>=0; i--) {
        
        let id = gSize-i;
        
        let yc = data[id].confirmed - data[id-1].confirmed;
        let yd = data[id].deaths - data[id-1].deaths;
        let yr = data[id].recovered - data[id-1].recovered;
        
        tX.push(data[id].date);
        
        // skip invalid data
        if (yc > 0) { tYc.push(yc); } else { tYc.push(0); }
        if (yd > 0) { tYd.push(yd); } else { tYd.push(0); }
        if (yr > 0) { tYr.push(yr); } else { tYr.push(0); }
    }
    
    // settings
    var ChartData = {
      labels : tX,
      datasets : [
        {
          label : key+' (confirmed)',
          borderWidth : 1,
          borderColor : "#0000FF",
          backgroundColor : "#DDDDFF",
          data : tYc
        },
        {
          label: key+' (deaths)',
          borderWidth : 1,
          borderColor : "#FF0000",
          backgroundColor : "#FFDDDD",
          data : tYd
        },
        {
          label: key+' (recovered)',
          borderWidth : 1,
          borderColor : "#00FF00",
          backgroundColor : "#DDFFDD",
          data : tYr
        }
      ]
    };
    
    var GlobalOptions = {
      responsive: true,
      animationEasing: "easeOutElastic"
    };

    // show chart box
    document.getElementById('box-chart').style.display = 'block';

    // clear old one, avoid multiple instances (old chart versions bumps out on hover)
    if (gChart !== '') { gChart.destroy(); }
    
    // show new chart
    var ctx = document.getElementById('CHART');
    gChart = new Chart(ctx, {
            type: 'line',
            data: ChartData,
            options: GlobalOptions
    });
}

function setStatus(data) {
    
    let key = Object.keys(data)[0];
    let s = data[key].length-1;
    
    let tStatus = '<div class="bg-info">Last update: ';
    tStatus += data[key][s].date;
    tStatus += '</div>';
    
    document.getElementById("STATUS").innerHTML = tStatus;
}

function setPeriod(p) {
    
    if (p === 0) { gPeriod = gSize; } else { gPeriod = p; }
    
    let oValue = gTable.order();
    let sValue = $('.dataTables_filter input').val();
    
    setTitle(gTitle);
    setTable(gData);    
    
    gTable.destroy();
    
    gTable = $('#covid-table').DataTable( {
        "orderClasses": true,
        responsive: true
    } );
    new $.fn.dataTable.FixedHeader( gTable );
    
    gTable.order(oValue).draw();
    gTable.search(sValue).draw();
    
    if (gChart !== '') { 
        setChart(gChKey, gData[gChKey], gPeriod);
    }
}

/* -----------------------------------------------------------------------------------------------------------------------
   GET DATA & BUILD INITIAL PAGE
   -------------------------------------------------------------------------------------------------------------------- */

fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => response.json())
  .then(data => {
    
    // make backup for update output section purposes
    gData = data;
    
    // INITIAL PAGE CONTENT
    setPanel();
    setTable(data);  
    setStatus(data);   

    // show the table
    $(document).ready( function () {
        gTable = $('#covid-table').DataTable( {
            "orderClasses": true,
            responsive: true
        } );
        new $.fn.dataTable.FixedHeader( gTable );
        showDeaths(1);
    });
});
  
