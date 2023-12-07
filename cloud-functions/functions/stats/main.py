# To deploy:

# REGION=europe-west3
# gcloud functions deploy get_polygon_zonal_stats --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \
#     \
#     --timeout 540




import json
# import requests
import traceback

# from google.cloud import bigquery

# import fiona
# from fiona.crs import from_epsg
from shapely import wkb
from shapely.geometry import mapping
# from shapely.ops import unary_union

# from google.auth import compute_engine
import ee

import psycopg2


# TODO use Google secrets
db_user = 'ferm_registry'
db_pass = '***REMOVED***'
db_name = 'ferm_registry'
unix_socket_path = '/cloudsql/fao-ferm:europe-west4:fao-ferm-postgres'


def connect_unix_socket():
    # Note: Saving credentials in environment variables is convenient, but not
    # secure - consider a more secure solution such as
    # Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
    # keep secrets safe.
    # db_user = os.environ['DB_USER']
    # db_pass = os.environ['DB_PASS']
    # db_name = os.environ['DB_NAME]
    # unix_socket_path = os.environ['INSTANCE_UNIX_SOCKET']

    try:
        conn = psycopg2.connect(dbname=db_name, user=db_user, password=db_pass, host=unix_socket_path)
        conn.set_session(readonly=True, autocommit=True)
        return conn
    except psycopg2.Error as e:
        print('Error: Couldn\'t connect to the Postgres database')
        print(e)

conn = connect_unix_socket()


# class EmptyResultError(Exception):
#     pass


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


# BQ = bigquery.Client()

service_account = 'earth-engine@fao-ferm2-review.iam.gserviceaccount.com'
credentials = ee.ServiceAccountCredentials(service_account, 'fao-ferm2-review-ad0074f38f58.json')
ee.Initialize(credentials)


def _get_area_multipolygon(area_uuid, project_id):
    cursor = conn.cursor()
    try:
        # project_id = request.args['project_id']
        # area_uuid = request.args.get('area_uuid')

        # TODO check if the given area_uuid belongs to the given project
        # doc_ref = db.collection(u'areas').document(project_id)
        # areas = doc_ref.get().to_dict()
        # # Please check areas data structure to understand the following line
        # if not any(next(iter(x.values()))['uuid'] == area_uuid for x in areas['areas']):
        #     return ('Data inconsistency', 400, { 'Access-Control-Allow-Origin': '*' } )

        cursor.execute("SELECT geom FROM project_areas WHERE area_uuid = %s AND project_id = %s", [str(area_uuid), str(project_id)])
        area = cursor.fetchone()[0]
        # print(wkb.loads(area, hex=True)) # DEBUG
        # cursor.close()
        return wkb.loads(area, hex=True);
        # return unary_union([shape(wkt.loads(polygon['geom'])) for polygon in source])
    except Exception as error:
        print(traceback.format_exc())
        return (str(error), 400, { 'Access-Control-Allow-Origin': '*' } )
    finally:
        cursor.close()

    # Create a multipolygon by merging all features - needed for zonal statistics


def create_ee_geometry(geojson):
    geom_type = geojson['type']
    coords = geojson.get('coordinates', None)
    
    if geom_type == 'GeometryCollection':
        geometries = geojson['geometries']
        ee_geometries = [create_ee_geometry(g) for g in geometries]
        features = [ee.Feature(geometry) for geometry in ee_geometries]
        return ee.FeatureCollection(features)
    elif geom_type == 'Point':
        return ee.Geometry.Point(coords)
    elif geom_type == 'Polygon':
        return ee.Geometry.Polygon(coords)
    elif geom_type == 'MultiPolygon':
        return ee.Geometry.MultiPolygon(coords)
    elif geom_type == 'LineString':
        return ee.Geometry.LineString(coords)
    elif geom_type == 'MultiLineString':
        return ee.Geometry.MultiLineString(coords)
    elif geom_type == 'MultiPoint':
        return ee.Geometry.MultiPoint(coords)
    else:
        raise ValueError(f"Unsupported geometry type: {geom_type}")

def _get_geometry(polygon=None, adm2_code=None):
    
    if not any([polygon, adm2_code]):
        raise Exception("geojsson or gaul_code has to be passed")
    
    if polygon:
        
        # # decode geojson
        # # decoded_polygon = json.loads(polygon)
        # return ee.Geometry.MultiPolygon(polygon["coordinates"])
        return create_ee_geometry(polygon)
    
    return (
        ee.FeatureCollection("FAO/GAUL/2015/level2")
            .filter(ee.Filter.eq("ADM2_CODE", int(adm2_code)))
    )

