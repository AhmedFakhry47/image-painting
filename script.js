document.getElementById("processButton").addEventListener("click", processImage);

function processImage() {
    const fileInput = document.getElementById("fileInput");

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
            generateKMeansResults(img);
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

function generateKMeansResults(img) {
    const resultsDiv = document.getElementById("kmeansResults");
    resultsDiv.innerHTML = ""; // Clear previous results

    for (let k = 1; k <= 10; k++) {
        // Create a new canvas for each k value
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Get image data and apply K-Means clustering
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const clusteredData = simulateClustering(imageData, k);
        ctx.putImageData(clusteredData, 0, 0);

        // Add the canvas to the results div
        const container = document.createElement("div");
        container.style.margin = "20px";
        const label = document.createElement("p");
        label.textContent = `k = ${k}`;
        container.appendChild(label);
        container.appendChild(canvas);

        resultsDiv.appendChild(container);
    }
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
