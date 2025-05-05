<template>
	<div class="system-role-container">
		<div class="carousel">
			<div class="section-title"><i></i><span>垃圾分类社区</span></div>
		</div>
		<div class="system-role-padding">
			<div class="system-user-search">
				<el-input v-model="state.tableData.param.search" size="default" placeholder="搜索帖子内容"
					style="width: 100%;" />
				<el-button size="default" type="primary" style="width: 200px;margin-left: 10px;"
					@click="getTableData()">
					<el-icon><ele-Search /></el-icon>
					搜索
				</el-button>
				<el-button size="default" type="success" style="width: 200px;" @click="addInvitation()">
					<el-icon><ele-FolderAdd /></el-icon>
					发新帖
				</el-button>
			</div>
			<!-- 帖子列表 -->
			<div class="post-list">
				<el-card v-for="post in state.tableData.data" :key="post.id" class="post-item mb15">
					<template #header>
						<div class="post-header">
							<el-avatar :src="post.avatar" size="small" class="mr10" />
							<span class="post-username">{{ post.username }}</span>
							<span class="post-time">{{ post.time }}</span>
						</div>
					</template>

					<h3 class="post-title">{{ post.title }}</h3>
					<div class="post-content">{{ post.content }}</div>

					<div class="post-actions mt15">
						<el-button v-if="post.isDelete" type="danger" size="small" @click="onRowDel(post)">
							<el-icon><ele-Delete /></el-icon>
							删除
						</el-button>
						<el-button v-if="!post.isLike" size="small" @click="handleLike(post.id, post.isLike)">
							👍 点赞 {{ post.starts || 0 }}
						</el-button>
						<el-button v-if="post.isLike" type="primary" size="small"
							@click="handleLike(post.startsId, post.isLike)">
							👍 已点赞 {{ post.starts || 0 }}
						</el-button>
						<el-input v-model="newComment[post.id]" size="small" placeholder="写评论..." class="ml10"
							style="width: 300px" @keyup.enter="addComment(post.id)" />
					</div>

					<div v-if="post.comments?.length" class="comments mt15">
						<div v-for="comment in post.comments" :key="comment.id" class="comment-item">
							<el-avatar :src="comment.avatar" size="small" class="mr10" />
							<div class="comment-content">
								<span class="comment-author">{{ comment.username }}：</span>
								<span class="comment-text">{{ comment.text }}</span>
								<span class="comment-time">{{ comment.createdAt }}</span>
							</div>
						</div>
					</div>
				</el-card>
			</div>

			<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
				:pager-count="5" :page-sizes="[5, 10, 20]" v-model:current-page="state.tableData.param.pageNum"
				background v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total" />
		</div>
		<Dialog ref="DialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { formatDate } from '/@/utils/formatTime';
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';

// 引入组件
const Dialog = defineAsyncComponent(() => import('./dialog.vue'));
// 新评论内容
const newComment = ref<any>({});
// 定义变量内容
const DialogRef = ref();
const state = reactive<any>({
	userInfos: {} as any,
	comments: [] as any,
	starts: [] as any,
	startdata: {} as any,
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 5,
		},
	},
});

