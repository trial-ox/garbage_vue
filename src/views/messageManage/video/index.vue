<template>
  <div class="system-role-container layout-padding">
    <div class="system-role-padding layout-padding-auto layout-padding-view">
      <div class="editor-wrapper">
        <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig"  class="toolbar" />
        <Editor v-model="valueHtml" class="editor" :defaultConfig="editorConfig" @onCreated="handleCreated" />

        <!-- 新增按钮区域 -->
        <div class="editor-footer">
          <button class="save-btn" @click="handleSave">保存内容</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="systemRole">
import { onBeforeUnmount, shallowRef, onMounted, ref, reactive } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import request from '/@/utils/request';
import DOMPurify from 'dompurify';
import { IEditorConfig } from '@wangeditor/editor'
import {formatDate} from '/@/utils/formatTime.ts'
import axios from 'axios';

const editorRef = shallowRef();
const valueHtml = ref();
const toolbarConfig = {};

// 配置 editorConfig
const editorConfig = {
    MENU_CONF: {
        uploadImage: {
            customUpload, // 复用通用的上传函数
        },
        uploadVideo: {
            customUpload, // 复用通用的上传函数
        },
    },
};

// 通用的上传函数
async function customUpload(file: File, insertFn: any) {
    console.log('上传文件:', file);

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('file', file); // 'file' 是后端接口中 MultipartFile 的参数名

    try {
        const response = await axios.post('http://localhost:9999/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.code === '0') {
            // 上传成功
            insertFn(response.data.data); // 假设 insertFn 是处理成功上传的回调
        } else {
            // 上传失败，显示错误消息
            ElMessage({
                type: 'error',
                message: response.data.msg || '上传失败',
            });
        }
    } catch (error) {
        console.error('上传失败:', error);
        ElMessage({
            type: 'error',
            message: '上传失败，请检查网络或文件格式',
        });
    }
}
const state = reactive({
  form: {} as any,
});
const handleCreated = (editor) => {
  editorRef.value = editor;
};

onBeforeUnmount(() => {
  editorRef.value?.destroy();
});

onMounted(() => {
  
  setTimeout(() => {
    request.get('/api/message/all').then((res) => {
      if (res.code == 0) {
        state.form = res.data[0];
        valueHtml.value = DOMPurify.sanitize(res.data[0].video); // 进行安全处理
      } else {
        ElMessage({
          type: 'error',
          message: res.msg,
        });
      }
    });
  }, 0);
});

// 保存按钮点击事件
const handleSave = () => {
  state.form.video = valueHtml.value;
  state.form.time = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
  request.post('/api/message/update', state.form).then((res) => {
    if (res.code == 0) {
      ElMessage.success('编辑成功！');
      setTimeout(() => {
      }, 500);
    } else {
      ElMessage({
        type: 'error',
        message: res.msg,
      });
    }
  });
};
</script>

<style scoped lang="scss">
.system-role-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .system-role-padding {
    height: 100%;
    flex: 1;
    padding: 15px;
    overflow: hidden;
    box-sizing: border-box;

    .editor-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .toolbar {
        border: 1px solid #ccc;
        flex-shrink: 0;
      }

      .editor {
        flex: 1;
        overflow-y: auto;
        border: 1px solid #ccc;
        border-top: none;

        .w-e-text-container {
          height: calc(100% - 35px) !important;
        }
      }

      /* 新增按钮区域 */
      .editor-footer {
        display: flex;
        justify-content: flex-end;
        /* 右对齐 */
        padding: 10px 0;

        .save-btn {
          background-color: #409eff;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;

          &:hover {
            background-color: #3078d3;
          }
        }
      }
    }
  }
}
</style>
