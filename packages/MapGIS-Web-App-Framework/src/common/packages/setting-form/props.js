export const formProps = {
  form: {
    type: Object,
  },
  compact: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: "mini",
  },
  hideRequiredMark: {
    type: Boolean,
    default: false,
  },
  labelAlign: {
    type: String,
    default: "left",
    validator: (v) => ["left", "right"].includes(v),
  },
  layout: {
    type: String,
    default: "horizontal",
    validator: (v) => ["horizontal", "vertical", "inline"].includes(v),
  },
  labelCol: {
    type: Object,
    default() {
      return { span: 8 };
    },
  },
  wrapperCol: {
    type: Object,
    default() {
      return { span: 16 };
    },
  },
  selfUpdate: {
    type: Boolean,
    default: false,
  },
  colon: {
    type: Boolean,
    default: false,
  },
};
