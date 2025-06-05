import { useSpring } from 'react-spring';

/**
 * 动画效果钩子函数
 * @param {string} type - 动画类型
 * @param {Object} customConfig - 自定义配置
 * @returns {Object} - react-spring动画属性
 */
const useAnimation = (type = 'fadeIn', customConfig = {}) => {
  // 预设动画配置
  const presets = {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      config: { tension: 280, friction: 20 }
    },
    slideUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      config: { tension: 280, friction: 20 }
    },
    slideDown: {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      config: { tension: 280, friction: 20 }
    },
    slideLeft: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      config: { tension: 280, friction: 20 }
    },
    slideRight: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      config: { tension: 280, friction: 20 }
    },
    scale: {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
      config: { tension: 280, friction: 20 }
    },
    bounce: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      config: { tension: 300, friction: 10, mass: 1 }
    },
    rotate: {
      from: { opacity: 0, transform: 'rotate(-5deg)' },
      to: { opacity: 1, transform: 'rotate(0deg)' },
      config: { tension: 280, friction: 20 }
    },
    flip: {
      from: { opacity: 0, transform: 'rotateX(90deg)' },
      to: { opacity: 1, transform: 'rotateX(0deg)' },
      config: { tension: 280, friction: 20 }
    }
  };

  // 获取预设或默认动画
  const preset = presets[type] || presets.fadeIn;
  
  // 合并自定义配置
  const config = {
    ...preset,
    ...customConfig
  };

  // 使用react-spring的useSpring钩子
  return useSpring(config);
};

export default useAnimation;