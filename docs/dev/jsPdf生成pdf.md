# jspdf生成Pdf文档  

项目需要生成pdf文件，由于对图表样式要求较高，决定放在前端实现。  
查询相关资料，发现多采用jspdf + html2canvas实现。  

## jspdf安装使用  
[官网](https://parall.ax/products/jspdf) [API文档](http://raw.githack.com/MrRio/jsPDF/master/docs/) [github](https://github.com/MrRio/jsPDF)  

#### 安装  
````bash
npm install jspdf
````
#### 常用api  
* text(text, x, y, options, transform)  
  添加文字
* setFontSize(size)
  设置字体大小
* addImage(imageData, format, x, y, width, height, alias, compression, rotation)  
  添加图片
* addPage()  
  添加新页面
* fromHTML(source, x, y, options)
  添加html元素
* save()  
  生成pdf

#### 使用
  1. 直接写入文本
     ````js
     // Default export is a4 paper, portrait, using milimeters for units
     var doc = new jsPDF()

     doc.text('Hello world!', 10, 10)
     doc.save('a4.pdf')
     ````
  2. 使用图片
     ````js
     var imgData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4ge....../2Q==';
       
     var doc = new jsPDF();
       
     doc.setFontSize(40);
     doc.text(35, 25, "Octonyan loves jsPDF");
     doc.addImage(imgData, 'JPEG', 15, 40, 180, 180);
     ````
  3. 使用html
     ````js
     var doc = new jsPDF();
     // We'll make our own renderer to skip this editor
     var specialElementHandlers = {
         '#editor': function(element, renderer){
             return true;
         }
     };
     // All units are in the set measurement for the document
     // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
     doc.fromHTML($('#render_me').get(0), 15, 15, {
         'width': 170,
         'elementHandlers': specialElementHandlers
     });
     ````
     生成的pdf可以自动分页，但是显示效果很差。

## 使用html2canvas  
[官网](http://html2canvas.hertzen.com/) [API文档](http://html2canvas.hertzen.com/documentation/) [github](https://github.com/niklasvh/html2canvas/) 

#### 安装
````bash
npm install html2canvas
````

#### 使用
````js
html2canvas(document.querySelector("#capture")).then(canvas => {
  // do sth
});
````

#### 联合使用生成pdf
````js
let report = document.getElementById('report');
html2canvas(report)
  .then(canvas => {
    // 渲染完成时调用的
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;

    // 一页pdf显示html页面生成的canvas高度;
    let pageHeight = contentWidth / 841.89 * 592.28;
    // 未生成pdf的html页面高度
    let leftHeight = contentHeight;
    // 页面偏移
    let position = 0;
    // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    let imgWidth = 841.89;
    let imgHeight = 841.89 / contentWidth * contentHeight;

    let pageData = canvas.toDataURL('image/jpeg', 1.0);

    let pdf = new jsPDF('l', 'pt', 'a4'); // l：横向  p：纵向
    // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
    // 当内容未超过pdf一页显示的范围，无需分页
    if (leftHeight < pageHeight) {
      pdf.addImage(pageData, 'JPEG', 26, 43, imgWidth, imgHeight);
    } else {
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 592.28;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }
    let reportName = this.reportData.name;
    pdf.save(reportName + '.pdf');
  });
````
实际使用时这样分页的效果还是不好，我是对每一个页面设置一个id，通过递归遍历生成pdf，效果完美。