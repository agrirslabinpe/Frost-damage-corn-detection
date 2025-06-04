/* /////////////////////////////////////////////////////////////////////
// Script to map corn area by block where training data was collected
////////////////////////////////////////////////////////////////////////
// Blocks to be mapped
        125          197,      260,      319,        
        159          227,      263,      322, 
        164          229,      292,      345, 
        193          232,      295,      347  
*/ /////////////////////////////////////////////////////////////////////

// Definition of variables
var blkId = 125; // define the block to be mapped
var dini = '2021-02-01'; // initial date of Sentinel-2/MSI images
var dfim = '2021-07-20'; // final date of Sentinel-2/MSI images 
var cloudthresh = 40; // cloud cover percentage
// Sampling factors to be used in Randomforest
var yesSampleFactor = 0.8;
var noSampleFactor = 0.8;

//////////////////////////////////////////////////////////////////////////
//               Functions
//////////////////////////////////////////////////////////////////////////

// Adjust samples limits
no = no.difference(yes);

// Adjust data for classification
function addYes(f){
  return f.set('_value',2);
}

function addNo(f){
  return f.set('_value',1);
}

// Function to adjust the Sentinel-2/MSI image date
function setDate(image){
  var date = ee.Date(image.get('GENERATION_TIME')).format('yyyy-MM-dd');
  return image.set({'date_acquired':ee.Date(image.get('GENERATION_TIME')).format('yyyy-MM-dd')});
            //.rename(['S01'+date,'S02'+date,'S03'+date,'S04'+date,'S05'+date,'S06'+date,'S07'+date,'S08'+date,'S8A'+date,'S09'+date,'S10'+date,'S11'+date,'S12'+date,'SQA10'+date,'SQA20'+date,'SQA60'+date])
}


// Function to visualize images for training
function addtomapS2(startDate,endDate,Nimages,cloudthresh){
  var current = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate(startDate,endDate)
                  .filterBounds(blk)
                  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',cloudthresh)
                  .map(setDate);
  var datelist = ee.List(current.aggregate_array('date_acquired'))
                   .distinct()
                   .sort()
                   .reverse()
                   .slice(0,Nimages);
  var count = datelist.getInfo().length;
  if(count>Nimages){count=Nimages;}
  for(var i = 0; i <count; i++){
    var date = datelist.get(i).getInfo();
    Map.addLayer(ee.Image(current.filterMetadata('date_acquired','equals',date)
                   .mosaic())
                   .clip(blk),{bands:['B8','B11','B4'],min:450,max:5000},'s2_'+date,false);
  }
}

// Function to add spectral indices
function addIndices(image){
  return image.addBands([
    image.select('B8','B3').normalizedDifference().multiply(10000).add(10000).rename('GNDVI'),
    image.select('B8','B4').normalizedDifference().multiply(10000).add(10000).rename('NDVI'),
    image.select('B11','B12').normalizedDifference().multiply(10000).add(10000).rename('NDWI')]);
}

/////////////////////////////////////////////////////////////////////////////////
//               Data
/////////////////////////////////////////////////////////////////////////////////

// Load the polygon to be mapped
var blk =  ee.FeatureCollection("users/adami16/Conab/PR/Bloco_PR_rec")
             .filterMetadata('BLOCO_ID', 'equals',blkId);

// Select the images for the mapping procedure
var s2t = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(blk)
            .filterDate(dini,dfim)
            .select(['B3','B4','B5','B6','B7','B8','B8A','B11','B12'])
            .map(addIndices);
            
// Calculate metrics for each period
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

// Create image for classification
var im_cla = fev_av.addBands(mar_av.addBands(abr_av.addBands(may_av
                   .addBands(jun_av.addBands(jul_av.addBands(ini_av.addBands(sec_av
                   .addBands(tot_av.addBands(dSecIni)))))))))
                   .clip(blk);

// Create the name list with the image bands                   
var names = ee.List(['_value']).cat(im_cla.bandNames()).getInfo();

// Creation of samples
var yesout = im_cla.sample({
  region:yes,
  factor:yesSampleFactor,
  scale:20,seed:5,
  dropNulls:true,
  tileScale:16}).map(addYes);
var noout = im_cla.sample({
  region:no,
  factor: noSampleFactor,
  scale:20,
  seed:5,
  dropNulls:true,
  tileScale:16}).map(addNo);
  
// Sample merge for classification
var trainingout = yesout.merge(noout);

// Random Forest classifier application
var rf = ee.Classifier.smileRandomForest(101);
var rfTreino = rf.train({
  features: trainingout,
  classProperty: '_value',
  inputProperties: names,
  subsampling: 0.8,
  subsamplingSeed:5
});

// Classification
var classArea = im_cla.classify(rfTreino);

var x= classArea.subtract(1).toUint8().selfMask(); //only areas mapped as corn 

/////////////////////////////////////////////////////////////////////////////////
//               Visualizations
/////////////////////////////////////////////////////////////////////////////////
var empty2 = ee.Image().byte();
var pxlOutlines = empty2.paint({
    featureCollection: blk,
    width: 3 });
    
Map.centerObject(blk,10);

// Add images to map
addtomapS2('2021-02-01','2021-02-28',5,cloudthresh); //Number of images, Cloud cover percentage
addtomapS2('2021-03-01','2021-03-31',5,cloudthresh);
addtomapS2('2021-04-01','2021-04-30',5,cloudthresh);
addtomapS2('2021-05-01','2021-05-31',5,cloudthresh);
addtomapS2('2021-06-01','2021-06-30',5,cloudthresh);
addtomapS2('2021-07-01','2021-07-31',5,cloudthresh);
Map.addLayer (x, {min: 1, max: 2, palette: ['C611E3']}, 'Corn');