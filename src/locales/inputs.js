
export default {
    en: {
        noneSelected: 'None selected',
        areaSurface: "Area",

        pointOfContact: {
            individualName: 'Individual Name',
            email: 'Email',
            organization: 'Organization',
            addItemLabel: 'Add point of contact',
        },
        organization: {
            name: 'Name',
            acronym: 'Acronym',
            type: 'Type',
            role: 'Role',
            addItemLabel: 'Add organization',
        },
        recursiveMenu: {
            pleaseSelect: 'Please select from the list below',
            search: '@:search' // DO NOT TRANSLATE
        },
        recursiveRadio: {
            search: '@:search' // DO NOT TRANSLATE
        },
        indicatorsList: {
            title: 'Project indicators',
            noIndicators: "No indicators selected for this area",
            addIndicators: "Add project indicators",
        },
        customIndicatorsList: {
            title: "Custom indicators",
            noIndicators: "No custom indicators selected for this area",
            addIndicator: "Add custom indicator",
        },
        validation: {
            area: {
                required: "Please enter at least one area in the {areaTabLink}.",
                areaTabLinkText: "Area tab"
            }
        },
        aoi: {
            addAdminArea: "Add admin area",
            drawPolygon: "Draw polygon",
            uploadShapefile: "Upload shapefile",
            uploadGeoJson: "Upload KML/KMZ/GeoJSON",
            addCountry: "Add country",
            deleteAreaConfirm: "Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted.",

            siteName: "Site name",
            calculateArea: "Calculate area",
            uploadArea: "Upload",
            clear: "Clear",

            administrativeArea: "Administrative area",
            selectCountry: "Please select country",
            selectRegion: "Please select region",
            selectProvince: "Please select province",

            uploadSuccess: "{fileCount} feature(s) uploaded.",
            reminder: "Please remember to click \"Save and close\" otherwise the data will be lost.",
            uploadError: "Error uploading the file: {error}",

            shapefileUpload: {
                instruction1: "Please upload a {zipFile} containing the {shapefileExtensions}.",
                instruction2: "The shapefile can contain one or many {geometryTypes}.",
                instruction3: "If possible, the shapefile should be in {projectionType} (latitude/longitude). If not, the system will try to reproject it.",
                zipFile: "zip file",
                shapefileExtensions: ".shp, .shx, .dbf, and .prj files",
                geometryTypes: "points, polygons, or multipolygons",
                projectionType: "geographic projection",
                dropFile: "Drop the zip file here or click to upload",

            },

            geoJsonUpload: {
                instruction1: "Please upload a file in {fileFormats}.",
                instruction2: "For each feature in the shapefile, one area will be added to the registry.",
                instruction3: "If possible, the data should be in {projectionType} (latitude/longitude). If not, the system will try to reproject it.",
                fileFormats: "KML, KMZ, or GeoJSON format",
                projectionType: "geographic projection",
                dropFile: "Drop the file here or click to upload",
            }
        },
        committedAreaToRestore: {
            title: "Committed area to restore",
            area: "@:areaSurface",
            units: "Units",
            info: "Includes pledges, targets, aspirations, or commitments of area to restore. This parameter will not be counted as area under restoration but will serve as a reference to monitor restoration progress.",
        },
        totalAreaUnderRestoration: {
            title: "Total area under restoration",
        },
        upload: {
            uploadPrompt: "Drop {fileText} here or click to upload",
            fileText: {
                single: "file",
                multiple: "files",
                more: "more files",
            },
        },
    },
    es: {
        areaSurface: "Área",
        noneSelected: 'Ninguna selección',
        pointOfContact: {
            individualName: 'Nombre del individuo',
            email: 'Email',
            organization: 'Organización',
            addItemLabel: 'Agregar punto de contacto',
        },
        organization: {
            name: 'Nombre',
            acronym: 'Acrónimo',
            type: 'Tipo',
            role: 'Papel',
            addItemLabel: 'Agregar organización',
        },
        recursiveMenu: {
            pleaseSelect: 'Por favor seleccione de la lista a continuación',
            search: '@:search', // DO NOT TRANSLATE
        },
        recursiveRadio: {
            search: '@:search' // DO NOT TRANSLATE
        },
        indicatorsList: {
            title: 'Indicadores del proyecto',
            noIndicators: "No se han seleccionado indicadores para esta área",
            addIndicators: "Agregar indicadores del proyecto",
        },
        customIndicatorsList: {
            title: "Indicadores personalizados",
            noIndicators: "No se han seleccionado indicadores personalizados para esta área",
            addIndicator: "Agregar indicador personalizado",
        },
        validation: {
            area: {
                required: "Por favor ingrese al menos un área en la {areaTabLink}.",
                areaTabLinkText: "pestaña de área"
            }
        },
        aoi: {
            addAdminArea: "Agregar área administrativa",
            drawPolygon: "Dibujar polígono",
            uploadShapefile: "Subir shapefile",
            uploadGeoJson: "Subir KML/KMZ/GeoJSON",
            addCountry: "Agregar país",
            deleteAreaConfirm: "¿Estás seguro de que deseas eliminar esta área? También se eliminarán las características, actividades y ecosistemas relacionados.",

            siteName: "Nombre del sitio",
            calculateArea: "Calcular área",
            uploadArea: "Subir",
            clear: "Limpiar",

            administrativeArea: "Área administrativa",
            selectCountry: "Por favor seleccione país",
            selectRegion: "Por favor seleccione región",
            selectProvince: "Por favor seleccione provincia",

            uploadSuccess: "{fileCount} elemento(s) subido(s).",
            reminder: "Recuerda hacer clic en \"Guardar y cerrar\" o los datos se perderán.",
            uploadError: "Error al subir el archivo: {error}",

            shapefileUpload: {
                instruction1: "Por favor suba un {zipFile} que contenga los archivos {shapefileExtensions}.",
                instruction2: "El shapefile puede contener uno o varios {geometryTypes}.",
                instruction3: "Si es posible, el shapefile debe estar en {projectionType} (latitud/longitud). Si no, el sistema intentará reproyectarlo.",
                zipFile: "archivo zip",
                shapefileExtensions: ".shp, .shx, .dbf, y .prj",
                geometryTypes: "puntos, polígonos, o multipolígonos",
                projectionType: "proyección geográfica",
                dropFile: "Suelta el archivo zip aquí o haz clic para subir",
            },

            geoJsonUpload: {
                instruction1: "Por favor suba un archivo en {fileFormats}.",
                instruction2: "Para cada elemento en el shapefile, se añadirá un área al registro.",
                instruction3: "Si es posible, los datos deben estar en {projectionType} (latitud/longitud). Si no, el sistema intentará reproyectarlo.",
                fileFormats: "formato KML, KMZ, o GeoJSON",
                projectionType: "proyección geográfica",
                dropFile: "Suelta el archivo aquí o haz clic para subir",
            },
        },
        committedAreaToRestore: {
            title: "Área comprometida a restaurar",
            area: "@:areaSurface",
            units: "Unidades",
            info: "Incluye promesas, objetivos, aspiraciones o compromisos de área a restaurar. Este parámetro no se contabilizará como área en restauración, pero servirá como referencia para monitorear el progreso de la restauración.",
        },
        totalAreaUnderRestoration: {
            title: "Área total en restauración",
        },
    },
    fr: {
        noneSelected: 'Aucune sélection',
        areaSurface: "Surface",

        pointOfContact: {
            individualName: 'Nom de l\'individu',
            email: 'Email',
            organization: 'Organisation',
            addItemLabel: 'Ajouter un point de contact',
        },
        organization: {
            name: 'Nom',
            acronym: 'Acronyme',
            type: 'Type',
            role: 'Rôle',
            addItemLabel: 'Ajouter une organisation',
        },
        recursiveMenu: {
            pleaseSelect: 'Veuillez sélectionner dans la liste ci-dessous',
            search: '@:search' // DO NOT TRANSLATE
        },
        recursiveRadio: {
            search: '@:search' // DO NOT TRANSLATE
        },
        indicatorsList: {
            title: 'Indicateurs du projet',
            noIndicators: "Aucun indicateur sélectionné pour cette zone",
            addIndicators: "Ajouter des indicateurs du projet",
        },
        customIndicatorsList: {
            title: "Indicateurs personnalisés",
            noIndicators: "Aucun indicateur personnalisé sélectionné pour cette zone",
            addIndicator: "Ajouter un indicateur personnalisé",
        },
        validation: {
            area: {
                required: "Veuillez entrer au moins une zone dans l'{areaTabLink}.",
                areaTabLinkText: "onglet de zone"
            }
        },
        aoi: {
            addAdminArea: "Ajouter une zone administrative",
            drawPolygon: "Dessiner un polygone",
            uploadShapefile: "Télécharger un shapefile",
            uploadGeoJson: "Télécharger un KML/KMZ/GeoJSON",
            addCountry: "Ajouter un pays",
            deleteAreaConfirm: "Êtes-vous sûr de vouloir supprimer cette zone ? Les caractéristiques, activités et écosystèmes associés seront également supprimés.",

            siteName: "Nom du site",
            calculateArea: "Calculer la surface",
            uploadArea: "Télécharger",
            clear: "Effacer",

            administrativeArea: "Zone administrative",
            selectCountry: "Veuillez sélectionner un pays",
            selectRegion: "Veuillez sélectionner une région",
            selectProvince: "Veuillez sélectionner une province",

            uploadSuccess: "{fileCount} élément(s) téléchargé(s).",
            reminder: "N'oubliez pas de cliquer sur \"Enregistrer et fermer\" sinon les données seront perdues.",
            uploadError: "Erreur lors du téléchargement du fichier : {error}",

            shapefileUpload: {
                instruction1: "Veuillez télécharger un {zipFile} contenant les fichiers {shapefileExtensions}.",
                instruction2: "Le shapefile peut contenir un ou plusieurs {geometryTypes}.",
                instruction3: "Si possible, le shapefile doit être en {projectionType} (latitude/longitude). Sinon, le système tentera de le reprojeter.",
                zipFile: "fichier zip",
                shapefileExtensions: ".shp, .shx, .dbf, et .prj",
                geometryTypes: "points, polygones, ou multipolygones",
                projectionType: "projection géographique",
                dropFile: "Déposez le fichier zip ici ou cliquez pour télécharger",
            },
            
            geoJsonUpload: {
                instruction1: "Veuillez télécharger un fichier au format {fileFormats}.",
                instruction2: "Pour chaque élément dans le shapefile, une zone sera ajoutée au registre.",
                instruction3: "Si possible, les données doivent être en {projectionType} (latitude/longitude). Sinon, le système tentera de le reprojeter.",
                fileFormats: "format KML, KMZ, ou GeoJSON",
                projectionType: "projection géographique",
                dropFile: "Déposez le fichier ici ou cliquez pour télécharger",
            },
        },
        committedAreaToRestore: {
            title: "Zone engagée à restaurer",
            area: "@:areaSurface",
            units: "Unités",
            info: "Inclut les promesses, les objectifs, les aspirations ou les engagements de surface à restaurer. Ce paramètre ne sera pas comptabilisé comme surface en restauration, mais servira de référence pour suivre les progrès de la restauration.",
        },
        totalAreaUnderRestoration: {
            title: "Surface totale en restauration",
        },
    },
};
