<template>
  <div class="container">
    <div class="carousel">
      <div class="section-title"><i></i><span>垃圾分类答题</span></div>
    </div>
    <!-- 选择题部分 -->
    <div class="question-container">
      <h2>选择题</h2>
      <div v-for="(question, index) in state.selectQuestions" :key="question.id || index" class="question-block">
        <h3>题目 {{ index + 1 }} / {{ state.selectQuestions.length }}</h3>
        <p class="question-text">{{ question.text }}</p>
        <img v-if="question.image" :src="question.image" alt="题目图片" class="question-image" />
        <div class="options">
          <button
            v-for="(option, oIndex) in question.options"
            :key="oIndex"
            @click="checkSelectAnswer(option, index)"
            :class="{
              'selected': !isSubmitted && question.userAnswer === option,
              'correct': isSubmitted && question.userAnswer === option && option === question.answer,
              'wrong': isSubmitted && question.userAnswer === option && option !== question.answer
            }"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- 判断题部分 -->
    <div class="question-container">
      <h2>判断题</h2>
      <div v-for="(question, index) in state.judgeQuestions" :key="question.id || index" class="question-block">
        <h3>题目 {{ index + 1 }} / {{ state.judgeQuestions.length }}</h3>
        <p class="question-text">{{ question.text }}</p>
        <img v-if="question.image" :src="question.image" alt="题目图片" class="question-image" />
        <div class="options">
          <button
            @click="checkJudgeAnswer(true, index)"
            :class="{
              'selected': !isSubmitted && question.userAnswer === true,
              'correct': isSubmitted && question.userAnswer === true && question.answer === true,
              'wrong': isSubmitted && question.userAnswer === true && question.answer === false
            }"
          >
            正确
          </button>
          <button
            @click="checkJudgeAnswer(false, index)"
            :class="{
              'selected': !isSubmitted && question.userAnswer === false,
              'correct': isSubmitted && question.userAnswer === false && question.answer === false,
              'wrong': isSubmitted && question.userAnswer === false && question.answer === true
            }"
          >
            错误
          </button>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-button">
      <button @click="handleSubmit">提交答案</button>
    </div>

    <!-- 得分展示 -->
    <div class="score-board" v-if="isSubmitted">
      <p>选择题得分：{{ finalSelectScore }} / {{ state.selectScore }}</p>
      <p>判断题得分：{{ finalJudgeScore }} / {{ state.judgeScore }}</p>
      <p>总得分：{{ finalSelectScore + finalJudgeScore }} / {{ state.allScore }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '/@/utils/request'
import { Session } from '/@/utils/storage'
import Cookies from 'js-cookie'

const route = useRoute()
const state = reactive<any>({
  id: '',
  title:'',
  selectQuestions: [],
  judgeQuestions: [],
  selectScore: 0,
  judgeScore: 0,
  allScore: 0,
})

const questionId = computed(() => {
  return (route.query.questionId as string) || ''
})

const isSubmitted = ref(false)
const finalSelectScore = ref(0)
const finalJudgeScore = ref(0)

const handleSubmit = () => {
  isSubmitted.value = true
  for (let i = 0; i < state.selectQuestions.length; i++) {
    if (state.selectQuestions[i].userAnswer === state.selectQuestions[i].answer) {
      finalSelectScore.value += state.selectQuestions[i].code
    }
  }
  for (let i = 0; i < state.judgeQuestions.length; i++) {
    if (state.judgeQuestions[i].userAnswer === state.judgeQuestions[i].answer) {
      finalJudgeScore.value += state.judgeQuestions[i].code
    }
  }
  save();
}

const checkSelectAnswer = (answer: string, index: number) => {
  if (!isSubmitted.value) {
    state.selectQuestions[index].userAnswer = answer
  }
}

const checkJudgeAnswer = (answer: boolean, index: number) => {
  if (!isSubmitted.value) {
    state.judgeQuestions[index].userAnswer = answer
  }
}

const save=()=>{
  var form = {} as any;
  form.username = Cookies.get('userName')
  form.questionId = state.id
  form.title = state.title
  form.score = finalSelectScore.value + finalJudgeScore.value
  request.post('/api/questionsRecord/', form).then((res) => {
		if (res.code == 0) {
			ElMessage.success('作答完成，已保存！');
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
	});
}

const transformQuestions = (data: any[]): any => {
  const result: any = {
    select: [],
    judge: []
  }

  let selectCounter = 1
  let judgeCounter = 1

  data.forEach(item => {
    if (item.type === 'select') {
      let options: string[] = []
      if (item.options) {
        try {
          options = JSON.parse(item.options)
        } catch (e) {
          console.error('解析 options 失败：', e)
        }
      }
      result.select.push({
        num: selectCounter++,
        text: item.text,
        type: 'select',
        answer: item.answer,
        options: options,
        code: Number(item.code)
      })
    } else if (item.type === 'judge') {
      result.judge.push({
        num: judgeCounter++,
        text: item.text,
        type: 'judge',
        answer: item.answer.toLowerCase() === 'true',
        code: Number(item.code)
      })
    }
  })

  return result
}

const getData = async () => {
  const res = await request.get('/api/questions/' + state.id)
  if (res.code == 0) {
    state.title = res.data[0].title
    const transformed = transformQuestions(res.data)
    state.judgeQuestions = transformed.judge
    state.selectQuestions = transformed.select
    for(var i = 0; i < state.selectQuestions.length; i++) {
      state.selectScore += state.selectQuestions[i].code;
    }
    for(var i = 0; i < state.judgeQuestions.length; i++) {
      state.judgeScore += state.judgeQuestions[i].code;
    }
    state.allScore = state.judgeScore + state.selectScore
  } else {
    ElMessage({
      type: 'error',
      message: res.msg,
    })
  }
}

onMounted(() => {
  state.id = questionId.value
  getData()
})
</script>

<style scoped lang="scss">
.submit-button {
  text-align: center;
  margin: 20px 0;
  button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    &:hover {
      background-color: #2980b9;
    }
  }
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  .carousel {
    height: 80px;
    width: 100%;
    .section-title {
      margin-bottom: 40px;
      font-size: 20px;
      text-align: center;
      position: relative;
      padding: 20px 0;
      display: flex;
      justify-content: center;
      i {
        background: #3498db;
        height: 1px;
        width: 100%;
        position: absolute;
        top: 40px;
      }
      span {
        background: #3498db;
        line-height: 40px;
        position: absolute;
        width: 150px;
        left: 50%;
        margin-left: -60px;
        color: #fff;
      }
    }
  }
}

.question-container {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.question-text {
  font-size: 18px;
  margin-bottom: 15px;
}

.question-image {
  max-width: 300px;
  margin-bottom: 15px;
}

.options button {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #f0f0f0;
  }
}

.options button.selected {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.options button.correct {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.options button.wrong {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.score-board {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}
</style>
