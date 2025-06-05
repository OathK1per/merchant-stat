import React from 'react';
import { motion } from 'framer-motion';
import { Button } from 'antd';

/**
 * 动画按钮组件
 * @param {Object} props - 按钮属性，继承自Ant Design的Button组件
 * @param {string} props.animationType - 动画类型，可选值：scale, bounce, rotate
 * @param {Object} props.animationProps - 自定义动画属性
 */
const AnimatedButton = ({ 
  children, 
  animationType = 'scale', 
  animationProps = {}, 
  ...buttonProps 
}) => {
  // 预设动画效果
  const animations = {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    },
    bounce: {
      whileHover: { y: -3 },
      whileTap: { y: 1 }
    },
    rotate: {
      whileHover: { rotate: 2 },
      whileTap: { rotate: -2 }
    },
    glow: {
      whileHover: { 
        boxShadow: '0 0 8px rgba(24, 144, 255, 0.5)' 
      },
      whileTap: { 
        boxShadow: '0 0 2px rgba(24, 144, 255, 0.5)' 
      }
    }
  };

  // 获取预设动画或默认动画
  const animation = animations[animationType] || animations.scale;

  // 合并自定义动画属性
  const motionProps = {
    ...animation,
    ...animationProps
  };

  return (
    <motion.div
      style={{ display: 'inline-block' }}
      {...motionProps}
    >
      <Button {...buttonProps}>
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;