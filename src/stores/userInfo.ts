import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { Session } from '/@/utils/storage';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			role: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// 存储用户信息到浏览器缓存
			if (Session.get('userInfo')) {
				this.userInfos = Session.get('userInfo');
				// console.log(this.userInfos);
			} else {
				const userInfos: any = await this.getApiUserInfo();
				this.userInfos = userInfos;
				// console.log(this.userInfos);
			}
		},
		// 模拟接口数据
		// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
		async getApiUserInfo() {
			return new Promise((resolve) => {
				setTimeout(() => {
					// 模拟数据，请求接口时，记得删除多余代码及对应依赖的引入
					const role = Cookies.get('role');
					// 模拟数据
					let defaultRoles: Array<string> = [];
					let defaultAuthBtnList: Array<string> = [];
					// admin 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let adminRoles: Array<string> = ['admin'];
					// admin 按钮权限标识
					let adminAuthBtnList: Array<string> = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
					let commonRoles: Array<string> = ['user'];
					// common 按钮权限标识
					let commonAuthBtnList: Array<string> = ['btn.add', 'btn.link'];
					// 不同用户模拟不同的用户权限
					if (role === 'admin') {
						defaultRoles = adminRoles;
						defaultAuthBtnList = adminAuthBtnList;
					} else if (role === 'user') {
						defaultRoles = commonRoles;
						defaultAuthBtnList = commonAuthBtnList;
					}

					// 用户信息模拟数据
					const userInfos = {
						userName: Cookies.get('userName'),
						role: role,
						photo:
							role === 'admin'
								? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
								: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
						time: new Date().getTime(),
						roles: defaultRoles,
						authBtnList: defaultAuthBtnList,
					};
					resolve(userInfos);
				}, 0);
			});
		},
	},
});
