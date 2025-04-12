// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

// 定义五彩纸屑效果选项接口
interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  shapes?: string[];
  colors?: string[];
  scalar?: number;
  flat?: boolean;
  origin?: {
    x: number;
    y: number;
  };
}

// 组件实例接口
interface ConfettiComponent {
  fire: (options: ConfettiOptions) => Promise<void>;
  reset: () => void;
}

Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0,
    motto: '欢迎使用五彩纸屑效果',
  },
  
  // 使用any类型避免TypeScript错误
  confetti: null as any,
  
  onLoad() {
    // 页面加载时获取系统信息
    this.initScreenSize();
  },
  
  // 获取屏幕尺寸并设置全屏canvas
  initScreenSize() {
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
  
  onReady() {
    // 确保屏幕尺寸已设置
    if (this.data.canvasWidth === 0) {
      this.initScreenSize();
    }
    
    // 获取confetti组件实例
    this.confetti = this.selectComponent('#confetti');
    
    // 确保组件已正确加载
    if (!this.confetti || typeof this.confetti.fire !== 'function') {
      console.error('canvas-confetti 组件未正确加载或初始化');
    }
  },
  
  // 获取按钮位置并转换为画布坐标
  async getButtonPosition(event: WechatMiniprogram.TouchEvent): Promise<{x: number, y: number}> {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      
      // 根据事件中的dataset获取按钮选择器
      let selector = '.effect-button';
      if (event.target.dataset.type) {
        selector += '[data-type="' + event.target.dataset.type + '"]';
      } else if (event.target.dataset.param) {
        selector += '[data-param="' + event.target.dataset.param + '"][data-value="' + event.target.dataset.value + '"]';
      }
      
      query.select(selector)
        .boundingClientRect()
        .exec((res) => {
          if (res && res[0]) {
            const button = res[0];
            // 计算按钮中心点相对于屏幕的位置
            const origin = {
              x: (button.left + button.width / 2) / this.data.canvasWidth,
              y: (button.top + button.height / 2) / this.data.canvasHeight
            };
            resolve(origin);
          } else {
            // 如果找不到按钮，使用事件触发点
            const origin = {
              x: event.touches[0].pageX / this.data.canvasWidth,
              y: event.touches[0].pageY / this.data.canvasHeight
            };
            resolve(origin);
          }
        });
    });
  },
  
  // 基本效果
  async fireBasic(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    this.confetti.fire({
      particleCount: 100,
      spread: 70,
      origin
    });
  },
  
  // 校园效果 - 使用校园颜色
  async fireSchool(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    this.confetti.fire({
      particleCount: 150,
      spread: 60,
      origin,
      colors: ['#ff0000', '#ffff00', '#0000ff', '#00ff00']
    });
  },
  
  // 烟花效果
  async fireFireworks(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    
    // 发射多次形成烟花效果
    const count = 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (this.confetti && typeof this.confetti.fire === 'function') {
          this.confetti.fire({
            particleCount: 30,
            spread: 100 + i * 10,
            origin,
            startVelocity: 30,
            shapes: ['circle', 'star'],
            ticks: 300,
            scalar: 0.8 + i * 0.2
          });
        }
      }, i * 200);
    }
  },
  
  // 雪花效果
  async fireSnow(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    this.confetti.fire({
      particleCount: 200,
      spread: 180,
      origin: { x: origin.x, y: origin.y - 0.1 }, // 稍微向上偏移
      startVelocity: 25,
      gravity: 0.8,
      ticks: 300,
      decay: 0.96,
      shapes: ['circle'],
      colors: ['#ffffff', '#f0f0f0', '#e0e0e0'],
      scalar: 0.6,
      drift: 0.5 // 添加漂移
    });
  },
  
  // 更真实的五彩纸屑效果
  async fireRealistic(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    
    // 从按钮两侧发射
    const leftEnd = {
      x: Math.max(0.1, origin.x - 0.15),
      y: origin.y
    };
    
    const rightEnd = {
      x: Math.min(0.9, origin.x + 0.15),
      y: origin.y
    };
    
    // 左侧发射
    this.confetti.fire({
      particleCount: 60,
      angle: 60,
      spread: 50,
      origin: leftEnd,
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'],
      flat: true
    });
    
    // 右侧发射
    this.confetti.fire({
      particleCount: 60,
      angle: 120,
      spread: 50,
      origin: rightEnd,
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d'],
      flat: true
    });
  },
  
  // 参数示例：根据选择的参数展示不同效果
  async fireParamExample(event: WechatMiniprogram.TouchEvent) {
    if (!this.confetti || typeof this.confetti.fire !== 'function') return;
    
    const origin = await this.getButtonPosition(event);
    const param = event.target.dataset.param;
    const value = event.target.dataset.value;
    
    // 基本配置
    const baseOptions: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      startVelocity: 45,
      origin,
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d']
    };
    
    // 根据选择的参数调整配置
    switch (param) {
      case 'count':
        baseOptions.particleCount = parseInt(value as string);
        break;
        
      case 'shape':
        if (value === 'square') {
          baseOptions.shapes = ['square'];
        } else if (value === 'circle') {
          baseOptions.shapes = ['circle'];
        } else if (value === 'star') {
          baseOptions.shapes = ['star'];
        } else if (value === 'mixed') {
          baseOptions.shapes = ['square', 'circle', 'star'];
        }
        break;
        
      case 'spread':
        baseOptions.spread = parseInt(value as string);
        break;
        
      case 'gravity':
        baseOptions.gravity = parseFloat(value as string);
        break;
        
      case 'velocity':
        baseOptions.startVelocity = parseInt(value as string);
        break;
        
      case 'angle':
        baseOptions.angle = parseInt(value as string);
        break;
    }
    
    // 执行效果
    this.confetti.fire(baseOptions);
  },
})
