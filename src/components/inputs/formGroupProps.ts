export default {
    label: { type: String },
    description: { type: String },
    dangerousHtmlDescription: { type: String },
    info: { type: String }, // Unused for now
    enabled: { type: Function, required: false, default: () => true },
    edit: { type: Boolean, required: false, default: true }
}
