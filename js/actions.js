/* -----------------------------------------------------------------------------------------------------------------------
   GLOBALS
   -------------------------------------------------------------------------------------------------------------------- */

var gTitle = 0;
var gTable = '';

var gChart = '';
var gChKey = '';

var gData = {};
var gSize = 0;

var gPeriod = 14;

var gWait = 0; // to keep data load sequence

/* -----------------------------------------------------------------------------------------------------------------------
   GET DATA - HOPKINS
   -------------------------------------------------------------------------------------------------------------------- */

function setGlobal(path, type) {
    fetch(path)
    .then(response => response.text())
    .then(data => {
               
        let aData = data.split('\n');
        let [state, region, lat, long, ...dates ] = aData[0].split(',');
        
        for (let k=1; k < aData.length-1; k++) {
            
            // set state, region and key
            [state, region, lat, long, ...values ] = aData[k].split(',');
            
            if (state.indexOf('"') !== -1) {
                [trash1, state, trash2 ] = aData[k].split('"');
                [region, trash3 ] = trash2.substring(1).split(',');
                values.shift();
            }
            
            if (region.indexOf('"') !== -1) {
                [trash1, region, trash2 ] = aData[k].split('"');
                values.shift();
            }
            
            let key = ( state === '') ? 
                        region.toString().trim() : 
                            region.toString().trim()+', '+state.toString().trim();
            
            // build JSON object
            for (let i=0; i<values.length; i++) {
                
                let value = parseInt(values[i]);
                
                if (typeof gData[key] === 'undefined') { gData[key] = []; }
                if (typeof gData[key][i] === 'undefined') { gData[key][i] = {}; }
                if (typeof gData[key][i][type] === 'undefined') { gData[key][i][type] = value; }
                if (typeof gData[key][i].date === 'undefined') {
                    
                    let d = new Date(dates[i]); 
                    let dM = (d.getMonth()+1).toString();
                    let dD = (d.getDate()).toString();
                    let dY = (d.getFullYear()).toString();

                    gData[key][i].date = dY+'-'+dM+'-'+dD;                    
                }
            }
        }
        gWait++; if (gWait === 3) { setPage(); }
    });
}

function getHopkins() {

    gData = {};
    gWait = 0;
    
    let dir = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/';
    dir += 'csse_covid_19_data/csse_covid_19_time_series/';

    setGlobal(dir+"time_series_covid19_confirmed_global.csv", "confirmed");
    setGlobal(dir+"time_series_covid19_deaths_global.csv", "deaths");
    setGlobal(dir+"time_series_covid19_recovered_global.csv", "recovered");
}

/* -----------------------------------------------------------------------------------------------------------------------
   GET DATA - POMBER
   -------------------------------------------------------------------------------------------------------------------- */

function getPomber() {
    fetch("https://pomber.github.io/covid19/timeseries.json")
    .then(response => response.json())
    .then(data => {
        
        gWait = 0;
        gData = data;
        setPage();
    });
}

/* -----------------------------------------------------------------------------------------------------------------------
   CUSTOM DATA SORT (if no value there is '-')
   -------------------------------------------------------------------------------------------------------------------- */

$.extend( $.fn.dataTableExt.oSort, {
    
    "sethigh-asc": function ( a, b ) {
        
        let x = a;
        let y = b;
        
             if (x == "-" && y != "-") { return  1; }
        else if (x != "-" && y == "-") { return -1; }
        else if (x == "-" && y == "-") { return  0; }
        else if (x != "-" && y != "-") { 
            
            x = parseFloat(a); 
            y = parseFloat(b);
            
            return ( (x < y) ? -1 : ( (x > y) ? 1 : 0 ) );
        }
    },
    "sethigh-desc": function ( a, b ) {
        
        let x = a;
        let y = b;
        
             if (x == "-" && y != "-") { return -1; }
        else if (x != "-" && y == "-") { return  1; }
        else if (x == "-" && y == "-") { return  0; }
        else if (x != "-" && y != "-") { 
            
            x = parseFloat(a); 
            y = parseFloat(b);            
            
            return ( (x < y) ? 1 : ( (x > y) ? -1 : 0 ) );
        }
    },
    
    "setlow-asc": function ( a, b ) {
        
        let x = a;
        let y = b;
        
             if (x == "-" && y != "-") { return -1; }
        else if (x != "-" && y == "-") { return  1; }
        else if (x == "-" && y == "-") { return  0; }
        else if (x != "-" && y != "-") { 
            
            x = parseFloat(a); 
            y = parseFloat(b);
            
            return ( (x < y) ? -1 : ( (x > y) ? 1 : 0 ) );
        }
    },
    "setlow-desc": function ( a, b ) {
        
        let x = a;
        let y = b;
        
             if (x == "-" && y != "-") { return  1; }
        else if (x != "-" && y == "-") { return -1; }
        else if (x == "-" && y == "-") { return  0; }
        else if (x != "-" && y != "-") { 
            
            x = parseFloat(a); 
            y = parseFloat(b);            
            
            return ( (x < y) ? 1 : ( (x > y) ? -1 : 0 ) );
        }
    }
});

