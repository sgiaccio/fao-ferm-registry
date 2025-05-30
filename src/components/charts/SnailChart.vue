<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import { select, areaRadial, interval, schemeTableau10 } from 'd3';
import { roundToPrecisionAsString } from '@/lib/util';

const props = withDefaults(defineProps<{
    values: number[];
    labels: string[];
    targetValue: number;
    unit?: string;
    size?: number,
    notAchievedLabel?: string,
}>(), {
    unit: '',
    size: 100,
    notAchievedLabel: 'Not achieved',
});

const chart = ref(null);
const tooltip = ref(null);

function getColorFromScheme(index: number) {
    const scheme = schemeTableau10;
    return scheme[index % scheme.length];
}

const _values = [...props.values]
const _labels = ref([...props.labels]);
const _colors = ref<string[]>([]);

function handleTooltip(path: any, value: number, index: number, duration: number) {
    setTimeout(() => {
        function createTooltipHandler(value: number, label: string) {
            return function (event: MouseEvent) {
                select(tooltip.value)
                    .style('opacity', 1)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY + 15) + 'px')
                    .html(`${label}<br/>${roundToPrecisionAsString(value, 2)} ${props.unit}`);
            };
        }

        path.on('mouseover', createTooltipHandler(value, _labels.value[index]))
            .on('mouseout', function () {
                select(tooltip.value).style('opacity', 0);
            });
    }, duration);
}

onMounted(() => {
    _colors.value = _values.map((_, index) => getColorFromScheme(index));
    const maxSize = props.size;
    const spiralInnerRadius = props.size / 2;
    const totalArea = _values.reduce((total, value) => total + value, 0);

    let percentImplemented = roundToPrecisionAsString(totalArea / props.targetValue * 100, 2);
    const isDisc = totalArea <= props.targetValue;

    if (totalArea < props.targetValue) {
        _values.push(props.targetValue - totalArea);
        _labels.value.push(props.notAchievedLabel);
        _colors.value.push('#aaa');
    }

    const totalAngle = isDisc ? (2 * Math.PI) : totalArea / props.targetValue * (2 * Math.PI);
    const nSpins = totalAngle / (2 * Math.PI);
    const spiralPitch = (maxSize - spiralInnerRadius) / nSpins;

    const lineWidth = 0.98 * spiralPitch;

    const area = areaRadial()
        .angle(d => d[0])
        .innerRadius(d => d[1])
        .outerRadius(d => d[1] + lineWidth);

    let increment = (2 * Math.PI) / props.targetValue;
    let decreaseIncrement = false
    if (increment > 0.1) {
        increment /= 50;
        decreaseIncrement = true
    }

    const predictedRadius = 2 * (spiralInnerRadius + (isDisc ? 0 : (totalAngle / (2 * Math.PI) * spiralPitch)) + lineWidth);

    const svg = select(chart.value)
        .append('svg')
        .attr('width', predictedRadius)
        .attr('height', predictedRadius)
        .append('g')
        .attr('transform', `translate(${predictedRadius / 2}, ${predictedRadius / 2})`);

    // If animation below is not needed, uncomment this block and comment the block below
    // props.values.forEach((value, index) => {
    //     const spiralData = [];
    //     for (let i = 0; i < value; i++) {
    //         totalAngle += increment;
    //         const radius = isDisc ? 50 : (totalAngle / (2 * Math.PI) * 35) + 50;
    //         spiralData.push([totalAngle, radius]);
    //     }
    //     const path = svg.append('path')
    //         .datum(spiralData)
    //         .attr('fill', colors[index])
    //         .attr('d', area);


    const duration = 700;  // Duration of the animation in milliseconds
    let currentAngle = 0;
    _values.forEach((value, index) => {
        const spiralData: any[] = [];

        // Generate data for the spiral as before
        for (let i = 0; i < value; i++) {
            if (decreaseIncrement) {
                for (let j = 0; j < 50; j++) {
                    currentAngle += increment;
                    const radius = spiralInnerRadius + (isDisc ? 0 : (currentAngle / (2 * Math.PI) * spiralPitch));
                    spiralData.push([currentAngle, radius]);
                }
            } else {
                currentAngle += increment;
                const radius = spiralInnerRadius + (isDisc ? 0 : (currentAngle / (2 * Math.PI) * spiralPitch));
                spiralData.push([currentAngle, radius]);
            }
        }

        // If it's not the last segment, extend the current segment slightly
        if (index < _values.length - 1) {
            const overlapIncrement = 0.02;  // Adjust as needed for more or less overlap
            const overlapAngle = currentAngle + overlapIncrement;
            const overlapRadius = spiralInnerRadius + (isDisc ? 0 : (overlapAngle / (2 * Math.PI) * spiralPitch));
            spiralData.push([overlapAngle, overlapRadius]);
        }

        const path = svg.append('path')
            .attr('fill', _colors.value[index]);

        // Animation
        interval((elapsed) => {
            const progress = elapsed / duration;
            const endAngle = progress * currentAngle;

            let segmentData = spiralData.filter(d => d[0] <= endAngle);

            if (segmentData.length > 0) {
                path.datum(segmentData).attr('d', area);
            }

            if (progress >= 1) {
                path.datum(spiralData).attr('d', area);
                return true;  // Stop the interval
            }
        }, 10);

        // wait for the previous animation to finish then add tooltips
        handleTooltip(path, value, index, duration);
    });

    // Calculate percentage
    // const totalImplemented = _values.reduce((acc, curr) => acc + curr, 0);

    // Add text to the center of the SVG
    svg.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "24px")
        .attr("fill", "#000")
        .text(`${percentImplemented}%`);

});
</script>

<template>
    <div class="flex justify-between">
        <div ref="chart"></div>
        <div class="flex flex-col space-y-2 p-4">
            <div v-for="(label, index) in _labels"
                 :key="index"
                 class="flex items-center space-x-2">
                <span class="w-5 h-5 rounded-full shadow flex-none"
                      :style="{ backgroundColor: _colors[index] }"></span>
                <span class="break-words">{{ label }}: {{ _values[index] }} {{ props.unit }}</span>
            </div>
        </div>
    </div>
    <div ref="tooltip"
         class="d3-tooltip"
         style="position: absolute; opacity: 0;"></div>
</template>

<style scoped>
.d3-tooltip {
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    pointer-events: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-size: 0.9em;
    transition: opacity 0.2s ease-in-out;
}
</style>
