let logsChartRef, linesChartRef, speedChartRef;
let anomalies = []; // global tanım — highlight fonksiyonu da kullanacak

async function loadLogData() {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch("https://python-web-editor-tez.onrender.com/api/logs");
        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("Expected an array but got:", data);
            return;
        }

        const startInput = document.getElementById('startTime').value;
        const start = startInput ? new Date(startInput + 'T00:00:00') : null;
        const end = startInput ? new Date(startInput + 'T23:59:59') : null;

        const groupedChars = {}, groupedLines = {};
        data.forEach(entry => {
            const time = new Date(entry.time);
            if ((start && time < start) || (end && time > end)) return;

            const email = entry.email;
            if (!groupedChars[email]) groupedChars[email] = [];
            if (!groupedLines[email]) groupedLines[email] = [];

            groupedChars[email].push({ x: time, y: entry.totalchars || 0 });
            groupedLines[email].push({ x: time, y: entry.totallines || 0 });
        });

        const writingSpeeds = {};
        anomalies = [];

                Object.entries(groupedChars).forEach(([email, charEntries]) => {
            const lineEntries = groupedLines[email] || [];
            charEntries.sort((a, b) => a.x - b.x);
            lineEntries.sort((a, b) => a.x - b.x);

            const speeds = [];
            const speedWindows = [];

            for (let i = 1; i < charEntries.length; i++) {
                const prevTime = charEntries[i - 1].x;
                const currTime = charEntries[i].x;
                const deltaTime = (currTime - prevTime) / 1000;
                const deltaChars = charEntries[i].y - charEntries[i - 1].y;

                if (deltaTime > 0) {
                    const charSpeed = deltaChars / deltaTime;
                    speeds.push({ x: currTime, y: charSpeed });
                    speedWindows.push(charSpeed);
                }
            }

            const avgSpeed = speedWindows.reduce((a, b) => a + b, 0) / speedWindows.length;
            writingSpeeds[email] = speeds;

            for (let i = 1; i < charEntries.length; i++) {
                const currTime = charEntries[i].x;
                const prevTime = charEntries[i - 1].x;
                const deltaTime = (currTime - prevTime) / 1000;
                const deltaChars = charEntries[i].y - charEntries[i - 1].y;

                if (deltaTime > 0) {
                    const speed = deltaChars / deltaTime;

                    // ✅ Yeni mantık: hem hız yüksek olacak hem deltaChars yeterince büyük
                    if (speed > avgSpeed * 3 && deltaChars > 100) {
                        anomalies.push({
                            email,
                            time: currTime,
                            deltaChars,
                            deltaTime,
                            avgSpeed,
                            type: `Yüksek artış: ${deltaChars} karakter, hız: ${speed.toFixed(2)} c/s (ortalama: ${avgSpeed.toFixed(2)})`
                        });
                    }
                }
            }
        });

        const datasetsChars = Object.entries(groupedChars).map(([email, entries]) => ({
            label: email,
            data: entries.sort((a, b) => a.x - b.x),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.2
        }));

        const datasetsLines = Object.entries(groupedLines).map(([email, entries]) => ({
            label: email,
            data: entries.sort((a, b) => a.x - b.x),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.2
        }));

        const speedDatasets = Object.entries(writingSpeeds).map(([email, entries]) => ({
            label: email,
            data: entries,
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.2
        }));
        if (logsChartRef instanceof Chart) {
    logsChartRef.destroy();
    logsChartRef = null;
}
if (linesChartRef instanceof Chart) {
    linesChartRef.destroy();
    linesChartRef = null;
}
if (speedChartRef instanceof Chart) {
    speedChartRef.destroy();
    speedChartRef = null;
}


        logsChartRef = new Chart(document.getElementById('logsChart').getContext('2d'), {
            type: 'line',
            data: { datasets: datasetsChars },
            options: chartOptions("Toplam Karakterler")
        });

        linesChartRef = new Chart(document.getElementById('linesChart').getContext('2d'), {
            type: 'line',
            data: { datasets: datasetsLines },
            options: chartOptions("Toplam Satırlar")
        });

        speedChartRef = new Chart(document.getElementById('speedChart').getContext('2d'), {
            type: 'line',
            data: { datasets: speedDatasets },
            options: chartOptions("Yazma Hızı (chars/sec)")
        });

        const anomalySummary = {};
        anomalies.forEach(a => {
            if (!anomalySummary[a.email]) {
                anomalySummary[a.email] = { count: 0, lastTime: a.time };
            }
            anomalySummary[a.email].count += 1;
            if (new Date(a.time) > new Date(anomalySummary[a.email].lastTime)) {
                anomalySummary[a.email].lastTime = a.time;
            }
        });

        const tableBody = document.querySelector("#anomalyTable tbody");
        tableBody.innerHTML = "";

        const entries = Object.entries(anomalySummary);
        if (entries.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="4" style="text-align:center; color: #4caf50; font-weight: bold;">✔️ İntihal şüphesi olan kullanıcı bulunmamaktadır</td>`;
            tableBody.appendChild(tr);
        } else {
            entries.forEach(([email, info]) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${email}</td>
                    <td>${info.count}</td>
                    <td>${new Date(info.lastTime).toLocaleTimeString()}</td>
                    <td><button onclick="highlightAnomaly('${email}')">İncele</button></td>
                `;
                tableBody.appendChild(tr);
            });
        }
        
    } catch (err) {
        console.error("Failed to fetch or render data:", err);
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

function chartOptions(yLabel) {
    return {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'HH:mm:ss',
                    unit: 'minute'
                },
                title: { display: true, text: 'Time' }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: yLabel }
            }
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    drag: true,
                    threshold: 5
                },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'xy'
                }
            }
        }
    };
}

function highlightAnomaly(email) {
    const userAnomalies = anomalies.filter(a => a.email === email);
    if (userAnomalies.length === 0) {
        alert("Bu kullanıcı için anomali bulunamadı.");
        return;
    }

    const drawPoints = (chartRef, label, type) => {
        const dataset = chartRef.data.datasets.find(d => d.label === email);
        if (!dataset) return;

        // remove previous highlight datasets for this user
        chartRef.data.datasets = chartRef.data.datasets.filter(d => !d.label.includes(`${label} – ${email}`));

        const points = userAnomalies.map(a => {
            const match = dataset.data.find(d => new Date(d.x).getTime() === new Date(a.time).getTime());
            return match ? { x: match.x, y: match.y, email: a.email } : null;
        }).filter(Boolean);

        chartRef.data.datasets.push({
            label: `${label} – ${email}`,
            data: points,
            pointBackgroundColor: 'red',
            pointRadius: 12,
            borderWidth: 0,
            showLine: false
        });

        chartRef.update();
    };

    drawPoints(logsChartRef, "Anomali Noktası", email);
    drawPoints(linesChartRef, "Anomali Noktası", email);
    drawPoints(speedChartRef, "Anomali Noktası", email);
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
}
