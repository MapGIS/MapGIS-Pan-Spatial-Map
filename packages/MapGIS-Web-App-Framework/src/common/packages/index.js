import MpIcon from './icon/Icon.vue'

import MpButton from './button/Button.vue'

import MpRowFlex from './row-flex/RowFlex.vue'

import MpToolbar from './toolbar/Toolbar.vue'

import MpToolbarSpace from './toolbar/ToolbarSpace.vue'

import MpToolbarTitle from './toolbar/ToolbarTitle.vue'

import MpToolbarCommand from './toolbar/ToolbarCommand.vue'

import MpToolbarCommandGroup from './toolbar/ToolbarCommandGroup.vue'

import MpPlacement from './placement/Placement.vue'

import MpWindow from './window/Window.vue'

import MpColorPicker from './color-picker/ColorPicker.vue'

import MpTreeSelect from './tree-select/TreeSelect.vue'

import MpSettingForm from './setting-form/SettingForm.vue'

import MpGroupTab from './group/GroupTab.vue'

import MpMask from './mask/Mask.vue'

const components = [
  MpIcon,
  MpButton,
  MpRowFlex,
  MpToolbar,
  MpToolbarSpace,
  MpToolbarTitle,
  MpToolbarCommand,
  MpToolbarCommandGroup,
  MpPlacement,
  MpWindow,
  MpColorPicker,
  MpTreeSelect,
  MpSettingForm,
  MpGroupTab,
  MpMask
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(
      (component.options && component.options.name) || component.name,
      component
    )
  })
}

export default {
  install
}
