## 问题
一次代码review中，发现代码如下：

```javascript
export const sortByASCII = (obj) => {
    let arr = Object.keys(obj);
    let sortArr = arr.sort();
    let sortObj = {};
    for (let i in sortArr) {
        sortObj[sortArr[i]] = obj[sortArr[i]];
    }
    return sortObj;
};

export const qs = {
  stringify: (obj = {}) => {
        const arr = [];
        for (const key in obj) {
            arr.push(key + "=" + obj[key]);
        }
        return arr.join("&");
    },
}

```

接口传参需要对对象的key按照ASCII码排序后拼接，然后开发写了个对象排序方法，将对象的key排序后，重新插入一个新对象并返回。传参时，调用qs.stringify(sortByASCII(params))，以得到一个ASCII排序后拼接的参数字符串。

这里显然是存在问题的，我们学习js的时候，就有讲过，for in并没有一个统一的遍历标准，在不同浏览器的实现都是不一样的。MDN的for in文档显示：**<font style="color:rgb(27, 27, 27);">for...in</font>**<font style="color:rgb(27, 27, 27);"> </font>**<font style="color:rgb(27, 27, 27);">语句</font>**<font style="color:rgb(27, 27, 27);">以任意顺序迭代一个对象</font>的除Symbol以外的可枚举属<font style="color:rgb(27, 27, 27);">性，包括继承的可枚举属性。此外，for in还会遍历原型属性，最好加上hasOwnProperty判断。</font>

## 解决
最好的办法，显然是我们对对象不进行排序，而是在拼接key的时候再排序。

```javascript
export const sortObjectEntries = (obj) => {
    return Object.entries(obj).sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0 )
};
```

这样我们就得到排序后的对象[key, value]数组。

这个方法存在一个问题，就是Object.entries的兼容性，需要写一个polyfill，当Object.entries不存在时，用for in实现一下。

## obj排序探究
我用前面的sortByASCII方法试验了几个对象，其实结果还是符合预期的，说明chrome浏览器还是按照插入顺序去遍历的。那么是否所有场景chrome都会这样，是否其他浏览器也这样。查询了一些文档，刚好看到有一篇文章作者对此转了分析。[https://juejin.cn/post/6998831933736108039](https://juejin.cn/post/6998831933736108039)

按照作者的分析，object.keys在现代浏览器排序规则如下：

1. <font style="color:rgb(51, 51, 51);">先从小到大遍历正整数部分</font>
2. <font style="color:rgb(51, 51, 51);">按接下来会插入顺序遍历剩下的字符串</font>
3. <font style="color:rgb(51, 51, 51);">最后再按照插入顺序</font>遍历 Symbol 类<font style="color:rgb(51, 51, 51);">型</font>

而for in的情况更复杂，因为最早for in并没有标准，后来采用了跟上面一样的规则。

所以之前的实现方法，当对象的属性都是字符串的时候，在现代浏览器是没有什么问题的。但是如果有正整数字符串的key就会存在问题。



