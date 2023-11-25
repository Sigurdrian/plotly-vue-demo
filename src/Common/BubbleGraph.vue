<script setup lang="ts">
//                                    Imports
// ============================================================================

import { onMounted, ref } from "vue";
import BubbleData from "../types/bubble";
import {
  Data,
  Layout,
  Config,
  PlotlyHTMLElement,
} from "plotly.js-dist-min";
import Plotly from "plotly.js";

//                                    Defines
// ============================================================================

const plotly = ref<typeof Plotly | null>(null); // Ref to hold the Plotly instance
const graph = ref<PlotlyHTMLElement | null>(null);
const graphContainerId = "bubbles";

// Reactive property to store the loaded data
const loading = ref(true); // Initial state is loading

// Reactive property to store the loaded data
const tot_data = ref<BubbleData[] | null>(null);

//                                    Local Functions
// ============================================================================

/**
 * Wraps text to ensure each line has no more than a specified number of characters, preserving whole words.
 * 
 * @param {string} text - The original text string to be wrapped.
 * @param {number} maxCharsPerLine - Maximum characters per line in the wrapped text.
 * @returns {string} The wrapped text with line breaks inserted appropriately.
 */
 function wrapText(text: string, maxCharsPerLine: number) {
  const words = text.split(" ");
  let wrappedText = "";
  let lineLength = 0;

  words.forEach((word) => {
    if (lineLength + word.length + 1 > maxCharsPerLine) {
      wrappedText += "<br>"; // Add a line break if the next word would exceed the max length
      lineLength = 0;
    } else if (wrappedText !== "") {
      wrappedText += " "; // Add a space before the word if it's not the beginning of a line
      lineLength += 1;
    }
    wrappedText += word;
    lineLength += word.length;
  });
  return wrappedText;
}

/**
 * Loads JSON data from a specified local path, handling HTTP errors and JSON parsing.
 * 
 * Note: This function is intended to be modified for a backend call using Axios in the future.
 * 
 * @returns A Promise resolving with the loaded data or undefined in case of an error.
 */
 function loadInitialData() {
  return fetch("./src/assets/data/bubbleView/bubble_mockup.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      tot_data.value = data;
    })
    .catch((error) => {
      console.error("Error loading the JSON file:", error);
    });
}

//                                Lifecycle Hooks
// ============================================================================

onMounted(async () => {
  // wait for Plotly to load
  plotly.value = (await import("plotly.js-dist-min")).default;

  const layout: Partial<Layout> = {
    width: 1000,
    height: 600,
  };

  const config: Partial<Config> = {
    modeBarButtonsToRemove: [
      "zoom2d",
      "pan2d",
      "select2d",
      "lasso2d",
      "zoomIn2d",
      "zoomOut2d",
      "autoScale2d",
    ],
  };
  console.log('Zeile 77')
  graph.value = await plotly.value.newPlot(
    graphContainerId,
    [],
    layout,
    config,
  );

  loadInitialData().then(() => {
    if (tot_data.value) {
      // Assuming you want to do this for the first topic in your JSON data
      const data: Data[] = tot_data.value.map((bubble) => {
        return {
          x: [bubble.x],
          y: [bubble.y],
          marker: 
          { size: bubble.size,
            color: bubble.color, 
          },         
          text: bubble.short_name,  
          type: 'scatter', 
          mode: 'markers+text',
          name: wrapText(bubble.topic, 40)
        };
      });

      if (plotly.value) {
        plotly.value.react(graphContainerId, data, layout);
      } else {
        console.error("Plotly failed to load");
      }

      // Plotly has been loaded, set loading to false
      loading.value = false;
    } else {
      console.error("No data available for Plotly to render.");
    }
  });
});


</script>

<template>
 <div v-if="loading" class="spinner-container">
    <div class="loader"></div>
    <p class="loader-label">Loading...</p>
  </div>
  <div v-show="!loading" :id="graphContainerId"></div>
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
}
</style>