/* -----------------------------------------------------------------------------------------------------------------------
   DATA CALCULATIONS
   -------------------------------------------------------------------------------------------------------------------- */

function getTrend(key, data, p) {
    
    let tIndex = 0, tUp = 0, tDown = 0;
    let tBefore = 0, tDiff = 0;
    let size = data.length-1;
     
    for(let i=0; i<p; i++) {
        
        let id = size-i;
        
        // skip empty values
        if (typeof data[id].confirmed === 'undefined' || 
            typeof data[id-1].confirmed === 'undefined') { continue; }
        
        tDiff = data[id].confirmed - data[id-1].confirmed;
        
        // skip invalid data
        if (tDiff < 0) { continue; }
        
        if (tDiff > tBefore) { tDown++; }
        if (tDiff < tBefore) { tUp++; }
        
        tBefore = tDiff;
    }
    
    if (tUp === tDown) { return 0; }
    if (tUp > p/2 || tDown > p/2) { tIndex = tUp - tDown; return tIndex; }
    return '-';
}

function getGrow(key, data, p) {
    
    let tGrow = 0, j = 0;
    let size = data.length-1;
     
    for(let i=0; i<p; i++) {
        
        let id = size-i;
        
        // skip empty values
        if (typeof data[id].confirmed === 'undefined' || 
            typeof data[id-1].confirmed === 'undefined') { continue; }
        
        let tDiff = data[id].confirmed - data[id-1].confirmed;
        
        // skip invalid data
        if (tDiff < 0) { continue; }
        
        j++;
        
        if (data[id].confirmed === 0) {
            tGrow += 0;
        } else {
            tGrow += ( tDiff / data[id].confirmed ) * 100;
        }
    }
    
    if (j > p/2) { return tGrow/p; }
    
    return '-';
}

/* -----------------------------------------------------------------------------------------------------------------------
   SET PAGE PARTS
   -------------------------------------------------------------------------------------------------------------------- */

