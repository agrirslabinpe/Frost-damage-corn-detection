/* /////////////////////////////////////////////////////////////////////
// Script to get training data to map all study area
*/ /////////////////////////////////////////////////////////////////////
// Study area limits
var lim = ee.FeatureCollection("users/adami16/geada/OestePR");

//Samples factors to use in Randomforest 
var yesSampleFactor = 0.1;
var noSampleFactor = 0.1;

// Date definition
var dini = '2021-02-01'; // initial date of Sentinel-2/MSI images
var dfim = '2021-07-20'; // final date of Sentinel-2/MSI images

// Blocks training data
var v125 = ee.FeatureCollection('users/grazielirodigheri/blk_125');
var v159 = ee.FeatureCollection('users/grazielirodigheri/blk_159');
var v164 = ee.FeatureCollection('users/grazielirodigheri/blk_164');
var v193 = ee.FeatureCollection('users/grazielirodigheri/blk_193');
var v197 = ee.FeatureCollection('users/grazielirodigheri/blk_197');
var v227 = ee.FeatureCollection('users/grazielirodigheri/blk_227');
var v229 = ee.FeatureCollection('users/grazielirodigheri/blk_229');
var v232 = ee.FeatureCollection('users/grazielirodigheri/blk_232');
var v260 = ee.FeatureCollection('users/grazielirodigheri/blk_260');
var v263 = ee.FeatureCollection('users/grazielirodigheri/blk_263');
var v292 = ee.FeatureCollection('users/grazielirodigheri/blk_292');
var v295 = ee.FeatureCollection('users/grazielirodigheri/blk_295');
var v319 = ee.FeatureCollection('users/grazielirodigheri/blk_319');
var v322 = ee.FeatureCollection('users/grazielirodigheri/blk_322');
var v345 = ee.FeatureCollection('users/grazielirodigheri/blk_345');
var v347 = ee.FeatureCollection('users/grazielirodigheri/blk_347');


// Merge variables
var v1 = v125.merge(v159.merge(v164.merge(v193.merge(v197.merge(v227.merge(v229.merge(
        v232.merge(v260.merge(v263.merge(v292.merge(v295.merge(v319.merge(v322.merge(
        v345.merge(v347)))))))))))))));

// Divide variables for training
var yes = v1.filterMetadata('_value','equals',2);
var no  = v1.filterMetadata('_value','equals',1);

/////////////////////////////////////////////////////////////////////////////////
//               Functions
/////////////////////////////////////////////////////////////////////////////////

//Add spectral indices
function addIndices(image){
  return image.addBands([
    image.select('B8','B3').normalizedDifference().multiply(10000).add(10000).rename('GNDVI'),
    image.select('B8','B4').normalizedDifference().multiply(10000).add(10000).rename('NDVI'),
    image.select('B11','B12').normalizedDifference().multiply(10000).add(10000).rename('NDWI')]);
}

//Adjust data for classification
function addYes(f){
  return f.set('_value',2);
}

function addNo(f){
  return f.set('_value',1);
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
            

var fev_av = s2t.filterDate('2021-02-01','2021-02-28')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_fev_P0','B3_fev_P25','B3_fev_P50','B3_fev_P75','B3_fev_P100',
                'B4_fev_P0','B4_fev_P25','B4_fev_P50','B4_fev_P75','B4_fev_P100',
                'B5_fev_P0','B5_fev_P25','B5_fev_P50','B5_fev_P75','B5_fev_P100',
                'B6_fev_P0','B6_fev_P25','B6_fev_P50','B6_fev_P75','B6_fev_P100',
                'B7_fev_P0','B7_fev_P25','B7_fev_P50','B7_fev_P75','B7_fev_P100',
                'B8_fev_P0','B8_fev_P25','B8_fev_P50','B8_fev_P75','B8_fev_P100',
                'B8A_fev_P0','B8A_fev_P25','B8A_fev_P50','B8A_fev_P75','B8A_fev_P100',
                'B11_fev_P0','B11_fev_P25','B11_fev_P50','B11_fev_P75','B11_fev_P100',
                'B12_fev_P0','B12_fev_P25','B12_fev_P50','B12_fev_P75','B12_fev_P100',
                'GNDVI_fev_P0','GNDVI_fev_P25','GNDVI_fev_P50','GNDVI_fev_P75','GNDVI_fev_P100',
                'NDVI_fev_P0','NDVI_fev_P25','NDVI_fev_P50','NDVI_fev_P75','NDVI_fev_P100',
                'NDWI_fev_P0','NDWI_fev_P25','NDWI_fev_P50','NDWI_fev_P75','NDWI_fev_P100']);
                
