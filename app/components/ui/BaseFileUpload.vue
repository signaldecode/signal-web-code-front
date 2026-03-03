<script setup>
import uiData from '~/data/ui.json'
import inquiryData from '~/data/inquiry.json'

const common = uiData.common
const fileUploadLabels = inquiryData.fileUpload

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  },
  maxSizeMB: {
    type: Number,
    default: 10
  },
  accept: {
    type: String,
    default: '.jpg,.jpeg,.png,.pdf,.doc,.docx,.hwp,.zip'
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  deleteLabel: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'error'])

const placeholderText = computed(() => props.placeholder || fileUploadLabels.placeholder)
const deleteText = computed(() => props.deleteLabel || common.delete)

const fileInputRef = ref(null)

const canAddMore = computed(() => props.modelValue.length < props.maxCount)

const handleClick = () => {
  if (props.disabled || !canAddMore.value) return
  fileInputRef.value?.click()
}

const getFileExtension = (filename) => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

const getFileIcon = (filename) => {
  const ext = getFileExtension(filename)
  const iconMap = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'doc',
    hwp: 'doc',
    zip: 'zip',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image'
  }
  return iconMap[ext] || 'file'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  const maxBytes = props.maxSizeMB * 1024 * 1024
  const validFiles = []

  for (const file of files) {
    if (props.modelValue.length + validFiles.length >= props.maxCount) break

    if (file.size > maxBytes) {
      emit('error', fileUploadLabels.fileSizeError.replace('{size}', props.maxSizeMB))
      continue
    }

    validFiles.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size
    })
  }

  if (validFiles.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...validFiles])
  }

  e.target.value = ''
}

const handleDelete = (id) => {
  emit('update:modelValue', props.modelValue.filter(i => i.id !== id))
}
</script>

<template>
  <div class="base-file-upload" :class="{ 'base-file-upload--disabled': disabled }">
    <button
      v-if="canAddMore"
      type="button"
      class="base-file-upload__add"
      :disabled="disabled"
      @click="handleClick"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="base-file-upload__add-text">{{ placeholderText }}</span>
    </button>

    <ul v-if="modelValue.length > 0" class="base-file-upload__list">
      <li
        v-for="item in modelValue"
        :key="item.id"
        class="base-file-upload__item"
      >
        <span class="base-file-upload__icon" :data-type="getFileIcon(item.name)">
          <svg v-if="getFileIcon(item.name) === 'image'" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>
            <path d="M2 11L5 8L7 10L10 7L14 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="getFileIcon(item.name) === 'pdf'" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 1H10L13 4V15H4V1Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M10 1V4H13" stroke="currentColor" stroke-width="1.2"/>
            <text x="5" y="11" font-size="4" fill="currentColor" font-weight="bold">PDF</text>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 1H10L13 4V15H4V1Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M10 1V4H13" stroke="currentColor" stroke-width="1.2"/>
            <path d="M6 8H11M6 10H11M6 12H9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="base-file-upload__info">
          <span class="base-file-upload__name">{{ item.name }}</span>
          <span class="base-file-upload__size">{{ formatFileSize(item.size) }}</span>
        </span>
        <button
          type="button"
          class="base-file-upload__delete"
          :aria-label="deleteText"
          @click="handleDelete(item.id)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </li>
    </ul>

    <p v-if="helpText" class="base-file-upload__help">{{ helpText }}</p>

    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      multiple
      class="base-file-upload__input"
      @change="handleFileChange"
    />
  </div>
</template>
