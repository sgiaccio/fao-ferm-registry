from logging import getLogger
from tempfile import TemporaryDirectory

from functools import wraps
from flask import abort, g
# from fastkml import kml

import os
import shutil
import traceback
from glob import glob
from tempfile import TemporaryDirectory, NamedTemporaryFile
from uuid import uuid1
import json

import time

from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest

import fiona

from shapely import wkt
from shapely.geometry import shape, GeometryCollection
from shapely.ops import transform

import pyproj
from pyproj.exceptions import CRSError

import psycopg2

from zipfile import ZipFile, BadZipFile

from google.cloud import storage
from firebase_admin import auth, firestore, initialize_app


fiona.drvsupport.supported_drivers['KML'] = 'rw'

logger = getLogger(__name__)

initialize_app()


# To deploy:
# gcloud functions deploy load_shapefile_multiple --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \
#     --set-env-vars DB_USER=foo,DB_PASS=bar,DB_NAME=boo,INSTANCE_UNIX_SOCKET=vaf
#
# gcloud functions deploy get_area_json --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \
#     --set-env-vars DB_USER=foo,DB_PASS=bar,DB_NAME=boo,INSTANCE_UNIX_SOCKET=vaf
#
# gcloud functions deploy load_area_json --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \
#     --set-env-vars DB_USER=foo,DB_PASS=bar,DB_NAME=boo,INSTANCE_UNIX_SOCKET=vaf
#
# gcloud functions deploy load_kml_kmz --region=europe-west3 \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \
#     --set-env-vars DB_USER=foo,DB_PASS=bar,DB_NAME=boo,INSTANCE_UNIX_SOCKET=vaf



# TODO use Google secrets
db_user = 'ferm_registry'
db_pass = '***REMOVED***'
db_name = 'ferm_registry'
unix_socket_path = '/cloudsql/fao-ferm:europe-west4:fao-ferm-postgres'
dst_bucket = 'ferm_file_transfer'

db = firestore.client()

def authenticated(fn):
    @wraps(fn)
    def wrapped(request):
        if request.method == 'OPTIONS':
            # Allows GET requests from any origin with the Content-Type
            # header and caches preflight response for an 3600s
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
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
            # g.verified = verified

            if request.form:
                project_id = request.form['project_id']
            else:
                project_id = request.args['project_id']
            
            doc_ref = db.collection(u'registry').document(project_id)
            doc = doc_ref.get()

            privileges = verified.get('privileges', {})
            group = doc.to_dict().get('group')

            if not verified['admin']:
                if group is not None and privileges.get(group) not in ('admin', 'editor'):
                    raise ValueError(f'User is not in admin nor editor in group {group}')

                # Group is not there so it's a new record - check if the user is editor or admin in at least one group
                # It works if there's only one group per user but otherwise authorization has to be reviewed
                at_least_one_group = "admin" in privileges.values() or "editor" in privileges.values()
                if not at_least_one_group:
                    raise ValueError(f'User not allowed')
        except Exception as e:
            # If an exception occured above, reject the request
            logger.error(traceback.format_exc())
            return abort(401, f'Invalid Credentials: {e}', {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Max-Age': '3600'
            })
        # Execute the authenticated function
        return fn(request)
    # Return the input function "wrapped" with our
    # authentication check, i.e. fn(authenticated(request))
    return wrapped

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
        return conn
    except psycopg2.Error as e:
        print('Error: Couldn\'t connect to the Postgres database')
        print(e)

conn = connect_unix_socket()

def flat_unzip(file, dest_dir):
    files = []

    with ZipFile(file) as zip_file:
        # Flatten the zip file content in tmp
        for member in zip_file.namelist():
            filename = os.path.basename(member)
            # Skip directories
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

