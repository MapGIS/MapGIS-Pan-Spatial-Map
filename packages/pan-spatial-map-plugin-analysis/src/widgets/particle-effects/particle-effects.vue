<template>
  <div>
    <mapgis-3d-particle-effects-manager
      id='mp-3d-particle-effects'
      :symbolList='symbolList'
      :particleList='particleList'
      ref='particleEffect'
      @changeParticle = 'changeParticle'
      @load='load'
    />
  </div>
</template>

<script lang='ts'>
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-common'

declare function require(string): string;

@Component({ name: 'MpParticleEffects' })
export default class MpParticleEffects extends Mixins(WidgetMixin) {

  private particleEffects = null

  private particleListArray = []

  private particleList = []

  private symbolList = []

  private particleChangedList = []

  async mounted(){
    const config = await api.getWidgetConfig('particle-effects')
    this.symbolList = config.symbolList.map(item => {
          return {
            guid: item.guid,
            name: item.name,
            image: `${this.baseUrl}${item.image}`,
            iconUrl: item.iconUrl,
            config: item.config
          }
        })
    this.particleListArray = config.particleListConfig
  }

  load(particleEffects) {
    this.particleEffects = particleEffects
  }

  onOpen() {
    this.particleEffects.mount()
    this.particleList = this.particleListArray
  }

  onClose() {
    this.particleEffects.unmount()
  }

  changeParticle(particleList) {
    this.particleChangedList = particleList
  }


  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('mp-3d-particle-effects')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }

  // 微件失活时
  onDeActive() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
    // this.particleEffects.unmount()
  }

  async saveConfig() {
    const originConfig = await api.getWidgetConfig('particle-effects')
    originConfig.particleListConfig = this.recursion(this.particleChangedList);
    api
      .saveWidgetConfig({
        name: 'particle-effects',
        config: JSON.stringify(originConfig)
      })
      .then(() => {
        console.log('更新particle配置成功')
      })
      .catch(() => {
        console.log('更新particle配置失败')
      })
  }

  // 递归删除对象数组中的__ob__属性
  recursion(obj) {
    const vm = this
    if(obj instanceof Array){
      const newOnj = [];
      for (let i =0;i<obj.length;i++){
        if(obj[i] instanceof Object){
          newOnj.push(vm.recursion(obj[i]));
        }else {
          newOnj.push(obj[i]);
        }
      }
      return newOnj;
    }else if(obj instanceof Object){
      const newOnj = {};
      Object.keys(obj).forEach(function(key) {
        if (obj[key] instanceof Object){
          if(key !== '__ob__'){
            newOnj[key] = vm.recursion(obj[key]);
          }
        }else {
          newOnj[key] = obj[key];
        }
      })
      return newOnj;
    }else {
      return obj;
    }
  }


}
</script>
<style lang='less'>
#mp-3d-particle-effects {
  width: 300px;
  max-width: 100%;
}
</style>
