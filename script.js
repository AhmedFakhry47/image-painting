window.onload = function () {
    const imageInput = document.getElementById('image-input');
    const kMeansClustersInput = document.getElementById('kmeans-clusters');
    const processButton = document.getElementById('process-button');

    const originalCanvas = document.getElementById('original-image');
    const kMeansCanvas = document.getElementById('kmeans-image');
    const meanShiftCanvas = document.getElementById('meanshift-image');

    const originalContext = originalCanvas.getContext('2d');
    const kMeansContext = kMeansCanvas.getContext('2d');
    const meanShiftContext = meanShiftCanvas.getContext('2d');

    let imageData = null;

    // Load and display the image
    imageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const img = new Image();
            img.onload = function () {
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;
                originalContext.drawImage(img, 0, 0);
                imageData = img;
            };
            img.src = URL.createObjectURL(file);
        }
    });

    // Process Image for Clustering
    processButton.addEventListener('click', () => {
        if (!imageData) {
            alert('Please upload an image first!');
            return;
        }

        const kMeansClusters = parseInt(kMeansClustersInput.value);
        const image = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
        const imagePixels = image.data;

        // Convert image pixels to 2D array (pixels as rows, RGB values as columns)
        let pixels = [];
        for (let i = 0; i < imagePixels.length; i += 4) {
            pixels.push([imagePixels[i], imagePixels[i + 1], imagePixels[i + 2]]);
        }

        // Perform K-Means clustering
        const kmeansResult = kMeansClustering(pixels, kMeansClusters);
        const kMeansImageData = recreateImage(kmeansResult.labels, kmeansResult.centers, originalCanvas.width, originalCanvas.height);
        kMeansContext.putImageData(kMeansImageData, 0, 0);

        // Perform Mean Shift clustering
        const meanShiftResult = meanShiftClustering(pixels);
        const meanShiftImageData = recreateImage(meanShiftResult.labels, meanShiftResult.centers, originalCanvas.width, originalCanvas.height);
        meanShiftContext.putImageData(meanShiftImageData, 0, 0);
    });
};

// K-Means clustering implementation (Basic)
function kMeansClustering(pixels, k) {
    // Initialize random centers (just as a simple starting point)
    let centers = [];
    for (let i = 0; i < k; i++) {
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        centers.push(randomPixel);
    }

    let labels = new Array(pixels.length);
    let changed = true;
    while (changed) {
        changed = false;

        // Assign pixels to closest center
        for (let i = 0; i < pixels.length; i++) {
            let minDist = Infinity;
            let bestCenter = 0;
            for (let j = 0; j < k; j++) {
                const dist = Math.sqrt(Math.pow(pixels[i][0] - centers[j][0], 2) +
                                       Math.pow(pixels[i][1] - centers[j][1], 2) +
                                       Math.pow(pixels[i][2] - centers[j][2], 2));
                if (dist < minDist) {
                    minDist = dist;
                    bestCenter = j;
                }
            }
            if (labels[i] !== bestCenter) {
                labels[i] = bestCenter;
                changed = true;
            }
        }

        // Update centers
        for (let j = 0; j < k; j++) {
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let i = 0; i < pixels.length; i++) {
                if (labels[i] === j) {
                    sumR += pixels[i][0];
                    sumG += pixels[i][1];
                    sumB += pixels[i][2];
                    count++;
                }
            }
            if (count > 0) {
                centers[j] = [sumR / count, sumG / count, sumB / count];
            }
        }
    }

    return { labels: labels, centers: centers };
}

// Mean Shift clustering implementation (Basic)
function meanShiftClustering(pixels) {
    const bandwidth = 20;
    let labels = [];
    let centers = [];

    // Simple implementation of Mean Shift: Iterate over pixels and shift them to the nearest peak
    for (let i = 0; i < pixels.length; i++) {
        let pixel = pixels[i];
        let shift = pixel;
        let shifted = true;

        while (shifted) {
            shifted = false;
            let neighbors = [];
            for (let j = 0; j < pixels.length; j++) {
                const dist = Math.sqrt(Math.pow(pixel[0] - pixels[j][0], 2) +
                                       Math.pow(pixel[1] - pixels[j][1], 2) +
                                       Math.pow(pixel[2] - pixels[j][2], 2));
                if (dist < bandwidth) {
                    neighbors.push(pixels[j]);
                }
            }

            if (neighbors.length > 0) {
                const newShift = [
                    neighbors.reduce((sum, val) => sum + val[0], 0) / neighbors.length,
                    neighbors.reduce((sum, val) => sum + val[1], 0) / neighbors.length,
                    neighbors.reduce((sum, val) => sum + val[2], 0) / neighbors.length
                ];
                if (!arraysEqual(shift, newShift)) {
                    shifted = true;
                    shift = newShift;
                }
            }
        }

        centers.push(shift);
        labels.push(centers.length - 1);
    }

    return { labels: labels, centers: centers };
}

// Utility function to check array equality
function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
}

// Recreate image based on labels and cluster centers
function recreateImage(labels, centers, width, height) {
    const imgData = new ImageData(width, height);
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const center = centers[label];
        imgData.data[i * 4] = center[0];     // R
        imgData.data[i * 4 + 1] = center[1]; // G
        imgData.data[i * 4 + 2] = center[2]; // B
        imgData.data[i * 4 + 3] = 255;       // A (fully opaque)
    }
    return imgData;
}
