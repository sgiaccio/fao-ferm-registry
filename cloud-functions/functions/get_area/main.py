import json
import requests
import traceback

from google.cloud import bigquery

# import fiona
# from fiona.crs import from_epsg
from shapely import wkt
from shapely.geometry import mapping, shape
from shapely.ops import unary_union
from flask import jsonify

from google.auth import compute_engine
import ee


class EmptyResultError(Exception):
    pass


data_sources = {
    # Categorical
    "land_cover": {
        "asset_id": "COPERNICUS/Landcover/100m/Proba-V-C3/Global",
        "ini_date": "2019-01-01",
        "end_date": "2019-12-31",
        "band": "discrete_classification",
        "categorical": True
    },
    "temperature": {
        "asset_id": "ECMWF/ERA5/MONTHLY",
        "ini_date": "2015-01-01",
        "end_date": "2019-12-31",
        "band": "mean_2m_air_temperature",
        "categorical": False
    },
    # Continuous
    "elevation": {
        "asset_id": "CGIAR/SRTM90_V4",
        "ini_date": "2000-02-11",
        "end_date": "2000-02-11",
        "band": "elevation",
        "categorical": False
    },
    "precipitation": {
        "asset_id": "UCSB-CHG/CHIRPS/PENTAD",
        "ini_date": "2015-01-01",
        "end_date": "2019-12-31",
        "band": "precipitation",
        "categorical": False
    },
    "tree_cover": {
        "asset_id": "NASA/MEASURES/GFCC/TC/v3",
        "ini_date": "2010-01-01",
        "end_date": "2014-12-31",
        "band": "tree_canopy_cover",
        "categorical": False
    }
}


BQ = bigquery.Client()

service_account = 'earth-engine@fao-ferm2-review.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'fao-ferm2-review-ad0074f38f58.json')
ee.Initialize(credentials)


def _get_area_multipolygon(area_uuid):
    # TODO SQL injection
    source = BQ.query(f'SELECT ST_ASTEXT(geometry) AS geom, project_id FROM fao-ferm2-review.registry.areas WHERE area_uuid = "{area_uuid}"') # Make an API request.

    if not source:
        raise EmptyResultError

    # Create a multipolygon by merging all features - needed for zonal statistics
    return unary_union([shape(wkt.loads(polygon['geom'])) for polygon in source])


def get_area(request):
    """ Returns a GeoJson with all the polygons
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text, or any set of values that can be turned into a
         Response object using `make_response`
        <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>.
    """

    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*', # TODO data.apps.fao.org and data.review.fao.org
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)
    
    try:
        area_uuid = request.args.get('area_uuid')
        multipolygon = _get_area_multipolygon(area_uuid)

        return json.dumps(mapping(multipolygon))
    except EmptyResultError:
        print(traceback.format_exc())
        return ('Empty polygon', 400, { 'Access-Control-Allow-Origin': '*' })
    except Exception:
         print(traceback.format_exc())
         return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })

