<template>
  <div class="marker-import-file-desc-wrapper">
    <div class="tabs-content">
      <a-tabs type="card">
        <a-tab-pane key="point" tab="点文件">
          <p class="sample">
            名称：点示例1<br />
            描述：text123456<br />
            类型：点<br />
            坐标：114,30<br />
            名称：点示例2<br />
            描述：text123456<br />
            类型：点<br />
            坐标：115,20
          </p>
        </a-tab-pane>
        <a-tab-pane key="line" tab="线文件">
          <p class="sample">
            名称：线示例1<br />
            描述：text123456<br />
            类型：线<br />
            坐标：62.55,39.93 94.11,65.85 151.94,56.12<br />
            名称：线示例2<br />
            描述：text123456<br />
            类型：线<br />
            坐标：61.55,38.93 93.11,64.85
          </p>
        </a-tab-pane>
        <a-tab-pane key="polygon" tab="区文件">
          <p class="sample">
            名称：区示例1<br />
            描述：text123456<br />
            类型：区<br />
            坐标：123,22 122,23 100,17 123,22<br />
            名称：区示例2<br />
            描述：text123456<br />
            类型：区<br />
            坐标：122,21 121,22 99,16 122,21
          </p>
        </a-tab-pane>
        <a-tab-pane key="multiPolygon" tab="组合区文件">
          <p class="sample">
            名称：组合区示例1<br />
            描述：text123456<br />
            类型：组合区<br />
            坐标：62.55,39.93 94.11,65.85 151.94,56.12 132.23,17.22
            62.55,39.93#57.55,39.93 94.11,70.85 156.94,56.12 132.23,12.22
            87.94,0.66 57.55,39.93#47.55,49.93 44.11,60.85 146.94,46.12
            122.23,11.22 47.55,49.93
          </p>
        </a-tab-pane>
        <a-tab-pane key="holePolygon" tab="带洞区文件">
          <p class="sample">
            名称：带洞区示例1<br />
            描述：text123456<br />
            类型：带洞区<br />
            坐标：62.55,39.93 94.11,65.85 151.94,56.12 132.23,17.22 87.94,5.66
            62.55,39.93#57.55,39.93 94.11,70.85 156.94,56.12 132.23,12.22
            87.94,0.66 57.55,39.93
          </p>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-alert message="提示" type="info">
      <p slot="description" class="info">
        格式为.txt文本，编码为UTF-8；<br />
        x，y之间之间使用英文,分隔；坐标点间空格分隔；要素间使用#分隔，表示一个标注包含多个要素。<br />
        多个标注依次往后追加。
      </p>
    </a-alert>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'MarkerImportFileDesc'
})
export default class MarkerImportFileDesc extends Vue {}
</script>

<style lang="less" scoped>
.marker-import-file-desc-wrapper {
  .sample {
    font-size: 14px;
    margin-left: 15px;
  }

  .info {
    color: @text-color-secondary;
    margin: 0;
  }
}
</style>
