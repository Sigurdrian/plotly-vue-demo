<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import TopicData from '../types/topics';
import { CustomPlotRelayoutEvent } from '../types/customPlotlyInterfaces';
import DualrangeSlider from './DualrangeSlider.vue'
import { Data, Datum, Layout, Config, PlotRelayoutEvent, PlotlyHTMLElement } from 'plotly.js-dist-min';
import Plotly from 'plotly.js';

const plotly = ref<typeof Plotly | null>(null); // Ref to hold the Plotly instance
const graph = ref<PlotlyHTMLElement | null>(null);
const graphContainerId = "gd";

// Reactive property to store the currently displayed range
const xRange = ref<string[] | null>(null);

// Reactive property to store the loaded data
const loading = ref(true); // Initial state is loading

// Reactive property to store the loaded data
const tot_data = ref<TopicData[] | null>(null);

function wrapText(text: string, maxCharsPerLine: number) {
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

// Function to handle a range change
function rangeChange(event: PlotRelayoutEvent) {
  const relayoutData = event as CustomPlotRelayoutEvent;
  // eventData will contain the updated range for the x-axis
  // This will check if the event data contains x-axis update
  if (typeof relayoutData['xaxis.range[0]'] === 'string'
    && typeof relayoutData['xaxis.range[1]'] === 'string') {
    xRange.value = [
      relayoutData['xaxis.range[0]'],
      relayoutData['xaxis.range[1]']
    ];
    console.log('Updated range of the x-axis:', xRange.value);
  };
}

onMounted(async () => {
  // wait for Plotly to load
  plotly.value = (await import('plotly.js-dist-min')).default;

  const layout: Partial<Layout> = {
    width: 1000,
    height: 600,
    xaxis: {
      autorange: true,
      rangeselector: {
        buttons: [
          {
            count: 1,
            label: '1m',
            step: 'month',
            stepmode: 'backward'
          },
          {
            count: 6,
            label: '6m',
            step: 'month',
            stepmode: 'backward'
          },
          { step: 'all' }
        ]
      },
      type: 'date'
    },
  };

  const config: Partial<Config> = {
    modeBarButtonsToRemove: [
      'zoom2d',
      'pan2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d'
    ]
  };

  graph.value = await plotly.value.newPlot(graphContainerId, [], layout, config);
  graph.value?.on('plotly_relayout', rangeChange);


  loadData().then(() => {
    if (tot_data.value) {
      // Assuming you want to do this for the first topic in your JSON data
      const data: Data[] = tot_data.value.map(topic => {
        // filter out days where a topic wasn't mentioned
        const filteredEntries = Object.entries(topic.mentions).filter(([, value]) => value !== 0);
        const xValues = filteredEntries.map(([key]) => key);
        const yValues = filteredEntries.map(([, value]) => value);
        return {
          x: xValues,
          y: yValues.map(Number), // Convert values to numbers, just in case they are not already
          type: 'scatter', // assuming you want a scatter plot for each topic
          mode: 'lines',
          name: wrapText(topic.topic, 40) // Use the topic as the name for the individual series
        };
      });

      if (plotly.value) {
        plotly.value.react(graphContainerId, data, layout);
      } else {
        console.error('Plotly failed to load');
      }

      // Plotly has been loaded, set loading to false
      loading.value = false;
    } else {
      console.error('No data available for Plotly to render.');
    }
  });
});

onBeforeUnmount(() => {
  graph.value?.removeAllListeners('plotly_relayout');
});

function handleSliderChange(rangeStrings: string[]) {
  //console.log('SliderChange: ', rangeStrings)
  const newRange: [Datum, Datum] = [
    rangeStrings[0] as Datum,
    rangeStrings[1] as Datum,
  ]
  plotly.value?.relayout(graphContainerId, {
    // Update the x-axis range
    'xaxis.range': newRange
  });
};
</script>

<template>
  <div v-if="loading" class="spinner-container">
    <div class="loader"></div>
    <p class="loader-label">Loading...</p>
  </div>
  <div v-show="!loading" :id="graphContainerId"> </div>
  <div v-show="!loading" class="toolstrip">
    <button>
      Get Range
    </button>
    <input type="date">
    <DualrangeSlider :start="'2023-08-01'" :end="'2023-12-30'" :from="'2023-08-01'" :to="'2023-12-24'"
      @sliderChangeEvent="handleSliderChange" />
    <input type="date">
  </div>
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

.toolstrip {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