def _zonal_stats(asset_id, ini_date, end_date, band, polygon=None, adm2_code=None, categorical=False):
    """
    Calculate zonal statistics for each of the images in input ImageCollection
    
    Args:
        asset_id (string): Image collection asset ID
        discrete (bool): Whether the input has discrete values or not (continuous, default)
        ini_date (string): Starting date to filter collection in format %YYYY-mm-dd
        end_date (string): Stop date to filter collection in format %YYYY-mm-dd
        band (string): Name of the band which cotains the target variable
        statistic (string): Reduction statistic to reduce results when using 
        polygon (geojson, str): geojson geometry, mandatory if not adm2_code
        adm2_code (str): FAO GAUL adm2_code, mandatory if not polygon
        
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

        print('Using reduce_categorical')
        # Using categorical areas
        reduced = (ee.Image.pixelArea().divide(1e4)
          .addBands(image)
          .reduceRegion(**{
            "reducer":ee.Reducer.sum().group(1), 
            "geometry":geometry,
            "scale": 1,
            "bestEffort": True
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

        print('Using reduce_continuos')
        # Using continuos
        reduced = (image
          .reduceRegion(**{
            "reducer": ee.Reducer.minMax().combine(**{
              "reducer2": ee.Reducer.mean(),
              "sharedInputs": True
            }), 
            "geometry": geometry,
            "scale": 1,
            "bestEffort": True
          }
        ))

        stats = ee.List(["min", "max", "mean"])
        append = stats.map(lambda x: ee.String("_").cat(ee.String(x)))

        from_name = append.map(lambda x: ee.String(image.bandNames().get(0)).cat(ee.String(x)))

        return ee.Feature(
            None, 
            reduced
            # reduced.combine(
            #     image.toDictionary(["system:time_start", "system:time_end", "system:id"]).rename(
            #         ["system:time_start", "system:time_end", "system:id"],
            #         ["system_time_start", "system_time_end", "system_id"])
            # )
            .rename(from_name, stats)
        )
    
    geometry = _get_geometry(polygon, adm2_code)
    
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
    ret = computed_object.map(lambda x: ee.Feature(x).toDictionary()).getInfo()
    return ret

def get_polygon_zonal_stats(request):
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
        project_id = request.args.get('project_id')
        statistics_id = request.args.get('statistics')

        multipolygon = _get_area_multipolygon(area_uuid, project_id)
        geojson = mapping(multipolygon)

        params = data_sources[statistics_id]

        print(f'Calculating polygon zonal stats: asset_id = {params["asset_id"]}, ini_date = {params["ini_date"]}, end_date=params["end_date"], band={ params["band"]}, categorical={params["categorical"]}')
        statistics = _zonal_stats(params['asset_id'], params['ini_date'], params['end_date'], params['band'], polygon=geojson, categorical=params['categorical'])

        return (json.dumps(statistics), 200, { 'Access-Control-Allow-Origin': '*' })
    # except EmptyResultError:
    #     print(traceback.format_exc())
    #     return ('Empty polygon', 400, { 'Access-Control-Allow-Origin': '*' })
    except Exception:
        print(traceback.format_exc())
        return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })

def get_adm2_zonal_stats(request):
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
        adm2_code = request.args.get('adm2_code')
        statistics_id = request.args.get('statistics')

        params = data_sources[statistics_id]

        print(f'Calculating admin 2 zonal stats: adm2_code={adm2_code}, asset_id = {params["asset_id"]}, ini_date = {params["ini_date"]}, end_date=params["end_date"], band={params["band"]}, categorical={params["categorical"]}')
        statistics = _zonal_stats(params['asset_id'], params['ini_date'], params['end_date'], params['band'], adm2_code=adm2_code, categorical=params['categorical'])

        return (json.dumps(statistics), 200, { 'Access-Control-Allow-Origin': '*' })
    # except EmptyResultError:
    #     print(traceback.format_exc())
    #     return ('Empty polygon', 400, { 'Access-Control-Allow-Origin': '*' })
    except Exception:
        print(traceback.format_exc())
        return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })
