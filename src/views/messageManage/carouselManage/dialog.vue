<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<el-form ref="roleDialogFormRef" :model="state.form" size="default" label-width="100px">
				<div class="imgs">
					<el-upload v-model="state.form.img" ref="uploadFile" class="avatar-uploader"
						action="http://localhost:9999/files/upload" :show-file-list="false"
						:on-success="handleAvatarSuccessone">
						<img v-if="state.form.img" :src="state.form.img" class="avatar" />
						<el-icon v-else>
							<Plus />
						</el-icon>
					</el-upload>
				</div>
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show">
						<el-form-item label="上传时间:">
							<el-input v-model="state.form.time" disabled clearable></el-input>
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

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const imageUrl = ref('');
const uploadFile = ref<UploadInstance>();

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	console.log(response);
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	state.form.img = response.data;
};

// 定义变量内容
const roleDialogFormRef = ref();
const state = reactive({
	form: {} as any,
	show: false,
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
const openDialog = (type: string, row: RowRoleType) => {
	if (type === 'edit') {
		state.form = row;
		state.show = true;
		state.dialog.title = '修改信息';
		state.dialog.submitTxt = '修 改';
		imageUrl.value = state.form.avatar;
	} else {
		state.dialog.title = '新增信息';
		state.dialog.submitTxt = '新 增';
		state.form = {};
		state.show = false;
	}
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
	if (state.dialog.title == '修改信息') {
		request.post('/api/carousel/update', state.form).then((res) => {
			if (res.code == 0) {
				ElMessage.success('修改成功！');
				setTimeout(() => {
					closeDialog();
					emit('refresh');
				}, 500);
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
	} else {
		request.post('/api/carousel/', state.form).then((res) => {
			if (res.code == 0) {
				ElMessage.success('添加成功！');
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
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.system-role-dialog-container {
	.el-dialog__body {
		padding: 20px;
	}
}

:deep(.dia) {
	width: 800px;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

	.el-dialog__header {
		// background-color: #409eff;
		color: #fff;
		font-weight: 600;
		padding: 15px 20px;
	}

	.el-dialog__footer {
		background-color: #f9f9f9;
		border-top: 1px solid #ebeef5;
		padding: 15px 20px;
	}
}

.el-form {
	width: 100%;

	.el-form-item {
		margin-bottom: 20px;
	}
}

.imgs {
	width: 400px;
	height: 400px;
	margin: 0 auto 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 2px dashed #d9d9d9;
	border-radius: 6px;
	cursor: pointer;
	transition: border-color 0.3s, box-shadow 0.3s;

	&:hover {
		border-color: #409eff;
		box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
	}
}

.avatar-uploader .el-upload {
	width: 100%;
	height: 100%;
}

.avatar {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 6px;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}
</style>