// ============================================================================
/* /////////////////////////////////////////////////////////////////////
// Script to calculate the percentage of each corn area affected or not
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
// ============================= CLASSIFICATION AREA ===============================
//==================================================================================

//==================================================================================
// Study area

var ROI_area_m2 = ROI.geometry().area()

var ROI_area_ha = ee.Number(ROI_area_m2).divide(1e4)
print('Study area (ha): ', ROI_area_ha)

//==================================================================================
// Corn area calculation

var corn_area = corn_mask.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: ROI.geometry(),
  scale: 20,
  maxPixels: 1e10
})

var corn_area_m2 = ee.Number(corn_area.get('classification'))

var corn_area_ha = corn_area_m2.divide(1e4)
print('Corn area (ha): ', corn_area_ha)

// Percentage of corn cultivated area in the study area
var corn_percentage = corn_area_ha.divide(ROI_area_ha).multiply(100)
print('Percentage of corn cultivated area (%): ', corn_percentage)

//==================================================================================
// Frost classification area

var classes_area = ee.Image.pixelArea().addBands(frost_classification).reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'class',
  }),
  geometry: ROI.geometry(),
  scale: 20,
  maxPixels: 1e10
}); 
print('Frost classification area (m²): ', classes_area)

// Calculate the area in hectares for each class
// Classification number: 1(harvested), 2(frost_May-25th), 3(frost_Jun-30th), 4(not frost-affected)
var area_class1 = ee.Number(ee.Dictionary(ee.List(classes_area.get('groups')).get(0)).get('sum')).divide(1e4)
var area_class2 = ee.Number(ee.Dictionary(ee.List(classes_area.get('groups')).get(1)).get('sum')).divide(1e4)
var area_class3 = ee.Number(ee.Dictionary(ee.List(classes_area.get('groups')).get(2)).get('sum')).divide(1e4)
var area_class4 = ee.Number(ee.Dictionary(ee.List(classes_area.get('groups')).get(3)).get('sum')).divide(1e4)

print('Harvested area (ha): ', area_class1)
print('May-25th frost area (ha): ', area_class2)
print('Jun-30th frost area (ha): ', area_class3)
print('Not frost-affected area (ha): ', area_class4)

// Calculate the percentage of each corn area affected or not
var percentage_class1 = area_class1.divide(corn_area_ha).multiply(100)
var percentage_class2 = area_class2.divide(corn_area_ha).multiply(100)
var percentage_class3 = area_class3.divide(corn_area_ha).multiply(100)
var percentage_class4 = area_class4.divide(corn_area_ha).multiply(100)

print('Percentage of harvested corn area (%): ', percentage_class1)
print('Percentage of corn area affected by May-25th frost (%): ', percentage_class2)
print('Percentage of corn area affected by Jun-30th frost (%): ', percentage_class3)
print('Percentage of not frost-affected corn area (%): ', percentage_class4)


