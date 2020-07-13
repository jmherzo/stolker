import React, { useEffect } from "react";
import * as d3 from "d3";

// Components
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

// Types
import { IDataset } from "../types/IDataset";

export interface IGraphProps {
  selectedSymbol?: IDataset;
}

const Graph: React.FC<IGraphProps> = ({ selectedSymbol }): JSX.Element => {
  useEffect(() => {
    const height = 600;
    const width = 700;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const data = selectedSymbol?.data || [];

    const line = d3
      .line()
      .defined((d: any) => !isNaN(d.price))
      .x((d: any) => x(d.time))
      .y((d: any) => y(d.price));

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.price) as any])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const yAxis = (g: any) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g: any) => g.select(".domain").remove())
        .call((g: any) =>
          g
            .select(".tick:last-of-type text")
            .clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("$ Price"),
        );

    const x = d3
      .scaleTime()
      .domain(d3.extent(data as any, (d: any) => d.time + 1 * 1000) as any)
      .nice()
      .range([margin.left, width - margin.right]);

    const xAxis = (g: any) =>
      g.attr("transform", `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 50)
          .tickSizeOuter(0),
      );

    const svg = d3
      .select("#graph-id")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line as any);

    // eslint-disable-next-line
  }, [selectedSymbol?.data.length]);

  return (
    <Grid container alignItems="center" justify="center">
      <Grid item>
        {selectedSymbol ? (
          <div key={selectedSymbol?.data.length} id="graph-id"></div>
        ) : (
          <Typography
            variant="h5"
            style={{ marginTop: "3rem" }}
            color="primary"
            gutterBottom
          >
            Select a stock
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default Graph;
