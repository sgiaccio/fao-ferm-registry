import json
import requests
import traceback

from google.cloud import bigquery

import fiona
# from fiona.crs import from_epsg
from shapely import wkt
from shapely.geometry import mapping, shape
from shapely.ops import unary_union
from flask import jsonify


BQ = bigquery.Client()

def _get_area_multipolygon(area_uuid):
    # TODO SQL injection
    source = BQ.query(f'SELECT ST_ASTEXT(geometry) AS geom, project_id FROM fao-ferm2-review.registry.areas WHERE area_uuid = "{area_uuid}"')  # Make an API request.

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
    except Exception:
         print(traceback.format_exc())


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
        band = request.args.get('band')
        gee_id = request.args.get('gee_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        categorical = request.args.get('categorical')

        multipolygon = _get_area_multipolygon(area_uuid)

        geojson = mapping(multipolygon)
        json = {
            'GEE_imageCollection_id': gee_id,
            # 'band': 'elevation',
            'geojson': geojson
        }
        if band != None:
            json['band'] = band
        if start_date != None and end_date != None:
            json['dateRange'] = {
                'startDate': start_date,
                'endDate': end_date
            }
        if categorical == "true":
            json['categorical'] = True
        
        # TODO catch http errors
        response = requests.post('https://api.data.apps.fao.org/api/v2/map/zonalstats', json=json)
        if response:
            return (jsonify(response.json()), 200, { 'Access-Control-Allow-Origin': '*' })
        else:
            return (response.reason, 400, { 'Access-Control-Allow-Origin': '*' })
    except Exception:
        print(traceback.format_exc())
        return ('Internal server error', 400, { 'Access-Control-Allow-Origin': '*' })
