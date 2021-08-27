<template>
  <mp-setting-form class="mp-builder-attribute" layout="vertical">
    <a-form-item label="logo">
      <a-row type="flex" align="middle" justify="space-between">
        <app-icon
          class="logo-color"
          :width="64"
          :height="64"
          :icon="appConfig.logo"
        />
        <a-dropdown>
          <a-menu slot="overlay" @click="settingLogo">
            <a-menu-item key="svg">
              svg
            </a-menu-item>
            <a-menu-item key="file">
              文件上传
            </a-menu-item>
          </a-menu>
          <a-button type="primary"> 设置logo <a-icon type="down" /> </a-button>
        </a-dropdown>
      </a-row>
    </a-form-item>
    <a-form-item label="标题">
      <a-input v-model="appConfig.title"></a-input>
    </a-form-item>
    <a-form-item label="副标题">
      <a-input v-model="appConfig.subtitle"></a-input>
    </a-form-item>
    <a-form-item>
      <div slot="label">
        <a-row type="flex" :gutter="[10, 0]" align="middle">
          <a-col flex="auto"><label>链接</label></a-col>
          <a-col style="display: flex; align-items: center;">
            <a-button type="primary" @click="addLink">
              添加
            </a-button>
          </a-col>
        </a-row>
      </div>
      <a-table
        bordered
        :data-source="appConfig.links"
        :columns="columns"
        row-key="label"
        :scroll="{ x: 360 }"
        size="small"
      >
        <template slot="action" slot-scope="text, record, index">
          <a @click="handleUpdate(index, record)">
            编辑
          </a>
          <a-divider type="vertical" />
          <a-popconfirm
            v-if="appConfig.links.length"
            title="是否要删除该链接?"
            @confirm="() => handleDelete(index)"
          >
            <a href="javascript:;">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </a-form-item>
    <a-modal
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="30%"
      @ok="handleConfirm('linkForm')"
      @cancel="dialogVisible = false"
    >
      <a-form-model
        ref="linkForm"
        layout="vertical"
        :model="link"
        :rules="rules"
      >
        <a-form-model-item label="标题" prop="label">
          <a-input v-model="link.label"></a-input>
        </a-form-model-item>
        <a-form-model-item label="url" prop="url">
          <a-input v-model="link.url"></a-input>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal
      title="svg"
      :visible.sync="svgDialogVisible"
      @ok="handleConfirmSvg"
      @cancel="svgDialogVisible = false"
    >
      <a-textarea autosize placeholder="请输入内容" v-model="svgLogo">
      </a-textarea>
    </a-modal>
    <a-modal
      title="文件上传"
      :visible.sync="fileDialogVisible"
      @ok="handleConfirmFile"
      @cancel="fileDialogVisible = false"
    >
      <input
        @change="uploadLogo($event)"
        type="file"
        class="mp-builder-attribute-choose-image"
        accept="image/svg+xml,image/jpeg,image/jpg,image/png"
      />
      <div class="mp-builder-attribute-logo-preview-item">
        <img class="image-node" :src="base64Logo" />
      </div>
    </a-modal>
  </mp-setting-form>
</template>

<script>
import AppIcon from './AppIcon'

export default {
  name: 'Attribute',
  components: { AppIcon },
  props: {
    appConfig: {
      type: Object
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      link: {
        label: '',
        url: '',
        id: null
      },
      rules: {
        label: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        url: [{ required: true, message: '请输入url', trigger: 'blur' }]
      },
      svgDialogVisible: false,
      svgLogo: '',
      fileDialogVisible: false,
      base64Logo: '',
      columns: [
        {
          title: '标题',
          dataIndex: 'label',
          width: 120
        },
        {
          title: '链接',
          dataIndex: 'url',
          width: 240
        },
        {
          title: '操作',
          key: 'action',
          fixed: 'right',
          width: 90,
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  methods: {
    addLink() {
      this.dialogVisible = true
      this.dialogTitle = '添加链接'
      this.link.label = ''
      this.link.url = ''
      this.link.id = null
    },
    handleDelete(index) {
      this.appConfig.links.splice(index, 1)
    },
    handleUpdate(index, row) {
      this.dialogVisible = true
      this.dialogTitle = '编辑链接'
      this.link.label = row.label
      this.link.url = row.url
      this.link.id = index
    },
    handleConfirm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.dialogTitle === '添加链接') {
            this.appConfig.links.push({
              label: this.link.label,
              url: this.link.url
            })
            this.$message.success('添加成功')
            this.dialogVisible = false
          } else {
            this.appConfig.links[this.link.id].label = this.link.label
            this.appConfig.links[this.link.id].url = this.link.url
            this.$message.success('修改成功')
            this.dialogVisible = false
          }
        } else {
          return false
        }
      })
    },
    settingLogo({ key }) {
      if (key === 'svg') {
        this.svgDialogVisible = true
        this.svgLogo = ''
      } else if (key === 'file') {
        this.fileDialogVisible = true
        this.base64Logo = ''
      }
    },
    handleConfirmSvg() {
      this.appConfig.logo = this.svgLogo
      this.svgDialogVisible = false
    },
    uploadLogo(e) {
      // 利用fileReader对象获取file
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = e => {
        // 读取到的图片base64 数据编码
        this.base64Logo = e.target.result
      }
    },
    handleConfirmFile() {
      this.appConfig.logo = this.base64Logo
      this.fileDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.mp-builder-attribute {
  padding: 12px;
  .logo-color {
    color: @primary-color;
  }
}
.mp-builder-attribute-choose-image {
  text-align: center;
  line-height: 30px;
}
.mp-builder-attribute-logo-preview-item {
  position: relative;
  padding: 5px;
  width: 100px;
  height: 100px;
  margin: 10px auto;
  .image-node {
    max-width: 80px;
    max-height: 80px;
  }
}
</style>
