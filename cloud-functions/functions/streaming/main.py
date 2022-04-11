# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


'''
This Cloud function is responsible for:
- Parsing and validating new files added to Cloud Storage.
- Checking for duplications.
- Inserting files' content into BigQuery.
- Logging the ingestion status into Cloud Firestore and Stackdriver.
- Publishing a message to either an error or success topic in Cloud Pub/Sub.
'''

import json
# import logging
import os
# import traceback
from datetime import datetime

from google.api_core import retry
from google.cloud import bigquery
from google.cloud import firestore
# from google.cloud import pubsub_v1
from google.cloud import storage
import pytz
import fiona
from shapely.ops import unary_union

from zipfile import ZipFile
import glob
import shutil

import tempfile
from werkzeug.utils import secure_filename


PROJECT_ID = os.getenv('GCP_PROJECT')
BQ_DATASET = 'registry'
BQ_TABLE = 'areas'
ERROR_TOPIC = 'projects/%s/topics/%s' % (PROJECT_ID, 'streaming_error_topic')
SUCCESS_TOPIC = 'projects/%s/topics/%s' % (PROJECT_ID, 'streaming_success_topic')
DB = firestore.Client()
CS = storage.Client()
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


def streaming(data, context):
    '''This function is executed whenever a file is added to Cloud Storage'''
    # bucket_name = data['bucket']
    shp_file_path = download_unzip(data)
    _insert_into_bigquery(shp_file_path)

def _insert_into_bigquery(project_id, shp_file_path):
    rows = convert(project_id, shp_file_path)
    table = BQ.dataset(BQ_DATASET).table(BQ_TABLE)
    errors = BQ.insert_rows_json(table, rows)
    if errors != []:
        raise BigQueryError(errors)

def convert(project_id, file):
    with fiona.open(file) as source:
        polygons = [{
            'geometry': json.dumps(record['geometry']),
            'project_id': project_id,
            'public': True
        } for record in source]
        return polygons
        # Option 2: merge all polygons in a multipolygon, needs to check if they are already multipolygons first
        # union = MultiPolygon([shape(pol['geometry']) for pol in source])
        # return [{"geometry": json.dumps(mapping(union))}]
                
# def _handle_success(db_ref):
#     message = 'File \'%s\' streamed into BigQuery' % db_ref.id
#     doc = {
#         u'success': True,
#         u'when': _now()
#     }
#     db_ref.set(doc)
#     PS.publish(SUCCESS_TOPIC, message.encode('utf-8'), file_name=db_ref.id)
#     logging.info(message)


# def _handle_error(db_ref):
#     message = 'Error streaming file \'%s\'. Cause: %s' % (db_ref.id, traceback.format_exc())
#     doc = {
#         u'success': False,
#         u'error_message': message,
#         u'when': _now()
#     }
#     db_ref.set(doc)
#     PS.publish(ERROR_TOPIC, message.encode('utf-8'), file_name=db_ref.id)
#     logging.error(message)


def _now():
    return datetime.utcnow().replace(tzinfo=pytz.utc).strftime('%Y-%m-%d %H:%M:%S %Z')


class BigQueryError(Exception):
    '''Exception raised whenever a BigQuery error happened''' 

    def __init__(self, errors):
        super().__init__(self._format(errors))
        self.errors = errors

    def _format(self, errors):
        err = []
        for error in errors:
            err.extend(error['errors'])
        return json.dumps(err)

tmpdirname = '/tmp'

def download_unzip(file):
    storage_client = storage.Client()

    source_blob_name = file['name']
    bucket_name = file['bucket']

    destination_file_name = os.path.join(tmpdirname, source_blob_name)

    bucket = storage_client.bucket(bucket_name)

    # Construct a client side representation of a blob.
    # Note `Bucket.blob` differs from `Bucket.get_blob` as it doesn't retrieve
    # any content from Google Cloud Storage. As we don't need additional data,
    # using `Bucket.blob` is preferred here.
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)

    # print(
    #     "Downloaded storage object {} from bucket {} to local file {}.".format(
    #         source_blob_name, bucket_name, destination_file_name
    #     )
    # )

    # with tempfile.TemporaryDirectory(dir="/tmp") as tmpdir:
    with ZipFile(destination_file_name) as zip_file:
        # print(zip_file.namelist())
        # Flatten the zip file content in tmp
        for member in zip_file.namelist():
            filename = os.path.basename(member)
            # skip directories
            # print(filename)
            if not filename:
                continue

            # copy file (taken from zipfile's extract)
            source = zip_file.open(member)
            target = open(os.path.join(tmpdirname, filename), 'wb')
            # print(target)
            with source, target:
                shutil.copyfileobj(source, target)

        # Find the .shp file
        target_pattern = os.path.join(tmpdirname, '*.shp')
        # print(os.listdir(tmpdirname))
        # print("----------------")
        # print(target_pattern)
        # print(glob.glob(target_pattern))
        # print(glob.glob(target_pattern)[0])
        # df = geopandas.read_file(glob.glob(target_pattern)[0], driver='shapefile')
        # print(df)
        return glob.glob(target_pattern)[0]







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


def parse_multipart(request):
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

    project_id = request.form.to_dict()['project_id'] # TODO don't have time

    file = request.files['file']
    file_path = get_file_path(file.filename)

    file.save(file_path)
    
    files = flat_unzip(file_path, tmpdirname)

    # Find the .shp file
    target_pattern = os.path.join(tmpdirname, '*.shp')
    shp_file_path = glob.glob(target_pattern)[0]
    # TODO check if shp_file is null
    _insert_into_bigquery(project_id, shp_file_path)

    # Clear temporary directory
    for file_path in files:
        os.remove(file_path)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    return ('Done!', 200, headers)

from shapely import wkt
from shapely.geometry import mapping, shape, MultiPolygon
from flask import make_response, send_file
from fiona.crs import from_epsg
import traceback

def project_areas(request):
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

    # This code will process each non-file field in the form
    # SELECT ST_ASTEXT(geometry) FROM `fao-ferm2-review.registry.areas`
    polygons = BQ.query('SELECT ST_ASTEXT(geometry) AS geom, project_id FROM fao-ferm2-review.registry.areas WHERE public')  # Make an API request.

    schema = {
        'geometry': 'Polygon',
        'properties': { 'project_id': 'str' }
    }
    # with fiona.MemoryFile() as memfile:
    #     for row in polygons:
    #         p = wkt.loads(row.geom)
    #         memfile.write({
    #             'geometry': mapping(p),
    #             'properties': { 'registry_id': "abc123" },
    #         })
    #     return (memfile, 200, headers)

    f_out = "/tmp/output.json"
    try:
        with fiona.open(
                f_out,
                'w',
                driver='GeoJSON',
                crs = from_epsg(4326),
                schema=schema) as sink:
            for row in polygons:
                p = wkt.loads(row.geom)
                sink.write({
                    'geometry': mapping(p),
                    'properties': { 'project_id': row.project_id },
                })
        # return ('', 204, headers)
    except Exception:
         print(traceback.format_exc())

    response = make_response(send_file('/tmp/output.json'))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
