from flask import Flask, request, jsonify, send_file
import cv2
import numpy as np
from sklearn.cluster import KMeans
from sklearn.cluster import MeanShift, estimate_bandwidth
from sklearn.metrics import silhouette_score
from io import BytesIO
from PIL import Image

app = Flask(__name__)

# Functions for image processing and clustering
def load_image(file):
    """Load an image from an uploaded file and convert it to RGB format."""
    image = Image.open(file)
    image = image.convert('RGB')
    image = np.array(image)
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert to BGR for OpenCV compatibility

def preprocess_image(image):
    """Convert the image to Lab color space and reshape it."""
    lab_image = cv2.cvtColor(image, cv2.COLOR_BGR2Lab)  # Convert to Lab color space
    height, width, _ = lab_image.shape
    reshaped_image = lab_image.reshape((-1, 3))  # Pixels as rows, Lab as columns
    return reshaped_image, (height, width, 3)

def find_optimal_clusters(pixels, max_clusters=10):
    """Determine the optimal number of clusters using Silhouette Score."""
    silhouette_scores = []
    cluster_range = range(2, max_clusters + 1)

    for k in cluster_range:
        kmeans = KMeans(n_clusters=k, random_state=42)
        kmeans.fit(pixels)
        silhouette_scores.append(silhouette_score(pixels, kmeans.labels_))

    optimal_k = cluster_range[np.argmax(silhouette_scores)]
    return optimal_k

def kmeans_clustering(pixels, n_clusters):
    """Apply K-Means clustering to the image pixels."""
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    kmeans.fit(pixels)
    return kmeans.labels_, kmeans.cluster_centers_

def mean_shift_clustering(pixels):
    """Apply Mean Shift clustering to the image pixels."""
    bandwidth = estimate_bandwidth(pixels, quantile=0.1, n_samples=500)
    mean_shift = MeanShift(bandwidth=bandwidth, bin_seeding=True)
    mean_shift.fit(pixels)
    return mean_shift.labels_, mean_shift.cluster_centers_

def recreate_image(labels, centers, dimensions):
    """Recreate the image from labels and cluster centers."""
    centers_rgb = cv2.cvtColor(centers[np.newaxis, :, :].astype(np.uint8), cv2.COLOR_Lab2RGB)[0]
    clustered_pixels = centers_rgb[labels].astype(np.uint8)
    return clustered_pixels.reshape(dimensions)

@app.route('/')
def index():
    return """
    <!doctype html>
    <title>Image Clustering</title>
    <h1>Upload an image to perform clustering</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="image" accept="image/*" required>
        <select name="clustering_type">
            <option value="kmeans">K-Means</option>
            <option value="meanshift">Mean Shift</option>
        </select>
        <button type="submit">Upload</button>
    </form>
    """

@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    clustering_type = request.form.get('clustering_type', 'kmeans')

    # Step 1: Load and preprocess the image
    image = load_image(file)
    pixels, dimensions = preprocess_image(image)

    # Step 2: Perform clustering
    if clustering_type == 'kmeans':
        optimal_clusters = find_optimal_clusters(pixels)
        labels, centers = kmeans_clustering(pixels, optimal_clusters)
    else:
        labels, centers = mean_shift_clustering(pixels)

    # Step 3: Recreate the clustered image
    clustered_image = recreate_image(labels, centers, dimensions)

    # Step 4: Convert to in-memory file
    clustered_image_rgb = cv2.cvtColor(clustered_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(clustered_image_rgb)
    img_io = BytesIO()
    pil_image.save(img_io, 'JPEG', quality=85)
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
