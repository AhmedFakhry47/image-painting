// Utility functions for clustering
class ClusteringUtils {
    // Euclidean distance calculation
    static distance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
        );
    }

    // Convert image data to pixel array
    static convertImageDataToPixels(imageData) {
        const pixels = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
            pixels.push([
                imageData.data[i],     // Red
                imageData.data[i + 1], // Green
                imageData.data[i + 2]  // Blue
            ]);
        }
        return pixels;
    }

    // Find optimal number of clusters (simplified Elbow Method)
    static findOptimalClusters(pixels, maxClusters = 10) {
        const distortions = [];
        
        for (let k = 2; k <= maxClusters; k++) {
            const { labels, centroids } = this.kMeansClustering(pixels, k);
            
            // Calculate distortion (sum of squared distances)
            const distortion = labels.reduce((sum, label, index) => {
                return sum + Math.pow(this.distance(pixels[index], centroids[label]), 2);
            }, 0);
            
            distortions.push(distortion);
        }
        
        // Find the "elbow" point (simplified)
        const optimalK = this.findElbowPoint(distortions);
        return optimalK;
    }

    // Simple elbow point detection
    static findElbowPoint(distortions) {
        let maxCurvature = 0;
        let optimalK = 2;

        for (let k = 2; k < distortions.length; k++) {
            const curvature = Math.abs(
                (distortions[k] - distortions[k-1]) / 
                (distortions[k-1] - distortions[k-2] || 1)
            );
            
            if (curvature > maxCurvature) {
                maxCurvature = curvature;
                optimalK = k + 1;
            }
        }

        return optimalK;
    }

    // K-Means Clustering implementation
    static kMeansClustering(pixels, k) {
        // Initialize centroids randomly
        const centroids = this.initializeCentroids(pixels, k);
        let labels = new Array(pixels.length).fill(0);
        let iterations = 0;
        const maxIterations = 100;

        while (iterations < maxIterations) {
            // Assign points to nearest centroid
            const newLabels = pixels.map(pixel => 
                centroids.reduce((minIndex, centroid, index, arr) => 
                    this.distance(pixel, centroid) < this.distance(pixel, arr[minIndex]) ? index : minIndex
                , 0)
            );

            // Check for convergence
            if (JSON.stringify(labels) === JSON.stringify(newLabels)) break;
            labels = newLabels;

            // Recalculate centroids
            centroids.forEach((_, centroidIndex) => {
                const clusterPoints = pixels.filter((_, index) => labels[index] === centroidIndex);
                
                if (clusterPoints.length > 0) {
                    centroids[centroidIndex] = clusterPoints.reduce((sum, point) => 
                        sum.map((val, i) => val + point[i]), 
                        new Array(pixels[0].length).fill(0)
                    ).map(val => val / clusterPoints.length);
                }
            });

            iterations++;
        }

        return { labels, centroids };
    }

    // Initialize centroids using k-means++
    static initializeCentroids(pixels, k) {
        const centroids = [pixels[Math.floor(Math.random() * pixels.length)]];

        while (centroids.length < k) {
            const distances = pixels.map(pixel => 
                Math.min(...centroids.map(centroid => this.distance(pixel, centroid)))
            );

            const totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
            const probabilities = distances.map(dist => dist / totalDistance);

            // Select next centroid based on weighted probability
            const cumulativeProbabilities = probabilities.reduce((acc, prob) => {
                acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + prob);
                return acc;
            }, []);

            const r = Math.random();
            const selectedIndex = cumulativeProbabilities.findIndex(p => p > r);
            centroids.push(pixels[selectedIndex]);
        }

        return centroids;
    }

    // Mean Shift Clustering implementation
    static meanShiftClustering(pixels, bandwidth = null) {
        // If bandwidth not provided, estimate it
        if (bandwidth === null) {
            const distances = [];
            for (let i = 0; i < pixels.length; i++) {
                for (let j = i + 1; j < pixels.length; j++) {
                    distances.push(this.distance(pixels[i], pixels[j]));
                }
            }
            distances.sort((a, b) => a - b);
            bandwidth = distances[Math.floor(distances.length * 0.1)];
        }

        const labels = new Array(pixels.length).fill(-1);
        const clusters = [];

        pixels.forEach((pixel, index) => {
            if (labels[index] !== -1) return; // Skip if already labeled

            let shifted = [...pixel];
            let prevShifted;

            do {
                prevShifted = [...shifted];
                
                // Calculate mean shift
                const nearPoints = pixels.filter(p => 
                    this.distance(p, shifted) <= bandwidth
                );

                shifted = nearPoints.reduce((sum, point) => 
                    sum.map((val, i) => val + point[i]), 
                    new Array(pixel.length).fill(0)
                ).map(val => val / nearPoints.length);
            } while (this.distance(shifted, prevShifted) > 0.1);

            // Find or create cluster
            let clusterIndex = clusters.findIndex(cluster => 
                this.distance(cluster, shifted) <= bandwidth
            );

            if (clusterIndex === -1) {
                clusterIndex = clusters.length;
                clusters.push(shifted);
            }

            labels[index] = clusterIndex;
        });

        return { labels, centroids: clusters };
    }

    // Visualize clustering results
    static visualizeClustering(imageData, labels, centroids) {
        const newImageData = new ImageData(imageData.width, imageData.height);
        
        for (let i = 0; i < labels.length; i++) {
            const clusterColor = centroids[labels[i]];
            newImageData.data[i * 4] = clusterColor[0];     // Red
            newImageData.data[i * 4 + 1] = clusterColor[1]; // Green
            newImageData.data[i * 4 + 2] = clusterColor[2]; // Blue
            newImageData.data[i * 4 + 3] = 255;             // Alpha
        }

        return newImageData;
    }
}

