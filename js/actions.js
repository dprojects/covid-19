var output = "";

var tTable1 = '<table id="covid-table-1" class="display">';
var tTable2 = '<table id="covid-table-2" class="display">';
var tTable3 = '<table id="covid-table-3" class="display">';

tHead = '<thead>';
tHead += '<tr>';

tHead += '<th class="col1">Place</th>';
tHead += '<th class="col2">Confirmed</th>';
tHead += '<th class="col3">Deaths</th>';
tHead += '<th class="col4">Deaths %</th>';
tHead += '<th class="col5">Recovered</th>';
tHead += '<th class="col6">Recovered %</th>';

tHead += '</tr>';
tHead += '</thead>';

var lastUpdate = "";

fetch("https://pomber.github.io/covid19/timeseries.json")
  .then(response => response.json())
  .then(data => {

    tBody1 = '<tbody>';
    tBody2 = '<tbody>';
    tBody3 = '<tbody>';

    Object.keys(data).forEach(function(key) {

        var size = data[key].length-1;

        var col1 = key;
        var col2 = data[key][size].confirmed;
        var col3 = data[key][size].deaths;

        var col4 = 0;
        if (col2 !== 0) {
            col4 = ( col3 / col2 ) * 100;
        }

        var col5 = data[key][size].recovered;

        var col6 = 0;
        if (col2 !== 0) {
            col6 = ( col5 / col2 ) * 100;
        }

        // build content for table 1
        if (col2 > 100) {

            tBody1 += '<tr>';

            tBody1 += '<td class="col1">' + col1 + '</td>';
            tBody1 += '<td class="col2">' + col2 + '</td>';
            tBody1 += '<td class="col3">' + col3 + '</td>';
            tBody1 += '<td class="col4">' + col4.toFixed(2) + '</td>';
            tBody1 += '<td class="col5">' + col5 + '</td>';
            tBody1 += '<td class="col6">' + col6.toFixed(2) + '</td>';

            tBody1 += '</tr>';
        }

        // build content for table 2
        if (col2 > 100) {

            tBody2 += '<tr>';

            tBody2 += '<td>' + col1 + '</td>';
            tBody2 += '<td>' + col2 + '</td>';
            tBody2 += '<td>' + col3 + '</td>';
            tBody2 += '<td>' + col4.toFixed(2) + '</td>';
            tBody2 += '<td>' + col5 + '</td>';
            tBody2 += '<td>' + col6.toFixed(2) + '</td>';

            tBody2 += '</tr>';
        }

        // build content for table 3
        //if (col2 > 10000) {

            tBody3 += '<tr>';

            tBody3 += '<td>' + col1 + '</td>';
            tBody3 += '<td>' + col2 + '</td>';
            tBody3 += '<td>' + col3 + '</td>';
            tBody3 += '<td>' + col4.toFixed(2) + '</td>';
            tBody3 += '<td>' + col5 + '</td>';
            tBody3 += '<td>' + col6.toFixed(2) + '</td>';

            tBody3 += '</tr>';
        //}

        lastUpdate = data[key][size].date;
    });

    tBody1 += '</tbody>';
    tBody2 += '</tbody>';
    tBody3 += '</tbody>';

    // PAGE CONTENT
    output += '<div class="box-page">';

    output += '<div class="box-table1">';
        output += '<div class="title-table">Best covid-19 healthcare</div>';
        output += tTable1 + tHead + tBody1 + '</table>';
    output += '</div>';

    output += '<div class="box-table2">';
        output += '<div class="title-table">Best covid-19 population resistent</div>';
        output += tTable2 + tHead + tBody2 + '</table>';
    output += '</div>';

    output += '<div class="box-table3">';
        output += '<div class="title-table">Best covid-19 politics</div>';
        output += tTable3 + tHead + tBody3 + '</table>';
    output += '</div>';

    output += '<div class="bg-info">Last update: ' + lastUpdate + '</div>';

    output += '</div>';

    document.getElementById("OUTPUT").innerHTML = output;

    $(document).ready( function () {

        var table1 = $('#covid-table-1').DataTable( {
            "order": [[ 3, 'asc' ]],
            "orderClasses": true,
            responsive: true
        } );

        var table2 = $('#covid-table-2').DataTable( {
            "order": [[ 5, 'dsc' ]],
            "orderClasses": true,
            responsive: true
        } );

        var table3 = $('#covid-table-3').DataTable( {
            "order": [[ 1, 'asc' ]],
            "orderClasses": true,
            responsive: true
        } );

        new $.fn.dataTable.FixedHeader( table1 );
        new $.fn.dataTable.FixedHeader( table2 );
        new $.fn.dataTable.FixedHeader( table3 );

    } );

  });
