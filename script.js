// Get elements from the DOM
const imageInput = document.getElementById('image-input');
const processButton = document.getElementById('process-button');
const originalImage = document.getElementById('original-image');
const kmeansCanvas = document.getElementById('kmeans-canvas');
const meanshiftCanvas = document.getElementById('meanshift-canvas');

// Function to load and display the selected image
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            // Adjust the canvas size to match the image
            kmeansCanvas.width = originalImage.width;
            kmeansCanvas.height = originalImage.height;
            meanshiftCanvas.width = originalImage.width;
            meanshiftCanvas.height = originalImage.height;
        };
    };
    reader.readAsDataURL(file);
}

// Function to apply K-Means clustering (dummy implementation for now)
function processKMeans() {
    const ctx = kmeansCanvas.getContext('2d');
    const image = originalImage;
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Apply K-Means algorithm (dummy: random color assignment)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.random() * 255;     // Red
        data[i + 1] = Math.random() * 255; // Green
        data[i + 2] = Math.random() * 255; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

// Function to apply Mean Shift clustering (dummy implementation for now)
function processMeanShift() {
    const ctx = meanshiftCanvas.getContext('2d');
    const image = originalImage;
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // Apply Mean Shift algorithm (dummy: random color assignment)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.random() * 255;     // Red
        data[i + 1] = Math.random() * 255; // Green
        data[i + 2] = Math.random() * 255; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
}

// Event listener for the image upload
imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        loadImage(file);
    }
});

// Event listener for the process button
processButton.addEventListener('click', function () {
    if (originalImage.src === "") {
        alert("Please upload an image first.");
        return;
    }

    processKMeans();
    processMeanShift();
});
