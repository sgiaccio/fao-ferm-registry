## Deploy

```
gcloud functions deploy resize_images \
  --runtime python39 \
  --trigger-bucket fao-ferm-goodpractices
```

```
gcloud functions deploy delete_thumbnail \
  --runtime python39 \
  --trigger-resource fao-ferm-goodpractices \
  --trigger-event google.storage.object.delete
```
