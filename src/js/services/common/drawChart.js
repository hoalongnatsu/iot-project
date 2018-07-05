export default function drawChar (info) {
   Highcharts.chart(info.element, {
      colors: [info.color],
      chart: {
         zoomType: 'x'
      },
      title: {
         text: info.title
      },
      xAxis: {
         type: 'datetime'
      },
      yAxis: {
         title: {
            text: info.yAxis
         }
      },
      legend: {
         enabled: false
      },
      plotOptions: {
            area: {
               fillColor: {
                  linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                  },
                  stops: [
                     [0, info.color],
                     [1, Highcharts.Color(info.color).setOpacity(0).get('rgba')]
                  ]
               },
               marker: {
                  radius: 2
               },
               lineWidth: 1,
               states: {
                  hover: {
                        lineWidth: 1
                  }
               },
               threshold: null
            }
      },
      series: [{
            type: 'area',
            name: info.name,
            data: info.data
      }]
   });
}