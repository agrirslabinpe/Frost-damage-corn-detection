// ============================================================================
/* /////////////////////////////////////////////////////////////////////
// Script to assess vegetation spectral profiles
*////////////////////////////////////////////////////////////////////////
// Variables

var start_date = '2021-02-01'
var end_date = '2021-07-31'
var ROI = Lim_PR

// ================================================================================ 
// Corn area classification
var corn_mask = ee.Image("users/adami16/geada/ClassMilhoSafrinha"); 

//The corn area classification uses 'corn'=2 and 'not corn'=1. Therefore, we need to 
// ...subtract 1 to generate the mask
corn_mask = corn_mask.subtract(1).selfMask()

Map.addLayer(corn_mask, {palette:['darkgreen']}, "Corn Mask")

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
// ============================= NDVI TIME SERIES ==================================
//==================================================================================

// Function to adjust the Sentinel-2/MSI image date
function setDate(image){
  var date = ee.Date(image.get('system:time_start')).format('yyyy-MM-dd');
  return image.set({'date_acquired':ee.Date(image.get('system:time_start')).format('yyyy-MM-dd')});
}

// Obtain the Sentinel-2/MSI image collection
var S2_collection = ee.ImageCollection('COPERNICUS/S2_SR')
                .filterDate(start_date, end_date)
                .filterBounds(Lim_PR)
                // .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',5)
                .map(setDate);

// Obtain the date of all images in the collection
var datelist = ee.List(S2_collection.aggregate_array('date_acquired'))
                .distinct()
                .sort()

// For each date, mosaic the images of the same date and compute NDVI
var NDVI_collection = ee.ImageCollection(
  datelist.map(function(date_str){
    return ee.Image(S2_collection.filterMetadata('date_acquired','equals',date_str).mosaic())
            .clip(Lim_PR)
            .mask(corn_mask)
            .normalizedDifference(['B8', 'B4'])
            .rename('NDVI')
            .set('date', ee.Date(date_str))
  })
)

// Generate the time series plot for each region
var list_regions = [samples_frost_may25, samples_frost_jun30, samples_notaffected, samples_harvested]
var names_regions = ['Frost May-25', 'Frost Jun-30', 'Not Affected', 'Harvested']

for (var i=0; i<4; i++){
  var chart = ui.Chart.image.seriesByRegion({
    imageCollection: NDVI_collection,
    band: 'NDVI',
    regions: list_regions[i],
    reducer: ee.Reducer.mean(),
    scale: 10,
    xProperty: 'date'
  })
  .setOptions({
    title: names_regions[i],
    hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
    vAxis: {title: 'NDVI', titleTextStyle: {italic: false, bold: true}},
    lineWidth: 3,
  });
  print(chart);
}

/* 
 * Each of the 4 sets of time series values were downloaded and processed 
 * in Excel. The images that contained clouds were removed and the average 
 * NDVI plots were generated (Figure 8 of the paper)
 */
 
 