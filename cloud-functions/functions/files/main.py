# Here project and document have been used interchangeably - have no time to fix it now

import logging
from tempfile import TemporaryDirectory

from functools import wraps
from flask import abort, jsonify

import os
import traceback
from tempfile import TemporaryDirectory, NamedTemporaryFile

from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest


from google.cloud import storage
from firebase_admin import auth, firestore, initialize_app


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

initialize_app()

dst_bucket = 'fao-ferm.appspot.com'


# To deploy:
# REGION=europe-west3
# gcloud functions deploy upload_project_file --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated \





db = firestore.client()

def authenticated(fn):
    @wraps(fn)
    def wrapped(request):
        if request.method == 'OPTIONS':
            # Allows GET requests from any origin with the Content-Type
            # header and caches preflight response for an 3600s
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE',
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
            
            if not project_id:
                raise BadRequest("Missing project_id")

            doc_ref = db.collection(u'registry').document(project_id)
            doc = doc_ref.get()

            privileges = verified.get('privileges', {})
            group = doc.to_dict().get('group')

            if not verified['admin']:
                if group is not None and privileges.get(group) not in ('admin', 'editor'):
                    raise ValueError(f'User is not admin or editor in group {group}')

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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Max-Age': '3600'
            })
        # Execute the authenticated function
        return fn(request)
    # Return the input function "wrapped" with our
    # authentication check, i.e. fn(authenticated(request))
    return wrapped


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

@authenticated
def upload_project_file(request):
    tmp_dir = None
    try:
        # Create a temporary directory where to store zip file and expanded ones
        tmp_dir = TemporaryDirectory()
        project_id, temp_file, _, path, orig_filename = _handle_upload(request, tmp_dir)
        _upload_to_bucket(project_id, temp_file, path, orig_filename)

        return ('File uploaded', 200, { 'Access-Control-Allow-Origin': '*' })

    except Exception as error:
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, {'Access-Control-Allow-Origin': '*'})
    finally:
        if tmp_dir:
            tmp_dir.cleanup()

def _upload_to_bucket(project_id, temp_file, path, orig_filename):
    if (path != None and path != ''):
        dst_path = '%s/%s/%s' % (project_id, path, secure_filename(orig_filename))
    else:
        dst_path = '%s/%s' % (project_id, secure_filename(orig_filename))
    try:
        upload_blob(dst_bucket, temp_file, dst_path)
    except Exception as e:
        dst_path = None
        logger.error('Couldn\'t save original file in bucket: %s' % e)
        logger.error(traceback.format_exc())
    return dst_path

def _handle_upload(request, tmp_dir):
    form_data = request.form.to_dict()
    project_id = form_data.get('project_id')
    path = form_data.get('path')

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

    return project_id, temp_file, temp_file_path, path, orig_filename

@authenticated
def list_document_files(request):
    try:
        project_id = request.args.get('project_id')
        file_path = request.args.get('path', '')
        if not project_id:
            raise BadRequest("Missing project_id")
        
        storage_client = storage.Client()
        prefix = f'{project_id}/{file_path}'.rstrip('/') + '/'
        blobs = storage_client.list_blobs(dst_bucket, prefix=prefix, delimiter='/')

        files = []
        for blob in blobs:
            if not blob.name.endswith('/'):  # Ensuring it's not a directory
                files.append({'name': blob.name.split('/')[-1], 'path': blob.name})

        return jsonify(files), 200, {'Access-Control-Allow-Origin': '*'}
    except BadRequest as e:
        return str(e), 400, {'Access-Control-Allow-Origin': '*'}
    except Exception as error:
        logger.error(traceback.format_exc())
        return 'Internal server error', 500, {'Access-Control-Allow-Origin': '*'}

@authenticated
def delete_document_file(request):
    try:
        project_id = request.args.get('project_id')
        file_path = request.args.get('file_path')
        if not project_id:
            raise BadRequest("Missing project_id")
        if not file_path or not file_path.startswith(project_id):
            raise BadRequest("Invalid file_path")

        bucket = storage.Client().bucket(dst_bucket)
        blob = bucket.blob(file_path)
        blob.delete()


        return ('File deleted', 200, { 'Access-Control-Allow-Origin': '*' })
    except Exception as error:
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })

@authenticated
def download_document_file(request):
    try:
        project_id = request.args.get('project_id')
        file_path = request.args.get('file_path')
        if not project_id:
            raise BadRequest("Missing project_id")
        if not file_path or not file_path.startswith(project_id):
            raise BadRequest("Invalid file_path")
        
        bucket = storage.Client().bucket(dst_bucket)
        blob = bucket.blob(file_path)
        blob.reload()
        content = blob.download_as_bytes()
        filename = blob.name.split('/')[-1]
        return (content, 200, {
            'Content-Disposition': 'attachment; filename="%s"' % filename,
            'Access-Control-Allow-Origin': '*'
        })
    except Exception as error:
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, { 'Access-Control-Allow-Origin': '*' })