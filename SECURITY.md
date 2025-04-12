# 安全策略

## 支持的版本

我们目前支持以下版本的安全更新：

| 版本 | 支持状态 |
| ---- | ----------- |
| 2.x.x | ✅ 支持 |
| 1.x.x | ❌ 不再支持 |

## 报告安全漏洞

我们重视安全问题。如果您发现任何安全漏洞，请通过以下方式报告：

1. 在GitHub上创建Issue，标记为"Security Vulnerability"
2. 或发送邮件至项目维护者(请在issue中查看联系方式)

请在报告中包含以下信息：

- 漏洞类型和影响
- 漏洞的再现步骤
- 受影响的组件版本
- 可能的修复建议（如有）

我们将尽快审查并响应您的报告，通常在72小时内。

## 安全最佳实践

使用wx-confetti组件时，请考虑以下安全最佳实践：

### 1. 性能安全

- **限制粒子数量**：过多的粒子可能导致性能问题，特别是在低端设备上。建议将`particleCount`限制在合理范围内（建议不超过200）。
- **控制同时触发数量**：避免短时间内多次触发大量粒子特效，这可能导致内存占用激增。
- **设置合理的生命周期**：使用适当的`ticks`值，避免粒子持续时间过长。

### 2. 互动安全

- **使用pointer-events: none**：确保Canvas不会干扰用户正常交互。
- **避免自动触发**：除非必要，不要在页面加载时自动触发效果，这可能影响用户体验。
- **提供关闭选项**：对于频繁出现的特效，考虑提供用户关闭选项。

### 3. 资源管理

- **及时清理**：在不需要时调用`reset()`方法释放资源。
- **页面卸载处理**：在页面卸载前确保调用`reset()`清理资源。
- **内存泄漏防范**：避免在循环中创建闭包函数重复触发特效而不清理。

### 4. 适配安全

- **检查基础库版本**：使用前检查微信基础库版本是否满足要求（≥2.9.0）。
- **处理API降级**：当新API不可用时，提供合理的降级策略。
- **错误处理**：为所有API调用添加适当的错误处理。

```javascript
// 基础库版本检查示例
const canUseComponent = () => {
  try {
    // 使用最新推荐API
    const version = wx.getAppBaseInfo().SDKVersion;
    return compareVersion(version, '2.9.0') >= 0;
  } catch (e) {
    // 降级处理：尝试使用旧API
    try {
      const version = wx.getSystemInfoSync().SDKVersion;
      return compareVersion(version, '2.9.0') >= 0;
    } catch (err) {
      return false;
    }
  }
};

// 版本比较函数
const compareVersion = (v1, v2) => {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);
  
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);
    
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  
  return 0;
};
```

## 潜在安全隐患

### 1. Canvas内容安全

虽然Canvas本身不直接涉及敏感信息，但应注意：
- 不要在Canvas上渲染敏感用户数据
- 避免通过Canvas展示可能引起不适的内容

### 2. 微信小程序限制

- **资源占用**：微信小程序对内存和CPU使用有严格限制，过度使用Canvas动画可能导致小程序被系统回收
- **用户体验**：频繁或过度使用特效可能导致用户体验下降，甚至引起投诉

### 3. 第三方库依赖

本组件移植自canvas-confetti库，如有安全更新，我们会及时跟进升级。

## 安全更新日志

| 日期 | 版本 | 修复内容 |
|------|------|----------|
| 2023-05-15 | 2.1.0 | 修复了可能导致内存泄漏的问题 |
| 2023-01-10 | 2.0.0 | 重构组件，提高安全性和性能 |

## 许可证

本安全政策适用于MIT许可下的wx-confetti组件。 