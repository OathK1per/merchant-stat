import React from 'react';
import { motion } from 'framer-motion';
import { Card } from 'antd';

/**
 * 动画卡片组件
 * @param {Object} props - 卡片属性，继承自Ant Design的Card组件
 * @param {string} props.animationType - 动画类型，可选值：hover, float, glow
 * @param {Object} props.animationProps - 自定义动画属性
 */
const AnimatedCard = ({ 
  children, 
  animationType = 'hover', 
  animationProps = {}, 
  ...cardProps 
}) => {
  // 预设动画效果
  const animations = {
    hover: {
      whileHover: { 
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      },
      transition: { type: 'spring', stiffness: 300 }
    },
    float: {
      animate: {
        y: [0, -5, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      }
    },
    glow: {
      whileHover: { 
        boxShadow: '0 0 15px rgba(24, 144, 255, 0.5)' 
      },
      transition: { duration: 0.3 }
    },
    scale: {
      whileHover: { 
        scale: 1.02,
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      },
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  // 获取预设动画或默认动画
  const animation = animations[animationType] || animations.hover;

  // 合并自定义动画属性
  const motionProps = {
    ...animation,
    ...animationProps
  };

  return (
    <motion.div
      {...motionProps}
      style={{ height: '100%' }}
    >
      <Card {...cardProps} style={{ height: '100%', ...cardProps.style }}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;