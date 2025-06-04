/* /////////////////////////////////////////////////////////////////////
// Script to map frost damage on corn area
*////////////////////////////////////////////////////////////////////////

var dini = '2021-02-01'; // initial date of Sentinel-2/MSI images
var dfim = '2021-08-31'; // final date of Sentinel-2/MSI images
var lim = ee.FeatureCollection("users/adami16/geada/OestePR"); // study area limits
var ms = ee.Image("users/adami16/geada/ClassMilhoSafrinha"); // corn map area
var per = ee.List.sequence(0, 100, 10); // decis list

//Training data
var colh = ee.FeatureCollection("users/adami16/geada/colhido"); //harvested corn
var g255 = ee.FeatureCollection("users/adami16/geada/geada_25_05"); //corn affected by frosts on May-25th
var g306 = ee.FeatureCollection("users/adami16/geada/geada_30_06"); //corn affected by frosts on Jun-30th
var naog = ee.FeatureCollection("users/adami16/geada/nao_afetado"); //not frost-affected corn

/////////////////////////////////////////////////////////////////////////////////
//               Functions
/////////////////////////////////////////////////////////////////////////////////

//Function to add spectral indices
function addIndices(image){
  return image.addBands([
    image.select('B8','B3').normalizedDifference().multiply(10000).add(10000).rename('GNDVI'),
    image.select('B8','B4').normalizedDifference().multiply(10000).add(10000).rename('NDVI'),
    image.select('B11','B12').normalizedDifference().multiply(10000).add(10000).rename('NDWI')]);
}

// Function to add a code to each kind of training data
function addcolh(f){
  return f.set('_value',1);
}
function addg255(f){
  return f.set('_value',2);
}
function addg306(f){
  return f.set('_value',3);
}
function addmng(f){
  return f.set('_value',4);
}

/////////////////////////////////////////////////////////////////////////////////
//               Data
/////////////////////////////////////////////////////////////////////////////////

//Select the images for the mapping procedure
var s2t = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(lim)
            .filterDate(dini,dfim)
            .select(['B3','B4','B5','B6','B7','B8','B8A','B11','B12'])
            .map(addIndices);

var pregeada = s2t.filterDate(dini,'2021-05-24')
                .reduce(ee.Reducer.percentile(per))
                .rename(['B3_pg_P0','B3_pg_P10','B3_pg_P20','B3_pg_P30','B3_pg_P40','B3_pg_P50','B3_pg_P60','B3_pg_P70','B3_pg_P80','B3_pg_P90','B3_pg_P100',
                'B4_pg_P0','B4_pg_P10','B4_pg_P20','B4_pg_P30','B4_pg_P40','B4_pg_P50','B4_pg_P60','B4_pg_P70','B4_pg_P80','B4_pg_P90','B4_pg_P100',
                'B5_pg_P0','B5_pg_P10','B5_pg_P20','B5_pg_P30','B5_pg_P40','B5_pg_P50','B5_pg_P60','B5_pg_P70','B5_pg_P80','B5_pg_P90','B5_pg_P100',
                'B6_pg_P0','B6_pg_P10','B6_pg_P20','B6_pg_P30','B6_pg_P40','B6_pg_P50','B6_pg_P60','B6_pg_P70','B6_pg_P80','B6_pg_P90','B6_pg_P100',
                'B7_pg_P0','B7_pg_P10','B7_pg_P20','B7_pg_P30','B7_pg_P40','B7_pg_P50','B7_pg_P60','B7_pg_P70','B7_pg_P80','B7_pg_P90','B7_pg_P100',
                'B8_pg_P0','B8_pg_P10','B8_pg_P20','B8_pg_P30','B8_pg_P40','B8_pg_P50','B8_pg_P60','B8_pg_P70','B8_pg_P80','B8_pg_P90','B8_pg_P100',
                'B8A_pg_P0','B8A_pg_P10','B8A_pg_P20','B8A_pg_P30','B8A_pg_P40','B8A_pg_P50','B8A_pg_P60','B8A_pg_P70','B8A_pg_P80','B8A_pg_P90','B8A_pg_P100',
                'B11_pg_P0','B11_pg_P10','B11_pg_P20','B11_pg_P30','B11_pg_P40','B11_pg_P50','B11_pg_P60','B11_pg_P70','B11_pg_P80','B11_pg_P90','B11_pg_P100',
                'B12_pg_P0','B12_pg_P10','B12_pg_P20','B12_pg_P30','B12_pg_P40','B12_pg_P50','B12_pg_P60','B12_pg_P70','B12_pg_P80','B12_pg_P90','B12_pg_P100',
                'GNDVI_pg_P0','GNDVI_pg_P10','GNDVI_pg_P20','GNDVI_pg_P30','GNDVI_pg_P40','GNDVI_pg_P50','GNDVI_pg_P60','GNDVI_pg_P70','GNDVI_pg_P80','GNDVI_pg_P90','GNDVI_pg_P100',
                'NDVI_pg_P0','NDVI_pg_P10','NDVI_pg_P20','NDVI_pg_P30','NDVI_pg_P40','NDVI_pg_P50','NDVI_pg_P60','NDVI_pg_P70','NDVI_pg_P80','NDVI_pg_P90','NDVI_pg_P100',
                'NDWI_pg_P0','NDWI_pg_P10','NDWI_pg_P20','NDWI_pg_P30','NDWI_pg_P40','NDWI_pg_P50','NDWI_pg_P60','NDWI_pg_P70','NDWI_pg_P80','NDWI_pg_P90','NDWI_pg_P100']);                

