const imageInput = document.getElementById('imageInput');
const clustersInput = document.getElementById('clusters');
const processButton = document.getElementById('processButton');
const originalCanvas = document.getElementById('originalCanvas');
const kmeansCanvas = document.getElementById('kmeansCanvas');
const meanshiftCanvas = document.getElementById('meanshiftCanvas');

let image = null;
const targetWidth = 255; // Target width for resizing

// Load the image into a canvas and resize it
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.height / img.width;
                const newWidth = targetWidth;
                const newHeight = Math.round(newWidth * aspectRatio);

                originalCanvas.width = newWidth;
                originalCanvas.height = newHeight;

                const ctx = originalCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                image = ctx.getImageData(0, 0, newWidth, newHeight);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Perform clustering
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

    const pixels = [];
    for (let i = 0; i < image.data.length; i += 4) {
        pixels.push([
            image.data[i],     // Red
            image.data[i + 1], // Green
            image.data[i + 2]  // Blue
        ]);
    }

    // K-Means clustering
    const kmeansPixels = kMeans(pixels, clusters);
    drawClusteredImage(kmeansPixels, image.width, image.height, kmeansCanvas);

    // Mean Shift clustering
    const meanshiftPixels = meanShift(pixels);
    drawClusteredImage(meanshiftPixels, image.width, image.height, meanshiftCanvas);
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

    return pixels.map((_, i) => centroids[assignments[i]]);
}

// Mean Shift Clustering
function meanShift(pixels, bandwidth = 40) {
    const centroids = [...pixels];
    const threshold = 1;

    let hasConverged = false;

    while (!hasConverged) {
        hasConverged = true;

        for (let i = 0; i < centroids.length; i++) {
            const centroid = centroids[i];
            const nearbyPoints = pixels.filter(p => euclideanDistance(p, centroid) < bandwidth);

            const newCentroid = nearbyPoints.reduce(
                (sum, p) => [sum[0] + p[0], sum[1] + p[1], sum[2] + p[2]],
                [0, 0, 0]
            ).map(sum => sum / nearbyPoints.length);

            if (euclideanDistance(centroid, newCentroid) > threshold) {
                centroids[i] = newCentroid;
                hasConverged = false;
            }
        }
    }

    return pixels.map(pixel =>
        centroids.reduce((closest, centroid) =>
            euclideanDistance(pixel, centroid) < euclideanDistance(pixel, closest)
                ? centroid
                : closest
        )
    );
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

