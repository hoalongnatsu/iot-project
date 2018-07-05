import apiCall from './services/api/apiCall';
import Swal from 'sweetalert2';
import Chart from 'chart.js';
import iziToast from 'izitoast';
import '../css/iziToast.min.css';
import '../css/ladda-themeless.min.css';
import * as Ladda from 'ladda';

class Statistic {
   constructor() {
      this.$listSeason = document.querySelector('.list-season');
      this.$contentSeason = document.querySelector('.content-season');
      this.$formSesson = $('#form-sesson');
      this.loadBtn = Ladda.create(document.querySelector('#btn-submit'));

      this.renderListSesson();
      this.addEventListener();
   }

   renderListSesson() {
      apiCall('iot/api/sesson/getallsesson').then((response) => {
         response.forEach(item => {
            this.createListSesson(item);
         });
      });
   }

   createListSesson(data) {
      //Create unquied id
      let unquiedId = data.day.replace(/\/|-/g, '');
      //Create item
      let listGroupItem = $(`<a class="list-group-item list-group-item-action" data-toggle="list" href="#list${unquiedId}" role="tab" aria-controls="home">${data.day}</a>`);
      let contnetListItem = `
         <div class="tab-pane fade" id="list${unquiedId}" role="tabpanel">
            <h3 class="text-center">${data.day}</h3>
            <div class="row py-5">
               <div class="col-md-6">
                  <canvas></canvas>
               </div>
               <div class="col-md-6">
                  <canvas></canvas>
               </div>
            </div>
         </div>`;
      //attach listener to element
      listGroupItem.click((e) => {
         let id = $(e.target).attr('href');
         let ctx = document.querySelectorAll(`${id} canvas`);
         this.drawChart(data, ctx);
      });
      // attach element to DOM
      $(this.$listSeason).prepend(listGroupItem);
      this.$contentSeason.insertAdjacentHTML('afterbegin', contnetListItem);
   }

   drawChart(data, ctx) {
      let pieChart = ctx[0].getContext('2d');
      let barChart = ctx[1].getContext('2d');

      new Chart(pieChart, {
         type: 'pie',
         data: {
            datasets: [{
               data: [data.meeting_quality_standard, data.die_shrimp, data.low_quantity],
               backgroundColor: ['rgba(242, 32, 22, 0.6)', 'rgba(46, 134, 193, 0.6)', 'rgba(86, 101, 115, 0.6)']
            }],

            labels: [
               'meeting quality standard',
               'die shrimp',
               'low quantity'
            ]
         },
         options: {
            legend: {
               position: 'right'
            }
         }
      });

      new Chart(barChart, {
         type: 'horizontalBar',
         data: {
            datasets: [
               {
                  label: 'Temp',
                  data: [data.temp_avg],
                  backgroundColor: 'rgba(255, 0, 0, 0.6)',
                  borderColor: 'rgba(255, 0, 0, 0.8)',
                  borderWidth: 2
               },
               {
                  label: 'Turb',
                  data: [data.turb_avg],
                  backgroundColor: 'rgba(41, 128, 185, 0.6)',
                  borderColor: 'rgba(41, 128, 185, 0.8)',
                  borderWidth: 2
               },
               {
                  label: 'PH',
                  data: [data.ph_avg],
                  backgroundColor: 'rgba(241, 196, 15, 0.6)',
                  borderColor: 'rgba(241, 196, 15, 0.8)',
                  borderWidth: 2
               },
            ],
            labels: [
               data.day
            ]
         },
         options: {
            scales: {
               xAxes: [{
                  barPercentage: 0.5,
                  ticks: {
                     min: 0,
                     max: 80
                  }
               }]
            },
         }
      });
   }

   addSesson() {
      let url = this.$formSesson.attr('action');
      let data = this.$formSesson.serialize();
      $.ajax({
         url: `${SERVER_URL}/${url}`,
         type: 'post',
         data: data,
         dataType: 'json'
      }).done((response) => {
         this.loadBtn.stop();
         this.createListSesson(response.data);
         Swal({
            type: 'success',
            title: response.message,
            showConfirmButton: false,
            timer: 1000
         })
      }).fail(() => {
         this.loadBtn.stop();
         Swal({
            type: 'error',
            title: 'Something went wrong! Try again'
         })
      });
   }

   addEventListener() {
      this.$formSesson.submit((e) => {
         e.preventDefault();
         this.loadBtn.start();
         this.addSesson();
      });
   }
}

let statistic = new Statistic();

// var ctx1 = document.getElementById('myChart1').getContext('2d');
// var ctx2 = document.getElementById('myChart2').getContext('2d');

// var char = new Chart(ctx1, {
//    type: 'pie',
//    data: {
//       datasets: [{
//          data: [10.11, 20.22, 30],
//          backgroundColor: ['rgba(242, 32, 22, 0.6)', 'rgba(46, 134, 193, 0.6)', 'rgba(86, 101, 115, 0.6)']
//       }],
      
//       labels: [
//          'meeting quality standard',
//          'die shrimp',
//          'low quantity'
//       ]
//    },
//    options: {
//       legend: {
//          position: 'right'
//       }
//    }
// });

// new Chart(ctx2, {
//    type: 'horizontalBar',
//    data: {
//       datasets: [
//          {
//             label: 'Temp',
//             data: [50],
//             backgroundColor: 'rgba(255, 0, 0, 0.6)',
//             borderColor: 'rgba(255, 0, 0, 0.8)',
//             borderWidth: 2
//          },
//          {
//             label: 'Turb',
//             data: [60],
//             backgroundColor: 'rgba(41, 128, 185, 0.6)',
//             borderColor: 'rgba(41, 128, 185, 0.8)',
//             borderWidth: 2
//          },
//          {
//             label: 'PH',
//             data: [7],
//             backgroundColor: 'rgba(241, 196, 15, 0.6)',
//             borderColor: 'rgba(241, 196, 15, 0.8)',
//             borderWidth: 2
//          },
//       ],
//       labels: [
//          '24/6-28/8/2018'
//       ]
//    },
//    options: {
//       scales: {
//          xAxes: [{
//             barPercentage: 0.5,
//             ticks: {
//                min: 0,
//                max: 80
//             }
//          }]
//       },
//    }
// });