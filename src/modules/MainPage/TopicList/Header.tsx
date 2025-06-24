import React, { memo, useContext, useState, useRef } from 'react';
import { EllipsisOutlined, FormOutlined, DeleteOutlined, DragOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Popover, Modal, Input, App } from 'antd';

import { HEADER_HEIGHT, SPLIT_LINE, DEFAULT_CATE } from '@common/constant';
import { userLog } from '@common/electron';
import { MainContext } from '@common/context';
import request from '@common/request';

import style from './index.module.less';

type HeaderProps = {
  onCreated: (t) => void;
}
const Header: React.FC<HeaderProps> = (props) => {
  const { message, modal } = App.useApp();
  const { onCreated } = props;
  const { currentCate, setCurrentCate, getCateList, getTopicList } = useContext(MainContext);

  const [showActionModal, setShowActionModal] = useState(false);

  const [showEditPanel, setShowEditPanel] = useState(false);
  const [tempCateName, setTempCateName] = useState('');

  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [tempCateOrder, setTempCateOrder] = useState(0);

  const inputRef = useRef(null);
  
  const createTopic = () => {
    request.post('/topic/add', {
      title: '这是一个新的代办事项/笔记/文章',
      desc: '',
      cateId: currentCate.id,
    }).then((res) => {
      userLog('Logic Create Topic: ', res.data);
      onCreated(res.data);
    }).catch((err) => {
      userLog('Logic Create Topic Failed: ', currentCate);
      message.error(`创建失败：${err.message}`);
    });
  };

  // 新增一条笔记
  const handleNewTopic = () => {
    userLog('Click Create Topic at: ', currentCate);
    // 如果是虚拟的笔记本需要先选择实体笔记本
    if (currentCate.isVirtual) {
      message.info('请先在左侧选择一个分类');
      return;
    }
    // 如果是实体的笔记本先创建一条记录，然后选择这个topic
    createTopic();
  };

  // 编辑笔记分类
  const handleEdit = () => {
    userLog('Click Edit Notebook Cate: ', currentCate);
    setShowActionModal(false);
    setShowEditPanel(true);
    setTempCateName(currentCate.name);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    }, 200);
  };

  const handleCateNameChange = (e) => {
    setTempCateName(e.target.value);
  };

  // 保存编辑信息
  const handleSaveEdit = () => {
    userLog('Submit Save Edit cate name, new cate name: ', tempCateName);
    if (!tempCateName || !tempCateName.length) {
      message.error('请输入笔记分类名称');
      return;
    }
    request
      .post(`/cate/update?id=${currentCate?.id}`, {
        ...currentCate,
        name: tempCateName,
      }).then(() => {
        setTempCateName('');
        setShowEditPanel(false);
        setCurrentCate({ ...currentCate, name: tempCateName });
        getCateList();
        message.success(`修改成功`);
      }).catch((err) => {
        userLog('Logic Save Edit cate name failed: ', err);
        message.error(`修改失败：${err.message}`);
      });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditPanel(false);
  };

  // 删除笔记分类
  const handleDelete = () => {
    userLog('Click Delete cate: ', currentCate);
    setShowActionModal(false);
    modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，该分类下的笔记全部清空',
      onOk() {
        // 删除
        request
        .get(`/cate/delete?id=${currentCate?.id}`)
        .then(() => {
          userLog('Logic Delete cate: ', currentCate);
          // 删除后，切换到默认笔记本
          setCurrentCate(DEFAULT_CATE);
          getCateList();
          message.success('删除成功');
        })
        .catch((err) => {
          userLog('Logic Delete cate failed: ', err);
          message.error(`删除失败：${err.message}`);
        });
      },
    });
  };

  // 调整分类排序
  const handleOrder = () => {
    setShowActionModal(false);
    setShowOrderPanel(true);
    setTempCateOrder(currentCate?.orders || 0);
  };

  // 修改分类排序
  const handleCateOrderChange = (e) => {
    setTempCateOrder(e.target.value);
  };

  // 保存分类排序
  const handleSaveOrder = () => {
    userLog('Submit Save Order cate, new cate order: ', tempCateOrder);
    if (!tempCateOrder) {
      message.error('请输入笔记分类排序');
      return;
    }
    request
      .post(`/cate/update?id=${currentCate?.id}`, {
        ...currentCate,
        orders: tempCateOrder,
      }).then(() => {
        setShowOrderPanel(false);
        setCurrentCate({ ...currentCate, orders: tempCateOrder });
        getCateList();
        message.success('排序成功');
      }).catch((err) => {
        userLog('Logic Save Order cate failed: ', err);
        message.error(`排序失败：${err.message}`);
      });
  };

  // 取消修改分类排序
  const handleCancelOrder = () => {
    setShowOrderPanel(false);
  };

  const handleMenuOpenChange = (open: boolean) => {
    setShowActionModal(open);
  };

  // 刷新笔记列表
  const handleRefresh = () => {
    getTopicList();
    getCateList();
  };

  // 操作笔记本菜单
  const actionMenu = () => {
    return (
      <div className={style.actionMenu}>
        <Button icon={<FormOutlined />} type="text" onClick={handleEdit}>编辑</Button>
        <Button icon={<DeleteOutlined />} type="text" onClick={handleDelete}>删除</Button>
        <Button icon={<DragOutlined />} type="text" onClick={handleOrder}>排序</Button>
        <Button icon={<ReloadOutlined />} type="text" onClick={handleRefresh}>刷新</Button>
      </div>
    );
  };

  return (
    <div className={style.header} style={{ height: HEADER_HEIGHT, borderBottom: SPLIT_LINE}}>
      <div className={style.title}>
        <span className={style.titleText}>{currentCate.name}</span>
        <Popover
          content={actionMenu}
          trigger="click"
          open={showActionModal}
          onOpenChange={handleMenuOpenChange}
          placement="bottom"
        >
          <Button icon={<EllipsisOutlined />} type="text"></Button>
        </Popover>
      </div>
      <div>
        <Button type="primary" size="small" onClick={handleNewTopic}>创建笔记</Button>
      </div>
      <Modal
        title="修改笔记分类"
        open={showEditPanel}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
      >
        <Input value={tempCateName} onChange={handleCateNameChange} maxLength={8} allowClear ref={inputRef} />
      </Modal>

      <Modal
        title="调整分类排序"
        open={showOrderPanel}
        onOk={handleSaveOrder}
        onCancel={handleCancelOrder}
      >
        <Input value={tempCateOrder} onChange={handleCateOrderChange} maxLength={2} allowClear />
      </Modal>
    </div>
  );

};

export default memo(Header);