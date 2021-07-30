import MpIcon from './icon/Icon.vue'

import MpButton from './button/Button.vue'

import MpRowFlex from './row-flex/RowFlex.vue'
import MpCard from './card/Card.vue'
import MpColorPickerConfirm from './color-picker-confirm/ColorPickerConfirm.vue'

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

import MpAdjustLine from './adjust-line/AdjustLine.vue'

import MpCollapseButton from './collapse-button/CollapseButton.vue'

import MpMask from './mask/Mask.vue'

import MpSpin from './spin/Spin.vue'

import MpPortal from './portal'

const components = [
  MpIcon,
  MpButton,
  MpCard,
  MpRowFlex,
  MpToolbar,
  MpToolbarSpace,
  MpToolbarTitle,
  MpToolbarCommand,
  MpToolbarCommandGroup,
  MpPlacement,
  MpWindow,
  MpColorPicker,
  MpColorPickerConfirm,
  MpTreeSelect,
  MpSettingForm,
  MpGroupTab,
  MpAdjustLine,
  MpCollapseButton,
  MpMask,
  MpSpin
]

const install = Vue => {
  Vue.prototype.$portal = MpPortal
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
