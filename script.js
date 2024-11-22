// Ensure the DOM is fully loaded before we start manipulating it
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

// K-Means clustering implementation (Placeholder for actual K-Means library)
function kMeansClustering(pixels, k) {
    const kmeans = new KMeans(k);
    const labels = kmeans.fit(pixels);
    return { labels: labels, centers: kmeans.clusterCenters() };
}

// Mean Shift clustering implementation (Placeholder for actual Mean Shift library)
function meanShiftClustering(pixels) {
    const meanShift = new MeanShift();
    const labels = meanShift.fit(pixels);
    return { labels: labels, centers: meanShift.clusterCenters() };
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
