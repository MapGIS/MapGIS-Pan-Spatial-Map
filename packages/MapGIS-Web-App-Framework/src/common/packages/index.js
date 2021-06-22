import MpIcon from './icon/Icon.vue'
import MpButton from './button/Button.vue'

import MpToolbar from './toolbar/Toolbar.vue'
import MpToolbarSpace from './toolbar/ToolbarSpace.vue'
import MpToolbarCommand from './toolbar/ToolbarCommand.vue'
import MpToolbarCommandGroup from './toolbar/ToolbarCommandGroup.vue'

import MpPlacement from './placement/Placement.vue'

import MpWindow from './window/Window.vue'

const components = [
  MpIcon,
  MpButton,
  MpToolbar,
  MpToolbarSpace,
  MpToolbarCommand,
  MpToolbarCommandGroup,
  MpPlacement,
  MpWindow
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
