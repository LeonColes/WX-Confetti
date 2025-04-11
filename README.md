# Canvas Confetti 微信小程序组件

这是一个兼容微信小程序的canvas-confetti组件，可以在小程序中实现五彩纸屑特效。移植自 [canvas-confetti](https://github.com/catdad/canvas-confetti) 库。

## 功能特点

- 完全兼容微信小程序
- 保留了原始库的核心功能
- 支持自定义颜色、形状、速度等参数
- 使用微信小程序的2D Canvas API
- 轻量级实现，性能良好

## 使用方法

### 1. 在页面JSON中引入组件

```json
{
  "usingComponents": {
    "canvas-confetti": "/components/canvas-confetti/canvas-confetti"
  }
}
```

### 2. 在WXML中使用组件

```html
<canvas-confetti id="confetti" width="{{canvasWidth}}" height="{{canvasHeight}}"></canvas-confetti>
```

### 3. 在JS中调用组件方法

```javascript
Page({
  data: {
    canvasWidth: 300,  // 设置画布宽度
    canvasHeight: 300  // 设置画布高度
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
| x | Number | 0.5 | 原点横坐标比例(0-1) |
| y | Number | 0.5 | 原点纵坐标比例(0-1) |
| shapes | Array | ['square', 'circle'] | 形状数组 |
| colors | Array | ['#26ccff', '#a25afd', ...] | 颜色数组 |
| scalar | Number | 1 | 尺寸缩放比例 |
| flat | Boolean | false | 是否平面运动(无旋转) |

### 示例

```javascript
// 在屏幕底部中央发射五彩纸屑
this.confetti.fire({
  particleCount: 150,
  spread: 60,
  origin: { y: 0.9 }
});

// 从左边发射
this.confetti.fire({
  particleCount: 50,
  angle: 60,
  spread: 55,
  origin: { x: 0 }
});

// 彩色星星
this.confetti.fire({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  shapes: ['star']
});
```

## 方法说明

该组件提供以下方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| fire | options | Promise | 触发五彩纸屑效果，返回Promise |
| reset | 无 | 无 | 重置画布，清除所有五彩纸屑 |

## 异步处理

从v2.0版本开始，fire方法是异步的，返回Promise，这是为了确保Canvas初始化完成后再触发效果：

```javascript
// 正确处理异步
this.confetti.fire(options)
  .then(() => {
    console.log('效果启动成功');
  })
  .catch(err => {
    console.error('效果启动失败', err);
    // 在这里可以添加重试逻辑或错误处理
  });
```

## 注意事项

1. 需要使用微信基础库 2.9.0 以上版本（支持type="2d"的canvas）
2. 建议在页面onReady生命周期内初始化组件
3. 在组件销毁前调用reset方法清除动画
4. fire方法是异步的，请使用Promise处理结果
5. 如遇到"Canvas未初始化"错误，请检查canvas是否正确创建，或在稍后重试

## 故障排除

如果遇到"Canvas未初始化"错误，可能有以下原因：

1. 组件未完全加载 - 尝试延迟调用fire方法
2. canvas节点未正确创建 - 检查WXML和组件ID是否匹配
3. 微信基础库版本过低 - 升级到2.9.0以上版本

## 性能优化建议

1. 适当控制particleCount数量，避免过多纸屑导致性能下降
2. 不需要显示时及时调用reset()方法释放资源
3. 在低端设备上可以降低参数或减少使用频率 