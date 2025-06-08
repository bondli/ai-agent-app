import React, { memo } from 'react';
import style from './index.module.less';

type MenuItemProps = {
  label: string;
  count: number;
};

const MenuItem: React.FC<MenuItemProps> = (props) => {
  const { label, count } = props;
  return (
    <div className={style.container}>
      <span>{label}</span>
      <span>{count}</span>
    </div>
  );

};

export default memo(MenuItem);