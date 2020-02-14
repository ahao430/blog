# python生成pdf报告

## 背景
项目需求生成测试报告，之前用[前端实现](./jsPdf生成pdf.md)，由于dom操作较慢，且每次生成报告都要渲染一遍，计划改为使用后端实现。经过调研采用python库reportlab来实现。

## 方案
* 主要使用[reportlab](https://www.reportlab.com/docs/reportlab-userguide.pdf)。对简单的表格段落等排版，通过模板方法实现。对复杂的排版，类似canvas的方法来画。
* 另外对于各种数据图，使用[pyecharts](http://pyecharts.org/)来处理，较自己实现更便捷好看。
  
## 环境
使用python3运行环境，需要安装reportlab库及相关库，需要安装pyecharts库及chromeDriver。
* 命令：
  ````shell
  pip install reportlab
  pip install pyecharts
  pip install echarts-countries-pypkg    
  pip install selenium
  pip install pyvirtualdisplay selenium
  pip install snapshot_selenium
  ````
* 下载对应浏览器版本号的[chromeDriver](http://npm.taobao.org/mirrors/chromedriver/)，并配置到环境变量。这是pyecharts需要。pyecharts是调用chromeDriver渲染html，再快照生成图片。

## reportlab简介
reportlab是Python的一个标准库，可以画图、画表格、编辑文字，最后可以输出PDF格式。
* reportlab不支持中文，需要自己下载中文字体并注册。
  ````python
  # 设置中文字体
  from reportlab.pdfbase import pdfmetrics
  pdfmetrics.registerFont(TTFont('SimSun', './Fonts/SimSun.ttf'))
  ````
* reportlab可以创建canvas的方式来创建pdf
  ````python
  from reportlab.pdfgen import canvas
  from reportlab.pdfbase.ttfonts import TTFont
  from reportlab.pdfbase import pdfmetrics
  pdfmetrics.registerFont(TTFont('SimHei', 'SimHei.TTF'))
  def hello(c):
      c.drawString(100,100,"世界你好")
  c = canvas.Canvas("hello.pdf")
  c.setFont('SimHei',12)
  hello(c)
  c.showPage()
  c.save()
  ````
* reportlab也可以通过模板，创建一个元素列表来创建pdf
  ````python
  from reportlab.pdfbase import pdfmetrics
  from reportlab.pdfbase.ttfonts import TTFont
  from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
  from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer,Image,Table,TableStyle,Frame,ListFlowable, ListItem
  from reportlab.lib.enums import TA_JUSTIFY
  from reportlab.lib import colors
  from reportlab.lib.colors import CMYKColor

  story=[]#建立空白的list
  
  ### 设置中文字体名称为msyh
  pdfmetrics.registerFont(TTFont('msyh', '/Users/cello/Library/Fonts/YAHEI.ttf'))
  #获得reportlab预先设定的文本模板
  styles = getSampleStyleSheet()
  styles.add(ParagraphStyle(name='txt', leftIndent=-50,rightIndent=-50,alignment=TA_JUSTIFY,fontName="msyh",fontSize=8,textColor='#003153',bulletFontSize=12,bulletIndent=-50,bulletAnchor ='start',bulletFontName = 'Symbol' ))
          
  text = '''<para><br/>第一部分：建立文本说明</para>'''
  story.append(Paragraph(text,styles["txt"])) 

  my_list = ListFlowable([
      ListItem(Paragraph('小红XXXXXXXXXXXX', styles["txt"]),
               leftIndent=10, value='diamondwx',bulletFontSize=6,
               bulletColor=CMYKColor(0.81, 0.45, 0.53, 0.23)
               ), #添加文本，并设置bullet的位置、形状、大小、颜色
      ListItem(Paragraph("<b>  <br/></b>", styles["txt"]),
               bulletColor=CMYKColor(0, 0, 0, 0)), # 空一行，将bullet的颜色设置为和背景一样的
      ListItem(Paragraph('小蓝XXXXXXXXXXXX', styles["txt"]),
               leftIndent=10, value='diamondwx',bulletFontSize=6,
               bulletColor=CMYKColor(0.81, 0.45, 0.53, 0.23)),
  ],
      start='sparkle',
      leftIndent=60
  )
  story.append(my_list )
  # 生成文档
  doc = SimpleDocTemplate(path +'test'+'.pdf',pagesize=[10，20],topMargin = 15,bottomMargin = 15)
  doc.build(story)
  ````

在这里，我使用的第二种方法，对于大部分的图表来说，自动排版会更好，而非对canvas一点一点的编写。

#### simpleDocTemplate常用模块和方法：

* 颜色、单位、尺寸等等
  ````python
  from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle # 样式
  from reportlab.lib.pagesizes import A4, landscape, portrait # 尺寸
  from reportlab.pdfbase import pdfmetrics 
  from reportlab.pdfbase.ttfonts import TTFont # 字体，设置中文见前面
  from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER # 对齐
  from reportlab.lib import colors # 颜色
  from reportlab.lib.units import inch, mm # 单位
  ````
* 分页
  在canvas中可以通过canvas.showPage()来插入分页，在simpleDocTemplate中，通过PageBreak来实现。
  ````python
  from reportlab.platypus import SimpleDocTemplate, PageBreak

  story.append(PageBreak())
  ````
* 页眉页脚
  SimpleDocTemplate可以设置onFirstPage和onLaterPages两个钩子，在这里可以设置页眉页脚。要注意这里是要用到canvas绘制。
  ````python
  def generatePdf(self, pagesData, driver):
      # 生成文件，自动按照横向A4大小分页
      doc = SimpleDocTemplate(reportName, pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT), leftMargin=0.5*inch, rightMargin=0.5*inch)
      doc.multiBuild(self.story, onFirstPage=self.myFirstPage, onLaterPages=self.myLaterPages)
      # 首页钩子，插入页眉页脚
  def myFirstPage(self, canvas, doc):
      canvas.saveState()
      self.renderHeader(canvas, doc)
      self.renderFooter(canvas, doc)
      canvas.restoreState()

  # 其他页面钩子，插入页眉页脚
  def myLaterPages(self, canvas, doc):
      canvas.saveState()
      self.renderHeader(canvas, doc)
      self.renderFooter(canvas, doc)
      canvas.restoreState()

  # 渲染页眉
  def renderHeader(self, canvas, doc):
      padding = 10
      # Logo
      logo_width = 127
      logo_height = 50
      canvas.drawImage(self.logo, padding, self.PAGE_HEIGHT - logo_height - padding, width=logo_width, height=logo_height, mask='auto')
      # Title
      canvas.setFont('Times-Bold', 16)
      canvas.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - padding - 24, self.totalData['title'])
      if self.totalData['subtitle']:
        canvas.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - padding - 24 - 24, self.totalData['subtitle'])
      # Company Logo
      company_logo_width = 50
      company_logo_height = 50
      canvas.drawImage(self.company_logo, self.PAGE_WIDTH - company_logo_width - padding, self.PAGE_HEIGHT - company_logo_height - padding, width=company_logo_width, height=company_logo_height, mask='auto')

  # 渲染页脚
  def renderFooter(self, canvas, doc):
      padding = 20
      canvas.setFont('Times-Roman', 9)
      canvas.drawCentredString(self.PAGE_WIDTH / 2, padding, "%s" % doc.page)
  ````