function setPanel() {
    
    let tPanel = '';
    
    tPanel += 'Data source: ';
    tPanel += '<input type="radio" id="source1" name="source" value="1" onClick="setSource(1)" checked="checked" />';
    tPanel += '<label for="1">Pomber</label>';
    tPanel += '&nbsp;&nbsp;';
    tPanel += '<input type="radio" id="source2" name="source" value="2" onClick="setSource(2)" />';
    tPanel += '<label for="2">Hopkins (global)</label>';
    tPanel += '</br>';
    
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

function setTable(data) {
    
    let tBody = '<tbody>';
    
    Object.keys(data).forEach(function(key) {

        gSize = data[key].length-1;
                
        let col0 = key;
        let col1 = '<button onClick="showChart(\''+key+'\')">show</button>';
        let col2 = (typeof data[key][gSize].confirmed !== 'undefined') ? data[key][gSize].confirmed : '-';
        let col3 = (typeof data[key][gSize].deaths !== 'undefined') ? data[key][gSize].deaths : '-';

        let col4 = 0;
        if (col3 === '-' || col2 === '-') { col4 = '-'; }
        else if (col2 !== 0 && col2 !== '-') { col4 = ( col3 / col2 ) * 100; }

        let col5 = (typeof data[key][gSize].recovered !== 'undefined') ? data[key][gSize].recovered : '-';

        let col6 = 0;
        if (col5 === '-' || col2 === '-') { col6 = '-'; }
        else if (col2 !== 0) { col6 = ( col5 / col2 ) * 100; }
        
        let col7 = getTrend(key, data[key], gPeriod);
        let col8 = getGrow(key, data[key], gPeriod);
        
        // build table content
        tBody += '<tr>';
        tBody += '<td class="col0">' + col0 + '</td>';
        tBody += '<td class="col1">' + col1 + '</td>';
        tBody += '<td class="col2">' + col2 + '</td>';
        tBody += '<td class="col3">' + col3 + '</td>';
        tBody += '<td class="col4">' +( col4 !== '-' ? col4.toFixed(2) : '-' )+ '</td>';
        tBody += '<td class="col5">' + col5 + '</td>';
        tBody += '<td class="col6">' +( col6 !== '-' ? col6.toFixed(2) : '-' )+ '</td>';
        tBody += '<td class="col7">' + col7 + '</td>';
        tBody += '<td class="col8">' +( col8 !== '-' ? col8.toFixed(2) : '-' )+ '</td>';
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
    
    // remove table if exist (for table changes)
    if (gTable !== '') { gTable.destroy(); }
    
    gTable = $('#covid-table').DataTable({
        "orderClasses": true,
        "responsive": true,
        "columnDefs": [ { "type": "sethigh", "targets": [2, ,3, 4, 7, 8] }, 
                        { "type": "setlow", "targets": [5, 6] } ]
    });
    new $.fn.dataTable.FixedHeader(gTable);
    
    // set default sort for table
    showDeaths(1);
}

function setChart(key, data, p) {
    
    let tX = []
    let tYc = [], tYd = [], tYr = [];
    
    gChKey = key;
    
    // calculation
    for(let i=p-1; i>=0; i--) {
        
        let id = gSize-i;
        
        let yc = 0;
        let yd = 0;
        let yr = 0;
        
        if (typeof data[id].confirmed !== 'undefined' && 
            typeof data[id-1].confirmed !== 'undefined') { yc = data[id].confirmed - data[id-1].confirmed; }
        
        if (typeof data[id].deaths !== 'undefined' && 
            typeof data[id-1].deaths !== 'undefined') { yd = data[id].deaths - data[id-1].deaths; }
            
        if (typeof data[id].recovered !== 'undefined' && 
            typeof data[id-1].recovered !== 'undefined') { yr = data[id].recovered - data[id-1].recovered; }
        
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
    
    let key = Object.keys(data)[1];
    let s = data[key].length-1;
    
    let tStatus = '<div class="bg-info">Last update: ';
    tStatus += data[key][s].date;
    tStatus += '</div>';
    
    document.getElementById("STATUS").innerHTML = tStatus;
}

/* -----------------------------------------------------------------------------------------------------------------------
   SET TITLE
   -------------------------------------------------------------------------------------------------------------------- */

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

/* -----------------------------------------------------------------------------------------------------------------------
   BUTTONS
   -------------------------------------------------------------------------------------------------------------------- */

function showDeaths(type) {
    
    if (type > 0) {
        gTable.order([4, 'asc'],[2, 'desc']).draw();
        setTitle(1);
    } else {
        gTable.order([4, 'desc'],[2, 'asc']).draw();
        setTitle(-1);
    }
}

function showRecov(type) {
    
    if (type > 0) {
        gTable.order([6, 'desc'],[2, 'desc']).draw();
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
        gTable.order([2, 'desc'],[8, 'desc']).draw();
        setTitle(-3);
    }
}

function showTrend(type) {
    
    if (type > 0) {
        gTable.order([7, 'asc'],[6, 'desc']).draw();
        setTitle(4);
    } else {
        gTable.order([7, 'desc'],[6, 'asc']).draw();
        setTitle(-4);
    }
}

function showGrow(type) {
    
    if (type > 0) {
        gTable.order([8, 'asc'],[6, 'desc']).draw();
        setTitle(5);
    } else {
        gTable.order([8, 'desc'],[6, 'asc']).draw();
        setTitle(-5);
    }
}

function showChart(key) {
    
    setChart(key, gData[key], gPeriod);
}

/* -----------------------------------------------------------------------------------------------------------------------
   RADIO BUTTON (SELECTORS)
   -------------------------------------------------------------------------------------------------------------------- */

function setPeriod(p) {
    
    if (p === 0) { gPeriod = gSize; } else { gPeriod = p; }
    
    // save current settings
    let t = gTitle;
    let oValue = gTable.order();
    let sValue = $('.dataTables_filter input').val();
    
    // recalculate data for new period 
    setTable(gData);
    
    // reload chart if opened
    if (gChart !== '') { 
        setChart(gChKey, gData[gChKey], gPeriod);
    }
    
    // restore settings
    gTable.order(oValue).draw();
    gTable.search(sValue).draw();
    setTitle(t);
}

function setSource(s) {
    
    if (s === 1) {
        
        getPomber(); 
        
    } else { 
        
        getHopkins();
    }
}

/* -----------------------------------------------------------------------------------------------------------------------
   BUILD PAGE
   -------------------------------------------------------------------------------------------------------------------- */

function setPage() {

    // clear old one, avoid no data for new source
    if (gChart !== '') { 
        gChart.destroy(); 
        document.getElementById('box-chart').style.display = 'none';
    }
    
    setTable(gData);  
    setStatus(gData);
}

/* -----------------------------------------------------------------------------------------------------------------------
   INIT PAGE
   -------------------------------------------------------------------------------------------------------------------- */
  
setPanel(); // not reload panel to keep radio change
setSource(1);