var mar_av = s2t.filterDate('2021-03-01','2021-03-31')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_mar_P0','B3_mar_P25','B3_mar_P50','B3_mar_P75','B3_mar_P100',
                'B4_mar_P0','B4_mar_P25','B4_mar_P50','B4_mar_P75','B4_mar_P100',
                'B5_mar_P0','B5_mar_P25','B5_mar_P50','B5_mar_P75','B5_mar_P100',
                'B6_mar_P0','B6_mar_P25','B6_mar_P50','B6_mar_P75','B6_mar_P100',
                'B7_mar_P0','B7_mar_P25','B7_mar_P50','B7_mar_P75','B7_mar_P100',
                'B8_mar_P0','B8_mar_P25','B8_mar_P50','B8_mar_P75','B8_mar_P100',
                'B8A_mar_P0','B8A_mar_P25','B8A_mar_P50','B8A_mar_P75','B8A_mar_P100',
                'B11_mar_P0','B11_mar_P25','B11_mar_P50','B11_mar_P75','B11_mar_P100',
                'B12_mar_P0','B12_mar_P25','B12_mar_P50','B12_mar_P75','B12_mar_P100',
                'GNDVI_mar_P0','GNDVI_mar_P25','GNDVI_mar_P50','GNDVI_mar_P75','GNDVI_mar_P100',
                'NDVI_mar_P0','NDVI_mar_P25','NDVI_mar_P50','NDVI_mar_P75','NDVI_mar_P100',
                'NDWI_mar_P0','NDWI_mar_P25','NDWI_mar_P50','NDWI_mar_P75','NDWI_mar_P100']);

var abr_av = s2t.filterDate('2021-04-01','2021-04-30')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_abr_P0','B3_abr_P25','B3_abr_P50','B3_abr_P75','B3_abr_P100',
                'B4_abr_P0','B4_abr_P25','B4_abr_P50','B4_abr_P75','B4_abr_P100',
                'B5_abr_P0','B5_abr_P25','B5_abr_P50','B5_abr_P75','B5_abr_P100',
                'B6_abr_P0','B6_abr_P25','B6_abr_P50','B6_abr_P75','B6_abr_P100',
                'B7_abr_P0','B7_abr_P25','B7_abr_P50','B7_abr_P75','B7_abr_P100',
                'B8_abr_P0','B8_abr_P25','B8_abr_P50','B8_abr_P75','B8_abr_P100',
                'B8A_abr_P0','B8A_abr_P25','B8A_abr_P50','B8A_abr_P75','B8A_abr_P100',
                'B11_abr_P0','B11_abr_P25','B11_abr_P50','B11_abr_P75','B11_abr_P100',
                'B12_abr_P0','B12_abr_P25','B12_abr_P50','B12_abr_P75','B12_abr_P100',
                'GNDVI_abr_P0','GNDVI_abr_P25','GNDVI_abr_P50','GNDVI_abr_P75','GNDVI_abr_P100',
                'NDVI_abr_P0','NDVI_abr_P25','NDVI_abr_P50','NDVI_abr_P75','NDVI_abr_P100',
                'NDWI_abr_P0','NDWI_abr_P25','NDWI_abr_P50','NDWI_abr_P75','NDWI_abr_P100']);

var may_av = s2t.filterDate('2021-05-01','2021-05-31')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_may_P0','B3_may_P25','B3_may_P50','B3_may_P75','B3_may_P100',
                'B4_may_P0','B4_may_P25','B4_may_P50','B4_may_P75','B4_may_P100',
                'B5_may_P0','B5_may_P25','B5_may_P50','B5_may_P75','B5_may_P100',
                'B6_may_P0','B6_may_P25','B6_may_P50','B6_may_P75','B6_may_P100',
                'B7_may_P0','B7_may_P25','B7_may_P50','B7_may_P75','B7_may_P100',
                'B8_may_P0','B8_may_P25','B8_may_P50','B8_may_P75','B8_may_P100',
                'B8A_may_P0','B8A_may_P25','B8A_may_P50','B8A_may_P75','B8A_may_P100',
                'B11_may_P0','B11_may_P25','B11_may_P50','B11_may_P75','B11_may_P100',
                'B12_may_P0','B12_may_P25','B12_may_P50','B12_may_P75','B12_may_P100',
                'GNDVI_may_P0','GNDVI_may_P25','GNDVI_may_P50','GNDVI_may_P75','GNDVI_may_P100',
                'NDVI_may_P0','NDVI_may_P25','NDVI_may_P50','NDVI_may_P75','NDVI_may_P100',
                'NDWI_may_P0','NDWI_may_P25','NDWI_may_P50','NDWI_may_P75','NDWI_may_P100']);                


