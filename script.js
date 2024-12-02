document.getElementById("processButton").addEventListener("click", processImage);

function processImage() {
    const fileInput = document.getElementById("fileInput");
    const clusters = parseInt(document.getElementById("clusters").value);

    if (!fileInput.files[0]) {
        alert("Please upload an image!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            displayImage(img, "originalCanvas");
            applyKMeansClustering(img, clusters);
            applyMeanShiftClustering(img);
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function displayImage(img, canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
}

function applyKMeansClustering(img, clusters) {
    const canvas = document.getElementById("kmeansCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const clusteredData = simulateClustering(imageData, clusters); // K-Means simulation
    ctx.putImageData(clusteredData, 0, 0);
}

function applyMeanShiftClustering(img) {
    const canvas = document.getElementById("meanshiftCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const clusteredData = simulateMeanShift(imageData); // Mean Shift simulation
    ctx.putImageData(clusteredData, 0, 0);
}

// Simulated K-Means Clustering
function simulateClustering(imageData, clusters) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
        const clusterValue = Math.floor((avg / 255) * clusters) * (255 / clusters);
        data[i] = data[i + 1] = data[i + 2] = clusterValue; // Grayscale clustering
    }
    return imageData;
}

// Simulated Mean Shift Clustering
function simulateMeanShift(imageData) {
    const data = imageData.data;
    const bandwidth = 50; // Simulated bandwidth for mean shift
    const width = imageData.width;
    const height = imageData.height;

    // Create a copy of the image data
    const outputData = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
        // Apply a simple mean shift by averaging the neighborhood
        const x = (i / 4) % width;
        const y = Math.floor(i / 4 / width);

        const neighbors = getNeighbors(x, y, width, height, bandwidth, data);
        const meanColor = calculateMeanColor(neighbors);

        outputData[i] = meanColor[0];     // Red
        outputData[i + 1] = meanColor[1]; // Green
        outputData[i + 2] = meanColor[2]; // Blue
    }

    return new ImageData(outputData, width, height);
}

// Helper Function: Get neighbors for a given pixel
function getNeighbors(x, y, width, height, bandwidth, data) {
    const neighbors = [];
    for (let dx = -bandwidth; dx <= bandwidth; dx++) {
        for (let dy = -bandwidth; dy <= bandwidth; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const index = (ny * width + nx) * 4;
                neighbors.push([data[index], data[index + 1], data[index + 2]]);
            }
        }
    }
    return neighbors;
}

// Helper Function: Calculate mean color from neighbors
function calculateMeanColor(neighbors) {
    const meanColor = [0, 0, 0];
    neighbors.forEach(([r, g, b]) => {
        meanColor[0] += r;
        meanColor[1] += g;
        meanColor[2] += b;
    });
    meanColor[0] /= neighbors.length;
    meanColor[1] /= neighbors.length;
    meanColor[2] /= neighbors.length;
    return meanColor;
}