* 常用模块
  通过reportlab.platypus引入各种模块。
  ````python
  from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, Frame, ListFlowable, ListItem, PageBreak
  ````
  * Paragraph
    段落，可插入文字及html字符串，并设置样式。
  * Spacer
    一个指定长宽的空白块
  * Image
    图片
  * Table, TableStyle
    表格
  * ListFlowable, ListItem
    无序列表，有小圆点。
* 表格
  ````python
  table_widths = [200, 50]
  table_data = [
      ['Control', 'Number'],
      ['Sent', 100],
      ['Hits', 50],
      ['Misses', 20],
  ]
  table_style = [
      ('FONTNAME', (0, 0), (-1, -1), 'SimSun'),  # 字体
      ('FONTSIZE', (0, 0), (colsLen - 1, 0), 12),  # 第一行的字体大小
      ('FONTSIZE', (0, 1), (-1, -1), 12),  # 第二行到最后一行的字体大小
      ('ALIGN', (0, 0), (colsLen - 1, 0), 'CENTER'),  # 第一行左右中间对齐
      ('ALIGN', (0, 1), (colsLen - 1, rowsLen - 1), 'CENTER'),  # 第二行到最后一行左右左对齐
      ('VALIGN', (0, 0), (colsLen - 1, rowsLen - 1), 'MIDDLE'),  # 所有表格上下居中对齐
      ('BACKGROUND', (0, 0), (colsLen - 1, 0), colors.lightslategray),  # 设置第一行背景颜色
      ('TEXTCOLOR', (0, 0), (-1, -1), colors.darkslategray),  # 设置表格内文字颜色
      ('GRID', (0, 0), (-1, -1), 0.1, colors.slategray),  # 设置表格框线为灰色，线宽为0.1
  ]
  table_table = Table(table_data, colWidths=table_widths, repeatRows=1, style=table_style)
  story.append(table_table)
  ````
  其中，repeatRows表示如果表格分页，顶部重复的行数。
