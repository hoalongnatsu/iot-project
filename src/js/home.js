import './general';
import './bootstrap';
import apiCall from './services/api/apiCall';
import { setInterval } from 'timers';
import drawChar from "./services/common/drawChart";
import SimpleWebRTC from 'simplewebrtc';
import Chart from 'chart.js';
import { Email } from './smtp';

const navbar = require('../../partial/navbar.html');
const overviewTable = require('../../partial/overview-table.html');
const turbTable = require('../../partial/turb-table.html');
const tempTable = require('../../partial/temp-table.html');
const phTable = require('../../partial/ph-table.html');

let cameraId = localStorage.getItem('unique-camera-id');
CanvasJS.addColorSet("red", ["#E8390A"]);
CanvasJS.addColorSet("orange", ["#F5B041"]);

class Home
{
   constructor()
   {
		 this.dataSetting = {
			temp: {
				high: '',
				low: '',
				error: 'The temperature is too %type%'
			},
			turb: {
				high: '',
				low: '',
				error: 'The turbidity is too %type%'
			},
			ph: {
				high: '',
				low: '',
				error: 'The ph is too %type%'
			}
		};
		
		this.$overviewTable = document.querySelector('#overview-tab');
		this.$turbidityTable = document.querySelector('#turbidity-tab');
		this.$tempTable = document.querySelector('#temp-tab');
		this.$phTable = document.querySelector('#ph-tab');

		this.$containerLoader = document.querySelector('#container-loader');
		this.$turbidityCanvas = document.querySelector('#overview-turbidity');
		this.$tempCanvas = document.querySelector('#overview-temp');
		this.$phCanvas = document.querySelector('#overview-ph');

		this.turbidityDataRealTime;
		this.tempDataRealTime;
		this.phDataRealTime;

      this.turbidityData;
      this.tempData;
		this.phData;
		
		this.interval;

		this.$maxTurb = document.querySelector('#max-turb');
		this.$currentTurb = document.querySelector('#current-turb');
		this.$minTurb = document.querySelector('#min-turb');

		this.$maxTemp = document.querySelector('#max-temp');
		this.$currentTemp = document.querySelector('#current-temp');
		this.$minTemp = document.querySelector('#min-temp');

		this.$maxPh = document.querySelector('#max-ph');
		this.$currentPh = document.querySelector('#current-ph');
		this.$minPh = document.querySelector('#min-ph');

		this.$camera = document.querySelector('#container-camera');

		this.addEventListener();
		this.intervalOverView();
		this.loadData();
   }

	intervalOverView() {
		this.loadOverview();
		window.clearInterval(this.interval);
		this.interval = window.setInterval(this.loadOverview.bind(this), 1200);
	}

	loadData() {
		apiCall('iot/api/setting').then((response) => {
			//Number point
			this.numberPoint = response.number_point;
			//Form setting
			this.checked = response.allow_notification;
			this.phone = response.phone;
			this.email = response.email;
			this.dataSetting.temp.high = response.high_temperature;
			this.dataSetting.temp.low = response.low_temperature;
			this.dataSetting.turb.high = response.high_turbidity;
			this.dataSetting.turb.low = response.low_turbidity;
			this.dataSetting.ph.high = response.high_ph;
			this.dataSetting.ph.low = response.low_ph;
		})
	}

	checkError(value, type) {
		if(this.checked) {
			if (value > this.dataSetting[type].high) {
				this.showError(type, 'high');
			} else if (value < this.dataSetting[type].low) {
				this.showError(type, 'low');
			}
		}
	}

	showError(type, highOrLow) {
		clearInterval(this.interval);
		let message = this.dataSetting[type].error.replace('%type%', highOrLow);
		$('#error-modal .modal-body').html(message);
		$('#error-modal').modal('show');
		this.sendMail(message);
	}

