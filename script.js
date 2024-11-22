const targetWidth = 255; // Target width for resizing
let image = null;

const imageInput = document.getElementById('image-input');
const originalCanvas = document.getElementById('original-image');
const kmeansCanvas = document.getElementById('kmeans-image');
const meanshiftCanvas = document.getElementById('meanshift-image');

const processButton = document.getElementById('process-button');

// Load the image into a canvas and resize it
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions to maintain aspect ratio
                const aspectRatio = img.height / img.width;
                const newWidth = targetWidth;
                const newHeight = Math.round(newWidth * aspectRatio);

                // Resize and display the original image
                originalCanvas.width = newWidth;
                originalCanvas.height = newHeight;

                const ctx = originalCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                // Extract image data for processing
                image = ctx.getImageData(0, 0, newWidth, newHeight);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Perform K-Means clustering
function kmeansClustering(pixels, k) {
    const points = [];
    for (let i = 0; i < pixels.data.length; i += 4) {
        points.push([pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]]);
    }

    const kmeans = new KMeans(k);
    kmeans.fit(points);

    const clusteredData = new Uint8ClampedArray(pixels.data.length);
    for (let i = 0; i < points.length; i++) {
        const cluster = kmeans.predict(points[i]);
        const [r, g, b] = kmeans.centroids[cluster];
        clusteredData.set([r, g, b, 255], i * 4);
    }

    return new ImageData(clusteredData, pixels.width, pixels.height);
}

// Perform MeanShift clustering
function meanshiftClustering(pixels) {
    const points = [];
    for (let i = 0; i < pixels.data.length; i += 4) {
        points.push([pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]]);
    }

    const meanshift = new MeanShift();
    meanshift.fit(points);

    const clusteredData = new Uint8ClampedArray(pixels.data.length);
    for (let i = 0; i < points.length; i++) {
        const cluster = meanshift.predict(points[i]);
        const [r, g, b] = meanshift.centroids[cluster];
        clusteredData.set([r, g, b, 255], i * 4);
    }

    return new ImageData(clusteredData, pixels.width, pixels.height);
}

// Process the image with K-Means and MeanShift
processButton.addEventListener('click', () => {
    if (!image) {
        alert('Please upload an image first!');
        return;
    }

    const k = 5; // Number of clusters for K-Means

    // Perform K-Means clustering
    const kmeansResult = kmeansClustering(image, k);
    kmeansCanvas.width = kmeansResult.width;
    kmeansCanvas.height = kmeansResult.height;
    kmeansCanvas.getContext('2d').putImageData(kmeansResult, 0, 0);

    // Perform MeanShift clustering
    const meanshiftResult = meanshiftClustering(image);
    meanshiftCanvas.width = meanshiftResult.width;
    meanshiftCanvas.height = meanshiftResult.height;
    meanshiftCanvas.getContext('2d').putImageData(meanshiftResult, 0, 0);
});
