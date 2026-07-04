<template>
    <h1 v-if="!isLoading">{{ status }}</h1>
    <h1 v-else>Loading...</h1>
</template>
<script setup>
import { shallowRef } from 'vue';
import { useCartStore } from '../stores/cart';

const params = new URLSearchParams(window.location.search);
const cartStore = useCartStore();
const token = params.get("token");
const isLoading = shallowRef(true)
const status = shallowRef('')

fetch(`/api/checkout/capture-order/${token}`)
.then(async () => {
    await cartStore.clearCart();

    status.value = "Ordered successfully";
    isLoading.value = false;
}).catch(() => {
    status.value = "Error while ordering";
    isLoading.value = false;
})
</script>