// Main processing function
async function processImage() {
    const fileInput = document.getElementById('file-input');
    const kClustersInput = document.getElementById('k-clusters');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload an image!');
        return;
    }

    // Read the image
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgElement = new Image();
        imgElement.onload = async function() {
            // Display original image
            document.getElementById('original-image').src = imgElement.src;

            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            ctx.drawImage(imgElement, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = ClusteringUtils.convertImageDataToPixels(imageData);

            // K-Means Clustering
            const kClusters = parseInt(kClustersInput.value);
            const { labels: kMeansLabels, centroids: kMeansCentroids } = 
                ClusteringUtils.kMeansClustering(pixels, kClusters);
            
            const kMeansImageData = ClusteringUtils.visualizeClustering(
                imageData, kMeansLabels, kMeansCentroids
            );

            // Mean Shift Clustering
            const { labels: meanShiftLabels, centroids: meanShiftCentroids } = 
                ClusteringUtils.meanShiftClustering(pixels);
            
            const meanShiftImageData = ClusteringUtils.visualizeClustering(
                imageData, meanShiftLabels, meanShiftCentroids
            );

            // Display clustered images
            const kMeansCanvas = document.createElement('canvas');
            kMeansCanvas.width = canvas.width;
            kMeansCanvas.height = canvas.height;
            const kMeansCtx = kMeansCanvas.getContext('2d');
            kMeansCtx.putImageData(kMeansImageData, 0, 0);
            document.getElementById('kmeans-image').src = kMeansCanvas.toDataURL();

            const meanShiftCanvas = document.createElement('canvas');
            meanShiftCanvas.width = canvas.width;
            meanShiftCanvas.height = canvas.height;
            const meanShiftCtx = meanShiftCanvas.getContext('2d');
            meanShiftCtx.putImageData(meanShiftImageData, 0, 0);
            document.getElementById('meanshift-image').src = meanShiftCanvas.toDataURL();
        };
        imgElement.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Event listener
document.getElementById('process-btn').addEventListener('click', processImage);
