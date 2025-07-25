//area of interest->showing area in and around Pune
var aoi=aoi2;

var imagery = ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
  .filterDate("2023-10-01", "2023-12-30")
  // Pre-filter to get less cloudy granules.
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
  .filterBounds(aoi)
  .map(maskS2clouds)
  .map(function (img) {
    return img.clip(aoi);
  })
  .median();
imagery = selectBands(imagery);
print(imagery);

// visualize imagery
Map.addLayer(imagery, imageParam , "dataset_rgb", true);

//merging all the training points
var sample=water.merge(greenLand).merge(builtUp).merge(barrenLand).randomColumn();

// split train and test
var train = sample.filter(ee.Filter.lte("random", 0.8));
var test = sample.filter(ee.Filter.gt("random", 0.8));

// Extract image values
var trainSample = imagery.sampleRegions({
  collection: train,
  scale: 10,
  properties: ["class"],
});
var testSample = imagery.sampleRegions({
  collection: test,
  scale: 10,
  properties: ["class"],
});

// Output (trainSample) looks like this:
// B4 (Red)	B3 (Green)	B2 (Blue)	class
// 1200      	1400	      1300	    0

//Model training
var rf_model = ee.Classifier.smileRandomForest(100).train(
  trainSample,
  "class",
  imagery.bandNames() //input features
);

//Accuracy test
var cm = testSample
  .classify(rf_model, "predict")
  .errorMatrix("class", "predict");
  
print("Confusion matrix", cm, "Accuracy", cm.accuracy(), "Kappa", cm.kappa());

var legend = {
  LULC_class_values: [0, 1, 2, 3],
  LULC_class_palette: [
    "2389da", //water
    "ff0000", //builtup
    "416422", // greenLand
    "C2B280", // barrenLand
    
  ],
};
var lulc = imagery.classify(rf_model, "LULC").toByte().set(legend);
Map.addLayer(lulc, {}, "lulc", true);


//==================================================

function maskS2clouds(image) {
  var qa = image.select("QA60");

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa
    .bitwiseAnd(cloudBitMask)
    .eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

//========================================================================
// function to select the required bands and add NDBI, NDVI, MNDWI indices
//========================================================================
function selectBands(image) {
  var ndvi = image
    .expression("(NIR - RED) / (NIR + RED)", {
      NIR: image.select("B8"),
      RED: image.select("B4"),
    })
    .rename("NDVI");

  var ndbi = image
    .expression("(SWIR - NIR) / (SWIR + NIR)", {
      NIR: image.select("B8"),
      SWIR: image.select("B11"),
    })
    .rename("NDBI");

  var mndwi = image
    .expression("(GREEN - SWIR1) / (GREEN + SWIR1)", {
      GREEN: image.select("B3"),
      SWIR1: image.select("B11"),
    })
    .rename("MNDWI");

  var ndsli = image
    .expression("(RED - SWIR1) / (RED + SWIR1)", {
      RED: image.select("B4"),
      SWIR1: image.select("B11"),
    })
    .rename("NDSLI");

  //required bands selection
  var bands = ["B4", "B3", "B2", "B8", "B11", "B12"];
  image = image.select(bands);

  // add NDVI, NDBI, NDSLI bands to image
  image = image.addBands(ee.Image([ndvi, mndwi, ndbi, ndsli]));
  return image;
}
