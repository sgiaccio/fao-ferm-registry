'''
This Cloud function is responsible for:
- Parsing and validating new files added to Cloud Storage.
- Checking for duplications.
- Inserting files' content into BigQuery.
- Logging the ingestion status into Cloud Firestore and Stackdriver.
- Publishing a message to either an error or success topic in Cloud Pub/Sub.
'''

# import logging
import os
import json
from zipfile import ZipFile
import glob
import shutil
import traceback
# from datetime import datetime
from uuid import uuid1

# from google.api_core import retry
from google.cloud import bigquery
# from google.cloud import firestore
# from google.cloud import pubsub_v1
# from google.cloud import storage
# import pytz

import fiona

import tempfile
from werkzeug.utils import secure_filename


PROJECT_ID = os.getenv('GCP_PROJECT')
BQ_DATASET = 'registry'
BQ_TABLE = 'areas'
ERROR_TOPIC = 'projects/%s/topics/%s' % (PROJECT_ID, 'streaming_error_topic')
SUCCESS_TOPIC = 'projects/%s/topics/%s' % (PROJECT_ID, 'streaming_success_topic')
# DB = firestore.Client()
# CS = storage.Client()
# PS = pubsub_v1.PublisherClient()
BQ = bigquery.Client()


# def streaming(data, context):
#     '''This function is executed whenever a file is added to Cloud Storage'''
#     bucket_name = data['bucket']
#     file_name = data['name']
#     print(f"Processing file: {file_name}.")
    
#     # db_ref = DB.document(u'streaming_files/%s' % file_name)
#     _insert_into_bigquery(bucket_name, file_name)
#     # try:
#     #     _insert_into_bigquery(bucket_name, file_name)
#     #     # _handle_success(db_ref)
#     # except Exception:
#     #     # _handle_error(db_ref)
#     #     pass

from functools import wraps
from firebase_admin import auth 
import firebase_admin

firebase_admin.initialize_app()
from flask import abort

def authenticated(fn):
    @wraps(fn)
    def wrapped(request):
        if request.method == 'OPTIONS':
            # Allows GET requests from any origin with the Content-Type
            # header and caches preflight response for an 3600s
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Max-Age': '3600'
            }

            return ('', 204, headers)

        try:
            # Extract the firebase token from the HTTP header
            token = request.headers['Authorization']
            token = token.replace('Bearer ', '')
            # Validate the token
            verified = auth.verify_id_token(token)
            print(verified)
        except Exception as e:
            # If an exception occured above, reject the request
            return abort(401, f'Invalid Credentials:{e}')
        # Execute the authenticated function
        return fn(request)
    # Return the input function "wrapped" with our
    # authentication check, i.e. fn(authenticated(request))
    return wrapped

def _insert_into_bigquery(project_id, shp_file_path, uuid):
    with open(shp_file_path, "r") as f:
        print(f.read())

    # TODO catch errors
    with fiona.open(shp_file_path) as source:
        for record in source:
            job = BQ.query(f"""INSERT INTO `fao-ferm2-review.registry.areas` (geometry, project_id, area_uuid, public, last_change_date, deleted) VALUES (ST_GEOGFROMGEOJSON('{json.dumps(record['geometry'])}'), "{project_id}", "{str(uuid)}", {True}, CURRENT_DATE(), {False})""")
            print(job.result())
    # if errors != []:
    #     raise BigQueryError(errors)

# def convert(project_id, file):
#     with fiona.open(file) as source:
#         polygons = [{
#             'geometry': json.dumps(record['geometry']),
#             'project_id': project_id,
#             'public': True
#         } for record in source]
#         return polygons
#         # Option 2: merge all polygons in a multipolygon, needs to check if they are already multipolygons first
#         # union = MultiPolygon([shape(pol['geometry']) for pol in source])
#         # return [{"geometry": json.dumps(mapping(union))}]
                
# def _now():
#     return datetime.utcnow().replace(tzinfo=pytz.utc).strftime('%Y-%m-%d %H:%M:%S %Z')

# class BigQueryError(Exception):
#     '''Exception raised whenever a BigQuery error happened''' 

#     def __init__(self, errors):
#         super().__init__(self._format(errors))
#         self.errors = errors

#     def _format(self, errors):
#         err = []
#         for error in errors:
#             err.extend(error['errors'])
#         return json.dumps(err)

tmpdirname = '/tmp'

# Helper function that computes the filepath to save files to
def get_file_path(filename):
    # Note: tempfile.gettempdir() points to an in-memory file system
    # on GCF. Thus, any files in it must fit in the instance's memory.
    file_name = secure_filename(filename)
    return os.path.join(tempfile.gettempdir(), file_name)

def flat_unzip(file_path, dest_dir):
    files = []

    with ZipFile(file_path) as zip_file:
        # print(zip_file.namelist())
        # Flatten the zip file content in tmp
        for member in zip_file.namelist():
            filename = os.path.basename(member)
            # skip directories
            if not filename:
                continue

            # copy file (taken from zipfile's extract)
            source = zip_file.open(member)
            target_path = os.path.join(dest_dir, filename)
            target = open(target_path, 'wb')
            with source, target:
                shutil.copyfileobj(source, target)
                files.append(target_path)
    return files


@authenticated
def load_json(request):
    try:
        project_id = request.form.to_dict()['project_id'] # TODO don't have time

        st_geojson = request.form.get('geojson')
        file_path = get_file_path('temp.geojson')
        
        with open(file_path, "w") as f:
            f.write(st_geojson)

        uuid = uuid1()
        _insert_into_bigquery(project_id, file_path, uuid)

        # Clear temporary directory
        os.remove(file_path)

        return (str(uuid), 200, { 'Access-Control-Allow-Origin': '*' })
    except:
        print(traceback.format_exc())
        return ('Internal server error', 400, { 'Access-Control-Allow-Origin': '*' } )


def load_shapefile(request):
    """ Parses a 'multipart/form-data' upload request
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    headers = { 'Access-Control-Allow-Origin': '*' }
    try:
        project_id = request.form.to_dict()['project_id'] # TODO don't have time

        file = request.files['file']
        file_path = get_file_path(file.filename)
        file.save(file_path)
        
        files = flat_unzip(file_path, tmpdirname)

        # Find the .shp file
        target_pattern = os.path.join(tmpdirname, '*.shp')
        shp_file_path = glob.glob(target_pattern)[0]
        # TODO check if shp_file is null
        uuid = uuid1()
        _insert_into_bigquery(project_id, shp_file_path, uuid)

        # Clear temporary directory
        for file_path in files:
            os.remove(file_path)

        return (str(uuid), 200, headers)
    except:
        headers = { 'Access-Control-Allow-Origin': '*' }
        print(traceback.format_exc())
        return ('Internal server error', 400, headers )
