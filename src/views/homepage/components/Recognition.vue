<template>
  <div class="over">
    <div class="carousel">
      <div class="section-title"><i></i><span>垃圾分类识别</span></div>
    </div>
    <div class="system-predict-padding ">
      <div class="header">
        <div class="model">
          <el-select v-model="model" placeholder="请选择模型" size="large" style="width: 240px" @change="filterWeights">
            <el-tooltip
              v-for="item in state.model_items"
              :key="item.value"
              class="box-item"
              effect="dark"
              :content="modelDescriptions[item.value] || '暂无描述'"
              placement="right"
              :hide-after="0"
            >
              <el-option :key="item.value" :label="item.label" :value="item.value" />
            </el-tooltip>
          </el-select>
        </div>
        <div class="weight" style="margin-left: 20px">
          <el-select v-model="weight" placeholder="请选择权重" size="large" style="width: 240px">
            <el-option v-for="item in state.weight_item" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="button-section" style="margin-left: 20px">
          <el-button type="primary" @click="upData" class="predict-button">开始预测</el-button>
        </div>
      </div>
      <el-card shadow="hover" class="card">
        <el-upload v-model="state.form.image_path" ref="uploadFile" class="avatar-uploader"
          action="http://localhost:9999/files/upload" :show-file-list="false" :on-success="handleAvatarSuccessone">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-card>
      <el-card class="result-section" v-if="state.predictionResult.result">
        <div class="bottom">
          <div style="width: 33%">识别结果：{{ state.predictionResult.result }}</div>
          <div style="width: 33%">预测概率：{{ state.predictionResult.confidence }}</div>
          <div style="width: 33%">总时间：{{ state.predictionResult.totalTime }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>


<script setup lang="ts" name="personal">
import { reactive, ref, onMounted } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { Plus } from '@element-plus/icons-vue';
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';

const imageUrl = ref('');
const model = ref('');
const weight = ref('');
const uploadFile = ref<UploadInstance>();
const state = reactive({
  userInfo: {} as any,
  model_items: [] as any,
  weight_items: [] as any,
  weight_item: [] as any,
  predictionResult: {
    result: '',
    confidence: '',
    totalTime: '',
  },
  form: {
    username: '',
    image_path: null as any,
    weights: '',
    model_name: '',
  },
});
const modelDescriptions = {
  "VGGNet":       "结构简洁规整，全用3x3小卷积核堆叠加深网络。证明了深度重要性，参数量大但迁移学习效果好。",
  "LeNet":        "早期CNN里程碑，成功用于手写数字识别。确立卷积、池化、全连接基本结构范式，影响深远。",
  "ShuffleNetV2": "高效移动端CNN，除FLOPs外更关注实测速度与内存访问。核心是改进的通道混洗与通道分割。",
  "AlexNet":      "2012年ImageNet突破性冠军模型。首次用ReLU、Dropout、GPU加速，引爆深度学习热潮。",
  "RegNet":       "通过探索网络设计空间规律，生成一系列简洁、规则且性能优异的高效网络架构，可扩展性强。",
  "DenseNet":     "核心是密集连接块，层层直连极致促进特征重用。参数高效但训练时特征图拼接导致内存消耗较大。",
  "MobileNetV2":  "谷歌轻量级移动端模型，引入倒置残差和线性瓶颈结构。结合深度可分离卷积，平衡效率与精度。",
  "GoogLeNet": "引入Inception模块并行多尺度卷积与池化。大量用1x1卷积降维，提升网络效率和性能。",
  "ResNet":       "提出残差块和快捷连接，革命性解决深度网络退化问题，使得训练数百上千层网络成为可能。",
  "MobileNetV3":  "结合前代优点，通过神经架构搜索(NAS)自动优化结构。引入SE模块和h-swish激活函数。",
  "EfficientNet": "通过复合缩放方法系统性地同时优化网络深度、宽度和分辨率。效率极高，性能优越，参数量少。",
};

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!);
  state.form.image_path = response.data;
};

const getData = () => {
  request.get('/api/flask/file_names').then((res) => {
    if (res.code == 0) {
      res.data = JSON.parse(res.data);
      state.model_items = res.data.model_items;
      state.weight_items = res.data.weight_items;
      state.weight_item = res.data.weight_items;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

const filterWeights = () => {
  if (model.value) {
    state.weight_item = state.weight_items.filter((item) => item.label.includes(model.value));
  }
};

const upData = () => {
  if (!Session.get('token')) {
    ElMessage({
      type: 'warning',
      message: '请先登录！',
    });
    return;
  } else if (!state.form.image_path) {
    ElMessage.error('请上传一张图片！');
    return;
  }
  state.form.weights = weight.value;
  state.form.model_name = model.value;
  state.form.username = state.userInfo.username;
  request.post('/api/flask/predict', state.form).then((res) => {
    if (res.code == 0) {
      try {
        res.data = JSON.parse(res.data);
        state.predictionResult.result = res.data.prediction;
        state.predictionResult.confidence = res.data.confidence;
        state.predictionResult.totalTime = res.data.total_time;
      } catch (error) {
        console.error('解析 JSON 时出错:', error);
      }
      ElMessage.success('预测成功！');
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  const userName = Cookies.get('userName');
  if (userName) {
    request.get('/api/user/' + userName).then((res) => {
      if (res.code == 0) {
        state.userInfo = res.data;
      } else {
        ElMessage({
          type: 'error',
          message: res.msg,
        });
      }
    });
  }
  getData();
});
</script>

<style scoped lang="scss">
.over {
  width: 100%;
  height: calc(100vh - 100px); // 占满整个屏幕高度
  display: flex;
  flex-direction: column;

  .carousel {
    height: 80px;
    padding: 0 200px;
    width: 100%;

    .section-title {
      margin-bottom: 40px;
      font-size: 20px;
      text-align: center;
      position: relative;
      padding: 20px 0;
      display: flex;
      justify-content: center;
      justify-items: center;

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

  .system-predict-padding {
    margin: 0 200px;
    height: calc(100% - 160px);

    .header {
      width: 100%;
      height: 40px;
      display: flex;
      justify-content: start;
      align-items: center;
      font-size: 20px;
    }

    .card {
      height: calc(100% - 50px);
      flex-shrink: 0; // 禁止收缩
      flex: 1; // 占据剩余空间
      border-radius: 10px;
      margin-top: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden; // 禁止内容溢出

      .avatar-uploader .avatar {
        // width: 100%;
        padding: 20px;
        height: 600px;
        display: block;
        object-fit: contain; // 图片自适应
        overflow: hidden; // 禁止内容溢出
        flex-shrink: 0; // 禁止收缩
      }

      .el-icon.avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100%;
        // height: calc(100% - 40px);
        text-align: center;
      }
    }

    .result-section {
      width: 100%;
      margin-top: 10px;
      text-align: center;
      display: flex;
      /* 添加 display: flex; */
      flex-direction: column;
      border-radius: 6px;

      .bottom {
        width: 100%;
        height: 50px;
        font-size: 18px;
        display: flex;
        /* 添加 display: flex; */
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .footer {
    height: 80px;
    margin-top: 20px;
    background-color: #404040;
    color: #fff;

    .footer-content {
      width: 100%;
      height: 80px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center; // 垂直居中
    }

    p {
      display: flex;
      align-items: center; // 垂直居中
      justify-content: center; // 水平居中
      width: 100%;
      height: 100%; // 继承父容器高度
      margin: 0; // 去除默认 margin
    }
  }
}


.button-section {
  display: flex;
  justify-content: center;
}

.predict-button {
  width: 100%;
  /* 按钮宽度填满 */
}
</style>
