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

    // Simulated K-Means (simplified version)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const clusteredData = simulateClustering(imageData, clusters); // Simulate clustering
    ctx.putImageData(clusteredData, 0, 0);
}

function applyMeanShiftClustering(img) {
    const canvas = document.getElementById("meanshiftCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Simulated Mean Shift Clustering (placeholder)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const clusteredData = simulateClustering(imageData, 5); // Simulate Mean Shift with 5 clusters
    ctx.putImageData(clusteredData, 0, 0);
}

function simulateClustering(imageData, clusters) {
    // Dummy implementation for clustering (Replace with real algorithms)
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
        const clusterValue = Math.floor((avg / 255) * clusters) * (255 / clusters);
        data[i] = data[i + 1] = data[i + 2] = clusterValue; // Grayscale-like clustering
    }
    return imageData;
}
