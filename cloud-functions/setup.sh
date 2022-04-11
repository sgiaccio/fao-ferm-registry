# See https://cloud.google.com/architecture/streaming-data-from-cloud-storage-into-bigquery-using-cloud-functions?hl=it&skip_cache=true


# Create the Cloud Storage bucket
gcloud config set project fao-ferm2-review
DEVSHELL_PROJECT_ID=fao-ferm2-review
REGION=europe-west3
FILES_SOURCE=${DEVSHELL_PROJECT_ID}-geo-files-source

gsutil mb -c regional -l ${REGION} gs://${FILES_SOURCE}


# Create the BigQuery table
bq mk registry
bq mk registry.areas
# TODO: bq mk registry.areas schema.json
# Verify that the table was created.
# bq ls --format=pretty registry

# Set up the streaming Cloud Function
FUNCTIONS_BUCKET=${DEVSHELL_PROJECT_ID}-functions
gsutil mb -c regional -l ${REGION} gs://${FUNCTIONS_BUCKET}
gcloud functions deploy streaming --region=${REGION} \
    --source=./functions/streaming --runtime=python37 \
    --stage-bucket=${FUNCTIONS_BUCKET} \
    --trigger-bucket=${FILES_SOURCE}
# Verify that the function was deployed.
# gcloud functions describe streaming  --region=${REGION} \
#     --format="table[box](entryPoint, status, eventTrigger.eventType)"

