
// Domain
// Range
// Type

// Based on: https://bl.ocks.org/vijithassar/c60dafea4431f292660d6f5e0487e470
function GeneratePlot() {
    // Configuration
    const height = 480
    const total_width = 960
    const grid = 10
    const margin = {
        top: 20,
        right: 30,
        bottom: 10,
        left: 30
    }
    const width = total_width - margin.left - margin.right
    const segment = height * 0.25
    const size = segment * 0.5

    const raincloud = (selection, data) => {
        selection
            .call(curve, data)
            .call(dots, data)
            .call(boxplot, data)
        }

    // Data
    const generate = (count = 800) => {
        const spread = d3.randomUniform(10, 50)()
        const center = d3.randomNormal(500, spread)()
        const jitter = d3.randomUniform(10, 100)
        const direction = () => Math.random() > 0.5 ? 1 : -1
        const base = d3.randomNormal(center, spread)
        const random = () => Math.round(base() + jitter() * direction())
        const data = Array.from({length: count})
            .fill(null)
            .map(random)
            .sort(d3.ascending)

        return data
    }

    // Curve
    const curve = (selection, data) => {
        const histogram = d3.histogram()
            .thresholds(20)
            (data)
            .map(bin => bin.length)
        const x = d3.scaleLinear()
            .domain([0, histogram.length])
            .range([0, width])
        const y = d3.scaleLinear()
            .domain([0, d3.max(histogram)])
            .range([size, 0])
        const area = d3.area()
            .y0(y)
            .y1(size)
            .x((d, i) => x(i))
            .curve(d3.curveBasis)
        selection.append('g')
            .classed('curve', true)
            .datum(histogram)
            .append('path')
            .attr('d', area)
    }

    // Box Plot
    const boxplot = (selection, data) => {

        const bar = grid
        const x = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([0, width])

        const plot = selection
            .append('g')
            .classed('boxplot', true)
            .attr('transform', `translate(0,${segment * 0.75 - grid})`)

        const dy = 30;

        let IQR = (d3.quantile(data, 0.75) - d3.quantile(data, 0.25));

        let Max = d3.quantile(data, 1);
        let Max_Fallback = d3.quantile(data, 0.75) + (1.5*IQR);

        let Min = d3.quantile(data, 0);
        let Min_Fallback = d3.quantile(data, 0.25) - (1.5*IQR);

        plotData = {
            Q1: d3.quantile(data, 0.25),
            Median: d3.quantile(data, 0.5),
            Q3: d3.quantile(data, 0.75),
            IQR: IQR,
            Min: Math.max(Min, Min_Fallback),
            Max: Math.min(Max, Max_Fallback),
        }
        console.log(`Q1 - 1.5IQR: ${Min_Fallback}\tIQR: ${(1.5*IQR)}\tQ3 + 1.5IQR: ${Max_Fallback}`);
        console.log(`Min: ${Min}, ${Min_Fallback}, ${plotData.Min}`)
        console.log(`Min: ${Max}, ${Max_Fallback}, ${plotData.Max}`)

        plot
            .append('line')
            .attr('x1', x(plotData.Median))
            .attr('x2', x(plotData.Median))
            .attr('y1', 0)
            .attr('y2', bar)

        plot
            .append('line')
            .attr('x1', x(plotData.Min))
            .attr('x2', x(plotData.Q1))
            .attr('y1', bar * 0.5)
            .attr('y2', bar * 0.5)

        plot
            .append('line')
            .attr('x1', x(plotData.Max))
            .attr('x2', x(plotData.Q3))
            .attr('y1', bar * 0.5)
            .attr('y2', bar * 0.5)

        plot.append('rect')
            .attr('x', x(plotData.Q1))
            .attr('y', 0)
            .attr('height', bar)
            .attr('width', x(plotData.Q3) - x(plotData.Q1))


        labels = [plotData.Min, plotData.Q1, plotData.Median, plotData.Q3, plotData.Max];

        for(idx = 0; idx < labels.length; idx++){
            plot
            .append('text')
            .text(labels[idx])
            .attr('x', x(labels[idx]))
            .attr('y', bar)
            .attr('dy', dy)
            .attr("text-anchor", "middle");
        }

    }

    // Raw Data
    const dots = (selection, data) => {
        const x = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([0, width])
        selection
            .append('g')
            .classed('dots', true)
            .attr('transform', `translate(0,${segment * 0.5 + grid})`)
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('r', 2)
            .attr('cx', x)
            .attr('cy', () => Math.random() * size * 0.5)
    }

    // DOM
    const dom = selection => {
    selection
        .append('svg')
        .attr('height', height)
        .attr('width', total_width)

    }

    // Loop
    const svg = d3.select('main')
        .call(dom)
        .select('svg')

    svg
        .append('g')
        .classed('raincloud', true)
        .attr('transform', `translate(${margin.left},${0 * segment + margin.top})`)
        .call(raincloud, generate())
}
