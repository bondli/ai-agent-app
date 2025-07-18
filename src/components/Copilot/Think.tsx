import React, { memo, useState } from 'react';

import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

type ComProps = {
  content: string;
};

const Think: React.FC<ComProps> = (props) => {
  const { content } = props;
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
  };

  const output = content.replace(/<think>([\s\S]*?)<\/think>/g, '$1');

  if (!output.trim()) {
    return null;
  }

  return (
    <div style={{ fontSize: 12, marginBottom: 10 }}>
      <Button
        color='default'
        variant='filled'
        size='small'
        icon={collapsed ? <DownOutlined /> : <UpOutlined />}
        iconPosition="end"
        onClick={handleToggle}
        style={{ marginBottom: 5 }}
      >
        深度思考
      </Button>
      <div style={{ display: collapsed ? 'none' : 'block' }}>
        {output}
      </div>
    </div>
  );
};

export default memo(Think);