import os
import tempfile

from google.cloud import storage
from wand.image import Image


storage_client = storage.Client()

thumb_height = 300

# Resizes images that are uploaded.
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
        image.sample(int(new_height * ratio), new_height)
        resized_image = image.make_blob('jpg')

        print(f"Image {file_name} was resized.")

        new_file_name = path[0] + "/images/thumbnail/thumbnail.jpg"
        new_blob = bucket.blob(new_file_name)
        new_blob.upload_from_string(resized_image, content_type='image/jpg')

        print(f"Resized image {new_file_name} has been created in the bucket {bucket_name}")


def delete_thumbnail(data, context):
    file_data = data
    file_name = file_data["name"]

    bucket_name = file_data["bucket"]
    bucket = storage_client.bucket(bucket_name)

    path = os.path.normpath(file_name).split(os.sep)
    if (len(path) != 3 or path[1] != "images"):
        print(f"Path is wrong {file_name}")
        return;
    if (path[2] == "thumbnail.jpg"):
        print(f"Skipping {file_name}, already deleted the thumbnail")
        return
    
    blob = bucket.blob(f"{path[0]}/images/thumbnail/thumbnail.jpg")
    blob.delete();
    print('Thumbnail deleted');



def _resize_image(current_blob):
    file_name = current_blob.name
    _, temp_local_filename = tempfile.mkstemp()

    # Download file from bucket.
    current_blob.download_to_filename(temp_local_filename)
    print(f"Image {file_name} was downloaded to {temp_local_filename}.")

    # Resize the image using ImageMagick.
    with Image(filename=temp_local_filename) as image:
        height = image.height
        width = image.width
        ratio = float(width) / float(height)
        image.resize(int(300 * ratio), 300)
        image.save(filename=temp_local_filename)

    print(f"Image {file_name} was resized.")

    # Upload result to a second bucket, to avoid re-triggering the function.
    # You could instead re-upload it to the same bucket + tell your function
    # to ignore files marked as blurred (e.g. those with a "blurred" prefix)
    resized_bucket_name = os.getenv("RESIZED_BUCKET_NAME")
    blur_bucket = storage_client.bucket(resized_bucket_name)
    new_blob = blur_bucket.blob(file_name)
    new_blob.upload_from_filename(temp_local_filename)
    print(f"Resized image uploaded to: gs://{resized_bucket_name}/{file_name}")

    # Delete the temporary file.
    os.remove(temp_local_filename)


# import io
# import os

# from google.cloud import storage
# from PIL import Image

# def resize_image(data, context):
#     file_data = data

#     if file_data['contentType'].startswith('image/'):
#         bucket_name = file_data['bucket']
#         file_name = file_data['name']

#         # Skip processing if the file is already a resized image
#         if "resized_" in file_name:
#             return f"Skipping {file_name}, already a resized image."

#         # download image file
#         storage_client = storage.Client()
#         bucket = storage_client.bucket(bucket_name)
#         blob = bucket.blob(file_name)
#         image = Image.open(blob.download_as_string())

#         # resize the image
#         size = (128, 128)
#         resized_image = image.resize(size)

#         # upload resized image
#         resized_image_file = "resized_" + file_name
#         resized_blob = bucket.blob(resized_image_file)
#         resized_blob.upload_from_string(resized_image.tobytes(), content_type='image/jpeg')

#         return f"Resized image {resized_image_file} has been created in the same bucket: {bucket_name}"
#     else:
#         return "The file uploaded is not an image."
