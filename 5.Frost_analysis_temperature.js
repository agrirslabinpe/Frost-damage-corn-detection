// ============================================================================
/* /////////////////////////////////////////////////////////////////////
// Script to analyze frost damage regarding temperature data
*////////////////////////////////////////////////////////////////////////

// Variables

// var start_date = '2021-05-15'
// var end_date = '2021-06-05'
var start_date = '2021-06-20'
var end_date = '2021-07-10'
var ROI = Lim_PR

// ================================================================================ 
// Corn area classification
var corn_mask = ee.Image("users/adami16/geada/ClassMilhoSafrinha"); 

//The corn area classification uses 'corn'=2 and 'not corn'=1. Therefore, we need to 
// ...subtract 1 to generate the mask
corn_mask = corn_mask.subtract(1).selfMask()

Map.addLayer(corn_mask, {palette:['darkgreen']}, "Corn Mask")

//==================================================================================
// Digital Elevation Model (DEM)

var DEM_corn = DEM.mask(corn_mask)
var pal = ['77daff','2784c4','52ff31','2c6607','ff7d33','c43e16','ff6850','ffdbc2']

// Obtain min and max DEM values
var min_max = DEM_corn.reduceRegion({reducer:ee.Reducer.minMax(), geometry:ROI, maxPixels:1e13})
print('min and max values of DEM:', min_max)

Map.addLayer(DEM_corn, {min: 107, max: 910, palette: pal}, 'DEM_corn')

//==================================================================================
// Frost classification

var frost_classification = ee.Image("users/adami16/geada/ClassificaMilhoGeada").mask(corn_mask);

// Visualize parameters 
var iVisPar = {
  "opacity":1,
  "bands":["classification"],
  "min":1,"max":4,
  "palette": ["06ffe8","e404ff","110eff","06ff19"]
}; // harvested(pink); frost May-25th(light blue); frost Jun-30th(dark blue); not frost-affected(green)

Map.addLayer(frost_classification, iVisPar, 'Frost Classification')


//==================================================================================
// ============================= MIN TEMPERATURES ==================================
//==================================================================================

//==================================================================================
//  MODIS LST_min image

// Get the minimum temperature for each pixel in the study range
var LST_min = MOD_LST
  .filterDate(start_date, end_date)
  .filterBounds(ROI)
  .select('LST_Night_1km')
  .min()
  .multiply(0.02)   // Band scale
  .subtract(273.15) // Convert to Celsius
  .clip(ROI)
  .mask(corn_mask)

// Add LST min image to map
Map.addLayer(LST_min, {min: -2, max: 12, palette:['1b2eff','4cceff','b8ecff','ff7b2f','ff5029','ff1f15']}, 'LST_min', false);
Map.centerObject(ROI, 8)

//==================================================================================
// MODIS LST collection

var LST = MOD_LST
  .filterDate(start_date, end_date)
  .filterBounds(ROI)
  .select('LST_Night_1km')
  .map(function(image){
    return image
    .multiply(0.02)   // Band scale
    .subtract(273.15) // Convert to Celsius
    .clip(ROI)
    .mask(corn_mask)
    .copyProperties(image, ['system:time_start'])
  });
  
// ============================================================================
// Generate the collection chart based on the minimum values
var LST_chart = 
  ui.Chart.image.series(
    LST, 
    ROI, 
    ee.Reducer.min(), 
    250, 
    "system:time_start"
  )
  .setOptions({
    title: 'Minimum Temperature',
    hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
    vAxis: {title: 'Temperature (°C)', titleTextStyle: {italic: false, bold: true}},
    lineWidth: 3,
    colors: ['blue']
  });
print(LST_chart);



//============================================================================
// Export images to Asset

Export.image.toAsset({
  image: LST_min,
  description: 'Corn_temperature',
  scale: 250,
  region: ROI,
  maxPixels:1e13
});

Export.image.toAsset({
  image: DEM_corn,
  description: 'DEM_corn',
  scale: 30,
  region: ROI,
  maxPixels:1e13
});


//============================================================================
// Export images to drive

var general = LST_min.toFloat().addBands(DEM_corn.toFloat()).addBands(frost_classification.toFloat())

Export.image.toDrive({
  image: LST_min,
  description: 'Corn_temperature_drive',
  scale: 250,
  region: ROI,
  maxPixels:1e13,
  folder: "Geada_paper",
  fileNamePrefix: "Corn_temperature_mask",
  fileFormat:'GeoTIFF'
});

Export.image.toDrive({
  image: DEM_corn,
  description: 'DEM_corn_drive',
  scale: 30,
  region: ROI,
  maxPixels:1e13,
  folder: "Geada_paper",
  fileNamePrefix: "DEM_corn_mask",
  fileFormat:'GeoTIFF'
});

Export.image.toDrive({
  image: frost_classification.toInt(),
  description: 'frost_classification_drive',
  scale: 20,
  region: ROI,
  maxPixels:1e13,
  folder: "Geada_paper",
  fileNamePrefix: "frost_classification_corn_mask",
  fileFormat:'GeoTIFF'
});

Export.image.toDrive({
  image: general,
  description: 'general_drive',
  scale: 20,
  region: ROI,
  maxPixels:1e13,
  folder: "Geada_paper",
  fileNamePrefix: "general_corn_mask",
  fileFormat:'GeoTIFF'
});


//============================================================================
// Generate the collection chart based on the minimum values of the pixel where the station is located

// Create the station location
var station_location = ee.FeatureCollection(ee.Geometry.Point(-54.02, -24.56));

var LST_station_chart = 
  ui.Chart.image.series({
    imageCollection: LST, 
    region: station_location, 
    reducer: ee.Reducer.min(),
    xProperty: "system:time_start"
  })
  .setOptions({
    title: 'Minimum Temperature in Station Location',
    hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
    vAxis: {title: 'Temperature (°C)', titleTextStyle: {italic: false, bold: true}},
    lineWidth: 3,
    colors: ['orange']
  });
print(LST_station_chart);