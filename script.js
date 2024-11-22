document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const fileName = file ? file.name : "No file chosen";
    document.getElementById('file-name').textContent = fileName;

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = new Image();
            image.onload = function() {
                // Resize the image to have a width of 255px while maintaining aspect ratio
                const targetWidth = 255;
                const scale = targetWidth / image.width;
                const targetHeight = image.height * scale;

                // Set the image source in the HTML
                const imgElement = document.getElementById('original-image');
                imgElement.src = e.target.result;
                imgElement.width = targetWidth;
                imgElement.height = targetHeight;
            }
            image.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('process-button').addEventListener('click', function() {
    const fileInput = document.getElementById('image-input');
    const kMeansClusters = document.getElementById('kmeans-clusters').value;

    if (!fileInput.files[0]) {
        alert("Please select an image first.");
        return;
    }

    const originalImage = document.getElementById('original-image');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);

    // Perform K-Means clustering
    processKMeans(canvas, kMeansClusters);
    // Perform Mean Shift clustering
    processMeanShift(canvas);
});

function processKMeans(canvas, k) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Example: This would be your K-Means clustering implementation
    // For simplicity, I'm just creating a dummy clustered image.
    // You should replace this with your actual K-Means clustering code.
    for (let i = 0; i < data.length; i += 4) {
        // Modify the image data to simulate clustering
        data[i] = Math.random() * 255;     // Red
        data[i + 1] = Math.random() * 255; // Green
        data[i + 2] = Math.random() * 255; // Blue
    }
    ctx.putImageData(imageData, 0, 0);

    const kmeansImage = document.getElementById('kmeans-image');
    kmeansImage.src = canvas.toDataURL();
}

function processMeanShift(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Example: This would be your Mean Shift clustering implementation
    // For simplicity, I'm just creating a dummy clustered image.
    // You should replace this with your actual Mean Shift clustering code.
    for (let i = 0; i < data.length; i += 4) {
        // Modify the image data to simulate clustering
        data[i] = Math.random() * 255;     // Red
        data[i + 1] = Math.random() * 255; // Green
        data[i + 2] = Math.random() * 255; // Blue
    }
    ctx.putImageData(imageData, 0, 0);

    const meanshiftImage = document.getElementById('meanshift-image');
    meanshiftImage.src = canvas.toDataURL();
}
