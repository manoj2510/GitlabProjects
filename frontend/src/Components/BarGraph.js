import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";

export default function BarGraph({ data, width, height, events = false }) {
  // accessors
  const getAuthorName = (d) => d.author_name;
  const getCommitFrequency = (d) => d.commit_frequency;
  console.log("getAuthorName", getAuthorName);

  // bounds
  const xMax = width;
  const yMax = height;

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand({
        range: [0, xMax],
        round: true,
        domain: data.map(getAuthorName),
        padding: 0.4,
      }),
    [xMax, data]
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(getCommitFrequency))],
      }),
    [yMax, data]
  );

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <Group>
        {data.map((d) => {
          const authorName = getAuthorName(d);
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(getCommitFrequency(d)) ?? 0);
          const barX = xScale(authorName);
          const barY = yMax - barHeight;
          return (
            <g key={`bar-group-${authorName}`}>
              <Bar
                x={barX}
                y={barY - 100}
                width={barWidth}
                height={barHeight}
                fill="rgba(23, 233, 217, .5)"
                onClick={() => {
                  if (events)
                    alert(`clicked: ${JSON.stringify(Object.values(d))}`);
                }}
              />
              <text
                x={barX + barWidth / 2}
                y={yMax - 75} // Position the text at the bottom
                fill="black"
                color="red"
                textAnchor="middle"
                fontSize={15}
              >
                {authorName}
              </text>
            </g>
          );
        })}
      </Group>
    </svg>
  );
}