var jun_av = s2t.filterDate('2021-06-01','2021-06-30')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_jun_P0','B3_jun_P25','B3_jun_P50','B3_jun_P75','B3_jun_P100',
                'B4_jun_P0','B4_jun_P25','B4_jun_P50','B4_jun_P75','B4_jun_P100',
                'B5_jun_P0','B5_jun_P25','B5_jun_P50','B5_jun_P75','B5_jun_P100',
                'B6_jun_P0','B6_jun_P25','B6_jun_P50','B6_jun_P75','B6_jun_P100',
                'B7_jun_P0','B7_jun_P25','B7_jun_P50','B7_jun_P75','B7_jun_P100',
                'B8_jun_P0','B8_jun_P25','B8_jun_P50','B8_jun_P75','B8_jun_P100',
                'B8A_jun_P0','B8A_jun_P25','B8A_jun_P50','B8A_jun_P75','B8A_jun_P100',
                'B11_jun_P0','B11_jun_P25','B11_jun_P50','B11_jun_P75','B11_jun_P100',
                'B12_jun_P0','B12_jun_P25','B12_jun_P50','B12_jun_P75','B12_jun_P100',
                'GNDVI_jun_P0','GNDVI_jun_P25','GNDVI_jun_P50','GNDVI_jun_P75','GNDVI_jun_P100',
                'NDVI_jun_P0','NDVI_jun_P25','NDVI_jun_P50','NDVI_jun_P75','NDVI_jun_P100',
                'NDWI_jun_P0','NDWI_jun_P25','NDWI_jun_P50','NDWI_jun_P75','NDWI_jun_P100']);
                
                
var jul_av = s2t.filterDate('2021-07-01','2021-07-31')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_jul_P0','B3_jul_P25','B3_jul_P50','B3_jul_P75','B3_jul_P100',
                'B4_jul_P0','B4_jul_P25','B4_jul_P50','B4_jul_P75','B4_jul_P100',
                'B5_jul_P0','B5_jul_P25','B5_jul_P50','B5_jul_P75','B5_jul_P100',
                'B6_jul_P0','B6_jul_P25','B6_jul_P50','B6_jul_P75','B6_jul_P100',
                'B7_jul_P0','B7_jul_P25','B7_jul_P50','B7_jul_P75','B7_jul_P100',
                'B8_jul_P0','B8_jul_P25','B8_jul_P50','B8_jul_P75','B8_jul_P100',
                'B8A_jul_P0','B8A_jul_P25','B8A_jul_P50','B8A_jul_P75','B8A_jul_P100',
                'B11_jul_P0','B11_jul_P25','B11_jul_P50','B11_jul_P75','B11_jul_P100',
                'B12_jul_P0','B12_jul_P25','B12_jul_P50','B12_jul_P75','B12_jul_P100',
                'GNDVI_jul_P0','GNDVI_jul_P25','GNDVI_jul_P50','GNDVI_jul_P75','GNDVI_jul_P100',
                'NDVI_jul_P0','NDVI_jul_P25','NDVI_jul_P50','NDVI_jul_P75','NDVI_jul_P100',
                'NDWI_jul_P0','NDWI_jul_P25','NDWI_jul_P50','NDWI_jul_P75','NDWI_jul_P100']);


var ini_av = s2t.filterDate('2021-02-01','2021-03-31')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_ini_P0','B3_ini_P25','B3_ini_P50','B3_ini_P75','B3_ini_P100',
                'B4_ini_P0','B4_ini_P25','B4_ini_P50','B4_ini_P75','B4_ini_P100',
                'B5_ini_P0','B5_ini_P25','B5_ini_P50','B5_ini_P75','B5_ini_P100',
                'B6_ini_P0','B6_ini_P25','B6_ini_P50','B6_ini_P75','B6_ini_P100',
                'B7_ini_P0','B7_ini_P25','B7_ini_P50','B7_ini_P75','B7_ini_P100',
                'B8_ini_P0','B8_ini_P25','B8_ini_P50','B8_ini_P75','B8_ini_P100',
                'B8A_ini_P0','B8A_ini_P25','B8A_ini_P50','B8A_ini_P75','B8A_ini_P100',
                'B11_ini_P0','B11_ini_P25','B11_ini_P50','B11_ini_P75','B11_ini_P100',
                'B12_ini_P0','B12_ini_P25','B12_ini_P50','B12_ini_P75','B12_ini_P100',
                'GNDVI_ini_P0','GNDVI_ini_P25','GNDVI_ini_P50','GNDVI_ini_P75','GNDVI_ini_P100',
                'NDVI_ini_P0','NDVI_ini_P25','NDVI_ini_P50','NDVI_ini_P75','NDVI_ini_P100',
                'NDWI_ini_P0','NDWI_ini_P25','NDWI_ini_P50','NDWI_ini_P75','NDWI_ini_P100']);
                
