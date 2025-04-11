// canvas-confetti.js - 微信小程序兼容版本
// 基于 https://github.com/catdad/canvas-confetti

Component({
  properties: {
    width: {
      type: Number,
      value: 300
    },
    height: {
      type: Number,
      value: 300
    },
    id: {
      type: String,
      value: 'confettiCanvas'
    }
  },

  data: {
    canvasId: '',
    isCanvasReady: false,
    canvasInitPromise: null,
    animationFrameId: null,
    animatingFettis: [],
    defaults: {
      particleCount: 50,
      angle: 90,
      spread: 45,
      startVelocity: 45,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      ticks: 200,
      x: 0.5,
      y: 0.5,
      shapes: ['square', 'circle'],
      colors: [
        '#26ccff',
        '#a25afd',
        '#ff5e7e',
        '#88ff5a',
        '#fcff42',
        '#ffa62d',
        '#ff36ff'
      ],
      scalar: 1,
      flat: false
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        canvasId: this.properties.id
      });
      // 创建初始化Promise
      this.data.canvasInitPromise = new Promise((resolve) => {
        this._canvasReadyResolver = resolve;
      });
    },
    ready() {
      // 在组件准备好后初始化canvas
      this.initCanvas();
    },
    detached() {
      this.reset();
    }
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery();
      query.select(`#${this.data.canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            // 设置canvas大小
            canvas.width = this.properties.width;
            canvas.height = this.properties.height;
            
            this.canvas = canvas;
            this.ctx = ctx;
            
            // 标记canvas已准备好
            this.setData({ isCanvasReady: true });
            
            // 解析初始化Promise
            if (this._canvasReadyResolver) {
              this._canvasReadyResolver();
            }
            
            console.log('Canvas 已初始化完成', this.canvas.width, this.canvas.height);
          } else {
            console.error('Canvas 节点未找到', this.data.canvasId);
            // 如果找不到canvas，200ms后重试
            setTimeout(() => {
              this.initCanvas();
            }, 200);
          }
        });
    },

    // 等待canvas初始化完成
    async waitForCanvasReady() {
      if (this.data.isCanvasReady && this.canvas && this.ctx) {
        return true;
      }
      
      try {
        await this.data.canvasInitPromise;
        return true;
      } catch (err) {
        console.error('Canvas 初始化失败', err);
        return false;
      }
    },

    // 核心方法，触发五彩纸屑效果
    async fire(options = {}) {
      // 等待canvas初始化完成
      const isReady = await this.waitForCanvasReady();
      
      if (!isReady || !this.canvas || !this.ctx) {
        console.error('Canvas 未初始化');
        return Promise.reject('Canvas 未初始化');
      }

      return this.fireConfetti(options);
    },

    // 重置，停止当前动画
    reset() {
      this.cancelAnimation();
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.setData({
        animatingFettis: []
      });
    },

    // 取消动画帧
    cancelAnimation() {
      if (this.data.animationFrameId) {
        if (wx.canIUse('cancelAnimationFrame')) {
          cancelAnimationFrame(this.data.animationFrameId);
        } else {
          clearTimeout(this.data.animationFrameId);
        }
        this.setData({
          animationFrameId: null
        });
      }
    },

    // 请求动画帧
    requestFrame(callback) {
      if (wx.canIUse('requestAnimationFrame')) {
        return requestAnimationFrame(callback);
      } else {
        return setTimeout(callback, 1000 / 60);
      }
    },

    // 转换属性
    convert(val, transform) {
      return transform ? transform(val) : val;
    },

    // 检查值是否有效
    isOk(val) {
      return !(val === null || val === undefined);
    },

    // 获取配置属性
    prop(options, name, transform) {
      return this.convert(
        options && this.isOk(options[name]) ? options[name] : this.data.defaults[name],
        transform
      );
    },

    // 将十六进制颜色转为RGB
    hexToRgb(str) {
      const val = String(str).replace(/[^0-9a-f]/gi, '');
      const hex = val.length < 6 
        ? val[0] + val[0] + val[1] + val[1] + val[2] + val[2]
        : val;

      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    },

    // 颜色数组转RGB
    colorsToRgb(colors) {
      return colors.map(color => this.hexToRgb(color));
    },

    // 只接受正整数
    onlyPositiveInt(number) {
      return number < 0 ? 0 : Math.floor(number);
    },

    // 生成随机整数
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },

    // 获取原点配置
    getOrigin(options) {
      const origin = this.prop(options, 'origin', Object) || {};
      origin.x = this.isOk(origin.x) ? origin.x : this.data.defaults.x;
      origin.y = this.isOk(origin.y) ? origin.y : this.data.defaults.y;
      return origin;
    },

    // 创建随机物理属性
    randomPhysics(opts) {
      const radAngle = opts.angle * (Math.PI / 180);
      const radSpread = opts.spread * (Math.PI / 180);

      return {
        x: opts.x,
        y: opts.y,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
        velocity: (opts.startVelocity * 0.5) + (Math.random() * opts.startVelocity),
        angle2D: -radAngle + ((0.5 * radSpread) - (Math.random() * radSpread)),
        tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
        color: opts.color,
        shape: opts.shape,
        tick: 0,
        totalTicks: opts.ticks,
        decay: opts.decay,
        drift: opts.drift,
        random: Math.random() + 2,
        tiltSin: 0,
        tiltCos: 0,
        wobbleX: 0,
        wobbleY: 0,
        gravity: opts.gravity * 3,
        ovalScalar: 0.6,
        scalar: opts.scalar,
        flat: opts.flat
      };
    },

    // 微信小程序不支持Path2D和标准的ellipse，创建一个ellipse方法
    ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(radiusX, radiusY);
      context.arc(0, 0, 1, startAngle, endAngle, false);
      context.restore();
    },

    // 更新单个五彩纸屑
    updateFetti(context, fetti) {
      fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
      fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
      fetti.velocity *= fetti.decay;

      if (fetti.flat) {
        fetti.wobble = 0;
        fetti.wobbleX = fetti.x + (10 * fetti.scalar);
        fetti.wobbleY = fetti.y + (10 * fetti.scalar);

        fetti.tiltSin = 0;
        fetti.tiltCos = 0;
        fetti.random = 1;
      } else {
        fetti.wobble += fetti.wobbleSpeed;
        fetti.wobbleX = fetti.x + ((10 * fetti.scalar) * Math.cos(fetti.wobble));
        fetti.wobbleY = fetti.y + ((10 * fetti.scalar) * Math.sin(fetti.wobble));

        fetti.tiltAngle += 0.1;
        fetti.tiltSin = Math.sin(fetti.tiltAngle);
        fetti.tiltCos = Math.cos(fetti.tiltAngle);
        fetti.random = Math.random() + 2;
      }

      const progress = (fetti.tick++) / fetti.totalTicks;

      const x1 = fetti.x + (fetti.random * fetti.tiltCos);
      const y1 = fetti.y + (fetti.random * fetti.tiltSin);
      const x2 = fetti.wobbleX + (fetti.random * fetti.tiltCos);
      const y2 = fetti.wobbleY + (fetti.random * fetti.tiltSin);

      context.fillStyle = `rgba(${fetti.color.r}, ${fetti.color.g}, ${fetti.color.b}, ${1 - progress})`;
      context.beginPath();

      if (fetti.shape === 'circle') {
        this.ellipse(
          context, 
          fetti.x, 
          fetti.y, 
          Math.abs(x2 - x1) * fetti.ovalScalar, 
          Math.abs(y2 - y1) * fetti.ovalScalar, 
          Math.PI / 10 * fetti.wobble, 
          0, 
          2 * Math.PI
        );
      } else if (fetti.shape === 'star') {
        let rot = Math.PI / 2 * 3;
        const innerRadius = 4 * fetti.scalar;
        const outerRadius = 8 * fetti.scalar;
        const x = fetti.x;
        const y = fetti.y;
        let spikes = 5;
        const step = Math.PI / spikes;

        while (spikes--) {
          let xTemp = x + Math.cos(rot) * outerRadius;
          let yTemp = y + Math.sin(rot) * outerRadius;
          context.lineTo(xTemp, yTemp);
          rot += step;

          xTemp = x + Math.cos(rot) * innerRadius;
          yTemp = y + Math.sin(rot) * innerRadius;
          context.lineTo(xTemp, yTemp);
          rot += step;
        }
      } else {
        // square (default)
        context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
        context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
        context.lineTo(Math.floor(x2), Math.floor(y2));
        context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
      }

      context.closePath();
      context.fill();

      return fetti.tick < fetti.totalTicks;
    },

    // 动画函数
    animate(fettis) {
      const animatingFettis = [...fettis];
      const context = this.ctx;
      const canvas = this.canvas;

      const update = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        const stillAlive = [];
        for (let i = 0; i < animatingFettis.length; i++) {
          if (this.updateFetti(context, animatingFettis[i])) {
            stillAlive.push(animatingFettis[i]);
          }
        }

        if (stillAlive.length) {
          this.setData({
            animatingFettis: stillAlive,
            animationFrameId: this.requestFrame(() => update())
          });
        } else {
          this.setData({
            animatingFettis: [],
            animationFrameId: null
          });
        }
      };

      this.setData({
        animationFrameId: this.requestFrame(() => update())
      });
    },

    // 发射五彩纸屑
    fireConfetti(options) {
      return new Promise((resolve) => {
        const particleCount = this.prop(options, 'particleCount', this.onlyPositiveInt.bind(this));
        const angle = this.prop(options, 'angle', Number);
        const spread = this.prop(options, 'spread', Number);
        const startVelocity = this.prop(options, 'startVelocity', Number);
        const decay = this.prop(options, 'decay', Number);
        const gravity = this.prop(options, 'gravity', Number);
        const drift = this.prop(options, 'drift', Number);
        const colors = this.prop(options, 'colors', this.colorsToRgb.bind(this));
        const ticks = this.prop(options, 'ticks', Number);
        const shapes = this.prop(options, 'shapes');
        const scalar = this.prop(options, 'scalar');
        const flat = !!this.prop(options, 'flat');
        const origin = this.getOrigin(options);

        let temp = particleCount;
        const fettis = [];

        const startX = this.canvas.width * origin.x;
        const startY = this.canvas.height * origin.y;

        while (temp--) {
          fettis.push(
            this.randomPhysics({
              x: startX,
              y: startY,
              angle: angle,
              spread: spread,
              startVelocity: startVelocity,
              color: colors[temp % colors.length],
              shape: shapes[this.randomInt(0, shapes.length)],
              ticks: ticks,
              decay: decay,
              gravity: gravity,
              drift: drift,
              scalar: scalar,
              flat: flat
            })
          );
        }

        // 合并已有和新的五彩纸屑
        const allFettis = [...this.data.animatingFettis, ...fettis];
        
        this.setData({
          animatingFettis: allFettis
        }, () => {
          // 如果已经有动画在运行，不需要再次启动
          if (!this.data.animationFrameId) {
            this.animate(allFettis);
          }
          resolve();
        });
      });
    }
  }
}); 