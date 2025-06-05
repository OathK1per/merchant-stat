import React, { forwardRef, Children, cloneElement } from 'react';
import { motion } from 'framer-motion';

/**
 * 动画列表组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件（列表项）
 * @param {string} props.className - 额外的CSS类名
 * @param {number} props.staggerDelay - 列表项之间的延迟时间（秒）
 * @param {string} props.animation - 动画类型，可选值：fadeIn, slideUp, slideLeft, scale
 */
const AnimatedList = forwardRef(({ 
  children, 
  className = '', 
  staggerDelay = 0.05, 
  animation = 'fadeIn',
  ...props 
}, ref) => {
  // 预设动画效果
  const animations = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  // 获取预设动画或默认动画
  const selectedAnimation = animations[animation] || animations.fadeIn;

  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  // 列表项动画变体
  const itemVariants = {
    hidden: selectedAnimation.hidden,
    visible: {
      ...selectedAnimation.visible,
      transition: { duration: 0.3 }
    }
  };

  // 将React子元素转换为数组
  const childrenArray = Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={child.key || index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
});

export default AnimatedList;