def _insert_into_postgis(project_id, shp_file_path, bucket_path, orig_filename, dissolve=False):
    cursor = conn.cursor()

    uuid_list = []
    geometries = []

    try:
        with fiona.open(shp_file_path) as source:
            p_in = pyproj.Proj(source.crs)
            project = pyproj.Transformer.from_proj(
                p_in, # source coordinate system
                pyproj.Proj(init='epsg:4326')) # destination coordinate system

            # Read and transform the geometries to EPSG:4326
            for record in source:
                geometry_type = record['geometry']['type']
                assert geometry_type in ['Point', 'MultiPoint', 'Polygon', 'MultiPolygon', '3D Point', '3D MultiPoint', '3D Polygon', '3D MultiPolygon', 'LineString'], 'Invalid geometry type: %s' % geometry_type

                geometry = shape(record['geometry'])
                # Reproject the polygon
                geometry4326 = transform(project.transform, geometry)  # apply projection
                geometries.append(geometry4326)

        if dissolve:
            uuid = uuid1()

            geometry_collection = GeometryCollection(geometries)
            cursor.execute("INSERT INTO project_areas (source, project_id, area_uuid, geom, bucket_path, orig_filename) VALUES ('shapefile', %s, %s, ST_Force2D(ST_GeomFromText(%s, 4326)), %s, %s)",
                            (project_id, str(uuid), wkt.dumps(geometry_collection), bucket_path, orig_filename))
            
            uuid_list.append(str(uuid))
        else:
            for geom in geometries:
                uuid = uuid1()
    
                cursor.execute("INSERT INTO project_areas (source, project_id, area_uuid, geom, bucket_path, orig_filename) VALUES ('shapefile', %s, %s, ST_Force2D(ST_GeomFromText(%s, 4326)), %s, %s)", (project_id, str(uuid), wkt.dumps(geom), bucket_path, orig_filename))

                uuid_list.append(str(uuid))
            
        conn.commit()
        return uuid_list
    except CRSError as e:
        conn.rollback()
        print('Unknown projection')
        print(e)
        raise
    except Exception as e:
        conn.rollback()
        print("Error inserting polygons into db")
        print(e)
        raise
    finally:
        cursor.close()

def upload_blob(bucket_name, source_file, destination_blob_name):
    """Uploads a file to the bucket."""
    # The ID of your GCS bucket
    # bucket_name = "your-bucket-name"
    # The path to your file to upload
    # source_file_name = "local/path/to/file"
    # The ID of your GCS object
    # destination_blob_name = "storage-object-name"
    
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_file(source_file, rewind=True)
    # blob.upload_from_filename(source_file_name)

def load_geometries(request, file_handler, dissolve=False):
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        return ('', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Max-Age': '3600'
        })
    tmp_dir = None
    try:
        # Create a temporary directory where to store zip file and expanded ones
        tmp_dir = TemporaryDirectory()
        project_id, temp_zipfile, temp_zipfile_path, orig_filename = _handle_upload(request, tmp_dir)
        bucket_dst_path = _upload_to_bucket(project_id, temp_zipfile, orig_filename)

        shp_file_path = file_handler(tmp_dir, temp_zipfile, temp_zipfile_path)
        # shp_file_path = _unzip_and_find_shapefile(tmp_dir, temp_zipfile)
        uuids = _insert_into_postgis(project_id, shp_file_path, bucket_dst_path, orig_filename, dissolve)
        # Get the areas of the inserted polygons
        areas = _fetch_areas(project_id, uuids)

        print('Areas inserted: %s' % len(areas))

        # return the uuids
        # return (json.dumps(uuids), 200, { 'Access-Control-Allow-Origin': '*' })
        # return the areas
        return (json.dumps(areas), 200, { 'Access-Control-Allow-Origin': '*' })

    except AssertionError as error:
        logger.error(traceback.format_exc())
        return (str(error), 400, {'Access-Control-Allow-Origin': '*'})
    except FileHandlerError as error:
        logger.error(traceback.format_exc())
        return (str(error), 400, {'Access-Control-Allow-Origin': '*'})
    except CRSError as error:
        logger.error(traceback.format_exc())
        return ('Unknown projection', 400, {'Access-Control-Allow-Origin': '*'})
    except BadRequest as error:
        logger.error(traceback.format_exc())
        return (str(error), 400, {'Access-Control-Allow-Origin': '*'})
    except Exception as error:
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, {'Access-Control-Allow-Origin': '*'})
    finally:
        if tmp_dir:
            tmp_dir.cleanup()

def _fetch_areas(project_id, uuids):
    cursor = conn.cursor()
    cursor.execute("SELECT area_uuid, ST_Area(ST_Transform(ST_SetSRID(geom::geometry, 4326), 6933)) AS area_sqm FROM project_areas WHERE area_uuid IN %s AND project_id = %s", [tuple(uuids), str(project_id)])   
    areas = cursor.fetchall()
    cursor.close()
    return areas

# Define a custom exception for file handling errors
class FileHandlerError(Exception):
    pass

def _unzip_and_find_shapefile(tmp_dir, temp_zipfile, _):
    try:
        flat_unzip(temp_zipfile, tmp_dir.name)
        target_pattern = os.path.join(tmp_dir.name, '*.shp')
        file_paths = glob(target_pattern)
        assert len(file_paths) == 1, 'zip file should contain one and only one shapefile'
        return file_paths[0]
    except BadZipFile:
        raise FileHandlerError("An error occurred while handling the file.")

def _upload_to_bucket(project_id, temp_zipfile, orig_filename):
    bucket_subdir = time.strftime("%Y%m%d-%H%M%S")
    dst_path = '%s/%s/%s' % (project_id, bucket_subdir, secure_filename(orig_filename))
    try:
        upload_blob(dst_bucket, temp_zipfile, dst_path)
    except Exception as e:
        dst_path = None
        logger.error('Couldn\'t save original file in bucket: %s' % e)
        logger.error(traceback.format_exc())
    return dst_path

def _handle_upload(request, tmp_dir):
    form_data = request.form.to_dict()
    project_id = form_data.get('project_id')
    if not project_id:
        raise BadRequest("Missing project_id")

    file = request.files.get('file')
    if not file:
        raise BadRequest("Missing file")

    orig_filename = file.filename
    _, file_extension = os.path.splitext(orig_filename)  # Extract file extension

    temp_file = NamedTemporaryFile(dir=tmp_dir.name, suffix=file_extension, delete=False)
    temp_file_path = temp_file.name  # Get the full path of the temporary file

    file.save(temp_file)
    temp_file.seek(0)  # Move file pointer to the beginning

    return project_id, temp_file, temp_file_path, orig_filename

@authenticated
def get_polygon_area(request):
    """ Returns the area of a polygon
    Args:
        request (flask.Request): The request object.
    Returns:
        The area of the polygon
    """
    area_uuid = request.args['area_uuid']
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT ST_Area(ST_Transform(ST_SetSRID(geom::geometry, 4326), 6933)) FROM project_areas WHERE area_uuid = %s", [str(area_uuid)])
        area = cursor.fetchone()[0]
        return (str(area), 200, { 'Access-Control-Allow-Origin': '*' })
    except Exception as error:
        print(traceback.format_exc())
        return (str(error), 400, { 'Access-Control-Allow-Origin': '*' })
    finally:
        cursor.close()


# def get_file_path(filename):
#     # Note: tempfile.gettempdir() points to an in-memory file system
#     # on GCF. Thus, any files in it must fit in the instance's memory.
#     file_name = secure_filename(filename)
#     return os.path.join(gettempdir(), file_name)

@authenticated
def load_area_json(request):
    tmp_dir = None
    try:
        project_id = request.form.to_dict()['project_id'] # TODO don't have time

        st_geojson = request.form.get('geojson')
        tmp_dir = TemporaryDirectory()
        file_path = os.path.join(tmp_dir.name, 'temp.geojson')

        with open(file_path, "w") as f:
            f.write(st_geojson)

        uuids = _insert_into_postgis(project_id, file_path, None, None)

        return (json.dumps(uuids), 200, { 'Access-Control-Allow-Origin': '*' })
    except AssertionError as error:
        print(traceback.format_exc())
        return (str(error), 400, { 'Access-Control-Allow-Origin': '*' } )
    except Exception as error:
        print(traceback.format_exc())
        return ('Internal server error: %s' % str(error), 400, { 'Access-Control-Allow-Origin': '*' } )
    finally:
        if tmp_dir is not None:
            tmp_dir.cleanup()

