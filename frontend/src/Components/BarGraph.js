import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisLeft } from "@visx/axis";
import { scaleBand, scaleLinear } from "@visx/scale";

export default function BarGraph({ data, width, height, events = false }) {
  // Accessors
  const getAuthorName = (d) => d.author_name;
  const getCommitFrequency = (d) => d.commit_frequency;

  // Margins and padding
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales, memoized for performance
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, innerWidth],
        round: true,
        domain: data.map(getAuthorName),
        padding: 0.2, // Adjust the padding between bars
      }),
    [innerWidth, data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight, 0],
        round: true,
        domain: [0, Math.max(...data.map(getCommitFrequency))],
      }),
    [innerHeight, data]
  );

  // Calculate approximate tick values for the y-axis
  const yTicks = yScale.ticks(5).map((value) => ({
    value,
    label: Math.floor(value),
  }));

  return (
    <svg width={width} height={height}>
      <Group transform={`translate(${margin.left}, ${margin.top})`}>
        {data.map((d) => {
          const authorName = getAuthorName(d);
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - yScale(getCommitFrequency(d));
          const barX = xScale(authorName);
          const barY = innerHeight - barHeight;

          return (
            <g key={`bar-group-${authorName}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#61cdbb" // Bar color
                onClick={() => {
                  if (events)
                    alert(
                      `Clicked: Author - ${authorName}, Commits - ${getCommitFrequency(
                        d
                      )}`
                    );
                }}
              />
              <text
                x={barX + barWidth / 2}
                y={innerHeight + 10} // Position the text below bars
                fill="#333" // Text color
                textAnchor="middle"
                fontSize={12}
              >
                {authorName}
              </text>
            </g>
          );
        })}
        <AxisLeft
          scale={yScale}
          tickStroke="#333" // Tick color
          tickLabelProps={() => ({
            fill: "#333", // Tick label color
            fontSize: 10,
            textAnchor: "end",
            dy: "0.33em",
          })}
          tickValues={yTicks.map((tick) => tick.value)}
          tickFormat={(value) => value.toFixed(0)}
        />
      </Group>
    </svg>
  );
}
