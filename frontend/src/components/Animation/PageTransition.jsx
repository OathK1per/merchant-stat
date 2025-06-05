import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 页面过渡动画组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件（页面内容）
 * @param {string} props.type - 动画类型，可选值：fade, slide, scale, flip
 * @param {string} props.className - 额外的CSS类名
 * @param {string} props.location - 当前路由位置，用于触发动画
 */
const PageTransition = ({ 
  children, 
  type = 'fade', 
  className = '',
  location,
  ...props 
}) => {
  // 预设动画效果
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slide: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
      transition: { duration: 0.3 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.1 },
      transition: { duration: 0.3 }
    },
    flip: {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: -90 },
      transition: { duration: 0.4 }
    }
  };

  // 获取预设动画或默认动画
  const animation = animations[type] || animations.fade;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        className={className}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;