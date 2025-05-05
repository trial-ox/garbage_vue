<template>
	<div class="system-role-container layout-padding">
		<div class="system-role-padding layout-padding-auto layout-padding-view">
			<div class="system-user-search mb15">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入题目编号"
					style="max-width: 180px"> </el-input>
				<el-input v-model="state.tableData.param.search1" size="default" placeholder="请输入题目标题"
					style="max-width: 180px; margin-left: 10px"> </el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData()">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddRole('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					添加
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading"
				:row-class-name="handleRowClassName" style="width: 100%">
				<el-table-column type="expand">
					<template #default="props">
						<div m="4" v-if="props.row.family && props.row.family.length">
							<p style="margin-left: 20px; font-size: 16px; font-weight: 800;">详细内容：</p>
							<el-table :data="props.row.family">
								<el-table-column prop="text" label="题目" align="center" />
								<el-table-column prop="option1" label="选项一" show-overflow-tooltip align="center" />
								<el-table-column prop="option2" label="选项二" show-overflow-tooltip align="center" />
								<el-table-column prop="option3" label="选项三" show-overflow-tooltip align="center" />
								<el-table-column prop="option4" label="选项四" show-overflow-tooltip align="center" />
								<el-table-column prop="answer" label="答案" align="center" />
							</el-table>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="num" label="序号" width="80" align="center" />
				<el-table-column prop="questionId" label="题目类别" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="title" label="题目标题" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="text" label="题目" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="type" label="题型" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="answer" label="答案" align="center" />
				<el-table-column prop="code" label="分值" align="center" />
				<el-table-column prop="time" label="创建时间" align="center" />
				<el-table-column label="操作" width="150">
					<template #default="scope">
						<el-button size="small" text type="primary"
							@click="onOpenEditRole('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
				:pager-count="5" :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.param.pageNum"
				background v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
			</el-pagination>
		</div>
		<RoleDialog ref="roleDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ElConfigProvider } from 'element-plus';
import request from '/@/utils/request';
import { fa } from 'element-plus/es/locale';

// 引入组件
const RoleDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 定义变量内容
const roleDialogRef = ref();
const state = reactive<SysRoleState>({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			search1: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

const handleRowClassName = ({ row }) => {
	return row.family ? 'has-family' : 'no-family';
}

const getTableData = () => {
	state.tableData.loading = true;
	request
		.get('/api/questions', {
			params: state.tableData.param,
		})
		.then((res) => {
			if (res.code == 0) {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					var data = {} as any;
					data = res.data.records[i];
					data.num = i + 1;
					if (res.data.records[i]['type'] == 'select') {
						data.family = [];
						var family = {} as any;
						res.data.records[i]['options'] = JSON.parse(res.data.records[i]['options'])
						family.option1 = res.data.records[i]['options'][0];
						family.option2 = res.data.records[i]['options'][1];
						family.option3 = res.data.records[i]['options'][2];
						family.option4 = res.data.records[i]['options'][3];
						family.answer = res.data.records[i]['answer'];
						family.text = res.data.records[i]['text'];
						data.family.push(family);
					}
					state.tableData.data.push(data);
				}
				state.tableData.total = res.data.total;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

// 打开新增角色弹窗
const onOpenAddRole = (type: string) => {
	roleDialogRef.value.openDialog(type);
};
// 打开修改角色弹窗
const onOpenEditRole = (type: string, row: Object) => {
	roleDialogRef.value.openDialog(type, row);
};

// 删除角色
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			request.delete('/api/questions/' + row.id).then((res) => {
				if (res.code == 0) {
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
			setTimeout(() => {
				getTableData();
			}, 500);
		})
		.catch(() => { });
};
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

// 页面加载时
onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
::v-deep .no-family .el-table__expand-icon {
	display: none !important;
}

.system-role-container {
	.system-role-padding {
		padding: 15px;

		.el-table {
			flex: 1;
		}
	}
}
</style>
