import React, { memo, useState } from 'react';

import { Input, Button, App } from 'antd';

type ComProps = {
  content: string;
  onSubmit: (input: string) => void;
};

const AskHuman: React.FC<ComProps> = (props) => {
  const { message } = App.useApp();
  const { content } = props;
  const [input, setInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (input: string) => {
    if (!input.trim()) {
      message.error('请输入内容');
      return;
    }
    props.onSubmit(input);
    setIsSubmitted(true);
  }

  const output = content.replace(/<ask_human_input>([\s\S]*?)<\/ask_human_input>/g, '$1');

  return (
    <div style={{ fontSize: 12, marginBottom: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 5 }}>
      <div style={{ marginBottom: 5 }}>
        {output}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => handleSubmit(input)}
          disabled={isSubmitted}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <Button type='primary' size='small' onClick={() => handleSubmit(input)} disabled={isSubmitted}>提交</Button>
          <Button type='default' size='small' onClick={() => handleSubmit('取消')} disabled={isSubmitted}>取消</Button>
        </div>
      </div>
    </div>
  );
};

export default memo(AskHuman);