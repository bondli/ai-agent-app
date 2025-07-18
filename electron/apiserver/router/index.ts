import express from 'express';
import { createTopic, getTopicInfo, getTopics, searchTopics, updateTopic, moveTopic, getTopicCounts, deletedFromTrash } from './topic-controller';
import { createCate, getCateInfo, getCates, updateCate, deleteCate } from './cate-controller';
import { createUser, userLogin, updateUser } from './user-controller';

import { agentChat } from './agent-controller';

const router = express.Router();

router.post('/topic/add', createTopic);
router.get('/topic/detail', getTopicInfo);
router.get('/topic/getList', getTopics);
router.post('/topic/searchList', searchTopics);
router.post('/topic/update', updateTopic);
router.post('/topic/move', moveTopic);
router.get('/topic/counts', getTopicCounts);
router.get('/topic/delete', deletedFromTrash);

router.post('/cate/create', createCate);
router.get('/cate/detail', getCateInfo);
router.get('/cate/list', getCates);
router.post('/cate/update', updateCate);
router.get('/cate/delete', deleteCate);

router.post('/user/register', createUser);
router.post('/user/login', userLogin);
router.post('/user/update', updateUser);

// 智能体接口
router.post('/ai/agentChat', agentChat);

export default router;