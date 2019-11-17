# svg的响应式

项目中遇到一个数据图，无法在echarts找到类似的设置，就研究svg写了一个。但是新需求需要对页面进行响应式处理，就上网找了下svg的响应式。
首先尝试对x，y等数值改写为百分数，一来麻烦，而来path写成百分数不生效。
然后看到了svg的viewBox属性，可以对svg进行缩放，并通过preserveAspectRatio属性来控制具体的实现方式。

#### viewport
viewport就是指svg本身的大小，可以通过width属性和height属性来控制。这里我因为要用媒体查询，就通过css来写style了。

#### viewbox
viewbox就是控制svg进行缩放。有四个参数，分别是x1，y1，x2，y2。就是左上角的x，y坐标和右下角的x，y坐标。开始我理解反了，以为要对viewbox做相应。viewbox本身不用写单位，默认px。查了下可以写em等单位，就用响应式写了svg的font-size进行控制，但是没有效果。后来发现是viewbox写死成原始大小，然后viewport来控制缩放。这样就简单了，viewbox写成原始大小，然后对svg的实际宽高通过css来控制。

#### preserveAspectRatio
当viewbox和viewport的宽和高比例不一致的时候可以指定如何缩放。preserveAspectRatio必须与viewBox配合使用，单独使用无效。它有两个参数，第一个参数是必须的第二个是可选的。
第一个参数表示如何对齐，包括x和y。x可选xMin,xMid,xMax；y可选YMin，YMid，YMax。第二个参数写none会拉伸变形，而meet会保持比例缩放，以最小边对齐。
preserveAspectRatio不写的话，默认就是xMinYMin meet。

````html
<svg viewBox="0 0 300 180" preserveAspectRatio="xMinYMin meet">
  <!-- 定义渐变 -->
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" style="stop-color:#FFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#AE76F8;stop-opacity:1" />
    </radialGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(83,75,129);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(45,45,70);stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 上方文字 -->
  <text x="10" y="10" fill="#A6A5A5" style="font-size: 10px;">1st</text>
  <text x="10" y="25" fill="#A6A5A5" style="font-size: 10px;">TEST</text>
  <text x="236" y="10" fill="#AE76F8" style="font-size: 10px;">LAST</text>
  <text x="236" y="25" fill="#AE76F8" style="font-size: 10px;">TEST</text>
  <!-- 矩形 -->
  <rect x="10" y="25" width="256" height="126"
  fill="url(#grad2)"/>
  <!-- 十字 -->
  <line x1="10" y1="93" x2="266" y2="93"
  style="stroke:rgb(82,80,113);stroke-width:1"/>
  <line x1="138" y1="30" x2="138" y2="156"
  style="stroke:rgb(82,80,113);stroke-width:1"/>
  <!-- 圆弧曲线 -->
  <path d="M 138 45 A 138,126,30,0,0,10,146" stroke="#A6A5A5"
  stroke-width="1" fill="none" stroke-dasharray="5"/>
  <path d="M 138 45 A 138,126,30,0,1,266,146" stroke="#AE76F8"
  stroke-width="1" fill="none" />
  <!-- 圆点 -->
  <circle cx="10" cy="156" r="5" fill="url(#grad1)"/>
  <circle cx="138" cy="45" r="5" fill="url(#grad1)"/>
  <circle cx="266" cy="156" r="5" fill="url(#grad1)"/>
  <!-- 底部文字 -->
  <text x="10" y="176" fill="#A6A5A5" style="font-size: 10px;">Jan 1, 2017</text>
  <text x="108" y="176" fill="#A6A5A5" style="font-size: 10px;">May 1, 2017</text>
  <text x="216" y="176" fill="#AE76F8" style="font-size: 10px;">Aug 1, 2017</text>
  <!-- 中间图形 -->
  <!-- 中间文字 -->
  <text x="140" y="90" fill="#A6A5A5" style="font-size: 8px;">LATEST TEST</text>
  <text x="140" y="100" fill="#A6A5A5" style="font-size: 8px;">FREQUENCY</text>
  <text x="158" y="133" fill="#FFFFFF" style="font-size: 20px;">3</text>
  <text x="178" y="133" fill="#FFFFFF" style="font-size: 8px;">months</text>
</svg>
````

````css
.svg{width: 300px; height: 180px;}
@media only screen and (min-width: 1600px) {
  .svg{width: 330px; height: 198px}
}
@media only screen and (min-width: 1920px) {
  .svg{width: 390px; height: 234px}
}
````