* 画图
  ````python
  from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle, Ellipse,ArcPath, Group
  from reportlab.graphics.charts.lineplots import LinePlot
  from reportlab.graphics.charts.textlabels import Label
  ````
  shapes中的Drawing类似于一块画布，其他元素可以添加到Drawing上，再插入到列表中渲染。在项目的一些复杂布局中有用到。Group可以对一些元素放到一组，便于整体的移动布局。
  而charts是自带的一些线图、饼图等基本数据图形，我们使用pyecharts代替。
  ````python
  d = Drawing(750, 350)
  d.add(Rect(0, 0, 750, 350, strokeColor=colors.transparent, fillColor=colors.HexColor('#30314d')))

  # 标题
  d.add(String(20, 310, 'Latest Test: ' + test['name'], fontSize=20,fillColor=colors.white,fontName='SimSun'))

  # major source 和 top Missed
  def drawTable1():
    topMissedStr = ''
    for item in test['topMissed']:
      if item:
        topMissedStr += str(item) + ' '
    g = Group(
      Line(10,55,260,55,strokeColor=colors.HexColor('#6d6e74')),
      Line(10,35,260,35,strokeColor=colors.HexColor('#6d6e74')),
      Line(10,15,260,15,strokeColor=colors.HexColor('#6d6e74')),
      Rect(10, 35, 250, 20, strokeColor=colors.transparent, fillColor=colors.toColor('rgb(38,39,64)')),
      String(20, 40, 'Weak Alias Tested: ' + ('√' if test['weakAliasTested'] else '×') + '  Major Source: ' + test['majorSource'], fontSize=10,fillColor=colors.white,fontName='SimSun'),
      String(20, 20, 'Top Missed:  ' + topMissedStr, fontSize=10,fillColor=colors.white,fontName='SimSun'),
    )
    # 弧线
    arc1 = ArcPath(strokeColor=colors.toColor('rgb(60,190,176)'),fillColor=colors.transparent)
    arc1.addArc(250,70,50,90,90+pure_angle) # 中心x，中心y，半径，startAngle，endAngle
    g.add(arc1)
    g.translate(200, 270)
    return g
  d.add(drawTable1())
  
  story.append(d)
  ````

## pyecharts简介
pyecharts是在百度echarts基础上封装的一个python库，可以像echarts一样通过设置配置生成各种图形。
````python
from pyecharts.charts import Bar
from pyecharts.render import make_snapshot

# 使用 snapshot-selenium 渲染图片
from snapshot_selenium import snapshot

bar = (
    Bar()
    .add_xaxis(["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"])
    .add_yaxis("商家A", [5, 20, 36, 10, 75, 90])
)
make_snapshot(snapshot, bar.render(), "bar.png")
````
make_snapshot将渲染的图形保存为图片，再用Image读取这个图片，append到story中即可。这里涉及到调用chromeDriver，频繁开关耗费时间，对其做了一些优化。