@authenticated
def get_area_json(request):
    """ Returns a GeoJson with all the polygons
    Args:
        request (flask.Request): The request object.
    Returns:
        a GeoJson representation of the area
    """

    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*', # TODO ferm.fao.org
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    cursor = conn.cursor()
    try:
        project_id = request.args['project_id']
        area_uuid = request.args.get('area_uuid')

        # TODO check if the given area_uuid belongs to the given project
        # doc_ref = db.collection(u'areas').document(project_id)
        # areas = doc_ref.get().to_dict()
        # # Please check areas data structure to understand the following line
        # if not any(next(iter(x.values()))['uuid'] == area_uuid for x in areas['areas']):
        #     return ('Data inconsistency', 400, { 'Access-Control-Allow-Origin': '*' } )

        cursor.execute("SELECT ST_AsGeoJSON(geom) FROM project_areas WHERE area_uuid = %s AND project_id = %s", [str(area_uuid), str(project_id)])
        area = cursor.fetchone()[0]
        return (area, 200, { 'Access-Control-Allow-Origin': '*' })
    except Exception as error:
        print(traceback.format_exc())
        return (str(error), 400, { 'Access-Control-Allow-Origin': '*' })
    finally:
        cursor.close()

# load_shapefile = lambda request: load_geometries(request, _unzip_and_find_shapefile, False)
do_not_process = lambda _1, _2, temp_zipfile_path: temp_zipfile_path

@authenticated
def load_shapefile(request):
    return load_geometries(request, _unzip_and_find_shapefile, False)

@authenticated
def load_kml_kmz(request):
    return load_geometries(request, do_not_process, True)


# load_kml_kmz = lambda request: load_geometries(request, do_not_process, True)

# @authenticated
# def load_kml_kmz(request):
#     if request.method == 'OPTIONS':
#         # Allows GET requests from any origin with the Content-Type
#         # header and caches preflight response for an 3600s
#         return ('', 204, {
#             'Access-Control-Allow-Origin': '*',
#             'Access-Control-Allow-Methods': 'GET',
#             'Access-Control-Allow-Headers': 'Content-Type,Authorization',
#             'Access-Control-Max-Age': '3600'
#         })
#     tmp_dir = None
#     try:
#         # Create a temporary directory where to store zip file and expanded ones
#         tmp_dir = TemporaryDirectory()
#         project_id, temp_file, temp_file_path, orig_filename = _handle_upload(request, tmp_dir)
#         bucket_dst_path = _upload_to_bucket(project_id, temp_file, orig_filename)

#         uuids = _insert_into_postgis(project_id, temp_file_path, bucket_dst_path, orig_filename)
#         # Get the areas of the inserted polygons
#         areas = _fetch_areas(project_id, uuids)

#         print('Areas inserted: %s' % len(areas))

#         # return the uuids
#         # return (json.dumps(uuids), 200, { 'Access-Control-Allow-Origin': '*' })
#         # return the areas
#         return (json.dumps(areas), 200, { 'Access-Control-Allow-Origin': '*' })

#     except AssertionError as error:
#         logger.error(traceback.format_exc())
#         return (str(error), 400, {'Access-Control-Allow-Origin': '*'})
#     except BadZipFile as error:
#         logger.error(traceback.format_exc())
#         return ('Uploaded file is not a valid zip file', 400, {'Access-Control-Allow-Origin': '*'})
#     except CRSError as error:
#         logger.error(traceback.format_exc())
#         return ('Unknown projection', 400, {'Access-Control-Allow-Origin': '*'})
#     except Exception as error:
#         logger.error(traceback.format_exc())
#         return ('Internal server error', 500, {'Access-Control-Allow-Origin': '*'})
#     finally:
#         if tmp_dir:
#             tmp_dir.cleanup()
