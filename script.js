function setNemoPage(result) {

  let page_number = 1;
  let records_per_page = 14;
  let total_page = Math.ceil(result['symbolsList'].length / records_per_page);

  // Display Pagination buttons
  $.fn.displayPaginationButtons = function () {
    let buttons_text = '<li class="page-item"><a class="page-link" id="buttonPrev" href="#" onClick="javascript:$.fn.prevPage();">&laquo;</a>';
    let active = '';

    for (let i = 1; i <= total_page; i++) {
      if (i == 1) {
        active = ' active';
      } else {
        active = '';
      }
      buttons_text = buttons_text + ' <li class="page-item"><a href="#" id="page_index' + i + '" onClick="javascript:$.fn.changePageIndex(' + i + ');" class="page-link page_index' + active + '">' + i + '</a>';
    }
    buttons_text = buttons_text + '<li class="page-item"><a class="page-link" id="buttonNext" href="#" onClick="javascript:$.fn.nextPage();">&raquo;</a>';
    $(".pagination-buttons").text('');
    $(".pagination-buttons").append(buttons_text);
  }

  $.fn.displayPaginationButtons();

  // Display products rows from Json data
  $.fn.displayTableData = function () {
    let start_index = (page_number - 1) * records_per_page;
    let end_index = start_index + (records_per_page - 1);
    end_index = (end_index >= result['symbolsList'].length) ? result['symbolsList'].length - 1 : end_index;
    let symbol = "";
    let html = '';

    for (let i = start_index; i <= end_index; i++) {
      symbol = result['symbolsList'][i].symbol;
      html += '<a href="#" class="d-block text-light p-3 text-center" id="' + symbol + '"> ' + result['symbolsList'][i].symbol + '</a> '
    }
    let htmlDiv = '<div class="menu" id="nemosList"> </div>'

    $("#nemosList").remove();
    $("#nemos").append(htmlDiv);
    $("#nemosList").append(html);
    $(".page_index").removeClass('active');
    $("#page_index" + page_number).addClass('active');
  }

  // Call of the pagination buttons
  $.fn.nextPage = function () {
    page_number++;
    if (total_page < page_number) {
      page_number--;
    } else {
      $.fn.displayTableData();
    }
  }

  $.fn.prevPage = function () {
    page_number--;
    if (page_number > 0) {
      $.fn.displayTableData();
    } else {
      page_number++;
    }
  }

  $.fn.changePageIndex = function (index) {
    page_number = parseInt(index);
    if (total_page >= page_number) {
      $.fn.displayTableData();
    }
  }
  $.fn.displayTableData();
}

function getNemos() {

  let endpoint = 'http://localhost:9090/symbols'
  $.ajax({
    type: "GET",
    url: endpoint,
    success: function (result) {
      setNemoPage(result);
    }
  })
}

// Get the historical data
function getDataNemo(nemo) {

  // Destroy the DataTable and create a new one
  $('#tableData').DataTable().clear();
  $('#tableData').DataTable().destroy();

  $('#tableData').DataTable({
    "pageLength": 5,
    lengthMenu: [5, 10],
    ajax: {
      url: 'http://localhost:9090/historical/' + nemo,
      dataSrc: function (json) {

        if (json.length > 0) {
          // Data Table
          anualAverage(json[0]['historical']);
          return json[0]['historical'];
        } else {
          $('#tableData').DataTable().clear();
          $('#tableData').DataTable().destroy();
          $('#tableData').DataTable({ "language": { "emptyTable": "The searched nemo does not exist" } });

          // Clean the charts
          let chartStatus = Chart.getChart("myChart"); // <canvas> id

          if (chartStatus != undefined) {
            chartStatus.destroy();
          }
        }
      }
    },
    columns: [
      { data: 'close' },
      { data: 'date' },
    ]
  });
}

function anualAverage(historicalData) {
  let years = [];
  let closePorYears = [];
  let average = 0;
  let anualAverage = [];

  // Save the years
  historicalData.forEach(element => {
    if (years.length == 0) {
      years.push(element.date.split('-')[0]);
    } else {
      if (!Object.values(years).includes(element.date.split('-')[0])) {
        years.push(element.date.split('-')[0]);
      }
    }
  });

  // We go through the years and get the anualAverage
  years.forEach(element => {

    closePorYears = historicalData.filter(x => x.date.includes(element));

    average = 0;

    closePorYears.forEach(data => {
      average += data.close
    });

    if (closePorYears.length > 0) {
      average = average / closePorYears.length;
      average = average.toPrecision(6);
    }

    // Save the year and de avarage por year
    anualAverage.push({ date: element, close: parseFloat(average) });
  });

  // We create the graph with the years and their average
  getChart(anualAverage);

}

$(document).ready(function () {
  getNemos();
});

$('#tableData').DataTable({
  "language": {
    "emptyTable": "Select a nemo from the list"
  }
});

// Click on the category set the product in the screen
$(document).on('click', '#nemosList', function (event) {

  let idNemo = event.target.id;

  if (idNemo) {
    getDataNemo(event.target.id);
  }
});

// Grafico
function getChart(historicalData) {
  const ctx = document.getElementById('myChart');

  let chartStatus = Chart.getChart("myChart"); // <canvas> id

  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      datasets: [{
        backgroundColor: [
          'rgba(255, 26, 104, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(0, 0, 0, 0.2)'
        ],
        borderColor: [
          'rgba(255, 26, 104, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(0, 0, 0, 1)'
        ],
        vorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  if (historicalData) {
    historicalData.forEach(element => {
      myChart.data['labels'].push(element.date)
      myChart.data['datasets'][0].data.push(element.close)
    });

  }

  const containerBody = document.querySelector('.containerBody');
  const totalLabels = myChart.data.labels.length;
  if (totalLabels > 7) {
    const newWidth = 700 + ((totalLabels - 7) * 50);
    containerBody.style.width = `${newWidth}px`;
  }

  // Refresh the chart because is not showing the data
  setTimeout(function () {
    myChart.update();
  }, 1000);
}

$(document).on('click', '#searchButton', function (event) {
  let search = $('#searchInput').val();
  getDataNemo(search);
});