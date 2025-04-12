# Canvas Confetti 微信小程序组件

这是一个兼容微信小程序的canvas-confetti组件，可以在小程序中实现五彩纸屑特效。移植自 [canvas-confetti](https://github.com/catdad/canvas-confetti) 库。

## 功能特点

- 完全兼容微信小程序
- 保留了原始库的核心功能
- 支持自定义颜色、形状、速度等参数
- 使用微信小程序的2D Canvas API
- 轻量级实现，性能良好
- 支持真机显示，解决了层级渲染问题

## 兼容性说明

- 基础库版本要求：2.9.0或更高（支持type="2d"的canvas）
- 已适配iPhone、Android等主流设备
- 已解决真机调试canvas层级不在顶层的问题

## 使用方法

### 1. 在页面JSON中引入组件

```json
{
  "usingComponents": {
    "vx-confetti": "/components/vx-confetti/vx-confetti"
  }
}
```

### 2. 在WXML中使用组件

```html
<vx-confetti id="confetti" class="confetti-canvas" width="{{canvasWidth}}" height="{{canvasHeight}}"></vx-confetti>
```

### 3. 在CSS中添加样式（可选，组件内已有默认样式）

```css
.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  pointer-events: none; /* 确保canvas不会阻挡点击事件 */
}
```

### 4. 在JS中调用组件方法

```javascript
Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0
  },
  
  onLoad() {
    // 获取屏幕尺寸
    try {
      const info = wx.getWindowInfo();
      this.setData({
        canvasWidth: info.windowWidth,
        canvasHeight: info.windowHeight
      });
    } catch (e) {
      console.error('获取屏幕尺寸失败', e);
      // 设置默认值
      this.setData({
        canvasWidth: 375,
        canvasHeight: 667
      });
    }
  },
  
  onReady: function() {
    // 获取组件实例
    this.confetti = this.selectComponent('#confetti');
  },
  
  fireConfetti: function() {
    // 触发五彩纸屑效果 - 注意这是异步方法，返回Promise
    this.confetti.fire({
      particleCount: 100,
      spread: 70,
      angle: 90,
      origin: { x: 0.5, y: 0.5 }
    }).then(() => {
      console.log('五彩纸屑效果已启动');
    }).catch(err => {
      console.error('启动失败', err);
    });
  },
  
  resetConfetti: function() {
    // 重置画布，清除五彩纸屑
    this.confetti.reset();
  }
})
```

## API 参数说明

发射五彩纸屑时可以设置以下参数：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| particleCount | Number | 50 | 纸屑数量 |
| angle | Number | 90 | 发射角度（度） |
| spread | Number | 45 | 发散角度范围（度） |
| startVelocity | Number | 45 | 初始速度 |
| decay | Number | 0.9 | 速度衰减系数 |
| gravity | Number | 1 | 重力系数 |
| drift | Number | 0 | 横向漂移系数 |
| ticks | Number | 200 | 生命周期帧数 |
| shapes | Array | ['square', 'circle'] | 形状数组 |
| colors | Array | ['#26ccff', ...] | 颜色数组 |
| scalar | Number | 1 | 尺寸缩放比例 |
| flat | Boolean | false | 是否平面运动(无旋转) |
| origin | Object | {x: 0.5, y: 0.5} | 发射原点(相对画布的0-1比例) |

### 示例用法

#### 基本效果

```javascript
// 基本效果
this.confetti.fire({
  particleCount: 100,
  spread: 70,
  origin: { x: 0.5, y: 0.5 }
});
```

#### 烟花效果

```javascript
// 烟花效果
const count = 5;
for (let i = 0; i < count; i++) {
  setTimeout(() => {
    this.confetti.fire({
      particleCount: 30,
      spread: 100 + i * 10,
      origin: { x: 0.5, y: 0.5 },
      startVelocity: 30,
      shapes: ['circle', 'star'],
      ticks: 300,
      scalar: 0.8 + i * 0.2
    });
  }, i * 200);
}
```

#### 双侧发射

```javascript
// 从左侧发射
this.confetti.fire({
  particleCount: 60,
  angle: 60,
  spread: 50,
  origin: { x: 0.1, y: 0.5 }
});

// 从右侧发射
this.confetti.fire({
  particleCount: 60,
  angle: 120,
  spread: 50,
  origin: { x: 0.9, y: 0.5 }
});
```

## 方法说明

该组件提供以下方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| fire | options | Promise | 触发五彩纸屑效果，返回Promise |
| reset | 无 | 无 | 重置画布，清除所有五彩纸屑 |

## 真机调试注意事项

1. 如果在真机上canvas不显示或层级问题，组件已经通过以下方式解决：
   - 使用`position: fixed`定位
   - 设置较高的`z-index: 9999`
   - 使用`pointer-events: none`确保不影响其他元素的交互
   - 配置设备像素比(DPR)以优化显示效果

2. 如果还有问题，请检查：
   - 确保使用了最新版本的基础库
   - 组件有正确的class属性和样式
   - 屏幕尺寸获取正确

## 基础库新版本API适配

随着微信小程序基础库的更新，部分API已经被废弃并推荐使用新的替代API：

- 不再使用 `wx.getSystemInfoSync()`，改用 `wx.getDeviceInfo()` 获取设备信息
- 获取窗口信息应使用 `wx.getWindowInfo()`
- 获取应用基本信息使用 `wx.getAppBaseInfo()`
- 获取系统设置信息使用 `wx.getSystemSetting()`
- 获取授权信息使用 `wx.getAppAuthorizeSetting()`

这些新API的好处是职责更明确，调用更轻量，并且支持同步和异步方式。

## 功能拓展示例

### 按钮点击效果

```javascript
// 获取按钮位置并在该位置触发特效
async function fireAtButton(event) {
  const query = wx.createSelectorQuery();
  const button = await new Promise(resolve => {
    query.select('.button')
      .boundingClientRect()
      .exec(res => resolve(res[0]));
  });
  
  const origin = {
    x: (button.left + button.width / 2) / this.data.canvasWidth,
    y: (button.top + button.height / 2) / this.data.canvasHeight
  };
  
  this.confetti.fire({
    particleCount: 100,
    spread: 70,
    origin
  });
}
```

### 连续特效

```javascript
// 连续触发多个效果
function fireMultiEffect() {
  for (let i = 0; i <= 5; i++) {
    setTimeout(() => {
      this.confetti.fire({
        particleCount: 20,
        angle: 90 + i * 15,
        spread: 50,
        origin: { x: 0.5, y: 0.5 }
      });
    }, i * 150);
  }
}
```

## 性能优化建议

1. 适当控制particleCount数量，避免过多纸屑导致性能下降
2. 不需要显示时及时调用reset()方法释放资源
3. 在低端设备上可以降低参数或减少使用频率
4. 使用合适的ticks值，避免动画时间过长

## 故障排除

如果遇到"Canvas未初始化"错误，可能有以下原因：

1. 组件未完全加载 - 尝试延迟调用fire方法
2. canvas节点未正确创建 - 检查WXML和组件ID是否匹配
3. 微信基础库版本过低 - 升级到2.9.0以上版本

## CSS选择器注意事项

在微信小程序组件中，某些选择器是不允许使用的：
- 标签名选择器（如 `canvas{}`）
- ID选择器（如 `#confetti{}`）
- 属性选择器（如 `[id="confetti"]{}`）

请始终使用类选择器（如 `.confetti-canvas{}`）来设置样式，避免在组件样式中使用上述选择器。

## 授权协议

MIT