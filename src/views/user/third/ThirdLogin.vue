<template>
  <div>
    <a v-for="type in config" :key="type.source" @click="onThirdLogin(type.source)" :title="type.name">
      <img :src="type.icon" class="item-icon" />
    </a>
    <!-- 第三方登录绑定账号密码输入弹框 -->
    <a-modal
      :title="$t('please.input.password')"
      :visible="thirdPasswordShow"
      @ok="thirdLoginCheckPassword"
      @cancel="thirdLoginNoPassword"
      :maskClosable="false"
    >
      <a-input-password :placeholder="$t('please.input.password')" v-model="thirdLoginPassword" />
    </a-modal>

    <!-- 第三方登录提示是否绑定账号弹框 -->
    <a-modal
      :footer="null"
      :visible="thirdConfirmShow"
      :class="'ant-modal-confirm'"
      @cancel="thirdLoginNoConfirm"
      :maskClosable="false"
    >
      <div class="ant-modal-confirm-body-wrapper">
        <div class="ant-modal-confirm-body">
          <a-icon type="question-circle" style="color: #faad14" />
          <span class="ant-modal-confirm-title">{{ this.$t('tip') }}</span>
          <div v-if="thirdLoginUserId" class="ant-modal-confirm-content">
            {{ $t('user.login.bind.tip', { username: this.thirdLoginUsername }) }}
          </div>
          <div v-else class="ant-modal-confirm-content">{{ $t('user.login.auto.create') }}</div>
        </div>
        <div class="ant-modal-confirm-btns">
          <a-button
            @click="thirdLoginUserCreate"
            :loading="thirdCreateUserLoding"
            :type="thirdLoginUserId ? 'default' : 'primary'"
          >
            {{ $t('user.login.create.new.account') }}
          </a-button>
          <a-button v-if="thirdLoginUserId" @click="thirdLoginUserBind" type="primary">
            {{ $t('user.login.confirm.bind') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { thirdLoginMixin } from '@/views/user/third/thirdLoginMixin'

export default {
  name: 'ThirdLogin',
  mixins: [thirdLoginMixin],
  props: {
    config: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="less" scoped>
.user-login-other {
  .item-icon {
    width: 24px;
    height: 24px;
    margin-left: 16px;
    cursor: pointer;
  }
}
</style>
