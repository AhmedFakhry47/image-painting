const imageInput = document.getElementById('imageInput');
const clustersInput = document.getElementById('clusters');
const processButton = document.getElementById('processButton');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');

let image = null;

// Load the image into a canvas
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const ctx = originalCanvas.getContext('2d');
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                image = img;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Perform K-Means Clustering
processButton.addEventListener('click', () => {
    if (!image) {
        alert('Please upload an image first!');
        return;
    }

    const clusters = parseInt(clustersInput.value);
    if (clusters < 2 || clusters > 10) {
        alert('Clusters must be between 2 and 10.');
        return;
    }

    const ctx = originalCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const pixels = [];
    
    // Extract pixel data
    for (let i = 0; i < imgData.data.length; i += 4) {
        pixels.push([
            imgData.data[i],     // Red
            imgData.data[i + 1], // Green
            imgData.data[i + 2]  // Blue
        ]);
    }

    // Run K-Means Clustering
    const clusteredPixels = kMeans(pixels, clusters);

    // Recreate the image with clustered colors
    const newImgData = ctx.createImageData(imgData.width, imgData.height);
    for (let i = 0; i < clusteredPixels.length; i++) {
        const [r, g, b] = clusteredPixels[i];
        newImgData.data[i * 4] = r;
        newImgData.data[i * 4 + 1] = g;
        newImgData.data[i * 4 + 2] = b;
        newImgData.data[i * 4 + 3] = 255; // Alpha channel
    }

    // Draw the processed image
    const processedCtx = processedCanvas.getContext('2d');
    processedCanvas.width = imgData.width;
    processedCanvas.height = imgData.height;
    processedCtx.putImageData(newImgData, 0, 0);
});

// K-Means Algorithm
function kMeans(pixels, k) {
    const centroids = initializeCentroids(pixels, k);
    let assignments = new Array(pixels.length).fill(-1);
    let hasChanged = true;

    while (hasChanged) {
        hasChanged = false;

        // Assign pixels to nearest centroid
        for (let i = 0; i < pixels.length; i++) {
            const distances = centroids.map(centroid => euclideanDistance(pixels[i], centroid));
            const newAssignment = distances.indexOf(Math.min(...distances));
            if (assignments[i] !== newAssignment) {
                assignments[i] = newAssignment;
                hasChanged = true;
            }
        }

        // Recalculate centroids
        const newCentroids = Array.from({ length: k }, () => [0, 0, 0, 0]); // [rSum, gSum, bSum, count]
        for (let i = 0; i < pixels.length; i++) {
            const cluster = assignments[i];
            const [r, g, b] = pixels[i];
            newCentroids[cluster][0] += r;
            newCentroids[cluster][1] += g;
            newCentroids[cluster][2] += b;
            newCentroids[cluster][3] += 1;
        }

        for (let i = 0; i < k; i++) {
            const [rSum, gSum, bSum, count] = newCentroids[i];
            centroids[i] = count > 0 ? [rSum / count, gSum / count, bSum / count] : centroids[i];
        }
    }

    // Recolor pixels
    return pixels.map((_, i) => centroids[assignments[i]]);
}

function initializeCentroids(pixels, k) {
    const centroids = [];
    const usedIndices = new Set();
    while (centroids.length < k) {
        const idx = Math.floor(Math.random() * pixels.length);
        if (!usedIndices.has(idx)) {
            centroids.push(pixels[idx]);
            usedIndices.add(idx);
        }
    }
    return centroids;
}

function euclideanDistance(p1, p2) {
    return Math.sqrt(
        Math.pow(p1[0] - p2[0], 2) +
        Math.pow(p1[1] - p2[1], 2) +
        Math.pow(p1[2] - p2[2], 2)
    );
}