var geada25 = s2t.filterDate('2021-05-25','2021-06-29')
                .reduce(ee.Reducer.percentile(per))
                .rename(['B3_g25_P0','B3_g25_P10','B3_g25_P20','B3_g25_P30','B3_g25_P40','B3_g25_P50','B3_g25_P60','B3_g25_P70','B3_g25_P80','B3_g25_P90','B3_g25_P100',
                'B4_g25_P0','B4_g25_P10','B4_g25_P20','B4_g25_P30','B4_g25_P40','B4_g25_P50','B4_g25_P60','B4_g25_P70','B4_g25_P80','B4_g25_P90','B4_g25_P100',
                'B5_g25_P0','B5_g25_P10','B5_g25_P20','B5_g25_P30','B5_g25_P40','B5_g25_P50','B5_g25_P60','B5_g25_P70','B5_g25_P80','B5_g25_P90','B5_g25_P100',
                'B6_g25_P0','B6_g25_P10','B6_g25_P20','B6_g25_P30','B6_g25_P40','B6_g25_P50','B6_g25_P60','B6_g25_P70','B6_g25_P80','B6_g25_P90','B6_g25_P100',
                'B7_g25_P0','B7_g25_P10','B7_g25_P20','B7_g25_P30','B7_g25_P40','B7_g25_P50','B7_g25_P60','B7_g25_P70','B7_g25_P80','B7_g25_P90','B7_g25_P100',
                'B8_g25_P0','B8_g25_P10','B8_g25_P20','B8_g25_P30','B8_g25_P40','B8_g25_P50','B8_g25_P60','B8_g25_P70','B8_g25_P80','B8_g25_P90','B8_g25_P100',
                'B8A_g25_P0','B8A_g25_P10','B8A_g25_P20','B8A_g25_P30','B8A_g25_P40','B8A_g25_P50','B8A_g25_P60','B8A_g25_P70','B8A_g25_P80','B8A_g25_P90','B8A_g25_P100',
                'B11_g25_P0','B11_g25_P10','B11_g25_P20','B11_g25_P30','B11_g25_P40','B11_g25_P50','B11_g25_P60','B11_g25_P70','B11_g25_P80','B11_g25_P90','B11_g25_P100',
                'B12_g25_P0','B12_g25_P10','B12_g25_P20','B12_g25_P30','B12_g25_P40','B12_g25_P50','B12_g25_P60','B12_g25_P70','B12_g25_P80','B12_g25_P90','B12_g25_P100',
                'GNDVI_g25_P0','GNDVI_g25_P10','GNDVI_g25_P20','GNDVI_g25_P30','GNDVI_g25_P40','GNDVI_g25_P50','GNDVI_g25_P60','GNDVI_g25_P70','GNDVI_g25_P80','GNDVI_g25_P90','GNDVI_g25_P100',
                'NDVI_g25_P0','NDVI_g25_P10','NDVI_g25_P20','NDVI_g25_P30','NDVI_g25_P40','NDVI_g25_P50','NDVI_g25_P60','NDVI_g25_P70','NDVI_g25_P80','NDVI_g25_P90','NDVI_g25_P100',
                'NDWI_g25_P0','NDWI_g25_P10','NDWI_g25_P20','NDWI_g25_P30','NDWI_g25_P40','NDWI_g25_P50','NDWI_g25_P60','NDWI_g25_P70','NDWI_g25_P80','NDWI_g25_P90','NDWI_g25_P100']);                

