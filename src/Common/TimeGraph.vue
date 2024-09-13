<script setup lang="ts">

//                                    Imports
// ============================================================================

import { onMounted, onBeforeUnmount, ref } from "vue";
import TopicData from "../types/topics";
import { CustomPlotRelayoutEvent } from "../types/customPlotlyInterfaces";
import DualrangeSlider from "./DualrangeSlider.vue";
import {
  Data,
  Datum,
  Layout,
  Config,
  PlotRelayoutEvent,
  PlotlyHTMLElement,
} from "plotly.js-dist-min";
import Plotly from "plotly.js-dist-min";
import MonthPickerInput from "./MonthPicker/MonthPickerInput.vue";

//                                    Defines
// ============================================================================

const plotly = ref<typeof Plotly | null>(null); // Ref to hold the Plotly instance
const graph = ref<PlotlyHTMLElement | null>(null);
const graphContainerId = "gd";

// Reactive property to store the currently displayed range
const displayedXrange = ref<string[] | null>(null);

// Reactive property to store the currently avalable range
const dataXrange = ref([new Date(), new Date(0)]);

// Reactive property to store the loaded data
const loading = ref(true); // Initial state is loading

// Reactive property to store the loaded data
const tot_data = ref<TopicData[] | null>(null);

// default values for the monthpickers
const start_default_month = ref<Number | null>(null);
const start_default_year = ref<Number | null>(null);
const end_default_month = ref<Number | null>(null);
const end_default_year = ref<Number | null>(null);

// default values for the monthpickers
const slider_start = ref<string>('');
const slider_end = ref<string>('');
const slider_from = ref<string>('');
const slider_to = ref<string>('');

const theme = ref<string>('default');

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
  return fetch("./src/assets/data/topicsOverTime/mockup_tot.json")
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

/**
 * Handles changes in the range of the x-axis on a plot, updating a global state variable.
 * 
 * @param {PlotRelayoutEvent} event - The relayout event object containing the new range data.
 */
function rangeChange(event: PlotRelayoutEvent) {
  const relayoutData = event as CustomPlotRelayoutEvent;
  // eventData will contain the updated range for the x-axis
  // This will check if the event data contains x-axis update
  if (
    typeof relayoutData["xaxis.range[0]"] === "string" &&
    typeof relayoutData["xaxis.range[1]"] === "string"
  ) {
    displayedXrange.value = [
      relayoutData["xaxis.range[0]"],
      relayoutData["xaxis.range[1]"],
    ];
    // update slider
    slider_from.value = relayoutData["xaxis.range[0]"];
    slider_to.value = relayoutData["xaxis.range[1]"];
  } else {
    // if no x range is given the plot most likely was reset
    //slider_from.value = dataXrange.value[0].toISOString().split('T')[0];
    //slider_to.value = dataXrange.value[1].toISOString().split('T')[0];
  }
}


/**
 * Updates the x-axis range of a Plotly graph based on slider input.
 * 
 * @param {string[]} rangeStrings - Array of two strings representing the new range for the x-axis.
 */
function handleSliderChange(rangeStrings: string[]) {
  //console.log('SliderChange: ', rangeStrings)
  const newRange: [Datum, Datum] = [
    rangeStrings[0] as Datum,
    rangeStrings[1] as Datum,
  ];
  plotly.value?.relayout(graphContainerId, {
    // Update the x-axis range
    "xaxis.range": newRange,
  });
}

/**
 * Get the total range of the recieved data by calculating its max and min values and set
 * it directly to the prop `dataXrange`.
 * 
 * @param {string[]} dateValues - Array of strings which all represent a datetime in ISO format. 
 */
function getDataXrange(dateValues: string[]) {

  // Convert strings to date objects
  let dates = dateValues.map(date => new Date(date));
  // Convert dates to timestamps
  let timestamps = dates.map(date => date.getTime());

  // Find the lowest and highest dates
  let lowestTimestamp = Math.min.apply(null, timestamps);
  let highestTimestamp = Math.max.apply(null, timestamps);

  // If the lowestTimestamp of this Topic is lower than the
  // global one it the new lowpoint
  if (lowestTimestamp < dataXrange.value[0].getTime()) {
    dataXrange.value[0] = new Date(lowestTimestamp)
  }

  if (highestTimestamp > dataXrange.value[1].getTime()) {
    dataXrange.value[1] = new Date(highestTimestamp)
  }
}

/**
 * Get the total range from `dataXrange` and set it directly to the  MonthPicker.
 * 
 */
function updateUIfromDataXrange() {
  // set the picker elements
  start_default_month.value = dataXrange.value[0].getMonth() + 1;
  start_default_year.value = dataXrange.value[0].getFullYear();
  end_default_month.value = dataXrange.value[1].getMonth() + 1;
  end_default_year.value = dataXrange.value[1].getFullYear();

  // set the slider elements
  slider_start.value = dataXrange.value[0].toISOString().split('T')[0];
  slider_from.value = slider_start.value;
  slider_end.value = dataXrange.value[1].toISOString().split('T')[0];
  slider_to.value = slider_end.value;
}



//                                Lifecycle Hooks
// ============================================================================

onMounted(async () => {

  // when mounted check the color theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark';
  }

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

  graph.value = await plotly.value.newPlot(
    graphContainerId,
    [],
    layout,
    config,
  );
  graph.value?.on("plotly_relayout", rangeChange);

  loadInitialData().then(() => {
    if (tot_data.value) {
      // Assuming you want to do this for the first topic in your JSON data
      const data: Data[] = tot_data.value.map((topic) => {
        // filter out days where a topic wasn't mentioned
        const filteredEntries = Object.entries(topic.mentions).filter(
          ([, value]) => value !== 0,
        );
        const xValues = filteredEntries.map(([key]) => key);
        const yValues = filteredEntries.map(([, value]) => value);

        getDataXrange(xValues);

        return {
          x: xValues,
          y: yValues.map(Number), // Convert values to numbers, just in case they are not already
          type: "scatter", // assuming you want a scatter plot for each topic
          mode: "lines",
          name: wrapText(topic.topic, 40), // Use the topic as the name for the individual series
        };
      });

      if (plotly.value) {
        plotly.value.react(graphContainerId, data, layout);
      } else {
        console.error("Plotly failed to load");
      }

      // Once the graph is initialized we also want to initialize the Slider.
      updateUIfromDataXrange();

      // Plotly has been loaded, set loading to false
      loading.value = false;
    } else {
      console.error("No data available for Plotly to render.");
    }
  });
});

onBeforeUnmount(() => {
  graph.value?.removeAllListeners("plotly_relayout");
});

</script>

<template>
  <div v-if="loading" class="spinner-container">
    <div class="loader"></div>
    <p class="loader-label">Loading...</p>
  </div>
  <div v-show="!loading" :id="graphContainerId"></div>
  <div v-if="!loading" class="toolstrip">
    <button>Get Range</button>
    <month-picker-input :default-month="start_default_month" :default-year="start_default_year" :input-pre-filled="true"
      :variant="theme" lang="de"></month-picker-input>
    <DualrangeSlider :start="slider_start" :end="slider_end" :from="slider_from" :to="slider_to"
      @sliderChangeEvent="handleSliderChange" />
    <month-picker-input :default-month="end_default_month" :default-year="end_default_year" :input-pre-filled="true"
      :variant="theme" lang="de"></month-picker-input>
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