## 代码实现
项目结构如下：
````
├── components
│   ├── myBar.py
│   ├── myLine.py
│   ├── myMap.py
│   ├── myPie.py
│   └── myTable.py
├── data
│   ├── analysis.json
│   ├── logo_big.png
├── Fonts
│   └── SimSun.ttf
├── img
├── pages
│   ├── detail.py
│   ├── summary.py
│   └── testInfo.py
├── .gitignore
├── generate.py
├── index.py
├── README.md
├── snapshot.py
└── utils.py
````
将一些报告数据放到data文件夹中，在index中通过json读取并调用Generator类生成报告。结束后关闭chromeDriver进程。
````python
# index.py
import json
import io
import sys
from utils import timer, get_chrome_driver
from generate import Generator
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


@timer
def generate_report(driver, data):
    Generator().generatePdf(data, driver)


if __name__ == "__main__":
    chrome_driver = get_chrome_driver()

    # analysis
    # f = open('data/analysis.json', encoding='utf-8')
    # peertest
    # f = open('data/peertest.json', encoding='utf-8')
    # dashboard
    f = open('data/dashboard.json', encoding='utf-8')

    d = json.load(f)['data']
    # print(chrome_driver.session_id)
    generate_report(chrome_driver, d)
    chrome_driver.close()
    chrome_driver.quit()
````

````python
# snapshot.py
import base64
import codecs
import logging
import os
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

PNG_FORMAT = "png"
JPG_FORMAT = "jpeg"
GIF_FORMAT = "gif"
PDF_FORMAT = "pdf"
SVG_FORMAT = "svg"
EPS_FORMAT = "eps"
B64_FORMAT = "base64"


def make_snapshot(
        engine,
        file_name: str,
        output_name: str,
        delay: float = 2,
        pixel_ratio: int = 2,
        is_remove_html: bool = False,
        **kwargs,
):
    logger.info("Generating file ...")
    file_type = output_name.split(".")[-1]

    content = engine.make_snapshot(
        html_path=file_name,
        file_type=file_type,
        delay=delay,
        pixel_ratio=pixel_ratio,
        **kwargs,
    )

    if file_type in [SVG_FORMAT, B64_FORMAT]:
        save_as_text(content, output_name)
    else:
        # pdf, gif, png, jpeg
        content_array = content.split(",")
        if len(content_array) != 2:
            raise OSError(content_array)

        image_data = decode_base64(content_array[1])

        if file_type in [PDF_FORMAT, GIF_FORMAT, EPS_FORMAT]:
            save_as(image_data, output_name, file_type)
        elif file_type in [PNG_FORMAT, JPG_FORMAT]:
            save_as_png(image_data, output_name)
        else:
            raise TypeError("Not supported file type '%s'".format(file_type))

    if "/" not in output_name:
        output_name = os.path.join(os.getcwd(), output_name)

    if is_remove_html and not file_name.startswith("http"):
        os.unlink(file_name)
    logger.info("File saved in %s" % output_name)


def make_snapshot_in_memory(
        engine,
        file_name: str,
        delay: float = 2,
        pixel_ratio: int = 2,
        is_remove_html: bool = False,
        **kwargs,
):
    logger.info("Generating file ...")
    file_type = "png"

    content = engine.make_snapshot(
        html_path=file_name,
        file_type=file_type,
        delay=delay,
        pixel_ratio=pixel_ratio,
        **kwargs,
    )

    content_array = content.split(",")
    if len(content_array) != 2:
        raise OSError(content_array)

    image_data = decode_base64(content_array[1])

    if is_remove_html and not file_name.startswith("http"):
        os.unlink(file_name)

    m = BytesIO(image_data)
    m.seek(0)
    return m


def decode_base64(data: str) -> bytes:
    """Decode base64, padding being optional.

    :param data: Base64 data as an ASCII byte string
    :returns: The decoded byte string.
    """
    missing_padding = len(data) % 4
    if missing_padding != 0:
        data += "=" * (4 - missing_padding)
    return base64.decodebytes(data.encode("utf-8"))


def save_as_png(image_data: bytes, output_name: str):
    with open(output_name, "wb") as f:
        f.write(image_data)


def save_as_text(image_data: str, output_name: str):
    with codecs.open(output_name, "w", encoding="utf-8") as f:
        f.write(image_data)