var geada30 = s2t.filterDate('2021-06-30',dfim)
                .reduce(ee.Reducer.percentile(per))
                .rename(['B3_g30_P0','B3_g30_P10','B3_g30_P20','B3_g30_P30','B3_g30_P40','B3_g30_P50','B3_g30_P60','B3_g30_P70','B3_g30_P80','B3_g30_P90','B3_g30_P100',
                'B4_g30_P0','B4_g30_P10','B4_g30_P20','B4_g30_P30','B4_g30_P40','B4_g30_P50','B4_g30_P60','B4_g30_P70','B4_g30_P80','B4_g30_P90','B4_g30_P100',
                'B5_g30_P0','B5_g30_P10','B5_g30_P20','B5_g30_P30','B5_g30_P40','B5_g30_P50','B5_g30_P60','B5_g30_P70','B5_g30_P80','B5_g30_P90','B5_g30_P100',
                'B6_g30_P0','B6_g30_P10','B6_g30_P20','B6_g30_P30','B6_g30_P40','B6_g30_P50','B6_g30_P60','B6_g30_P70','B6_g30_P80','B6_g30_P90','B6_g30_P100',
                'B7_g30_P0','B7_g30_P10','B7_g30_P20','B7_g30_P30','B7_g30_P40','B7_g30_P50','B7_g30_P60','B7_g30_P70','B7_g30_P80','B7_g30_P90','B7_g30_P100',
                'B8_g30_P0','B8_g30_P10','B8_g30_P20','B8_g30_P30','B8_g30_P40','B8_g30_P50','B8_g30_P60','B8_g30_P70','B8_g30_P80','B8_g30_P90','B8_g30_P100',
                'B8A_g30_P0','B8A_g30_P10','B8A_g30_P20','B8A_g30_P30','B8A_g30_P40','B8A_g30_P50','B8A_g30_P60','B8A_g30_P70','B8A_g30_P80','B8A_g30_P90','B8A_g30_P100',
                'B11_g30_P0','B11_g30_P10','B11_g30_P20','B11_g30_P30','B11_g30_P40','B11_g30_P50','B11_g30_P60','B11_g30_P70','B11_g30_P80','B11_g30_P90','B11_g30_P100',
                'B12_g30_P0','B12_g30_P10','B12_g30_P20','B12_g30_P30','B12_g30_P40','B12_g30_P50','B12_g30_P60','B12_g30_P70','B12_g30_P80','B12_g30_P90','B12_g30_P100',
                'GNDVI_g30_P0','GNDVI_g30_P10','GNDVI_g30_P20','GNDVI_g30_P30','GNDVI_g30_P40','GNDVI_g30_P50','GNDVI_g30_P60','GNDVI_g30_P70','GNDVI_g30_P80','GNDVI_g30_P90','GNDVI_g30_P100',
                'NDVI_g30_P0','NDVI_g30_P10','NDVI_g30_P20','NDVI_g30_P30','NDVI_g30_P40','NDVI_g30_P50','NDVI_g30_P60','NDVI_g30_P70','NDVI_g30_P80','NDVI_g30_P90','NDVI_g30_P100',
                'NDWI_g30_P0','NDWI_g30_P10','NDWI_g30_P20','NDWI_g30_P30','NDWI_g30_P40','NDWI_g30_P50','NDWI_g30_P60','NDWI_g30_P70','NDWI_g30_P80','NDWI_g30_P90','NDWI_g30_P100']);                