	sendMail(message) {
		Email.send(
			"miocosplayer@gmail.com",
			this.email,
			"System error",
			`<h1>${message}. Please contact us to repair system</h1>`,
			{
				token: "dfd1ff9a-4556-43d4-aec7-afa2343403a6",
				callback: function done(mes) { console.log(mes); }
			}
		);
	}

   loadOverview() {
      //Data turbidity
      apiCall('iot/api/turbidity/realtime')
         .then((response) => {
				let turbidityDataRealTime = response;
				this.turbidityDataRealTime = turbidityDataRealTime.map((item) => {
					let {x: time, y}= item;
					let x= new Date(time);
					return {x, y};
				});
				this.checkError(this.turbidityDataRealTime[this.turbidityDataRealTime.length - 1].y, 'turb');
				this.drawChartTurbidityOverView();
         });
      //Data temp
		apiCall('iot/api/temp/realtime')
         .then((response) => {
				let tempDataRealTime = response;
				this.tempDataRealTime = tempDataRealTime.map((item) => {
					let { x: time, y } = item;
					let x = new Date(time);
					return { x, y };
				});
				this.checkError(this.tempDataRealTime[this.tempDataRealTime.length - 1].y, 'temp');
				this.drawChartTempOverView();
         });
      //Data ph
		apiCall('iot/api/ph/realtime')
         .then((response) => {
				let phDataRealTime = response;
				this.phDataRealTime = phDataRealTime.map((item) => {
					let { x: time, y } = item;
					
					let x = new Date(time);
					return { x, y };
				});
				this.checkError(this.phDataRealTime[this.phDataRealTime.length - 1].y, 'ph');
				this.drawChartPhOverView();
				this.$containerLoader.style.display= 'none';
			});
   }

	//Draw chart overview
   drawChartTurbidityOverView() {
		let chart= new CanvasJS.Chart("overview-turbidity", {
			theme: "light2",
			title: {
				text: "Turbidity"
			},
			axisX: {
				valueFormatString: "H:mm:ss",
			},
			axisY: {
				includeZero: false
			},
			data: [{
				type: "line",
				xValueFormatString: "DD MMM, YYYY H:mm:ss",
				dataPoints: this.turbidityDataRealTime
			}]
		});
		chart.render();
   }

   drawChartTempOverView() {
		let chart = new CanvasJS.Chart("overview-temp", {
			colorSet: "red",
			theme: "light2",
			title: {
				text: "Temperature"
			},
			axisX: {
				valueFormatString: "H:mm:ss",
			},
			axisY: {
				includeZero: false
			},
			data: [{
				type: "line",
				xValueFormatString: "DD MMM, YYYY H:mm:ss",
				dataPoints: this.tempDataRealTime
			}]
		});
		chart.render();
   }

   drawChartPhOverView() {
		let chart = new CanvasJS.Chart("overview-ph", {
			colorSet: "orange",
			theme: "light2",
			title: {
				text: "PH"
			},
			axisX: {
				valueFormatString: "H:mm:ss",
			},
			axisY: {
				includeZero: false
			},
			data: [{
				type: "line",
				xValueFormatString: "DD MMM, YYYY H:mm:ss",
				dataPoints: this.phDataRealTime
			}]
		});
		chart.render();
	}
	
	//Load and draw chart turbidity
	loadTurbidity() {
		this.loadMaxCurrentMinTurb();
		apiCall('iot/api/turbidity/hour')
			.then((response) => {
				this.turbidityData = response;
				this.drawChartTurb();
			});
		window.clearInterval(this.interval);
		this.interval = window.setInterval(this.loadMaxCurrentMinTurb.bind(this), 1000);
	}

	drawChartTurb() {
		let info= {
			element: 'chart-turb-table',
			color: '#0E7FA9',
			title: 'Turbidity',
			yAxis: 'cm',
			name: 'cm',
			data: this.turbidityData
		};

		drawChar(info);
	}

