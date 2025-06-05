import { Button, Card } from 'antd';

// 导出所有无动画版本的组件
export const AnimationWrapper = ({ children, className = '', ...props }) => {
  return <div className={className} {...props}>{children}</div>;
};

export const useAnimation = () => ({});

export const AnimatedButton = ({ children, ...buttonProps }) => {
  const { animationType, animationProps, ...restProps } = buttonProps;
  return <Button {...restProps}>{children}</Button>;
};

export const AnimatedCard = ({ children, ...cardProps }) => {
  const { animationType, animationProps, ...restProps } = cardProps;
  return <Card {...restProps}>{children}</Card>;
};

export const AnimatedList = ({ children, className = '', ...props }) => {
  return <div className={className} {...props}>{children}</div>;
};

export const PageTransition = ({ children, location, className = '', ...props }) => {
  return <div className={className} {...props}>{children}</div>;
};