// Concatenate images for classification
var im_cla = pregeada.addBands(geada25.addBands(geada30))
             .clip(lim);

//Create a name list with image bands                   
var names = ee.List(['_value']).cat(im_cla.bandNames()).getInfo();

// Create samples
var mcol = im_cla.sample({
  region:colh,
  factor:0.9,
  scale:20,seed:5,
  dropNulls:true,
  tileScale:16}).map(addcolh);
var mg25 = im_cla.sample({
  region:g255,
  factor: 0.9,
  scale:20,
  seed:5,
  dropNulls:true,
  tileScale:16}).map(addg255);
var mg30 = im_cla.sample({
  region:g306,
  factor: 0.9,
  scale:20,
  seed:5,
  dropNulls:true,
  tileScale:16}).map(addg306);
var mng = im_cla.sample({
  region:naog,
  factor: 0.9,
  scale:20,
  seed:5,
  dropNulls:true,
  tileScale:16}).map(addmng);  
// Sample merge for classification
var trainingout = mcol.merge(mg25.merge(mg30.merge(mng)));  


// Random Forest classifier application
var rf = ee.Classifier.smileRandomForest(101);
var rfTreino = rf.train({
  features: trainingout,
  classProperty: '_value',
  inputProperties: names,
  subsampling: 0.8,
  subsamplingSeed:5
});

var rfp = ee.Classifier.smileRandomForest(101).setOutputMode('MULTIPROBABILITY');
var rfTreinop = rfp.train({
  features: trainingout,
  classProperty: '_value',
  inputProperties: names,
  subsampling: 0.8,
  subsamplingSeed:5
});

var dict_ = rfTreinop.explain();
var explain = ee.FeatureCollection(ee.Feature(null,ee.Dictionary(dict_)))

//Classify
var classAreac = im_cla.classify(rfTreino);
var classAreap = im_cla.classify(rfTreinop);

//Filter images by date and local, ordering by cloud percentage
var s2FiltSort1=s2t.sort('CLOUDY_PIXEL_PERCENTAGE',false);
//Create a mosaic
var s2Mosaic1=s2FiltSort1.mosaic();

ms = ms.multiply(-1).add(2);
/////////////////////////////////////////////////////////////////////////////////
//               Visualization
/////////////////////////////////////////////////////////////////////////////////
var visParams={gamma: 1.0, min: [0,0,0], max: [5000,5000,5000], bands: ['B11', 'B8', 'B4']};

Map.centerObject(lim,8);
Map.addLayer(s2Mosaic1.clip(lim),visParams,'Mosaic');
Map.addLayer(classAreac,imageVisParam,'Frost');// harvested(light blue) frost May-25th(magenta) frost Jun-30th(dark blue) not frost-affected(green)
Map.addLayer(i,imageVisParam,'Frosts')
Map.addLayer(ms.selfMask(),{},'Corn map');
Map.addLayer(colh,{color:'red'},'harvested samples');
Map.addLayer(g255,{color:'blue'},'May-25th frost samples');
Map.addLayer(g306,{color:'yellow'},'June-30th frost samples');
Map.addLayer(naog,{color:'black'},'not frost-affected samples');


Export.image.toAsset({
  image: classAreac,
  description: 'ClassifyCornFrost',
  assetId: 'ClassifyCornFrost',
  scale: 20,
  region: lim,
  maxPixels:1e13
  });
  
Export.image.toAsset({
  image: classAreap,
  description: 'ProbCornFrost',
  assetId: 'ProbCornFrost',
  scale: 20,
  region: lim,
  maxPixels:1e13
  });
    
//Export to Gdrive a table with a RF explanation
Export.table.toDrive({
  collection:  explain,
  description: 'Explain_Corn' ,
  folder: 'quadrado'
});