def _zonal_stats(asset_id, ini_date, end_date, band, polygon, categorical=False):
    """
    Calculate zonal statistics for each of the images in input ImageCollection
    
    Args:
        asset_id (string): Image collection asset ID
        discrete (bool): Whether the input has discrete values or not (continuous, default)
        ini_date (string): Starting date to filter collection in format %YYYY-mm-dd
        end_date (string): Stop date to filter collection in format %YYYY-mm-dd
        band (string): Name of the band which cotains the target variable
        statistic (string): Reduction statistic to reduce results when using 
        polygon (geojson, str): geojson geometry
        
        {
            "type": "MultiPolygon", 
            "coordinates": [
                [[
                    [11.9948265434602, 42.6145920085208],
                    [12.1055223772636, 42.8544329817615],
                    [12.3638126561382, 42.9559041627479],
                    [11.9948265434602, 42.6145920085208]
                ]],
                [[
                    [10.7894737734482, 43.4906610302986],
                    [10.9250456000997, 43.5387118043016],
                    [11.0606174267511, 43.5867625783047],
                    [10.7894737734482, 43.4906610302986]
                ]]
            ]
        }

        
    """
    
    def reduce_categorical(image):
        """Reduce categorical type image and calculate its area"""

        # Using categorical areas
        reduced = (ee.Image.pixelArea().divide(1e4)
          .addBands(image)
          .reduceRegion(**{
            "reducer":ee.Reducer.sum().group(1), 
            "geometry":geometry,
            "scale":scale
          }
        )).get("groups")
        
        # Style output by extracting keys and values from list of dicts
        keys_values = ee.List(ee.List(reduced).map(lambda x: ee.Dictionary(x).values())).unzip()
        
        reduced = ee.Dictionary.fromLists(
            ee.List(keys_values.get(0)).map(lambda x: ee.Number(x).format()),
            keys_values.get(1), 
        )
        
        # Combine output with image info
        return ee.Feature(
            None, 
            reduced.combine(
                image.toDictionary(["system:time_start", "system:time_end", "system:id"]).rename(
                    ["system:time_start", "system:time_end", "system:id"],
                    ["system_time_start", "system_time_end", "system_id"])
            )
        )
    
    
    def reduce_continuos(image):
        """Reduce continuous type image"""

        # Using continuos
        reduced = (image
          .reduceRegion(**{
            "reducer": ee.Reducer.minMax().combine(**{
              "reducer2": ee.Reducer.mean(),
              "sharedInputs": True
            }), 
            "geometry":geometry,
            "scale": 1,
            "bestEffort": True
          }
        ))

        stats = ee.List(["min", "max", "mean"])
        append = stats.map(lambda x: ee.String("_").cat(ee.String(x)))

        from_name = append.map(lambda x: ee.String(image.bandNames().get(0)).cat(ee.String(x)))

        return ee.Feature(
            None, 
            reduced.combine(
                image.toDictionary(["system:time_start", "system:time_end", "system:id"]).rename(
                    ["system:time_start", "system:time_end", "system:id"],
                    ["system_time_start", "system_time_end", "system_id"])
            ).rename(from_name, stats)
        )
    
    # decode geojson
    # decoded_polygon = json.loads(polygon)
    
    geometry = ee.Geometry.MultiPolygon(polygon["coordinates"])
    source_type = ee.data.getAsset(asset_id)["type"]
    
    if source_type == "IMAGE_COLLECTION":
        
        image_collection = (
            ee.ImageCollection(asset_id)
              .filter(ee.Filter.date(ini_date, end_date))
              .select(band)
        )

        # Get pixel size from the first image
        scale = image_collection.first().projection().nominalScale()
        
        # Use the proper reduce region function depending on the image type
        computed_object = ee.FeatureCollection(
            image_collection.map(reduce_categorical if categorical else reduce_continuos)
        ).toList(image_collection.size())
    
    elif source_type == "IMAGE":
        
        image = ee.Image(asset_id)
        
        # Get pixel size from the first image
        scale = image.select(0).projection().nominalScale()
        
        computed_object = ee.List(
            [reduce_categorical(image) if categorical else reduce_continuos(image)]
        )
        
    return computed_object.map(lambda x: ee.Feature(x).toDictionary()).getInfo()

def get_zonal_stats(request):
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*', # TODO data.apps.fao.org and data.review.fao.org
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)
    
    try:
        area_uuid = request.args.get('area_uuid')
        statistics_id = request.args.get('statistics')

        multipolygon = _get_area_multipolygon(area_uuid)
        geojson = mapping(multipolygon)

        params = data_sources[statistics_id]
        statistics = _zonal_stats(params['asset_id'], params['ini_date'], params['end_date'], params['band'], geojson, params['categorical'])

        return (json.dumps(statistics), 200, { 'Access-Control-Allow-Origin': '*' })
    except EmptyResultError:
        print(traceback.format_exc())
        return ('Empty polygon', 400, { 'Access-Control-Allow-Origin': '*' })
    except Exception:
        print(traceback.format_exc())
        return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })


# def get_zonal_stats(request):
#     if request.method == 'OPTIONS':
#         # Allows GET requests from any origin with the Content-Type
#         # header and caches preflight response for an 3600s
#         headers = {
#             'Access-Control-Allow-Origin': '*', # TODO data.apps.fao.org and data.review.fao.org
#             'Access-Control-Allow-Methods': 'GET',
#             'Access-Control-Allow-Headers': 'Content-Type',
#             'Access-Control-Max-Age': '3600'
#         }

#         return ('', 204, headers)
    
#     try:
#         area_uuid = request.args.get('area_uuid')
#         band = request.args.get('band')
#         gee_id = request.args.get('gee_id')
#         start_date = request.args.get('start_date')
#         end_date = request.args.get('end_date')
#         categorical = request.args.get('categorical')

#         multipolygon = _get_area_multipolygon(area_uuid)

#         geojson = mapping(multipolygon)
#         json = {
#             'GEE_imageCollection_id': gee_id,
#             # 'band': 'elevation',
#             'geojson': geojson
#         }
#         if band != None:
#             json['band'] = band
#         if start_date != None and end_date != None:
#             json['dateRange'] = {
#                 'startDate': start_date,
#                 'endDate': end_date
#             }
#         if categorical == "true":
#             json['categorical'] = True
        
#         # TODO catch http errors
#         response = requests.post('https://api.data.apps.fao.org/api/v2/map/zonalstats', json=json)
#         if response:
#             return (jsonify(response.json()), 200, { 'Access-Control-Allow-Origin': '*' })
#         else:
#             return (response.reason, 400, { 'Access-Control-Allow-Origin': '*' })
#     except Exception:
#         print(traceback.format_exc())
#         return ('Internal server error', 400, { 'Access-Control-Allow-Origin': '*' })