	//Load and draw chart temp
	loadTemp() {
		this.loadMaxCurrentMinTemp();
		apiCall('iot/api/temp/hour')
			.then((response) => {
				this.tempData = response;
				this.drawChartTemp();
			});
		window.clearInterval(this.interval);
		this.interval = window.setInterval(this.loadMaxCurrentMinTemp.bind(this), 1000);
	}

	drawChartTemp() {
		let info = {
			element: 'chart-temp-table',
			color: '#F1472C',
			title: 'Temperature',
			yAxis: 'C',
			name: 'C',
			data: this.tempData
		};

		drawChar(info);
	}

	//Load and draw chart ph
	loadPh() {
		this.loadMaxCurrentMinPh();
		apiCall('iot/api/ph/hour')
			.then((response) => {
				this.phData = response;
				this.drawChartPh();
			});
		window.clearInterval(this.interval);
		this.interval = window.setInterval(this.loadMaxCurrentMinPh.bind(this), 1000);
	}

	drawChartPh() {
		let info = {
			element: 'chart-ph-table',
			color: '#E7A012',
			title: 'PH',
			yAxis: 'ph',
			name: 'ph',
			data: this.phData
		};

		drawChar(info);
	}

	//Load max current min
	loadMaxCurrentMinTurb() {
		apiCall('iot/api/turbidity/maxcurrentmin')
			.then((response) => {
				this.$maxTurb.innerHTML= response.max;
				this.$currentTurb.innerHTML = response.current;
				this.$minTurb.innerHTML = response.min;
			});
	}

	loadMaxCurrentMinTemp() {
		apiCall('iot/api/temp/maxcurrentmin')
			.then((response) => {
				this.$maxTemp.innerHTML = response.max;
				this.$currentTemp.innerHTML = response.current;
				this.$minTemp.innerHTML = response.min;
			});
	}

	loadMaxCurrentMinPh() {
		apiCall('iot/api/ph/maxcurrentmin')
			.then((response) => {
				this.$maxPh.innerHTML = response.max;
				this.$currentPh.innerHTML = response.current;
				this.$minPh.innerHTML = response.min;
			});
	}

	addEventListener() {
		this.$overviewTable.addEventListener('click', this.intervalOverView.bind(this));
		this.$turbidityTable.addEventListener('click', this.loadTurbidity.bind(this));
		this.$tempTable.addEventListener('click', this.loadTemp.bind(this));
		this.$phTable.addEventListener('click', this.loadPh.bind(this));
	}

	addRemoteVideo($video, peer) {
		if (cameraId != 123456789) {
			console.log($video);
			$video.className = 'video-player';
			$(this.$camera).html($video);
		}
	}
}

$('navbar').replaceWith(navbar);
$('overview-table').replaceWith(overviewTable);
$('turb-table').replaceWith(turbTable);
$('temp-table').replaceWith(tempTable);
$('ph-table').replaceWith(phTable);

var home = new Home();
const room = location.search && location.search.split('?')[1];

function getDevices() {
	return new Promise((resolve, reject) => {
		navigator.mediaDevices.enumerateDevices().then(function (devices) {
			let videoDevice = devices.filter(device => device.kind === 'videoinput');
			resolve(videoDevice);
		}).catch(error => {
			reject(error);
		});
	});
}

getDevices().then(data => {
	console.log(data);
	const webrtc = new SimpleWebRTC({
		localVideoEl: 'localVideo',
		remoteVideosEl: '',
		autoRequestMedia: true,
		debug: false,
		media: {
			video: {
				deviceId: data[0].deviceId
			}
		}
	});

	if (room === '') {
		webrtc.createRoom('monitoring', (err, name) => {
			if (!err) {
				const newUrl = location.pathname + '?' + name;
				history.replaceState({}, '', newUrl);
			} else {
				console.error(err);
			}
		});
	}

	webrtc.on('readyToCall', () => {
		if (room) webrtc.joinRoom(room);
	});

	webrtc.on('videoAdded', ($video, peer) => home.addRemoteVideo($video, peer));
});