# REGION=europe-west3
#
# gcloud functions deploy upload_bp_image --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated
#
# gcloud functions deploy delete_bp_image --region=${REGION} \
#     --source=./ --runtime=python39 \
#     --stage-bucket=fao-ferm-functions-staging \
#     --trigger-http --allow-unauthenticated
#

import os
import logging
import traceback
from functools import wraps

from flask import abort

from google.cloud import storage
from firebase_admin import auth, firestore, initialize_app

from wand.image import Image
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest


initialize_app()
db = firestore.client()

storage_client = storage.Client()

thumb_height = 300

origin = 'https://ferm.fao.org'
headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '3600'
}


def get_bp_data(bp_id):
    doc_ref = db.collection_group('bestPractices').where('id', '==', bp_id).limit(1)
    docs = doc_ref.get()

    if not docs:
        raise Exception('Best practice not found')
    doc = docs[0]
    if not doc.exists:
        raise Exception('Best practice not found')

    # Get the parent document
    project_ref = doc.reference.parent.parent
    project = project_ref.get()
    
    project_dict = project.to_dict()
    return (project_dict.get('group'), project_dict.get('status'), project_dict.get('created_by'))

def authenticated(fn):
    @wraps(fn)
    def wrapped(request):
        if request.method == 'OPTIONS':
            return ('', 204, headers)
        try:
            token = request.headers['Authorization']
            if not token:
                return ('Missing token', 401, { 'Access-Control-Allow-Origin': origin })
            decoded_token = auth.verify_id_token(token.replace('Bearer ', ''))
            
            if request.form:
                bp_id = request.form['bp_id']
            else:
                bp_id = request.args['bp_id']
            if not bp_id:
                return ('Missing bp_id', 400, { 'Access-Control-Allow-Origin': origin })

            group, status, created_by = get_bp_data(bp_id)
            if status == 'submitted' or status == 'public':
                return ('Best practice already published or submitted', 401, { 'Access-Control-Allow-Origin': origin })

            if not decoded_token['admin']:
                privileges = decoded_token.get('privileges', {})

                allowed = False
                groupLevel = privileges.get(group)
                if groupLevel == 'admin':
                    allowed = True
                elif groupLevel == 'editor':
                    allowed = created_by == decoded_token['uid']

                if not allowed:
                    return ('User not allowed', 401, { 'Access-Control-Allow-Origin': origin })
        except Exception as e:
            logger.error(traceback.format_exc())
            return ('Internal server error', 500, { 'Access-Control-Allow-Origin': origin })
        return fn(request)
    return wrapped



def _upload_blob(bucket_name, source_file, destination_blob_name):
    """Uploads a file to the bucket."""
   
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_file(source_file, rewind=True)

# Resizes images that are uploaded - 512 MB should be allocated to this function
# It's triggered by the fao-ferm-goodpractices bucket uploads
def resize_images(data, context):
    file_data = data
    file_name = file_data["name"]
    bucket_name = file_data["bucket"]

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    path = os.path.normpath(file_name).split(os.sep)
    if (len(path) != 3 or path[1] != "images"):
        print(f"Path is wrong {file_name}")
        return
    if (path[2] == "thumbnail.jpg"):
        print(f"Skipping {file_name}, already a thumbnail")
        return
    
    # Resize the image using ImageMagick.
    with Image(blob=blob.download_as_string()) as image:
        new_height = min(thumb_height, image.height)
        ratio = float(image.width) / float(image.height)
        image.resize(int(new_height * ratio), new_height)
        resized_image = image.make_blob('jpg')

        print(f"Image {file_name} was resized.")

        new_file_name = path[0] + "/images/thumbnail/thumbnail.jpg"
        new_blob = bucket.blob(new_file_name)
        new_blob.upload_from_string(resized_image, content_type='image/jpg')

        print(f"Resized image {new_file_name} has been created in the bucket {bucket_name}")


dst_bucket = "fao-ferm-goodpractices"

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

@authenticated
def upload_bp_image(request):
    form_data = request.form.to_dict()
    bp_id = form_data.get('bp_id')
    file = request.files.get('file')

    if not file:
        return ('Missing file', 400, { 'Access-Control-Allow-Origin': origin })

    try:
        _upload_blob(dst_bucket, file, '%s/images/%s' % (bp_id, secure_filename(file.filename)))
        return ('File uploaded', 200, { 'Access-Control-Allow-Origin': origin })
    except Exception as e:  
        logger.error('Error uploading file to bucket: %s' % e)
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, {'Access-Control-Allow-Origin': origin})

# @authenticated
# def get_bp_thumbnail(request):
#     if request.method == 'OPTIONS':
#         # Allows GET requests from any origin with the Content-Type
#         # header and caches preflight response for an 3600s
#         return ('', 204, headers)
#     bp_id = request.args.get('bp_id')
    
#     try:
#         path = '%s/images/thumbnail/thumbnail.jpg' % bp_id
#         blob = storage_client.bucket(dst_bucket).blob(path)
#         if not blob.exists():
#             return ('File not found', 404, { 'Access-Control-Allow-Origin': origin })

#         # blob.reload()
#         content = blob.download_as_bytes()
#         return (content, 200, {
#             'Content-Disposition': 'attachment; filename="thumbnail.jpg"',
#             'Content-Type': 'image/jpeg',
#             'Access-Control-Allow-Origin': origin
#         })
#     except Exception as e:
#         logger.error('Error getting file from bucket: %s' % e)
#         logger.error(traceback.format_exc())
#         return ('Internal server error', 500, {'Access-Control-Allow-Origin': origin})

# def delete_thumbnail(data, _):
#     file_data = data
#     file_name = file_data["name"]

#     bucket_name = file_data["bucket"]
#     bucket = storage_client.bucket(bucket_name)

#     path = os.path.normpath(file_name).split(os.sep)
#     if (len(path) != 3 or path[1] != "images"):
#         print(f"Path is wrong {file_name}")
#         return
#     if (path[2] == "thumbnail.jpg"):
#         print(f"Skipping {file_name}, already deleted the thumbnail")
#         return
    
#     blob = bucket.blob(f"{path[0]}/images/thumbnail/thumbnail.jpg")
#     blob.delete()
#     print('Thumbnail deleted')


@authenticated
def delete_bp_image(request):
    bp_id = request.args.get('bp_id')
    bucket = storage_client.bucket(dst_bucket)

    try:
        thumbnail_path = '%s/images/thumbnail/thumbnail.jpg' % bp_id
        blob = bucket.blob(thumbnail_path)
        if (blob.exists()):
            blob.delete()
        dir_path = '%s/images' % bp_id
        # blobs = storage_client.list_blobs(dst_bucket, prefix=dir_path)
        # for blob in blobs:
        #     blob.delete()
        blobs = list(bucket.list_blobs(prefix='%s/images' % bp_id))
        bucket.delete_blobs(blobs)

        return ('Image and thumbnail deleted', 200, { 'Access-Control-Allow-Origin': origin })
    except Exception as e:
        logger.error('Error deleting file from bucket: %s' % e)
        logger.error(traceback.format_exc())
        return ('Internal server error', 500, {'Access-Control-Allow-Origin': origin})