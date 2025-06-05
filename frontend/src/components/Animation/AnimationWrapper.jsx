import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

// 预设动画效果
const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  },
  bounce: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 15 
    }
  },
  rotate: {
    initial: { opacity: 0, rotate: -5 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 5 },
    transition: { duration: 0.3 }
  },
  flip: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { duration: 0.4 }
  },
  staggered: (index = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, delay: index * 0.1 }
  })
};

/**
 * 动画包装组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {string} props.type - 动画类型，可选值：fadeIn, slideUp, slideDown, slideLeft, slideRight, scale, bounce, rotate, flip, staggered
 * @param {number} props.index - 用于staggered动画的索引
 * @param {Object} props.custom - 自定义动画属性，会覆盖预设动画
 * @param {string} props.className - 额外的CSS类名
 */
const AnimationWrapper = forwardRef(({ 
  children, 
  type = 'fadeIn', 
  index = 0, 
  custom = {}, 
  className = '',
  ...props 
}, ref) => {
  // 获取预设动画或使用自定义动画
  let animation = animations[type] || animations.fadeIn;
  
  // 如果是staggered动画，需要传入索引
  if (type === 'staggered') {
    animation = animations.staggered(index);
  }
  
  // 合并自定义动画属性
  const animationProps = {
    ...animation,
    ...custom
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={animationProps.initial}
      animate={animationProps.animate}
      exit={animationProps.exit}
      transition={animationProps.transition}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default AnimationWrapper;