
<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits(['sliderChangeEvent'])

function onSliderChange() {
    // Emitting the custom event and passing the new value
    emit('sliderChangeEvent',
        [
            convert_NumberToDate(fromPos.value),
            convert_NumberToDate(toPos.value)
        ]);
}

const props = defineProps({
    // Define your properties here
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    }
});

const startDate = computed(() => { return isValidDate(props.start) });
const endDate = computed(() => { return isValidDate(props.end) });

const nDays = computed(() => {
    return calculateDaysBetween(startDate.value, endDate.value);
});

const fromPos = ref(convert_DateToNumber(isValidDate(props.from)));
const toPos = ref(convert_DateToNumber(isValidDate(props.to)));


function isValidDate(dateStr: string): Date {
    const date = new Date(dateStr);
    // Checks if the date is a valid date
    const err_msg = 'Invalid String given to DualrangeSlider as a Date';
    console.assert(!isNaN(date.getTime()), err_msg);
    return date
}

function convert_DateToNumber(date: Date): number {
    // Ensure date is within the range
    if (date < startDate.value) return 0;
    if (date > endDate.value) return calculateDaysBetween(startDate.value, endDate.value);

    // Calculate the difference in days
    return calculateDaysBetween(startDate.value, date);
}

function convert_NumberToDate(days: number): string {
    // Assuming startDate is a reactive reference
    const startDateValue = startDate.value;
    const MS_PER_DAY = 24*60*60*1000;
    // Clone the startDate to avoid mutating it
    var resultDate = new Date(startDateValue);
    resultDate = new Date(resultDate.getTime() + (MS_PER_DAY*days))

    // Returning only the date part in YYYY-MM-DD format
    return resultDate.toISOString().split('T')[0];
}

function calculateDaysBetween(start_date: Date, end_date: Date): number {
    const ONE_DAY = 1000 * 60 * 60 * 24; // Milliseconds in one day
    const differenceMs = Math.abs(end_date.getTime() - start_date.getTime());
    return Math.floor(differenceMs / ONE_DAY);
}

</script>

<template>
    <div class="dualrange-slider">
        <input id="fromSlider" type="range" v-model="fromPos" min="0" :max=nDays @input="onSliderChange" />
        <input id="toSlider" type="range" v-model="toPos" min="0" :max=nDays @input="onSliderChange" />
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

input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: all;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px #C6C6C6;
    cursor: pointer;
}

input[type=range]::-moz-range-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: all;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px #C6C6C6;
    cursor: pointer;
}

input[type=range]::-webkit-slider-thumb:hover {
    background: #f7f7f7;
}

input[type=range]::-webkit-slider-thumb:active {
    box-shadow: inset 0 0 3px #387bbe, 0 0 9px #387bbe;
    -webkit-box-shadow: inset 0 0 3px #387bbe, 0 0 9px #387bbe;
}

input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 2px;
    width: 100%;
    background-color: #C6C6C6;
    pointer-events: none;
    grid-row: 1;
    grid-column: 1;
}

#fromSlider {
    height: 0;
    z-index: 1;
}
</style>