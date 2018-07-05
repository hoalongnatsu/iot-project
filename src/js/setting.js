import './general';
import apiCall from './services/api/apiCall';
import Swal from 'sweetalert2';
import Chart from 'chart.js';
import iziToast from 'izitoast';
import '../css/iziToast.min.css';

const STATE_FORM = ['DISABLE', 'EDIT'];
const STATE_BTN_SETTING= ['EDIT', 'UPDATE'];

class Setting
{
   constructor()
   {
      //Form for jquery
      this.$settingForm = $('#setting-form');
      this.$changePointForm = $('#change-point-form');
      //Button
      this.$allowUpdate = $('.allow-update');
      this.$btnAllow = document.querySelector('#btn-allow');
      this.$btnSetting = document.querySelector('#btn-setting');
      //Form for js
      this.$formSetting = document.querySelector('#setting-form');
      this.$formChangePoint = document.querySelector('#change-point-form');
      //Range input, ouput, canvas chart
      this.$rangeInput = document.querySelector('#range-input');
      this.$rangeOutput = document.querySelector('#range-output');
      this.$chart = document.querySelector('#chart');

      this.stateForm = STATE_FORM[0];
      this.numberPoint;
      this.labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      this.data = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

      this.loadData();
      this.addEventListener();
   }

   loadData()
   {
      apiCall('iot/api/setting').then((response) => {
         //Number point
         this.numberPoint = response.number_point;
         this.$rangeInput.value = this.numberPoint;
         this.$rangeOutput.innerHTML = this.numberPoint;
         this.drawChart();
         this.$formChangePoint.elements.number_point.value = this.numberPoint;
         //Form setting
         this.$btnAllow.checked = response.allow_notification;
         this.$formSetting.elements.high_tem.value = response.high_temperature;
         this.$formSetting.elements.low_tem.value = response.low_temperature;
         this.$formSetting.elements.high_turb.value = response.high_turbidity;
         this.$formSetting.elements.low_turb.value = response.low_turbidity;
         this.$formSetting.elements.high_ph.value = response.high_ph;
         this.$formSetting.elements.low_ph.value = response.low_ph;
         this.$formSetting.elements.phone.value = response.phone;
         this.$formSetting.elements.email.value = response.email;
      })
   }

   drawChart()
   {
      let dataSetting= {
         labels: this.labels.slice(0, this.numberPoint),
         datasets: [{
            label: 'Number point',
            fill: false,
            data: this.data.slice(0, this.numberPoint),
            borderColor: '#5DADE2',
            backgroundColor: '#5DADE2',
         }]
      }
      
      new Chart(this.$chart, {
         type: 'line',
         data: dataSetting,
         options: {
            animation: {
               duration: 0,
            },
            scales: {
               label : {
                  fontSize: 18
               },
               yAxes: [{
                  display: false
               }]
            }
         }
      });
   }

   setting()
   {
      if (this.stateForm === STATE_FORM[0])
      {
         this.allowEditSetting();
         return;
      }

      this.updateSetting(this.$settingForm)
      .done((response) => {
         Swal({
            type: 'success',
            title: response.message,
            showConfirmButton: false,
            timer: 1500
         })
         this.$allowUpdate.attr('disabled', '');
         this.stateForm = STATE_FORM[0];
         this.$btnSetting.textContent = STATE_BTN_SETTING[0];
      })
      .fail(() => {
         Swal({
            type: 'error',
            title: 'Something went wrong! Try again'
         })
      });
   }

   allowEditSetting()
   {
      this.$allowUpdate.removeAttr('disabled');
      this.stateForm = STATE_FORM[1];
      this.$btnSetting.textContent = STATE_BTN_SETTING[1];
   }

   updateSetting(form)
   {
      let url = form.attr('action');
      let data = form.serialize();
      return $.ajax({
         url: `${SERVER_URL}/${url}`,
         type: 'post',
         data: data,
         dataType: 'json'
      });
   }

   changeAllowSetting()
   {
      apiCall('iot/api/setting/changeallowsetting').then((response) => {
         iziToast.info({
            title: 'Message',
            message: response.message,
            position: 'topCenter',
            progressBar: false
         });
      });
   }

   changeRangeOutput()
   {
      this.$rangeOutput.innerHTML = this.$rangeInput.value;
   }

   changeNumberPoint()
   {
      this.numberPoint = this.$rangeInput.value;
      this.drawChart();
      this.$formChangePoint.elements.number_point.value = this.numberPoint;
      this.$changePointForm.show();
   }

   addEventListener()
   {
      this.$settingForm.submit((e) => {
         e.preventDefault();
         this.setting();
      });
      this.$changePointForm.submit((e) => {
         e.preventDefault();
         this.updateSetting(this.$changePointForm)
         .done((response) => {
            this.$changePointForm.hide();
            iziToast.success({
               title: 'Message',
               message: response.message,
               position: 'topCenter',
               progressBar: false
            });
         })
         .fail(() => {
            Swal({
               type: 'error',
               title: 'Something went wrong! Try again'
            })
         });
      });
      this.$btnAllow.addEventListener('click', this.changeAllowSetting);
      this.$rangeInput.addEventListener('input', this.changeRangeOutput.bind(this));
      this.$rangeInput.addEventListener('change', this.changeNumberPoint.bind(this));
   }
}

let setting= new Setting();