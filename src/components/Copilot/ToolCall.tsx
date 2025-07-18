import React, { memo, useState } from 'react';

import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

type ComProps = {
  content: string;
};

const ToolCall: React.FC<ComProps> = (props) => {
  const { content } = props;
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
  };
  
  const output = content.replace(/<tool_call>([\s\S]*?)<\/tool_call>/g, '$1');
  const [toolName, toolContent] = output.split('__TOOLCALL__');

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
        {toolName}
      </Button>
      <div style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 5, display: collapsed ? 'none' : 'block' }}>
        <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{toolContent}</pre>
      </div>
    </div>
  );

};

export default memo(ToolCall);