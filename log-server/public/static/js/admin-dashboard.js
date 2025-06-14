        let logsChartRef, linesChartRef;

        async function loadLogData() {
            document.getElementById("loading").style.display = "block";
            try {
                const res = await fetch("https://python-web-editor-tez.onrender.com/api/logs");
                const data = await res.json();
                console.log("Fetched log data:", data);

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

                const datasetsChars = Object.entries(groupedChars).map(([email, entries]) => {
                    entries.sort((a, b) => a.x - b.x);
                    return {
                        label: email,
                        data: entries,
                        fill: false,
                        borderColor: getRandomColor(),
                        tension: 0.2
                    };
                });

                const datasetsLines = Object.entries(groupedLines).map(([email, entries]) => {
                    entries.sort((a, b) => a.x - b.x);
                    return {
                        label: email,
                        data: entries,
                        fill: false,
                        borderColor: getRandomColor(),
                        tension: 0.2
                    };
                });

                if (logsChartRef) logsChartRef.destroy();
                if (linesChartRef) linesChartRef.destroy();

                logsChartRef = new Chart(document.getElementById('logsChart').getContext('2d'), {
                    type: 'line',
                    data: { datasets: datasetsChars },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                type: 'time',
                                time: { tooltipFormat: 'HH:mm', unit: 'minute' },
                                title: { display: true, text: 'Time' }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Total Characters' }
                            }
                        }
                    }
                });

                linesChartRef = new Chart(document.getElementById('linesChart').getContext('2d'), {
                    type: 'line',
                    data: { datasets: datasetsLines },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                type: 'time',
                                time: { tooltipFormat: 'HH:mm', unit: 'minute' },
                                title: { display: true, text: 'Time' }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Total Lines' }
                            }
                        }
                    }
                });
            } catch (err) {
                console.error("Failed to fetch or render data:", err);
            } finally {
                document.getElementById("loading").style.display = "none";
            }
        }

        function getRandomColor() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgb(${r}, ${g}, ${b})`;
        }