const getTableData = () => {
	state.tableData.loading = true;
	request
		.get('/api/invitation', {
			params: state.tableData.param,
		})
		.then((res) => {
			if (res.code == 0) {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					state.tableData.data[i] = res.data.records[i];
					state.tableData.data[i]['num'] = i + 1;
					const countMap = countInvitationIds(state.starts);
					const id = state.tableData.data[i].id;
					state.tableData.data[i].comments = getMessagesByInvitationId(state.comments, id);
					//获取当前帖子赞数
					state.tableData.data[i].starts = countMap.get(id.toString());
					//判断是否可删除（自己发的自己可以删除，管理员可以删除全部）
					if (state.tableData.data[i].username === Cookies.get('userName') || Cookies.get('userName') === 'admin') {
						state.tableData.data[i].isDelete = true;
					} else {
						state.tableData.data[i].isDelete = false;
					}
					//判断当前用户是否点赞
					state.tableData.data[i].isLike = false;
					for (let j = 0; j < state.starts.length; j++) {
						if (state.starts[j].invitationId == id) {
							if (state.starts[j].username == Cookies.get('userName')) {
								state.tableData.data[i].isLike = true;
								state.tableData.data[i].startsId = state.starts[j].id;
								break;
							}
						}
					}
				}
				// console.log(state.tableData.data);
				state.tableData.total = res.data.total;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};
const countInvitationIds = (comments: any): Map<string, number> => {
	const countMap = new Map<any, any>();

	comments.forEach(comment => {
		const { invitationId } = comment;
		countMap.set(invitationId, (countMap.get(invitationId) || 0) + 1);
	});

	return countMap;
}
const getStarts = () => {
	request
		.get('/api/starts/all').then((res) => {
			if (res.code == 0) {
				state.starts = res.data;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

// 删除角色
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			request.delete('/api/invitation/' + row.id).then((res) => {
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
				getCommentData();
				getStarts();
				getTableData();
			}, 500);
		})
		.catch(() => { });
};

const addComment = async (id: any) => {
	if (newComment.value[id].trim() === '') {
		ElMessage({
			type: 'warning',
			message: '请填写评论内容！',
		});
		return;
	}

	try {
		// 发送请求到后端保存评论
		request.post('/api/comments', {
			invitationId: id, // 当前帖子的ID
			username: state.userInfos.username, // 当前用户ID
			avatar: state.userInfos.avatar, // 当前用户头像
			parentId: null,               // 顶级评论，parentId 为 null
			text: newComment.value[id],       // 评论内容
		}).then((res) => {
			if (res.code == 0) {
				ElMessage.success('回复成功！');
				newComment.value = '';
				setTimeout(() => {
					getCommentData();
					getStarts();
					getTableData();
				}, 500);
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
	} catch (error) {
		ElMessage({
			type: 'error',
			message: '请求失败，请稍后重试',
		});
	}

};
const addInvitation = () => {
	DialogRef.value.openDialog();
}
const handleLike = (id: any, isLike) => {
	if (isLike) {
		request.delete('/api/starts/' + id).then((res) => {
			if (res.code == 0) {
				ElMessage.success('取消点赞成功！');
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
			setTimeout(() => {
				getCommentData();
				getStarts();
				getTableData();
			}, 500);
		});
	} else {
		state.startdata.invitationId = id;
		state.startdata.time = formatDate(new Date(), "YYYY-mm-dd HH:MM:SS");
		state.startdata.username = Cookies.get('userName');
		request.post('/api/starts/', state.startdata).then((res) => {
			if (res.code == 0) {
				ElMessage.success('点赞成功！');
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
			setTimeout(() => {
				getCommentData();
				getStarts();
				getTableData();
			}, 500);
		});
	}
}

const groupMessagesByInvitationId = (messages: any): any => {
	return messages.reduce((acc, message) => {
		if (!acc[message.invitationId]) {
			acc[message.invitationId] = [];
		}
		acc[message.invitationId].push(message);
		return acc;
	}, {} as any);
}

const getMessagesByInvitationId = (
	groupedMessages: any,
	invitationId: any
): any[] => {
	return groupedMessages[invitationId] || [];
}

// 获取评论数据
const getCommentData = () => {
	request
		.get('/api/comments/all')
		.then((res) => {
			if (res.code == 0) {
				const formattedComments = res.data.reverse();
				state.comments = groupMessagesByInvitationId(formattedComments);
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
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
	if (!Session.get('token')) {
		ElMessage({
			type: 'warning',
			message: '请先登录！',
		});
		return;
	} else {
		request.get('/api/user/' + Cookies.get('userName')).then((res) => {
			if (res.code == 0) {
				state.userInfos = res.data
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
		getCommentData();
		getStarts();
		getTableData();
	}
});
</script>

<style scoped lang="scss">
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

.system-role-container {
	:deep(.system-role-padding) {
		// background: radial-gradient(circle, #d3e3f1 0%, #ffffff 100%);
		padding: 20px 20px 0 20px;
		border-radius: 8px;
	}

	.system-user-search {
		width: calc(100% - 400px);
		margin: auto;
		display: flex;

		.el-input {
			flex: 1 1 100%;
			max-width: 100%;
		}
	}

	.post-list {
		width: calc(100% - 400px);
		margin-left: 200px;
		margin-right: 200px;
		margin: 0 auto;
		margin-top: 20px;
		overflow-y: auto;
	}

	.post-item {
		// background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		margin-bottom: 20px;
		transition: transform 0.2s, box-shadow 0.2s;
		border: none;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		}

		:deep(.el-card__header) {
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			border-bottom: 1px solid #eee;
			padding: 12px 20px;
		}
	}

	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.el-avatar {
			transition: transform 0.2s;

			&:hover {
				transform: scale(1.1);
			}
		}
	}

	.post-username {
		font-weight: 600;
		color: #2c3e50;
		margin-right: auto;
	}

	.post-time {
		color: #95a5a6;
		font-size: 0.85em;
	}

	.post-title {
		color: #34495e;
		font-size: 1.25rem;
		margin: 12px 0;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.post-content {
		color: #4a5568;
		line-height: 1.7;
		font-size: 0.95rem;
		white-space: pre-line;
	}

	.post-image {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		border-radius: 8px;
		margin-top: 15px;
		cursor: zoom-in;
		transition: transform 0.3s;

		&:hover {
			transform: scale(1.02);
		}
	}

	.post-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
		border-top: 1px solid #eee;

		.el-input {
			flex: 1;
			transition: all 0.3s;

			&:focus-within {
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
			}
		}
	}

	.comments {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 12px;

		.comment-item {
			display: flex;
			align-items: flex-start;
			padding: 8px 0;
			border-bottom: 1px solid #eee;

			&:last-child {
				border-bottom: none;
			}
		}

		.comment-content {
			flex: 1;
			font-size: 0.9rem;

			.comment-author {
				font-weight: 500;
				color: #2c3e50;
			}

			.comment-text {
				color: #4a5568;
				line-height: 1.6;
			}

			.comment-time {
				color: #95a5a6;
				font-size: 0.8rem;
				margin-left: 8px;
			}
		}
	}

	.el-pagination {
		width: calc(100% - 400px);
		margin: auto;
		padding-bottom: 20px;
	}
}
</style>