var sec_av = s2t.filterDate('2021-04-01','2021-06-30')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_sec_P0','B3_sec_P25','B3_sec_P50','B3_sec_P75','B3_sec_P100',
                'B4_sec_P0','B4_sec_P25','B4_sec_P50','B4_sec_P75','B4_sec_P100',
                'B5_sec_P0','B5_sec_P25','B5_sec_P50','B5_sec_P75','B5_sec_P100',
                'B6_sec_P0','B6_sec_P25','B6_sec_P50','B6_sec_P75','B6_sec_P100',
                'B7_sec_P0','B7_sec_P25','B7_sec_P50','B7_sec_P75','B7_sec_P100',
                'B8_sec_P0','B8_sec_P25','B8_sec_P50','B8_sec_P75','B8_sec_P100',
                'B8A_sec_P0','B8A_sec_P25','B8A_sec_P50','B8A_sec_P75','B8A_sec_P100',
                'B11_sec_P0','B11_sec_P25','B11_sec_P50','B11_sec_P75','B11_sec_P100',
                'B12_sec_P0','B12_sec_P25','B12_sec_P50','B12_sec_P75','B12_sec_P100',
                'GNDVI_sec_P0','GNDVI_sec_P25','GNDVI_sec_P50','GNDVI_sec_P75','GNDVI_sec_P100',
                'NDVI_sec_P0','NDVI_sec_P25','NDVI_sec_P50','NDVI_sec_P75','NDVI_sec_P100',
                'NDWI_sec_P0','NDWI_sec_P25','NDWI_sec_P50','NDWI_sec_P75','NDWI_sec_P100']);
                
var tot_av = s2t.filterDate('2021-02-01','2021-06-30')
                .reduce(ee.Reducer.percentile([0,25,50,75,100]))
                .rename(['B3_tot_P0','B3_tot_P25','B3_tot_P50','B3_tot_P75','B3_tot_P100',
                'B4_tot_P0','B4_tot_P25','B4_tot_P50','B4_tot_P75','B4_tot_P100',
                'B5_tot_P0','B5_tot_P25','B5_tot_P50','B5_tot_P75','B5_tot_P100',
                'B6_tot_P0','B6_tot_P25','B6_tot_P50','B6_tot_P75','B6_tot_P100',
                'B7_tot_P0','B7_tot_P25','B7_tot_P50','B7_tot_P75','B7_tot_P100',
                'B8_tot_P0','B8_tot_P25','B8_tot_P50','B8_tot_P75','B8_tot_P100',
                'B8A_tot_P0','B8A_tot_P25','B8A_tot_P50','B8A_tot_P75','B8A_tot_P100',
                'B11_tot_P0','B11_tot_P25','B11_tot_P50','B11_tot_P75','B11_tot_P100',
                'B12_tot_P0','B12_tot_P25','B12_tot_P50','B12_tot_P75','B12_tot_P100',
                'GNDVI_tot_P0','GNDVI_tot_P25','GNDVI_tot_P50','GNDVI_tot_P75','GNDVI_tot_P100',
                'NDVI_tot_P0','NDVI_tot_P25','NDVI_tot_P50','NDVI_tot_P75','NDVI_tot_P100',
                'NDWI_tot_P0','NDWI_tot_P25','NDWI_tot_P50','NDWI_tot_P75','NDWI_tot_P100']);

var dSecIni = sec_av.subtract(ini_av);

//Create image for classification
var im_cla = fev_av.addBands(mar_av.addBands(abr_av.addBands(may_av
                  .addBands(jun_av.addBands(jul_av.addBands(ini_av.addBands(sec_av
                  .addBands(tot_av.addBands(dSecIni)))))))))
                  .clip(lim);
                   
var names = ee.List(['_value']).cat(im_cla.bandNames()).getInfo();


// Creation of samples
var yesout = im_cla.sample({
  region:yes,
  factor:yesSampleFactor,
  scale:20,
  seed:5,
  dropNulls:true,
  geometries:true,
  tileScale:16}).map(addYes);
var noout = im_cla.sample({
  region:no,
  factor: noSampleFactor,
  scale:20,
  seed:5,
  dropNulls:true,
  geometries:true,
  tileScale:16}).map(addNo);
  
// Sample merge for classification
var trainingout = yesout.merge(noout); 


Export.table.toAsset({
  collection: trainingout,
  description: 'SamplesFrost',
  assetId: 'users/adami16/geada/Amostras_Geada'});
  
  //Export to Gdrive a table with the RF explanation
Export.table.toDrive({
  collection:  lim,
  description: 'Limits_OestePR' ,
  folder: 'GEE_artigos'
});
  