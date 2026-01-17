(function () {
    if (typeof d3 === "undefined") {
        console.warn("D3 belum dimuat.");
        return;
    }

    const palette = [
        "#f97316",
        "#fb7185",
        "#22c55e",
        "#38bdf8",
        "#8b5cf6",
        "#facc15",
        "#14b8a6",
        "#ef4444",
        "#0ea5e9",
        "#a855f7"
    ];

    function getContainer(id) {
        return document.getElementById(id);
    }

    function clearContainer(container) {
        container.innerHTML = "";
    }

    function getSize(container) {
        const rect = container.getBoundingClientRect();
        const width = rect.width > 0 ? rect.width : 320;
        const height = rect.height > 0 ? rect.height : 240;
        return { width, height };
    }

    function applySvgStyle(svg) {
        svg.style("font-family", "'Space Grotesk', sans-serif")
            .style("font-size", "11px")
            .style("color", "#475569");
    }

    function createSvg(container) {
        clearContainer(container);
        const size = getSize(container);
        const svg = d3
            .select(container)
            .append("svg")
            .attr("width", size.width)
            .attr("height", size.height)
            .attr("viewBox", `0 0 ${size.width} ${size.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
        applySvgStyle(svg);
        return { svg, width: size.width, height: size.height };
    }

    function renderEmpty(container, message) {
        clearContainer(container);
        const empty = document.createElement("div");
        empty.style.display = "flex";
        empty.style.height = "100%";
        empty.style.width = "100%";
        empty.style.alignItems = "center";
        empty.style.justifyContent = "center";
        empty.style.fontSize = "12px";
        empty.style.color = "#64748b";
        empty.textContent = message;
        container.appendChild(empty);
    }

    function getTooltip() {
        let tooltip = document.getElementById("chart-tooltip");
        if (tooltip) {
            return tooltip;
        }
        tooltip = document.createElement("div");
        tooltip.id = "chart-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.pointerEvents = "none";
        tooltip.style.padding = "8px 10px";
        tooltip.style.background = "rgba(15, 23, 42, 0.95)";
        tooltip.style.color = "#f8fafc";
        tooltip.style.borderRadius = "8px";
        tooltip.style.fontSize = "11px";
        tooltip.style.lineHeight = "1.4";
        tooltip.style.boxShadow = "0 10px 20px rgba(15, 23, 42, 0.2)";
        tooltip.style.opacity = "0";
        tooltip.style.transition = "opacity 120ms ease";
        document.body.appendChild(tooltip);
        return tooltip;
    }

    function showTooltip(event, text) {
        const tooltip = getTooltip();
        tooltip.textContent = text;
        tooltip.style.left = `${event.pageX + 12}px`;
        tooltip.style.top = `${event.pageY + 12}px`;
        tooltip.style.opacity = "1";
    }

    function hideTooltip() {
        const tooltip = getTooltip();
        tooltip.style.opacity = "0";
    }

    function styleAxis(axisGroup) {
        axisGroup.selectAll("path").attr("stroke", "#cbd5f5");
        axisGroup.selectAll("line").attr("stroke", "#e2e8f0");
        axisGroup.selectAll("text").attr("fill", "#64748b");
    }

    function renderBarChart(container, data) {
        if (!container) {
            return;
        }
        if (!data.length) {
            renderEmpty(container, "Tidak ada data kategori.");
            return;
        }

        const labels = data.map((item) => item.label);
        const values = data.map((item) => item.value);
        const { svg, width, height } = createSvg(container);
        const margin = { top: 16, right: 16, bottom: 36, left: 42 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const x = d3.scaleBand().domain(labels).range([0, chartWidth]).padding(0.2);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(values) || 0])
            .nice()
            .range([chartHeight, 0]);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const yGrid = g
            .append("g")
            .call(d3.axisLeft(y).ticks(4).tickSize(-chartWidth).tickFormat(""));
        yGrid.selectAll("line").attr("stroke", "#e2e8f0");
        yGrid.selectAll("path").attr("stroke", "none");

        const yAxis = g.append("g").call(d3.axisLeft(y).ticks(4));
        styleAxis(yAxis);

        const xAxis = g
            .append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x));
        xAxis.selectAll("text")
            .attr("transform", "rotate(-15)")
            .style("text-anchor", "end");
        styleAxis(xAxis);

        const bars = g.selectAll("rect")
            .data(
                data.map((item, index) => ({
                    value: item.value,
                    label: item.label,
                    tooltip: item.tooltip,
                    color: palette[index % palette.length]
                }))
            )
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.label))
            .attr("y", chartHeight)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", (d) => d.color);

        bars.transition()
            .duration(600)
            .attr("y", (d) => y(d.value))
            .attr("height", (d) => chartHeight - y(d.value));

        bars.on("mouseenter", function (event, d) {
                d3.select(this).attr("opacity", 0.85);
                showTooltip(event, d.tooltip || `${d.label}: ${d.value}`);
            })
            .on("mousemove", (event, d) => showTooltip(event, d.tooltip || `${d.label}: ${d.value}`))
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });
    }

    function renderLineChart(container, data) {
        if (!container) {
            return;
        }
        if (!data.length) {
            renderEmpty(container, "Tidak ada data kategori.");
            return;
        }

        const labels = data.map((item) => item.label);
        const { svg, width, height } = createSvg(container);
        const margin = { top: 16, right: 24, bottom: 36, left: 42 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const x = d3.scalePoint().domain(labels).range([0, chartWidth]).padding(0.5);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (item) => item.value) || 0])
            .nice()
            .range([chartHeight, 0]);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        const yGrid = g
            .append("g")
            .call(d3.axisLeft(y).ticks(4).tickSize(-chartWidth).tickFormat(""));
        yGrid.selectAll("line").attr("stroke", "#e2e8f0");
        yGrid.selectAll("path").attr("stroke", "none");

        const yAxis = g.append("g").call(d3.axisLeft(y).ticks(4));
        styleAxis(yAxis);

        const xAxis = g
            .append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x));
        xAxis.selectAll("text")
            .attr("transform", "rotate(-15)")
            .style("text-anchor", "end");
        styleAxis(xAxis);

        const area = d3
            .area()
            .x((item) => x(item.label))
            .y0(chartHeight)
            .y1((item) => y(item.value));

        g.append("path")
            .datum(data)
            .attr("fill", "rgba(249, 115, 22, 0.18)")
            .attr("d", area);

        const line = d3
            .line()
            .x((item) => x(item.label))
            .y((item) => y(item.value));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#f97316")
            .attr("stroke-width", 2)
            .attr("d", line);

        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => x(d.label))
            .attr("cy", (d) => y(d.value))
            .attr("r", 3.5)
            .attr("fill", "#f97316")
            .on("mouseenter", function (event, d) {
                d3.select(this).attr("r", 5);
                showTooltip(event, d.tooltip || `${d.label}: ${d.value}`);
            })
            .on("mousemove", (event, d) => showTooltip(event, d.tooltip || `${d.label}: ${d.value}`))
            .on("mouseleave", function () {
                d3.select(this).attr("r", 3.5);
                hideTooltip();
            });
    }

    function renderPieChart(container, data, innerRatio) {
        if (!container) {
            return;
        }
        if (!data.length) {
            renderEmpty(container, "Tidak ada data kategori.");
            return;
        }

        const { svg, width, height } = createSvg(container);
        const radius = Math.min(width, height) / 2 - 8;
        const innerRadius = innerRatio ? radius * innerRatio : 0;

        const g = svg
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie().sort(null).value((d) => d.value);
        const dataset = data.map((item, index) => ({
            label: item.label,
            value: item.value,
            tooltip: item.tooltip,
            color: palette[index % palette.length]
        }));

        const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

        g.selectAll("path")
            .data(pie(dataset))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d) => d.data.color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .on("mousemove", (event, d) => showTooltip(event, d.data.tooltip || `${d.data.label}: ${d.data.value}`))
            .on("mouseenter", function () { d3.select(this).attr("opacity", 0.85); })
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });
    }

    function renderPolarArea(container, data) {
        if (!container) {
            return;
        }
        if (!data.length) {
            renderEmpty(container, "Tidak ada data kategori.");
            return;
        }

        const { svg, width, height } = createSvg(container);
        const radius = Math.min(width, height) / 2 - 12;
        const center = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

        const maxValue = d3.max(data, (item) => item.value) || 1;
        const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);
        const pie = d3.pie().sort(null).value(() => 1);
        const dataset = data.map((item, index) => ({
            label: item.label,
            value: item.value,
            tooltip: item.tooltip,
            color: palette[index % palette.length]
        }));

        const ringLevels = 3;
        for (let i = 1; i <= ringLevels; i += 1) {
            center
                .append("circle")
                .attr("r", (radius / ringLevels) * i)
                .attr("fill", "none")
                .attr("stroke", "#e2e8f0")
                .attr("stroke-dasharray", "2,2");
        }

        const arc = d3
            .arc()
            .innerRadius(0)
            .outerRadius((d) => rScale(d.data.value));

        center
            .selectAll("path")
            .data(pie(dataset))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d) => d.data.color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .on("mousemove", (event, d) => showTooltip(event, d.data.tooltip || `${d.data.label}: ${d.data.value}`))
            .on("mouseenter", function () { d3.select(this).attr("opacity", 0.85); })
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 1);
                hideTooltip();
            });
    }

    function renderRadar(container, labels, datasets, tooltips) {
        if (!container) {
            return;
        }
        if (!labels.length) {
            renderEmpty(container, "Tidak ada data kategori.");
            return;
        }

        const { svg, width, height } = createSvg(container);
        const radius = Math.min(width, height) / 2 - 28;
        const legend = svg.append("g").attr("transform", "translate(12,12)");
        datasets.forEach((dataset, index) => {
            const row = legend.append("g").attr("transform", `translate(0, ${index * 14})`);
            row.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", dataset.stroke);
            row.append("text")
                .attr("x", 14)
                .attr("y", 9)
                .attr("fill", "#64748b")
                .text(dataset.label);
        });
        const center = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        const angleStep = (Math.PI * 2) / labels.length;
        const maxValue = d3.max(datasets.flatMap((set) => set.values)) || 1;
        const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

        const gridLevels = 4;
        for (let i = 1; i <= gridLevels; i += 1) {
            center
                .append("circle")
                .attr("r", (radius / gridLevels) * i)
                .attr("fill", "none")
                .attr("stroke", "#e2e8f0")
                .attr("stroke-dasharray", "2,2");
        }

        labels.forEach((label, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            center.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", x)
                .attr("y2", y)
                .attr("stroke", "#cbd5f5");

            center.append("text")
                .attr("x", Math.cos(angle) * (radius + 12))
                .attr("y", Math.sin(angle) * (radius + 12))
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("font-size", 10)
                .attr("fill", "#64748b")
                .text(label);
        });

        const radarLine = d3
            .lineRadial()
            .radius((d) => d.radius)
            .angle((d) => d.angle)
            .curve(d3.curveLinearClosed);

        datasets.forEach((dataset) => {
            const points = dataset.values.map((value, index) => ({
                radius: rScale(value),
                angle: angleStep * index - Math.PI / 2
            }));

            center
                .append("path")
                .datum(points)
                .attr("d", radarLine)
                .attr("fill", dataset.fill)
                .attr("stroke", dataset.stroke)
                .attr("stroke-width", 2)
                .attr("opacity", 0.9);

            center
                .selectAll(null)
                .data(points.map((point, index) => ({
                    x: Math.cos(point.angle) * point.radius,
                    y: Math.sin(point.angle) * point.radius,
                    tooltip: tooltips[index]
                })))
                .enter()
                .append("circle")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", 2.5)
                .attr("fill", dataset.stroke)
                .on("mouseenter", function (event, d) {
                    d3.select(this).attr("r", 4);
                    showTooltip(event, d.tooltip);
                })
                .on("mousemove", (event, d) => showTooltip(event, d.tooltip))
                .on("mouseleave", function () {
                    d3.select(this).attr("r", 2.5);
                    hideTooltip();
                });
        });
    }

    function buildChartData(categories, patients) {
        const categoryIndex = new Map();
        categories.forEach((category, index) => {
            categoryIndex.set(Number(category.id), index);
        });

        const summary = categories.map((category) => ({
            id: Number(category.id),
            label: category.name,
            count: 0,
            ageSum: 0,
            ageCount: 0,
            minAge: null,
            maxAge: null,
            cityMap: new Map()
        }));

        patients.forEach((patient) => {
            const categoryId = Number(patient.category_id);
            const categoryPosition = categoryIndex.get(categoryId);
            if (categoryPosition === undefined) {
                return;
            }

            const item = summary[categoryPosition];
            item.count += 1;

            const ageValue = Number(patient.age);
            if (Number.isFinite(ageValue)) {
                item.ageSum += ageValue;
                item.ageCount += 1;
                item.minAge =
                    item.minAge === null
                        ? ageValue
                        : Math.min(item.minAge, ageValue);
                item.maxAge =
                    item.maxAge === null
                        ? ageValue
                        : Math.max(item.maxAge, ageValue);
            }

            const city = (patient.city || "").trim();
            if (city) {
                item.cityMap.set(city, (item.cityMap.get(city) || 0) + 1);
            }
        });

        summary.forEach((item) => {
            item.avgAge = item.ageCount ? Number((item.ageSum / item.ageCount).toFixed(1)) : 0;
            item.cityCount = item.cityMap.size;
            let topCityName = "N/A";
            let topCityCount = 0;
            item.cityMap.forEach((count, name) => {
                if (count > topCityCount) {
                    topCityCount = count;
                    topCityName = name;
                }
            });
            item.topCityName = topCityName;
            item.topCityCount = topCityCount;
            item.minAgeValue = item.minAge === null ? 0 : item.minAge;
            item.maxAgeValue = item.maxAge === null ? 0 : item.maxAge;
        });

        return summary;
    }

    function renderCharts(categories, patients) {
        const summary = buildChartData(categories, patients);
        const labels = summary.map((item) => item.label);
        const tooltip = (item) =>
            `Kategori: ${item.label}\n` +
            `Patients: ${item.count}\n` +
            `Avg age: ${item.avgAge}\n` +
            `Cities: ${item.cityCount}\n` +
            `Top city: ${item.topCityName} (${item.topCityCount})`;

        const barData = summary.map((item) => ({
            label: item.label,
            value: item.count,
            tooltip: tooltip(item)
        }));
        const lineData = summary.map((item) => ({
            label: item.label,
            value: item.avgAge,
            tooltip: tooltip(item)
        }));
        const pieData = summary.map((item) => ({
            label: item.label,
            value: item.count,
            tooltip: tooltip(item)
        }));
        const doughnutData = summary.map((item) => ({
            label: item.label,
            value: item.cityCount,
            tooltip: tooltip(item)
        }));
        const polarData = summary.map((item) => ({
            label: item.label,
            value: item.topCityCount,
            tooltip: tooltip(item)
        }));
        const radarTooltips = summary.map(
            (item) =>
                `${tooltip(item)}\nMin age: ${item.minAgeValue}\nMax age: ${item.maxAgeValue}`
        );

        renderBarChart(getContainer("chart-category-bar"), barData);
        renderLineChart(getContainer("chart-age-line"), lineData);
        renderPieChart(getContainer("chart-category-pie"), pieData, 0);
        renderPieChart(getContainer("chart-city-doughnut"), doughnutData, 0.55);
        renderPolarArea(getContainer("chart-city-polar"), polarData);
        renderRadar(getContainer("chart-age-radar"), labels, [
            {
                label: "Min Age",
                values: summary.map((item) => item.minAgeValue),
                stroke: "#10b981",
                fill: "rgba(16, 185, 129, 0.18)"
            },
            {
                label: "Max Age",
                values: summary.map((item) => item.maxAgeValue),
                stroke: "#f97316",
                fill: "rgba(249, 115, 22, 0.16)"
            }
        ], radarTooltips);
    }

    let hasExternalData = false;

    async function fetchData() {
        const [categoriesResponse, patientsResponse] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/patients")
        ]);

        if (!categoriesResponse.ok || !patientsResponse.ok) {
            throw new Error("API error saat memuat chart.");
        }

        const categories = await categoriesResponse.json();
        const patients = await patientsResponse.json();
        renderCharts(Array.isArray(categories) ? categories : [], Array.isArray(patients) ? patients : []);
    }

    document.addEventListener("charts:data", (event) => {
        hasExternalData = true;
        const detail = event.detail || {};
        const categories = Array.isArray(detail.categories) ? detail.categories : [];
        const patients = Array.isArray(detail.patients) ? detail.patients : [];
        renderCharts(categories, patients);
    });

    setTimeout(() => {
        if (!hasExternalData) {
            fetchData().catch((error) => console.error("Gagal memuat data chart:", error));
        }
    }, 0);
})();
