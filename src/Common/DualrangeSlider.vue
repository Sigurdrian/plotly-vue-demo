<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

const emit = defineEmits(["sliderChangeEvent"]);

function onSliderChange(event: Event) {
  const sliderElement = event.target as HTMLInputElement;

  var num_fromPos = typeof fromPos.value === 'number' ? fromPos.value : parseInt(fromPos.value);
  var num_toPos = typeof toPos.value === 'number' ? toPos.value : parseInt(toPos.value);

  // if both Sliders are left ensure the to SLdier gets selected dominantly
  if (sliderElement.id === 'toSlider') {
    setToggleAccessible(sliderElement);
  }

  // Color between the two Sliders
  fillSlider();

  if (num_fromPos > num_toPos) {
    num_fromPos = num_toPos - 1;
  }
  if (num_toPos < num_fromPos) {
    num_toPos = num_fromPos + 1;
  }

  toPos.value = String(num_toPos);
  fromPos.value = String(num_fromPos);

  // Emitting the custom event and passing the new value
  emit("sliderChangeEvent", [
    convert_NumberToDate(num_fromPos),
    convert_NumberToDate(num_toPos),
  ]);
}

const props = defineProps({
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

const startDate = computed(() => {
  return isValidDate(props.start);
});
const endDate = computed(() => {
  return isValidDate(props.end);
});

const nDays = computed(() => {
  return calculateDaysBetween(startDate.value, endDate.value);
});

const fromSlider = ref<HTMLInputElement | null>(null);
const toSlider = ref<HTMLInputElement | null>(null);
const fromPos = ref<string>(String(convert_DateToNumber(isValidDate(props.from))));
const toPos = ref<string>(String(convert_DateToNumber(isValidDate(props.to))));

watch(
  () => props.from,
  (new_from) => {
    fromPos.value = String(convert_DateToNumber(isValidDate(new_from)));
    fillSlider();
    console.log('from watch')
  })

watch(
  () => props.to,
  (new_to) => {
    toPos.value = String(convert_DateToNumber(isValidDate(new_to)));
    fillSlider();
    console.log('to watch')
  })

function isValidDate(dateStr: string): Date {
  const date = new Date(dateStr);
  // Checks if the date is a valid date
  const err_msg = "Invalid String given to DualrangeSlider as a Date";
  console.assert(!isNaN(date.getTime()), err_msg);
  return date;
}

function convert_DateToNumber(date: Date): number {
  // Ensure date is within the range
  if (date < startDate.value) return 0;
  if (date > endDate.value)
    return calculateDaysBetween(startDate.value, endDate.value);

  // Calculate the difference in days
  return calculateDaysBetween(startDate.value, date);
}

function convert_NumberToDate(days: number): string {
  // Assuming startDate is a reactive reference
  const startDateValue = startDate.value;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  // Clone the startDate to avoid mutating it
  var resultDate = new Date(startDateValue);
  resultDate = new Date(resultDate.getTime() + MS_PER_DAY * days);

  // Returning only the date part in YYYY-MM-DD format
  return resultDate.toISOString().split("T")[0];
}

function calculateDaysBetween(start_date: Date, end_date: Date): number {
  const ONE_DAY = 1000 * 60 * 60 * 24; // Milliseconds in one day
  const differenceMs = Math.abs(end_date.getTime() - start_date.getTime());
  return Math.floor(differenceMs / ONE_DAY);
}


function fillSlider() {
  const rangeDistance = nDays.value;
  const fromPosition = typeof fromPos.value === 'number' ? fromPos.value : parseFloat(fromPos.value);
  const toPosition = typeof toPos.value === 'number' ? toPos.value : parseFloat(toPos.value);
  const sliderColor = '#C6C6C6';
  const rangeColor = '#25daa5';

  if (toSlider.value) {
    toSlider.value.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
  }

  if (fromSlider.value) {
    fromSlider.value.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
  }
}

function setToggleAccessible(currentTarget: HTMLInputElement) {
  if (currentTarget.valueAsNumber <= 0) {
    currentTarget.style.zIndex = '2';
  } else {
    currentTarget.style.zIndex = '0';
  }
}

onMounted(() => {
  fillSlider();
})

</script>

<template>
  <div class="dualrange-slider">
    <input id="fromSlider" type="range" ref="fromSlider" v-model="fromPos" min="0" :max="nDays" @input="onSliderChange" />
    <input id="toSlider" type="range" ref="toSlider" v-model="toPos" min="0" :max="nDays" @input="onSliderChange" />
  </div>
</template>

<style scoped>
.dualrange-slider {
  flex-grow: 2;
  flex-shrink: 0;
  display: grid;
  justify-items: center;
  align-items: center;
  margin: 10px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: all;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #c6c6c6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: all;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #c6c6c6;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #f7f7f7;
}

input[type="range"]::-webkit-slider-thumb:active {
  box-shadow:
    inset 0 0 3px #387bbe,
    0 0 9px #387bbe;
  -webkit-box-shadow:
    inset 0 0 3px #387bbe,
    0 0 9px #387bbe;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 2px;
  width: 100%;
  background-color: #c6c6c6;
  pointer-events: none;
  grid-row: 1;
  grid-column: 1;
}

#fromSlider {
  height: 0;
  z-index: 1;
}
</style>
