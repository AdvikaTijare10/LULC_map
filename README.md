# LULC_map

# 🌍 Land Use Land Cover (LULC) Classification – Pune Region

This project performs a **Land Use Land Cover (LULC)** classification for **Pune and its surrounding areas**, using **Sentinel-2 satellite imagery** and the **Random Forest classifier** on **Google Earth Engine (GEE)**. The output categorizes the region into four major land cover types:

- 🌊 **Water**
- 🌾 **Vegetation (including cropland)**
- 🏙️ **Built-up**
- 🏜️ **Barren land**

---

## 🗺️ Area of Interest (AOI)

The area covers **Pune, India**, using a polygon geometry (`aoi2`). The study focuses on Pune and its surrounding regions in the state of Maharashtra, India. The AOI spans approximately from longitude 73.32°E to 74.17°E and latitude 18.19°N to 18.85°N. This region covers:

Pune city and major urban zones like Pimpri-Chinchwad, Chakan, and Uruli Kanchan

Agricultural belts and rural outskirts including Saswad, Jejuri, and Theur

Western hilly and green regions like Lonavala, Mulshi, and Pirangut

This spatial extent provides a diverse landscape mix, making it ideal for LULC classification into water bodies, built-up areas, vegetation, and barren lands.

---

## 🛰️ Satellite Imagery Used

- **Dataset**: [COPERNICUS/S2_HARMONIZED](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_HARMONIZED)
- **Timeframe**: October 1, 2023 – December 30, 2023
- **Cloud Filter**: Less than 20% cloud cover
- **Resolution**: 10m to 20m (depending on the band)
- **Preprocessing**: 
  - Cloud masking using `QA60` band (bits 10 and 11)
  - Image clipped to AOI and mosaicked using `.median()`

-The actual satellite image of the area of interest -> [View Satellite Image](satelliteImagery.png)


## 📦 Feature Bands and Indices

The following spectral bands and indices were used as input features:

### 🔹 Spectral Bands
- `B2` (Blue)
- `B3` (Green)
- `B4` (Red)
- `B8` (NIR)
- `B11` (SWIR1)
- `B12` (SWIR2)

### 🔸 Indices
- **NDVI** – Vegetation health  
- **MNDWI** – Water presence  
- **NDBI** – Built-up density  
- **NDSLI** – Soil Line Index for barren areas  

---

## 🏷️ Land Cover Classes

| Class         | Value | Color Code | Best Bands |
|---------------|-------|------------|------------|
| Water         | 0     | `#2389da`  | **MNDWI** or B3-B8-B11 |
| Built-up      | 1     | `#ff0000`  | **NDBI** or B12-B11-B4 |
| Vegetation    | 2     | `#416422`  | **NDVI** or B8-B4-B3 |
| Barren Land   | 3     | `#C2B280`  | **NDSLI** or B11-B8-B2 |

---

## 📸 Sample Visualization Images

You can preview images that highlight training data and map layers:

| Description | Link |
|-------------|------------|
| Water Training Points Map | [Water](waterTP.png) |
| Vegetation Training Points Map | [Vegetation](greenLandTP.png) |
| Built-up Training Points Map | [Built-up](builtUpTP.png) |
| Barren Land Training Points Map | [Barren](barrenLandTP.png) |



## 🤖 Classifier Used

- **Random Forest Classifier (100 trees)**  
- Chosen for its high accuracy, robustness to overfitting, and ease of use with GEE.

> Random Forest works by building an ensemble of decision trees using random subsets of features and training data. It's highly suitable for remote sensing applications due to its ability to model complex class boundaries.

---

## 📊 Accuracy Assessment

- **Train/Test Split**: 80% training, 20% testing
- **Confusion Matrix**: Evaluates model predictions vs actual classes
- **Overall Accuracy**: ✅ ~**99.5%**
- **Kappa Coefficient**: 🤝 ~**0.99**

### 🔍 What These Metrics Mean:
- **Accuracy** measures the proportion of correctly predicted pixels out of all predictions.
- **Kappa** adjusts for agreement occurring by chance. A value close to 1 indicates almost perfect classification.
- **Confusion Matrix** shows per-class accuracy, helping assess where misclassifications happen.

---

## ✅ Final LULC Classification Map

A full classified map was generated using the trained model and added to the map viewer:

```javascript
Map.addLayer(lulc, {}, "LULC", true);

