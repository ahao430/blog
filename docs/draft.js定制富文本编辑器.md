有一个需求：

+ 需要在输入框中输入/时弹出自定义下拉弹窗，选择组件并插入到输入框。
+ 下拉弹窗是双层，且子目录支持输入文本过滤。
+ 同时插入的块在删除时应该整体删除。





这个弹窗和插入整体感觉跟语雀的功能很像。一般的富文本编辑器可以插入特定的样式，但是整体自定义组件显示是不支持的，尤其是插入的块退格时作为整体删除。

另外这个输入/弹出下拉的功能，联想到很多编辑器中@人的时候的mention功能。 去看了react-mention，唤起键可以自定义，不一定是@，但是下拉弹窗的样式是固定的，只有单层列表，且不支持过滤。看react-mention的介绍，要唤起多个列表，就用多个不同按键唤起。这与我们的需求不符。



## 库选择
第一反应是用[tiptap](https://tiptap.dev/docs/editor/introduction)，去翻了下文档，挺复杂的，感觉对我这个功能来说有点重。

再去查了下富文本实现mention，facebook开源的有一个draft.js的库，相对底层一些，可以用来实现自定义的富文本编辑器，网上的示例就有mention和插入整体的代码。参考了这篇文章：[https://segmentfault.com/a/1190000041471277?utm_source=sf-similar-article](https://segmentfault.com/a/1190000041471277?utm_source=sf-similar-article)



## draft.js简单介绍
[draftjs](https://draftjs.org/docs/getting-started)<font style="color:rgb(33, 37, 41);"> 是用于 react 的富文本编辑器框架，它并不能开箱即用，但是它提供了很多用于开发富文本的 API。基于此，开发者能够搭建出定制化的富文本编辑器。draftjs 有几个重要的概念：EditorState、Entity、SelectionState、CompositeDecorator。</font>

#### <font style="color:rgb(33, 37, 41);">EditorState</font>
<font style="color:rgb(33, 37, 41);">EditorState 是编辑器的顶级状态对象。它是一个不可变数据，表示 Draft 编辑器的整个状态，包括:</font>

+ <font style="color:rgb(33, 37, 41);">当前文本内容状态（ContentState）</font>
+ <font style="color:rgb(33, 37, 41);">当前选择状态（SelectionState）</font>
+ <font style="color:rgb(33, 37, 41);">内容的装饰器（Decorator）</font>
+ <font style="color:rgb(33, 37, 41);">撤销/重做堆栈</font>
+ <font style="color:rgb(33, 37, 41);">对内容所做的最新类型的更改（EditorChangeType）</font>

<font style="color:rgb(33, 37, 41);">draftjs 基于不可变（immutable）数据，因此对编辑器的修改都需要新生成一个 EditorState 对象传入编辑器，以实现数据更新。</font>

<font style="color:rgb(33, 37, 41);">静态方法支持创建、增加、撤销、恢复等操作。下面我们要用到</font>createEmpty和createWithContent来创建editorState的实例，分别用于新建和编辑时。

```typescript
static createEmpty(decorator?: DraftDecoratorType): EditorState
                   
static createWithContent(
  contentState: ContentState,
  decorator?: DraftDecoratorType
): EditorState
```



#### <font style="color:rgb(33, 37, 41);">Entity</font>
<font style="color:rgb(33, 37, 41);">Entity 用来描述带有元数据的文本，使一段文本可以携带任意类型的数据，提供了更加丰富的功能，链接、提及和嵌入的内容都可以通过 Entity 来实现。</font>

**<font style="color:rgb(33, 37, 41);">Entity的结构</font>**

```plain
{
    type: 'string', 
    // 表示Entity的类型; eg:'LINK', 'TOKEN', 'PHOTO', 'IMAGE'
    mutability: 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED', 
    // 此属性表示在编辑器中编辑文本范围时使用此实体对象注释的文本范围的行为。
    data: 'object', 
    // Entity的元数据; 用于存储你想要存储在该Entity里的任何信息
}
```

<font style="color:rgb(33, 37, 41);">其中 Mutability 这条属性三个值的含义分别是：</font>

+ <font style="color:rgb(33, 37, 41);">Immutable：此 Entity 作为一个整体，一删则整体都删除，无法更改文本;</font>
+ <font style="color:rgb(33, 37, 41);">Mutable：Entity 在编辑器中的文字可以自由修改，比如链接文本;</font>
+ <font style="color:rgb(33, 37, 41);">Segmented：于 Immutable 类似，区别是可以删除部分文字;</font>

#### <font style="color:rgb(33, 37, 41);">SelectionState</font>
<font style="color:rgb(33, 37, 41);">SelectionState 表示编辑器中的选择范围。一个选择范围有两点：锚点（起点）和焦点（终点）。</font>

+ <font style="color:rgb(33, 37, 41);">锚点位置 === 焦点位置，没有选择文本；</font>
+ <font style="color:rgb(33, 37, 41);">锚点位置 > 焦点位置，从右至左选择文本;</font>
+ <font style="color:rgb(33, 37, 41);">锚点位置 < 焦点位置，从左至右选择文本;</font>

#### <font style="color:rgb(33, 37, 41);">CompositeDecorator</font>
<font style="color:rgb(33, 37, 41);">Decorator 概念的基础是扫描给定 ContentBlock 的内容，根据定义的策略定位到匹配位置，然后用指定的 React 组件呈现它们。</font>



## 主要技术实现
### 引入draft.js，初始化
```javascript
import {
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from "draft-js";
import "draft-js/dist/Draft.css";

const MyEditor = props => {
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty(),
  );

  return (
    <Editor
      editorState={editorState}
      placeholder="Please input"
    />
  )
}

```

### 设置高度，点击聚焦
初始化之后，发现初始只有一行，随着输入换行，会自动增加高度。但是我们看到的富文本区域，一般是有个初始高度的，有个编辑器的边框。

这里在外面加一层div来模拟，当点击div时，我们要让编辑器处于编辑的状态。

```javascript
const MyEditor = props => {
  const editorRef = useRef();
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty(),
  );

  const onEditorContainerClick = e => {
    editorRef.current?.focus();
  }

  return (
    <div className="editor-container" onClick={onEditorContainerClick}>	
      <Editor
        ref={editorRef}
        editorState={editorState}
        placeholder="Please input"
      />
    </div>
  )
}

```

```less
.editor-container {
  border: 1px solid #d0d5dd;
  box-shadow: 0px 1px 2px 0px #1018280d;
  padding: 10px;
  border-radius: 5px;
  .public-DraftEditor-content {
    min-height: 140px;
  }
}

```

### 点击插入entity
自己实现一个下拉弹窗，先固定在页面上。

点击弹窗按钮插入指定的标签元素，这里需要用到CompositeDecorator。

```typescript
  const compositeDecorator = new CompositeDecorator([
    {
      strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges((character) => {
          const entityKey = character.getEntity();
          if (entityKey === null) {
            return false;
          }
          const type = contentState.getEntity(entityKey).getType();
          return type;
        }, callback);
      },
      component: (props) => {
        const data = props.contentState.getEntity(props.entityKey).data;

        return (
          <Tag
            data-offset-key={props.offsetkey}
            className={data.type}
            color={data.color}
          >
            {props.children}
          </Tag>
        );
      },
    },
  ]);

  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty(compositeDecorator),
  );
```

上面设置了entity用Tag组件渲染，在创建entity时传入compositeDecorator。

接下来，点击按钮时，插入entity，方法如下：

```javascript
const insertEntity = async (type, entityData) => {
  setMentionVisible(false);

  let contentState = editorState.getCurrentContent();
  contentState = contentState.createEntity(type, "IMMUTABLE", entityData);
  const entityKey = contentState.getLastCreatedEntityKey();

  let selection = editorState.getSelection();

  if (selection.isCollapsed()) {
    contentState = Modifier.insertText(
      contentState,
      selection,
      entityData.name,
      undefined,
      entityKey,
    );
  } else {
    contentState = Modifier.replaceText(
      contentState,
      selection,
      entityData.name,
      undefined,
      entityKey,
    );
  }

  let end;
  contentState.getFirstBlock().findEntityRanges(
    (character) => character.getEntity() === entityKey,
    (_, _end) => {
      end = _end;
    },
  );

  let newEditorState = EditorState.set(editorState, {
    currentContent: contentState,
  });
  selection = selection.merge({
    anchorOffset: end,
    focusOffset: end,
  });
  newEditorState = EditorState.forceSelection(newEditorState, selection);
  handleEditorChange(newEditorState);
};
```

其中，entity就是我们插入的标签，再删除时是作为一个整体。createEntity的第二个参数，可以是<font style="color:rgb(25, 27, 31);">Immutable、Mutable、Segmented。当entity是链接时用mutable，因为一般情况下，链接和文字并不是紧密耦合的，文字可以自由增删。这里我们用</font>.<font style="color:rgb(25, 27, 31);">Immutable，当在中间添加一个字符，整个entity消失。</font>

<font style="color:rgb(25, 27, 31);">后面用Modifier来修改内容。</font>

<font style="color:rgb(25, 27, 31);">selection是我们的光标操作，anchor是光标的位置，focus是当前选中的位置，从左向右选中时，focusOffset > anchorOffset ; 从右向左选中时，focusOffset < anchorOffset。</font>

<font style="color:rgb(25, 27, 31);">上面创建entity并插入，然后把光标位置移动到后面，保存状态。</font>

### 输入/触发下拉弹窗
给下拉弹窗隐藏起来，输入/显示，插入entity后再隐藏。

这里用到Editor组件的handleBeforeInput方法，监听输入/时，显示弹窗。当return 'handled'，后续事件被拦截，这里触发了弹窗， 同时拦截了/的输入。

```javascript
const handleBeforeInput = (char) => {
  console.log("beforeInput", char);
  if (char === "/" || char === "、") {
    toInsert = char;
    showMention();
    return "handled";
  }

  const selectedTextLength = getLengthOfSelectedText();

  return "not-handled";
};
```

### 关闭弹窗时，插入/
前面拦截了/的输入，但是如果我们确实需要输入/呢，比如http://，因此，我们需要有一个机制来输入/。特意试验了语雀的/是只在每行第一个输入触发弹窗菜单，在后面就不触发。另外出现弹窗后，按住ESC关闭弹窗，或者点击插入一个元素，都不会出现/，但是继续输入其他字符，就会关闭弹窗的同时，连带/和后面的字符一起输入。

这里我们简单一点，当拦截/时，记录有一个待插入的/，当ESC时清空这个记录，而输入其他字符时，关闭弹窗的同时先插入这个记录。用一个flag来记录即可。

插入文本的方法类似上面插入entity。

```javascript
const insertText = (text) => {
  if (!text) return false;

  let contentState = editorState.getCurrentContent();

  let selection = editorState.getSelection();

  if (selection.isCollapsed()) {
    contentState = Modifier.insertText(
      contentState,
      selection,
      text,
      undefined,
      null,
    );
  } else {
    contentState = Modifier.replaceText(
      contentState,
      selection,
      text,
      undefined,
      null,
    );
  }

  let newEditorState = EditorState.set(editorState, {
    currentContent: contentState,
  });
  selection = selection.merge({
    anchorOffset: selection.anchorOffset + 1,
    focusOffset: selection.focusOffset + 1,
  });
  newEditorState = EditorState.forceSelection(newEditorState, selection);
  handleEditorChange(newEditorState);
};
```

### 监听按键关闭弹窗
可以用handleBeforeInput，也可以用keyBindingFn+handleKeyCommand。

其中handleBeforeInput是监听输入直接操作。而keyBindingFn是监听按按键，return一个事件，再用handleKeyCommand去判断事件类型来执行。



当输入任何/以外的按键，都关闭弹窗，并拦截接下来的行为。

再监听document.body，当点击编辑器以外的区域，向上冒泡到页面，同样关闭弹窗。编辑器容器阻止冒泡。



### tab键展示
当输入tab键时，没有像我们一般在vscode等编辑器中输入预期的输入\t或者几个空格效果，而是触发了浏览器本身的切换选中元素的效果。这里用keyBindingFn+handleKeyCommand来监听，插入\t。

### 弹窗位置跟随光标
这里我们需要实时拿到光标的坐标。每次弹窗展示的时候查询。

```javascript
function FindCaretPosition() {
  const selection = window.getSelection();
  const selectionRange = selection.getRangeAt(0).cloneRange();
  selectionRange.collapse(false);
  //-----
  const caretMarker = document.createElement("span");
  caretMarker.id = "__caret";
  selectionRange.insertNode(caretMarker);
  const caretPosition = document
    .querySelector("#__caret")
    .getBoundingClientRect();
  //-----
  selectionRange.deleteContents();

  return { x: caretPosition.left, y: caretPosition.bottom };
}
```

还有一个小问题，我们的菜单以及二级菜单是从左往右的，当光标在右边时，超出屏幕的部分菜单看不到了，这个时候应该让菜单右边跟屏幕右边对齐，二级菜单向左弹出。

### 导出数据，及数据回显
用convertToRaw得到导出数据，再用convertFromRaw导入。注意导入的时候，要用createWithContent，同时还要传入compositeDecorator。

```javascript
  const getEditorValue = () => {
    const content = editorState.getCurrentContent();
    const rawData = convertToRaw(content);
    return JSON.stringify(rawData);
  };
  const setEditorValue = (val) => {
    let newEditorState;
    if (val) {
      const rawData = JSON.parse(val);
      const contentState = convertFromRaw(rawData);
      newEditorState = EditorState.createWithContent(
        contentState,
        compositeDecorator,
      );
    } else {
      newEditorState = EditorState.createEmpty(compositeDecorator);
    }
    setEditorState(newEditorState);
  };
```

## 完整代码和demo
在线代码及预览: [https://codesandbox.io/p/devbox/objective-bohr-fkjlxl?file=%2Fsrc%2FApp.tsx%3A14%2C1](https://codesandbox.io/p/devbox/objective-bohr-fkjlxl?file=%2Fsrc%2FApp.tsx%3A14%2C1)





