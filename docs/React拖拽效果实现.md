原生js中，我们可以通过onDrag和onDrop事件来实现拖拽效果。而在react中，有一个强大的库，[react-dnd](https://github.com/react-dnd/react-dnd/)，对拖拽相关能力进行了封装。react-dnd强大的好处是高度自由性，但是各种代码需要去手动实现。

我们海星二期装修页面需要实现一个拖拽（排序和复制），这里我们选择一个基于react-dnd二次封装的库，[react-smooth-dnd](https://github.com/kutlugsahin/react-smooth-dnd#readme)。



---

## 文档
#### 安装
```bash
npm i react-smooth-dnd
```

#### 示例
```tsx
import React, { Component } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';

class SimpleSortableList extends Component {
  render() {
    return (
      <div>
        <Container onDrop={this.props.onDrop}>
          {this.props.items.map(item => {
            return (
              <Draggable key={item.id}>
                {this.props.renderItem(item)}
              </Draggable>
            );
          })}
        </Container>
      </div>
    );
  }
}
```

#### API
组件包括Container和Draggable两个。其中Draggable是被拖拽的元素，Container是这些元素的父容器。试验了一下，Draggable必须是Container的子元素。Draggable没有什么属性，相关的属性和方法都在container上设置。

常用的有这些：

+ behaviour，设置这个容器是接收draggable的<font style="color:#E8323C;">move</font>，还是接收其他容器draggable的<font style="color:#E8323C;">copy</font>行为。默认move。
+ orientation，决定内部draggable的排布方向，是水平还是垂直，这个比较死板，只有这两种排列方式。
+ groupName，这个属性很重要，只有相同groupName之间才可以互相拖拽。
+ dropPlaceholder，设置放置时占位元素的样式
+ <font style="color:rgb(36, 41, 47);background-color:rgb(246, 248, 250);">dragBeginDelay，拖拽生效延时，以避免点击事件触发拖拽</font>
+ <font style="color:rgb(36, 41, 47);">getChildPayload，被拖拽元素要传递的payload数据。</font>
+ onDrop，放置函数，接收一个事件，里面包含addedIndex，removedIndex，payload。这样我们就可以根据这些数据去修改列表的值，实现排序或插入。
+ <font style="color:rgb(36, 41, 47);">shouldAcceptDrop， 可以过滤一些不可放置的元素</font>
+ <font style="color:rgb(36, 41, 47);background-color:rgb(246, 248, 250);">getGhostParent，这个也很重要，不同container之间可能所处的层级不同，通过这个都挂到body上，可以防止拖拽效果被遮挡。</font>



#### 官方demo
[https://kutlugsahin.github.io/smooth-dnd-demo/](https://kutlugsahin.github.io/smooth-dnd-demo/)

#### 拖拽排序
很显然，拖拽排序是默认设置，一个container自身的draggable拖拽即可。无需设置groupName，只需设置onDrop即可，通过addedIndex和removedIndex去修改列表。![](https://cdn.nlark.com/yuque/0/2022/gif/373268/1652065378606-491a337c-f87e-403c-b69a-02ad9d444183.gif)

#### 拖拽移动
两个或多个container，设置相同的groupName，这样除了自身的拖拽排序，还可以拖拽到另一个container实现跨container的移动。通过onDrop设置移动后的行为，因为groupName相同，我们除了addedIndex和removedIndex，还要知道元素是从哪个container来的，可以在<font style="color:rgb(36, 41, 47);">getChildPayload设置。</font>![](https://cdn.nlark.com/yuque/0/2022/gif/373268/1652065388357-973b8a51-cc62-405a-82c8-c8e83c7d7f07.gif)

#### 拖拽复制
同上面拖拽复制，但是其中一个container的behaviour要设置为copy。这样这个container自身的draggable就只能拖到另一个container去实现复制插入，而它本身拖拽无效。![](https://cdn.nlark.com/yuque/0/2022/gif/373268/1652065395596-7c40ef99-e110-4d04-84d7-d90be230d9ee.gif)



---

## 海星的拖拽实现
海星的可视化组件装修页面需求，我们有几个拖拽区域：页面列表自身的拖拽排序；组件列表自身的拖拽排序；从组件库拖拽组件到组件列表进行复制插入。

其中页面列表是独立的，按照前面拖拽排序的实现即可。

```tsx
<div className="page-list">
  <Container
    onDrop={onDropPage}
    dropPlaceholder={{
      className: 'page-item placeholder'
    }}
    dragBeginDelay={100}>
      {props.pages && props.pages.map((item,index) => (
        <Draggable key={item.path}>
          <div className="page-item">
            ...
          </div>
        </Draggable>
      ))}
  </Container>
</div>
```

```tsx
  const onDropPage = (e) => {
    const {addedIndex, removedIndex} = e
    props.dispatch({
      type: 'appDecorate/MOVE_PAGE',
      payload: {
        fromIndex: removedIndex,
        toIndex: addedIndex
      }
    })
  }
```

```tsx
MOVE_PAGE(state, {payload}) {
  const {fromIndex, toIndex} = payload
  const pages = JSON.parse(JSON.stringify(state.config.pages))
  const page = pages[fromIndex]
  // 交换
  if (fromIndex > toIndex) {
    pages.splice(fromIndex, 1)
    pages.splice(toIndex, 0, page)
  } else if (fromIndex < toIndex) {
    pages.splice(fromIndex, 1)
    pages.splice(toIndex, 0, page)
  }
  state.config.pages = pages
}
```



组件列表和组件库要设置相同的groupName，组件库behoviour设置为copy。并且组件列表container的onDrop事件，在payload要区分Draggable对象来源，做不同的处理。

```tsx
<Container
  dragBeginDelay={100}
  groupName="modules"
  getChildPayload={i => ({
    source: 'selected-module-list',
  })}
  dropPlaceholder={{
    className: 'module-item placeholder'
  }}
  getGhostParent={() =>
    document.body
  }
  onDrop={onDropModule}>
    {props.curPageModules && props.curPageModules.map((item,index) => (
      <Draggable key={index + '-' + item.value}>
        <div className="module-item">
          ...
        </div>
      </Draggable>
    ))}
</Container>
```

```tsx
    <Drawer
      className="module-drawer"
      title="选择组件"
      width="840px"
      placement={props.placement || 'right'}
      closable={false}
      onClose={props.onClose}
      visible={props.visible}
      destroyOnClose
      closable
      mask={false}
    >
      <p className="tip">拖拽到页面组件区域添加</p>
        <Tabs tabPosition="left">
          {
            props.moduleList && props.moduleList.map((group, groupIndex) => (
              <Tabs.TabPane tab={group.name} key={groupIndex}>
                <div className="module-list">
                  <Container
                  behaviour="copy"
                  groupName="modules"
                  getChildPayload={i => ({
                    source: 'module-to-select',
                    data: group.children[i]
                  })}
                  getGhostParent={() => document.body
                  }>
                  {
                    group.children && group.children.map((module, moduleIndex) => (
                      <Draggable key={groupIndex + '-' + moduleIndex}>
                        <div className="module-item">
                          ...
                        </div>
                      </Draggable>
                    ))
                  }
                  </Container>
                </div>
              </Tabs.TabPane>
            ))
          }
        </Tabs>
    </Drawer>
```

```tsx
  const onDropModule = (e) => {
    const {addedIndex, removedIndex, payload} = e
    const {source, data} = payload
    if (source === 'module-to-select') {
      props.dispatch({
        type: 'appDecorate/ADD_MODULE',
        payload: {
          moduleIndex: addedIndex,
          module: data
        }
      })
    } else if (source === 'selected-module-list') {
      props.dispatch({
        type: 'appDecorate/MOVE_MODULE',
        payload: {
          fromModuleIndex: removedIndex,
          toModuleIndex: addedIndex,
        }
      })
    }
  }
```

最终实现效果如下：

![](https://cdn.nlark.com/yuque/0/2022/gif/373268/1652066350969-14618526-d0b2-4689-a01b-79a315509717.gif)

其中，组件库只能水平或垂直，这里直接通过class名设置了换行效果。另外，copy的时候，组件列表的container高度初始很小，不好拖放，也是通过class名设置了container高度100%。

