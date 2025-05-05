<template>
  <div class="homepage">
    <header class="header">
      <div class="logo">
        <h1>垃圾分类识别科普系统</h1>
        <span class="slogan">Garbage classification recognition science popularization system</span>
      </div>
      <nav class="nav">
        <a v-for="(item, index) in navItems" :key="index" :class="{ active: activeTab === index }"
          @click.prevent="switchTab(index)">
          {{ item }}
        </a>
      </nav>
      <div class="auth" v-if="!state.token">
        <router-link class="auth-link" to="/login">登录</router-link>
        <span class="auth-divider">|</span>
        <router-link class="auth-link" to="/register">注册</router-link>
      </div>
      <div class="auth" v-if="state.token">
        <el-dropdown @command="onHandleCommandClick" class="custom-dropdown">
          <span class="user-info">
            <img :src="state.userInfo.avatar" width="40" height="40" alt="avatar" class="avatar" />
            <span class="username">{{ state.userInfo.username }}</span>
            <el-icon class="el-icon--right">
              <ele-ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="/personal">{{ $t('个人中心') }}</el-dropdown-item>
              <el-dropdown-item divided command="logOut">{{ $t('退出登录') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 动态内容区域 -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" />
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, shallowRef, defineAsyncComponent, onMounted } from "vue";
import { Session } from '/@/utils/storage';
import Cookies from 'js-cookie';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
const { locale, t } = useI18n();

const state = reactive<any>({
  token: false,
  userInfo: {} as any,
});
const Introduce = defineAsyncComponent(() => import('./components/Introduce.vue'));
const communal = defineAsyncComponent(() => import('./components/communal.vue'));
const answer = defineAsyncComponent(() => import('./components/answer.vue'));
const Recognition = defineAsyncComponent(() => import('./components/Recognition.vue'));
const navItems = ['垃圾分类科普', '垃圾分类答题', '垃圾分类社区', '垃圾分类识别'];
const activeTab = ref(0);
const components = [Introduce, answer, communal, Recognition];
const currentComponent = shallowRef(components[0]);
const router = useRouter();
const switchTab = (index: number) => {
  activeTab.value = index;
  currentComponent.value = components[index];
};

const onHandleCommandClick = (path: string) => {
  if (path === 'logOut') {
		ElMessageBox({
			closeOnClickModal: false,
			closeOnPressEscape: false,
			title: t('message.user.logOutTitle'),
			message: t('message.user.logOutMessage'),
			showCancelButton: true,
			confirmButtonText: t('message.user.logOutConfirm'),
			cancelButtonText: t('message.user.logOutCancel'),
			buttonSize: 'default',
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = t('message.user.logOutExit');
					setTimeout(() => {
						done();
						setTimeout(() => {
							instance.confirmButtonLoading = false;
						}, 300);
					}, 700);
				} else {
					done();
				}
			},
		})
    .then(async () => {
      // 清除缓存/token等
      Session.clear();
      Cookies.remove('userName');
      // 使用 reload 时，不需要调用 resetRoute() 重置路由
      window.location.reload();
    })
    .catch(() => { });
	} else {
		router.push(path);
	}
};
onMounted(() => {
  const userName = Cookies.get('userName');
  if (Session.get('token')) {
    state.token = true;
  } else {
    state.token = false;
  }
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
});
</script>

<style scoped>
.homepage {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f0f8ff, #ffffff);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 200px;
  background-color: #fff;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 100px;
}

.logo {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.logo h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.slogan {
  font-size: 16px;
  color: #7f8c8d;
  font-style: italic;
}

.nav {
  display: flex;
  gap: 40px;
}

.nav a {
  text-decoration: none;
  color: #34495e;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav a:hover {
  background-color: #f8f9fa;
  color: #3498db;
}

.nav a.active {
  color: #3498db;
  position: relative;
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: #3498db;
}

.auth {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-link {
  text-decoration: none;
  color: #34495e;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.auth-link:hover {
  background-color: #f8f9fa;
  color: #3498db;
}

.auth-divider {
  color: #bdc3c7;
  font-size: 16px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  /* padding: 0 150px; */
}

.footer {
  padding: 20px;
  text-align: center;
  background-color: #2c3e50;
  color: #fff;
  font-size: 18px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {

  .header,
  .main-content {
    padding: 20px 100px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 20px;
    gap: 15px;
  }

  .nav {
    gap: 20px;
  }

  .main-content {
    padding: 20px;
  }
}

.auth {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: #f8f9fa;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  transition: border-color 0.3s ease;
}

.user-info:hover .avatar {
  border-color: #3498db;
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: #34495e;
}

.el-icon--right {
  margin-left: 4px;
  color: #7f8c8d;
  transition: color 0.3s ease;
}

.user-info:hover .el-icon--right {
  color: #3498db;
}

.el-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-dropdown-menu__item {
  font-size: 14px;
  color: #34495e;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.el-dropdown-menu__item:hover {
  background-color: #f8f9fa;
  color: #3498db;
}
</style>