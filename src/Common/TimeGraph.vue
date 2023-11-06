<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Plotly, { Data, Layout } from 'plotly.js-dist-min';

// Reactive property to store the loaded data
const tot_data = ref(null);

// Function to load the JSON data
function loadData() {
    return fetch('./src/assets/data/topicsOverTime/mockup_tot.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      tot_data.value = data;
      console.log(data)
    })
    .catch(error => {
      console.error('Error loading the JSON file:', error);
    });
}


onMounted(async () => {
    loadData().then(() => {
    if (tot_data.value) {
      const data: Data[] = [{ y: tot_data.value.yDataArray ?? [1, 2, 3] }];
      const layout: Partial<Layout> = { width: 600, height: 400 };
      Plotly.newPlot("gd", data, layout);
    } else {
      console.error('No data available for Plotly to render.');
    }
  });
});


</script>

<template>
    <div id="gd"> </div>
</template>

<style scoped></style>
