<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<el-form ref="roleDialogFormRef" :model="state.form" size="default" label-width="100px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="题目编号:" style="color: #000">
							<el-input v-model="state.form.questionId" placeholder="请输入题目编号" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="题目标题:" style="color: #000">
							<el-input v-model="state.form.title" placeholder="请输入题目标题" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="题目:" style="color: #000">
							<el-input v-model="state.form.text" placeholder="请输入题目" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="分值:" style="color: #000">
							<el-input v-model="state.form.code" placeholder="请输入分值" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.selectShow">
						<el-form-item label="题目类型：">
							<el-select v-model="state.form.type" value-key="id" placeholder="请选择题目类型"
								style="width: 100%" @change="fun">
								<el-option v-for="item in option" :key="item.id" :label="item.label"
									:value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 1">
						<el-form-item label="选项一:" style="color: #000">
							<el-input v-model="state.form.option1" placeholder="请输入选项一" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 1">
						<el-form-item label="选项二:" style="color: #000">
							<el-input v-model="state.form.option2" placeholder="请输入选项二" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 1">
						<el-form-item label="选项三:" style="color: #000">
							<el-input v-model="state.form.option3" placeholder="请输入选项三" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 1">
						<el-form-item label="选项四:" style="color: #000">
							<el-input v-model="state.form.option4" placeholder="请输入选项四" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 1">
						<el-form-item label="答案:" style="color: #000">
							<el-input v-model="state.form.answer" placeholder="请输入选答案" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20" v-if="state.show == 2">
						<el-form-item label="答案：">
							<el-select v-model="state.form.answer" value-key="id" placeholder="请选择题目答案"
								style="width: 100%">
								<el-option v-for="item in answer" :key="item.id" :label="item.label"
									:value="item.value" />
							</el-select>
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

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const roleDialogFormRef = ref();
const state = reactive({
	show: 0,
	selectShow: true,
	form: {} as any,
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});
const option = [
	{ id: 1, label: '选择题', value: 'select' },
	{ id: 2, label: '判断题', value: 'judge' },
];
const answer = [
	{ id: 1, label: '正确', value: 'true' },
	{ id: 2, label: '错误', value: 'false' },
];
// 打开弹窗
const openDialog = (type: string, row: RowRoleType) => {
	if (type === 'edit') {
		state.selectShow = false;
		state.form = row;
		if (state.form.type == 'select') {
			state.show = 1;
			state.form.option1 = state.form.options[0];
			state.form.option2 = state.form.options[1];
			state.form.option3 = state.form.options[2];
			state.form.option4 = state.form.options[3];
		} else {
			state.show = 2
		}
		state.dialog.title = '修改信息';
		state.dialog.submitTxt = '修 改';
	} else {
		state.selectShow = true;
		state.show = 0,
		state.form = {};
		state.dialog.title = '新增信息';
		state.dialog.submitTxt = '新 增';
	}
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
const fun = () => {
	if (state.form.type == 'select') {
		state.show = 1
	} else {
		state.show = 2
	}
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	if (state.dialog.title == '修改信息') {
		if (state.form.type == 'select') {
			state.form.options = JSON.stringify([state.form.option1, state.form.option2, state.form.option3, state.form.option4]);
		}
		request.post('/api/questions/update', state.form).then((res) => {
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
		if (state.form.type == 'select') {
			state.form.options = JSON.stringify([state.form.option1, state.form.option2, state.form.option3, state.form.option4]);
		}
		request.post('/api/questions/', state.form).then((res) => {
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
