import path from "path";
import * as fse from "fs-extra";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import Chart, { ChartConfiguration } from "chart.js";
import { Options, Stats } from "lib";

const projectName = fse.readJSONSync("package.json")?.name || "My Project";

const width = 1200;
const height = 800;

export default async function generateReport(
  statsPerDay: Stats,
  options: Options
) {
  const chartConfig: ChartConfiguration = {
    plugins: [
      {
        beforeDraw: (chart: Chart) => {
          const ctx = chart.ctx;
          if (!ctx) return;
          ctx.save();
          ctx.fillStyle = options.dark ? "#111" : "#fff";
          ctx.fillRect(0, 0, chart.width || 0, chart.height || 0);
          ctx.restore();
        },
      },
    ],
    type: "line",
    data: {
      datasets: [
        {
          label: "Javascript",
          borderColor: "rgb(255,+99,+132)",
          backgroundColor: "rgba(255,+99,+132,+.5)",
          data: statsPerDay.map((s) => ({
            x: s.date,
            y: s.stats.js.total,
          })),
        },
        {
          label: "Typescript",
          borderColor: "rgb(54,+162,+235)",
          backgroundColor: "rgba(54,+162,+235,+.5)",
          data: statsPerDay.map((s) => ({
            x: s.date,
            y: s.stats.ts.total,
          })),
        },
      ],
    },
    options: {
      elements: {
        point: {
          radius: 0,
        },
      },
      title: {
        display: true,
        text: `Typescript migration - ${projectName}`,
        fontSize: 24,
      },
      legend: {
        labels: {
          fontSize: 18,
          fontStyle: "bold",
        },
      },
      scales: {
        xAxes: [
          {
            type: "time",
            distribution: "series",
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20,
              fontSize: 16,
              fontStyle: "bold",
            },
            gridLines: {
              color: options.dark ? "#222" : "#ddd",
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Lines of Code",
              fontSize: 16,
              fontStyle: "bold",
            },
            ticks: {
              fontSize: 16,
              fontStyle: "bold",
            },
            gridLines: {
              color: options.dark ? "#222" : "#ddd",
            },
          },
        ],
      },
    },
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const image = await chartJSNodeCanvas.renderToBuffer(chartConfig);

  await fse.writeFile(path.resolve(options.output, "image.png"), image);
}