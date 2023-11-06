<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TopicData } from '@/types/topics.ts';
import { Data, Layout } from 'plotly.js-dist-min';

// Reactive property to store the loaded data
const loading = ref(true); // Initial state is loading

// Reactive property to store the loaded data
const tot_data = ref<TopicData[] | null>(null);

function wrapText(text : string, maxCharsPerLine : number) {
  const words = text.split(' ');
  let wrappedText = '';
  let lineLength = 0;

  words.forEach(word => {
    if (lineLength + word.length + 1 > maxCharsPerLine) {
      wrappedText += '<br>'; // Add a line break if the next word would exceed the max length
      lineLength = 0;
    } else if (wrappedText !== '') {
      wrappedText += ' '; // Add a space before the word if it's not the beginning of a line
      lineLength += 1;
    }
    wrappedText += word;
    lineLength += word.length;
  });
  return wrappedText;
}

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
    })
    .catch(error => {
      console.error('Error loading the JSON file:', error);
    });
}

onMounted(async () => {
  // wait for Plotly to load
  const Plotly = (await import('plotly.js-dist-min')).default;

  const graphContainerId = "gd";
  const layout: Partial<Layout> = { width: 1000, height: 600 };
  Plotly.newPlot(graphContainerId, [], layout);

  loadData().then(() => {
    if (tot_data.value) {
      // Assuming you want to do this for the first topic in your JSON data
      const data: Data[] = tot_data.value.map(topic => {
        const mentions = topic.mentions;
        return {
          x: Object.keys(mentions),
          y: Object.values(mentions).map(Number), // Convert values to numbers, just in case they are not already
          type: 'scatter', // assuming you want a scatter plot for each topic
          name: wrapText(topic.topic, 40) // Use the topic as the name for the individual series
        };
      });

      Plotly.react(graphContainerId, data, layout);

      // Plotly has been loaded, set loading to false
      loading.value = false;
    } else {
      console.error('No data available for Plotly to render.');
    }
  });
});
</script>

<template>
  <div v-if="loading" class="spinner-container">
    <div class="loader"></div>
    <p class="loader-label">Loading...</p>
  </div>
  <div v-show="!loading" id="gd"> </div>
</template>

<style scoped>
.loader {
  /* Add styles for your loader */
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 120px;
  height: 120px;
  animation: spin 2s linear infinite;
}

.loader-label {
  position: absolute;
  z-index: 10;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}</style>
