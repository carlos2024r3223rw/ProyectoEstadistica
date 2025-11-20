document.addEventListener('DOMContentLoaded', function() {
    const dataInput = document.getElementById('dataInput');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const frequencyTable = document.getElementById('frequencyTable').querySelector('tbody');
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportExcelBtn = document.getElementById('exportExcel');
    const exportImageBtn = document.getElementById('exportImage');

    let barChart, pieChart, histogram;

    processBtn.addEventListener('click', processData);
    fileInput.addEventListener('change', handleFileUpload);
    exportPDFBtn.addEventListener('click', exportAsPDF);
    exportExcelBtn.addEventListener('click', exportAsExcel);
    exportImageBtn.addEventListener('click', exportAsImage);

    function processData() {
        let data = dataInput.value.trim();
        if (!data) {
            alert('Por favor ingrese datos.');
            return;
        }

        // Parse data
        const numbers = parseData(data);
        if (numbers.length === 0) {
            alert('No se encontraron números válidos.');
            return;
        }

        // Calculate frequency distribution
        const frequencyData = calculateFrequencyDistribution(numbers);
        
        // Display table
        displayTable(frequencyData);

        // Render charts
        renderCharts(frequencyData);
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
            readTextFile(file);
        } 
        else if (fileName.endsWith('.docx')) {
            readDocxFile(file);
        }
        else if (fileName.endsWith('.xlsx')) {
            readExcelFile(file);
        }
        else if (fileName.endsWith('.pdf')) {
            readPdfFile(file);
        } 
        else {
            alert('Formato no soportado.');
        }
    }

    function readDocxFile(file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                dataInput.value = result.value;
            } catch (error) {
                alert("Error al leer el archivo .docx");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function readExcelFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            let extractedData = [];

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const csv = XLSX.utils.sheet_to_csv(sheet);
                extractedData.push(csv);
            });

            dataInput.value = extractedData.join("\n");
        };
        reader.readAsArrayBuffer(file);
    }

    function readPdfFile(file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const typedArray = new Uint8Array(e.target.result);

            try {
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(" ");
                    fullText += pageText + "\n";
                }

                dataInput.value = fullText;
            } catch (error) {
                alert("Error al leer el archivo PDF");
            }
        };
        reader.readAsArrayBuffer(file);
    }


    function parseData(data) {
        return data.split(/[\s,]+/).map(item => {
            const num = parseFloat(item.trim());
            return isNaN(num) ? null : num;
        }).filter(num => num !== null).sort((a, b) => a - b);
    }

    function calculateFrequencyDistribution(numbers) {
        const n = numbers.length;
        const k = Math.ceil(1 + 3.322 * Math.log10(n));
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        const range = max - min;
        const classWidth = Math.ceil(range / k);

        const classes = [];
        let cumulativeAnterior = 0;
        document.getElementById('numClases').textContent = k;
        document.getElementById('amplitudClase').textContent = classWidth;
        document.getElementById('rango').textContent = range.toFixed(2);
        for (let i = 0; i < k; i++) {

            const lowerBound = min + i * classWidth;
            const upperBound = min + (i + 1) * classWidth;

            const absFreq = numbers.filter(num => num >= lowerBound && num < upperBound).length;

            const puntoMedio = (lowerBound + upperBound) / 2;

            cumulativeAnterior += absFreq;

            classes.push({
                interval: `${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}`,
                absolute: absFreq,
                relative: (absFreq / n).toFixed(4),
                cumulativeAnterior: cumulativeAnterior,
                puntoMedio: puntoMedio.toFixed(2)
            });
        }

        // Frecuencia acumulada posterior
        let cumulativePosterior = n;
        for (let i = 0; i < classes.length; i++) {
            classes[i].cumulativePosterior = cumulativePosterior;
            cumulativePosterior -= classes[i].absolute;
        }

        return classes;
    }

    function displayTable(data) {
        frequencyTable.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.interval}</td>
                <td>${row.puntoMedio}</td>
                <td>${row.absolute}</td>
                <td>${row.relative}</td>
                <td>${row.cumulativeAnterior}</td>
                <td>${row.cumulativePosterior}</td>
            `;
            frequencyTable.appendChild(tr);
        });
    }

    function renderCharts(data) {
        const labels = data.map(item => item.interval);
        const absFreq = data.map(item => item.absolute);
        const relFreq = data.map(item => parseFloat(item.relative));

        if (barChart) barChart.destroy();
        barChart = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Frecuencia Absoluta',
                    data: absFreq
                }]
            },
            options:  {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 750
                }
            }
        });

        if (pieChart) pieChart.destroy();
        pieChart = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: relFreq,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 750
                }
            }
        });

        if (histogram) histogram.destroy();
        histogram = new Chart(document.getElementById('histogram'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                    label: 'Frecuencia',
                    data: absFreq,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 750
                }
            }
        });
    }

    function exportAsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const imgWidth = 190;
        const pageHeight = 297;
        let yPosition = 10;

        function addImageToPDF(canvas, yPos) {
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (yPos + imgHeight > pageHeight) {
                doc.addPage();
                yPos = 10;
            }

            doc.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
            return yPos + imgHeight + 10;
        }

        html2canvas(document.querySelector('.results-section'), { scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff' }).then(tableCanvas => {
            yPosition = addImageToPDF(tableCanvas, yPosition);

            const barCanvas = document.getElementById('barChart');
            yPosition = addImageToPDF(barCanvas, yPosition);

            const pieCanvas = document.getElementById('pieChart');
            yPosition = addImageToPDF(pieCanvas, yPosition);

            const histCanvas = document.getElementById('histogram');
            addImageToPDF(histCanvas, yPosition);

            doc.save('Distribucion_de_frecuencia.pdf');
        });
    }

    function exportAsExcel() {
        const table = document.getElementById('frequencyTable');
        const wb = XLSX.utils.table_to_book(table);
        XLSX.writeFile(wb, 'distribucion_de_frecuencia.xlsx');
    }

    function exportAsImage() {
        const container = document.querySelector('.container');

        setTimeout(() => {
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.background = '#ffffff';
            tempDiv.style.padding = '20px';
            document.body.appendChild(tempDiv);

            const tableClone = document.querySelector('.results-section').cloneNode(true);
            tempDiv.appendChild(tableClone);

            const barCanvas = document.getElementById('barChart');
            const pieCanvas = document.getElementById('pieChart');
            const histCanvas = document.getElementById('histogram');

            const barImg = document.createElement('img');
            barImg.src = barCanvas.toDataURL('image/png');
            barImg.style.width = '100%';
            barImg.style.marginTop = '20px';
            tempDiv.appendChild(barImg);

            const pieImg = document.createElement('img');
            pieImg.src = pieCanvas.toDataURL('image/png');
            pieImg.style.width = '100%';
            pieImg.style.marginTop = '20px';
            tempDiv.appendChild(pieImg);

            const histImg = document.createElement('img');
            histImg.src = histCanvas.toDataURL('image/png');
            histImg.style.width = '100%';
            histImg.style.marginTop = '20px';
            tempDiv.appendChild(histImg);

            setTimeout(() => {
                html2canvas(tempDiv, { scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: tempDiv.scrollWidth,
                    height: tempDiv.scrollHeight }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'distribucion_de_frecuencia.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    document.body.removeChild(tempDiv);
                }).catch(error => {
                    console.error('Error capturando la imagen:', error);
                    alert('Error exportando la imagen. Porfavor pruebe de nuevo.');
                    document.body.removeChild(tempDiv);
                });
            }, 500);
        }, 500);
    }
});