<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<el-form ref="roleDialogFormRef" :model="state.form" size="default" label-width="100px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="发帖标题：">
							<el-input v-model="state.form.title" placeholder="请输入发帖标题" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="发帖内容：" style="color: #000">
							<el-input v-model="state.form.content" placeholder="请输入发帖内容" clearable></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { nextTick, computed, reactive, ref } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import request from '/@/utils/request';
import { formatDate } from '/@/utils/formatTime';
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const roleDialogFormRef = ref();
const state = reactive({
	form: {} as any,
	menuData: [] as TreeType[],
	menuProps: {
		children: 'children',
		label: 'label',
	},
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = () => {
	state.dialog.title = '发新帖';
	state.dialog.submitTxt = '新 增';
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	state.form.time = formatDate(new Date(), "YYYY-mm-dd HH:MM:SS");
	state.form.username = Cookies.get('userName');
	request.get('/api/user/' + state.form.username).then((res) => {
		if (res.code == 0) {
			state.form.avatar = res.data.avatar
			request.post('/api/invitation/', state.form).then((res) => {
				if (res.code == 0) {
					ElMessage.success('发帖成功！');
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
		setTimeout(() => {
			closeDialog();
			emit('refresh');
		}, 500);
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
:deep(.dia) {
	width: 800px;
	height: 650px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.el-form {
	width: 80%;
	margin-left: 10%;
}

.imgs {
	font-size: 28px;
	color: hsl(215, 8%, 58%);
	width: 120px;
	height: 120px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	cursor: pointer;
	margin-left: 320px;
	margin-bottom: 20px;
}

.avatar-uploader .el-upload:hover {
	border-color: #409eff;
}

.avatar {
	width: 120px;
	height: 120px;
	display: block;
}
</style>
