<template>
  <div class="question-container">
    <h1>题目列表</h1>
    <div class="question-list">
      <div class="question-header">
        <div class="header-item">题目编号</div>
        <div class="header-item">题目标题</div>
        <div class="header-item">作答状态</div>
        <div class="header-item">作答次数</div>
        <div class="header-item">最高得分</div>
        <div class="header-item">操作</div>
      </div>

      <div v-for="question in state.questions" :key="question.questionId" class="question-item">
        <div class="question-cell">{{ question.questionId }}</div>
        <div class="question-cell">{{ question.title }}</div>
        <div class="question-cell">
          <span :class="['status', question.answered ? 'answered' : 'unanswered']">
            {{ question.answered ? '✓' : '✗' }}
          </span>
        </div>
        <div class="question-cell">{{ question.attempts }}</div>
        <div class="question-cell">{{ question.highestScore }}分</div>
        <div class="question-cell">
          <span 
            style="color: #3498db; cursor: pointer;" 
            @click="openQuestion(question.questionId)"
          >
            {{ question.answered ? '继续作答' : '去作答' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';

const state = reactive<any>({
  questions: [] as any,
});

const getData = async () => {
  var data = {} as any;
  const records = await request.get('/api/questionsRecord/all');
  if (records.code == 0) {
    data = records.data;
  } else {
    ElMessage({
      type: 'error',
      message: records.msg,
    });
  }
  const res = await request.get('/api/questions/all');
  if (res.code == 0) {
    // 调用去重函数
    const deduplicatedData = deduplicateByQuestionId(res.data);
    const adminStats = getUserStats(data, Cookies.get('userName'));
    for (let i = 0; i < deduplicatedData.length; i++) {
      var data = {} as any;
      data.title = deduplicatedData[i].title;
      data.questionId = deduplicatedData[i].questionId;
      var id = deduplicatedData[i].questionId;
      if(adminStats[id]){
        data.answered = adminStats[id].answered;
        data.attempts = adminStats[id].attempts;
        data.highestScore = adminStats[id].highestScore;
      }else{
        data.answered = false;
        data.attempts = 0;
        data.highestScore = 0;
      }
      state.questions.push(data);
    }
  } else {
    ElMessage({
      type: 'error',
      message: res.msg,
    });
  }
}

// 去重函数
const deduplicateByQuestionId = (data: any) => {
  const uniqueMap = new Map<string, any>(); // 用于存储唯一的 questionId 和对应的记录

  for (const item of data) {
    if (!uniqueMap.has(item.questionId)) {
      uniqueMap.set(item.questionId, item); // 如果 questionId 不存在，则添加到 Map 中
    }
  }

  return Array.from(uniqueMap.values()); // 将 Map 中的值转换为数组
}

const getUserStats = (records: any[], username: string): any => {
  // 过滤出指定用户的记录
  const userRecords = records.filter(record => record.username === username);

  // 使用 reduce 进行统计
  return userRecords.reduce<any>((acc, current) => {
    const questionId = current.questionId;
    const score = Number(current.score);

    // 处理无效分数（按需添加）
    if (isNaN(score)) return acc;

    if (acc[questionId]) {
      // 更新已有题目统计
      acc[questionId].attempts += 1;
      acc[questionId].highestScore = Math.max(acc[questionId].highestScore, score);
    } else {
      // 初始化新题目统计
      acc[questionId] = {
        answered: true,
        attempts: 1,
        highestScore: score
      };
    }
    return acc;
  }, {});
}

// 点击跳转函数
const openQuestion = (questionId: string) => {
  const url = 'http://localhost:8888/#/theme';
  window.open(url + '?questionId=' + questionId);
}

// 页面加载时
onMounted(() => {
  if (!Session.get('token')) {
    ElMessage({
      type: 'warning',
      message: '请先登录！',
    });
    return;
  } else {
    getData();
  }
});
</script>

<style scoped>
.question-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #333;
}

.question-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.question-header {
  display: flex;
  background-color: #f5f5f5;
  padding: 12px;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
}

.question-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.question-item:nth-child(even) {
  background-color: #f9f9f9;
}

.question-item:last-child {
  border-bottom: none;
}

.header-item,
.question-cell {
  flex: 1;
  padding: 8px;
  text-align: center;
}

.status {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  line-height: 24px;
}

.answered {
  background-color: #4CAF50;
  color: white;
}

.unanswered {
  background-color: #f44336;
  color: white;
}
</style>
