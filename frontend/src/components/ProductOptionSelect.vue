<template>
  <label class="product-option">
    <span>{{ label }}</span>
    <select :value="modelValue" :required="required" @change="$emit('update:modelValue', $event.target.value)">
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
    </select>
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select one',
  },
  required: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])
</script>