def save_as(image_data: bytes, output_name: str, file_type: str):
    try:
        from PIL import Image

        m = Image.open(BytesIO(image_data))
        m.load()
        color = (255, 255, 255)
        b = Image.new("RGB", m.size, color)
        b.paste(m, mask=m.split()[3])
        b.save(output_name, file_type, quality=100)
    except ModuleNotFoundError:
        raise Exception("Please install PIL for {} image type".format(file_type))

````

````python
# generate.py
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4, landscape, portrait
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, Frame, ListFlowable, ListItem, PageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from reportlab.lib.colors import CMYKColor
from reportlab.lib.units import inch, mm
import shutil
import os
from pages import summary, detail, miss, testInfo, peertest, overall, dashboard
from utils import timer

# 设置中文字体
pdfmetrics.registerFont(TTFont('SimSun', './Fonts/SimSun.ttf'))

# 设置样式
styles = getSampleStyleSheet()

# header
styles.add(ParagraphStyle(name='header', leftIndent=8, rightIndent=8, 
leading=18, alignment=TA_JUSTIFY, fontName="SimSun", fontWeight="bold", lineHeight=1.5, fontSize=12, textColor='#003153', bulletFontSize=12, bulletIndent=8, bulletAnchor='start', bulletFontName='Symbol'))
# 大写标题
styles.add(ParagraphStyle(name='bigTitle', leftIndent=8, rightIndent=8, 
leading=18, alignment=TA_JUSTIFY, fontName="SimSun", fontWeight="bold", lineHeight=1.5, fontSize=20, textColor='#003153', bulletFontSize=12, bulletIndent=8, bulletAnchor='start', bulletFontName='Symbol'))
# 正文
styles.add(ParagraphStyle(name='txt', leftIndent=8, rightIndent=8, alignment=TA_JUSTIFY, fontName="SimSun", fontSize=12, lineHeight=1.5, textColor='#003153', bulletFontSize=12, bulletIndent=8, bulletAnchor='start', bulletFontName='Symbol'))

class Generator:
  story = []
  totalData = None
  pages = []
  # a4纸的尺寸[210cm / 8.27 inch, 297cm / 11.69inch]
  PAGE_WIDTH = 297 * mm
  PAGE_HEIGHT = 210 * mm
  # 公用
  logo = './data/logo_big.png'
  company_logo = ''

  # 外部调用，根据数据渲染生成pdf文件
  @timer
  def generatePdf(self, pagesData, driver):
      # 初始化
      self.init()
      # 格式化
      self.totalData = pagesData
      self.pages = self.formatPages(pagesData['pages'])
      self.company_logo = pagesData['company']['logo']

      # 遍历页面，根据页面类型插入内容
      # for i in range(20):
      for page in self.pages:
          self.renderPage(page, driver)

      # 已存在文件先删除
      reportName = self.totalData['name'] + '.pdf'
      if os.path.exists(os.path.join(reportName)):
          os.remove(os.path.join(reportName))

      # 生成文件，自动按照横向A4大小分页
      doc = SimpleDocTemplate(reportName, pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT), leftMargin=0.5*inch, rightMargin=0.5*inch)
      doc.multiBuild(self.story, onFirstPage=self.myFirstPage, onLaterPages=self.myLaterPages)

  # 初始化数据
  def init(self):
      self.story = []
      self.pages = []
      self.totalData = None
      # 清理img文件夹
      imgPath = os.path.join('img/')
      if not os.path.exists(imgPath):
        os.mkdir(imgPath)
      else:
        shutil.rmtree(imgPath)
        os.mkdir(imgPath)

  # 处理个别页面是个数组而非对象
  def formatPages(self, rawPages):
      list = []
      for page in rawPages:
          if type(page).__name__ == 'list':
              for item in page:
                  list.append(item)
          else:
              list.append(page)
      return list

  # 首页钩子，插入页眉页脚
  def myFirstPage(self, canvas, doc):
      canvas.saveState()
      self.renderHeader(canvas, doc)
      self.renderFooter(canvas, doc)
      canvas.restoreState()

  # 其他页面钩子，插入页眉页脚
  def myLaterPages(self, canvas, doc):
      canvas.saveState()
      self.renderHeader(canvas, doc)
      self.renderFooter(canvas, doc)
      canvas.restoreState()

  # 渲染页眉
  def renderHeader(self, canvas, doc):
      padding = 10
      # Logo
      logo_width = 127
      logo_height = 50
      canvas.drawImage(self.logo, padding, self.PAGE_HEIGHT - logo_height - padding, width=logo_width, height=logo_height, mask='auto')
      # Title
      canvas.setFont('Times-Bold', 16)
      canvas.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - padding - 24, self.totalData['title'])
      if self.totalData['subtitle']:
        canvas.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - padding - 24 - 24, self.totalData['subtitle'])
      # Company Logo
      company_logo_width = 50
      company_logo_height = 50
      canvas.drawImage(self.company_logo, self.PAGE_WIDTH - company_logo_width - padding, self.PAGE_HEIGHT - company_logo_height - padding, width=company_logo_width, height=company_logo_height, mask='auto')

  # 渲染页脚
  def renderFooter(self, canvas, doc):
      padding = 20
      canvas.setFont('Times-Roman', 9)
      canvas.drawCentredString(self.PAGE_WIDTH / 2, padding, "%s" % doc.page)

  # 渲染页面内容
  # @timer
  def renderPage(self, page, driver):
      pageType = page['type']

      # analysis
      if pageType == 'summary':
          summary.draw(self.story, self.totalData, page, styles, driver)
      elif pageType == 'detail':
          testInfo.draw(self.story, self.totalData, page, styles, driver)
          detail.draw(self.story, self.totalData, page, styles, driver)
      elif pageType == 'miss':
          testInfo.draw(self.story, self.totalData, page, styles, driver)
          miss.draw(self.story, self.totalData, page, styles, driver)

      # peertest
      elif pageType == 'peertest':
          peertest.draw(self.story, self.totalData, page, styles, driver)

      # dashboard
      elif pageType == 'overall':
        overall.draw(self.story, self.totalData, page, styles, driver)
      elif pageType == 'dashboard':
        dashboard.draw(self.story, self.totalData, page, styles, driver)

      # others
      else:
          pass

      # 分页
      self.story.append(PageBreak())
