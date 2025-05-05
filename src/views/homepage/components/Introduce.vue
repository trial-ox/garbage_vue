<template>
  <div class="over">
    <div class="carousel">
      <el-carousel indicator-position="outside" height="800px">
        <el-carousel-item v-for="(item, index) in state.data" :key="index">
          <el-image :src="item.img" style="width: 100%;" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="main">
      <div class="container">
        <div class="section-title"><i></i><span>垃圾分类科普</span></div>
        <div class="TranSportation">
          <div class="text">
            <h4>Introduction</h4>
            <div class="p" v-html="IntroductionHtmlContent"></div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="section-title"><i></i><span>科普视频</span></div>
        <div class="TranSportation">
          <div class="text">
            <h4>Video</h4>
            <div class="p" v-html="VideoHtmlContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, ref, defineAsyncComponent } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import DOMPurify from 'dompurify';
import request from '/@/utils/request';
const IntroductionHtmlContent = ref('');
const VideoHtmlContent = ref('');
const state = reactive({
  data: [] as any
});
const getData = () => {
  request.get('/api/carousel/all').then((res) => {
    if (res.code == 0) {
      state.data = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};
// 页面加载时
onMounted(() => {
  getData();
  request.get('/api/message/all').then((res) => {
    if (res.code == 0) {
      IntroductionHtmlContent.value = DOMPurify.sanitize(res.data[0].introduction); // 进行安全处理
      VideoHtmlContent.value = DOMPurify.sanitize(res.data[0].video); // 进行安全处理
    } else {
      ElMessage({
        type: 'error',
        message: res.msg,
      });
    }
  });
});
</script>
<style scoped lang="scss">
.over {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto !important;
  /* 允许垂直滚动 */
  background: linear-gradient(to bottom, #f0f8ff, #ffffff);
}

.carousel {
  width: 100%;
  height: 800px;
}

.el-carousel__item h3 {
  display: flex;
  color: #475669;
  opacity: 0.75;
  /* line-height: 500px; */
  margin: 0;
  height: 100%;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}

.main {
  margin-top: 20px;
}


.container {
  padding: 0 200px;
  margin: 0 auto;
}

.section-title {
  margin-bottom: 50px;
  font-size: 20px;
  text-align: center;
  position: relative;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  justify-items: center;
}

.section-title i {
  background: #3498db;
  height: 1px;
  width: 100%;
  position: absolute;
  top: 40px;
}

.section-title span {
  background: #3498db;
  line-height: 40px;
  position: absolute;
  width: 150px;
  left: 50%;
  margin-left: -60px;
  color: #fff;
}

.about {
  background-color: #fff;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.TranSportation {
  background-color: #fff;

  .text {
    /* margin-right: 300px; */
    padding: 20px 60px 20px 0;
  }

  .text h4 {
    margin: 0;
    padding-left: 75px;
    border-bottom: 1px solid #3498db;
    color: #3498db;
    font-size: 24px;
    line-height: 2;
    display: inline-block;
  }

  .text p {
    margin: 0;
    padding: 24px 0 24px 75px;
    color: #999;
    min-height: 100px;
    line-height: 1.8;
  }

  .p {
    margin: 0;
    padding: 24px 0 24px 75px;
    // color: #999;
    min-height: 100px;
    line-height: 1.8;
  }
}

.about .text {
  /* margin-right: 300px; */
  padding: 20px 60px 20px 0;
}

.about .text h4 {
  margin: 0;
  padding-left: 75px;
  border-bottom: 1px solid #3498db;
  color: #3498db;
  font-size: 24px;
  line-height: 2;
  display: inline-block;
}

.about .text .p {
  margin: 0;
  padding: 24px 0 24px 75px;
  color: #999;
  min-height: 100px;
  line-height: 1.8;
}


.about .text .big-more {
  margin: 0 0 0 75px;
}

.about .text .big-more {
  margin: 0 0 0 75px;
}

.about .img-center img {
  width: 400px;
  height: auto;
  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
}

.big-more {
  display: block;
  margin: 30px auto 0;
  width: 168px;
  border: 1px solid #e9e9e9;
  line-height: 43px;
  color: #999;
  text-align: center;
}

a {
  color: #333;
  text-decoration: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}

</style>