````

components为封装的图表组件。
````python
myBar.py
from reportlab.platypus import Image
from reportlab.lib.units import cm
import pyecharts
from pyecharts.charts import Bar
from pyecharts import options as opts
from pyecharts.globals import ThemeType
import uuid
from utils import timer, snap_shot

def draw(driver, x, y, data):
  # 默认900*500
    bar = Bar(init_opts=opts.InitOpts(theme=ThemeType.MACARONS,animation_opts=opts.AnimationOpts(animation=False)))
    x_list = []
    for item in data:
        x_list.append(item[x])
    bar.add_xaxis(x_list)

    for y_key in y:
        y_item = []
        for item in data:
            y_item.append(item[y_key])
        bar.add_yaxis(y_key, y_item)
    
    return bar

def drawImg(driver, x, y, data):
    bar = draw(driver, x, y, data)

    name = uuid.uuid4().hex
    img = snap_shot(bar, name, driver)
    img.drawHeight = 7*cm  # 设置读取后图片的高
    img.drawWidth = 13*cm  # 设置读取后图片的宽

    return img
````
pages为具体某一类型报告页面的代码。
````python
# detail.py
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, Frame, ListFlowable, ListItem
from reportlab.lib import colors
from components import myTable, myBar
from decimal import *


def draw(story, totalData, page, styles, driver):
    # 图表标题
    t1 = Paragraph(page['title'], styles['header'])
    story.append(t1)
    t2 = Paragraph('By:' + page['by'], styles['header'])
    story.append(t2)

    story.append(Spacer(200, 20))

    # 柱形图
    if page['chart'] and page['chart']['show']:
      bar_x = page['chart']['x']
      bar_y = page['chart']['y']
      bar_data = page['data']
      story.append(myBar.drawImg(driver, bar_x, bar_y, bar_data))

    # 数据表格
    table_cols = page['th']
    table_data = []
    for row in page['data']:
        rowData = []
        for col in table_cols:
            rowData.append(row[col])
        table_data.append(rowData)
    story.append(myTable.draw(table_cols, table_data))
````