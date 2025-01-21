export default {
    en: {
        title: "Area and Ecosystems",
        description: {
            main: "Identification of geographic areas under ecosystem restoration is key for geospatial applications and is essential to keep track of effective restoration, being the main objective of {target2} of the Kunming-Montreal Global Biodiversity Framework. One initiative can implement ecosystem restoration in one or more geographic areas. Activities, indicators, ecosystem characterization, and results will be provided for each area. Geographic areas can be identified based on different options:",
            target2: "Target 2",
            "selectAdminAreas": "Select administrative areas",
            "uploadPolygons": "Upload polygons/vector",
            "drawOnPlatform": "Draw directly on the platform",
            "typology2": "It is crucial to identify the ecosystems that your initiative is restoring. The IUCN Global Ecosystem Typology 2.0 is the outcome of critical review and input by an extensive international network of ecosystem scientists, containing profiles for 5 realms and their combinations, 25 biomes and 108 ecosystem functional groups (Keith et al. 2022). {infoButton}",
            "moreInformation": "More information",
            gef: {
                main: "In this tab information on the project areas and ecosystems is needed in tabular and in geospatial form. You will need to provide details on committed land under GEF Core Indicators 1-5, and information on Restoration Plans/Management Plans with the extension of the area of intervention as well as the geospatial information of the areas including ecosystems covered.",
                ecosystems: "It is crucial to identify the ecosystems that your initiative is restoring. The IUCN Global Ecosystem Typology 2.0 is the outcome of critical review and input by an extensive international network of ecosystem scientists, containing profiles for 5 realms and their combinations, 25 biomes and 108 ecosystem functional groups (Keith et al.2022). {infoButton}",
            },
        },
        info: {
            realmsTitle: "Realms",
            biomesTitle: "Biomes",
            ecosystemGroupsTitle: "Ecosystem functional groups",
            realms: "{realms} are the five major components of the biosphere that differ fundamentally in ecosystem organization and function: terrestrial, freshwater, marine, subterranean, and atmospheric.",
            biomes: "{biomes} are components of a realm united by one or a few common major ecological drivers that regulate major ecosystem functions and ecological processes.",
            ecosystemGroups: "{ecosystemGroups} are a group of related ecosystems within a biome that share common ecological drivers promoting convergence of ecosystem properties that characterize the group.",
            spatialInfo: "If spatially explicit information about an area is provided and represents the entirety of the area under restoration (i.e. points or polygons of the areas are provided), the button \"get biomes in this area\" can be used to automatically generate a map overlay to indicate potential biomes that may be under restoration in the area. The user will need to review the automatically selected biomes and ensure that the biomes selected are truly those under restoration. If only tabular data of an area is provided, we kindly ask you to select the corresponding ecosystems using biomes of the IUCN Global Ecosystem Typology 2.0 (Keith et al., 2022).",
        },
        area: "Area",
        alerts: {
            areaUnitsChanged: "You have changed the units of the target area. Please note that the areas you have defined will not be converted to the new units. Please review all the areas you have defined.",
            areaUnitsSet: "You have set the units of the target area for the whole project. Please note that all the areas will have to be entered in the same units.",
            selectEcosystems: "Please select ecosystems for the first area first.",
            applyEcosystemsToAll: "Are you sure you want to apply this ecosystem to all areas? Your current selections will be overwritten.",
            gef: {
                uploadPolygons: "Please upload a shapefile with the land (in ha) reported in the geographic information system (spatially explicit data) if available. Otherwise please include the coordinates of project location.",
                drawOnPlatform: "Please use the drawer feature to draw the land directly on the platform. The calculator function will calculate the land (in ha).",
                selectAdminArea: "Please select the administrative area where your project is working and enter the full land (in ha) of the administrative area or enter the land (in ha) within an administrative area where your project is working."
            }
        },
        countriesInfo: "Countries are automatically selected based on your uploaded polygons and selected admin areas. You can also edit them manually.",
        deleteAllAreas: "Delete all areas",
        deleteAllAreasConfirm: {
            main: "Are you sure you want to delete all project areas? This action will only remove areas temporarily in your current session. {saveProject}",
            saveProject: "To permanently apply this change, you must save the project afterwards",
        },
        areaEcosystems: {
            title: "IUCN Global Ecosystem Typology 2.0 - Biomes",
            getBiomes: "Get biomes in this area",
            confirmOverwrite: "Are you sure you want to overwrite the selected ecosystems for this area?",
        },
        paAndTraditionalTerritories: {
            theRestorationAreaHas: "The restoration area has",
            protectedAreaOrOECM: "{units} of Protected Area (PA) or Other Effective Area-based Conservation Measures (OECM)",
            indigenousAndTraditionalTerritory: "{units} of Indigenous and Traditional Territory (ITT)",
            gef: {
                title: "Protected Area (PA), Other Effective Area-based Conservation Measures (OECM) and Indigenous and Traditional Territory (ITT)"
            },
        },
        areaByEcosystem: {
            totalPercentage: "Total percentage:",
            title: "Area by {country} ecosystem",
            countryAnd: "country and",
            validation: {
                percentageCheck: "The total percentage should equal 100%, but it currently sums to {totalPercentage}%",
            },
        },
        gef: {
            landCommitted: {
                info: {
                    title: "Information on Land committed in GEF Core Indicators (tabular data)",
                    text: "{title} The land committed in GEF Core Indicators includes the ha committed in GEF Core Indicators 1-5 and LDCF Indicator 2.",
                },
                label: "Breakdown of commitment by core indicator [Hectares]",
                description: "Area of land committed by core indicator",
                coreIndicator1: {
                    main: "Core Indicator 1 {info}",
                    description: "Terrestrial protected areas created or under improved Management",
                },
                coreIndicator2: {
                    main: "Core Indicator 2 {info}",
                    description: "Marine protected areas created or under improved management",
                },
                coreIndicator3: {
                    main: "Core Indicator 3 {info}",
                    description: "Area of land and ecosystems under restoration",
                },
                coreIndicator4: {
                    main: "Core Indicator 4 {info}",
                    description: "Area of landscapes under improved practices",
                },
                coreIndicator5: {
                    main: "Core Indicator 5 {info}",
                    description: "Area of marine habitat under improved practices to benefit biodiversity",
                },
                coreIndicator2LDCF: {
                    main: "LDCF CI 2 {info}",
                    description: "Area of land managed for climate resilience",
                },
            },
            restorationPlans: {
                info: {
                    title: "Information on Restoration Plans/Management Plans (tabular data).",
                    text: "{title} The plan should at least include a description of restoration or land management activities and the extension of the area of intervention.",
                },
                upload: {
                    label: "Please upload Restoration Plans/Management Plans",
                    info: "Please upload the Restoration Plans/ Management plans with the description of restoration / land management activities and baseline information of the territory, including pictures.",
                },
            },
            geographicAreas: {
                info: {
                    identifyArea: "Areas can be identified based on different options:",
                    title: "Information on Geographic Areas (spatially explicit data).",
                    text: "{title} The data should have the following {requirementsLink} and the feature table to be uploaded the following {structureLink}.",
                    requirements: "requirements",
                    structure: "structure",
                },
                totalArea: {
                    label: "Total area of land achieved (spatially explicit format)",
                    info: "The total of the land (in ha) will be computed by the plattorm based on spatially explicit information provided.",
                },
            },
        },
    },
    es: {
        title: "Área y Ecosistemas",
        description: {
            main: "La identificación de áreas geográficas en proceso de restauración de ecosistemas es clave para las aplicaciones geoespaciales y esencial para realizar un seguimiento efectivo de la restauración, siendo el objetivo principal de {target2} del Marco Mundial de la Biodiversidad de Kunming-Montreal. Una iniciativa puede implementar la restauración de ecosistemas en una o más áreas geográficas. Las actividades, indicadores, caracterizaciones de ecosistemas y resultados se proporcionarán para cada área. Las áreas geográficas pueden identificarse en base a diferentes opciones:",
            target2: "Objetivo 2",
            selectAdminAreas: "Seleccionar áreas administrativas",
            uploadPolygons: "Subir polígonos/vectores",
            drawOnPlatform: "Dibujar directamente en la plataforma",
            typology2: "Es crucial identificar los ecosistemas que su iniciativa está restaurando. La Tipología Global de Ecosistemas 2.0 de la UICN es el resultado de una revisión crítica y la contribución de una extensa red internacional de científicos de ecosistemas, que contiene perfiles para 5 reinos y sus combinaciones, 25 biomas y 108 grupos funcionales de ecosistemas (Keith et al. 2022). {infoButton}",
            moreInformation: "Más información",
            gef: {
                main: "En esta pestaña se necesita información sobre las áreas del proyecto y los ecosistemas en forma tabular y geoespacial. Deberá proporcionar detalles sobre la tierra comprometida en los Indicadores Centrales del FMAM 1-5, e información sobre los Planes de Restauración/Planes de Manejo con la extensión del área de intervención, así como la información geoespacial de las áreas incluyendo los ecosistemas cubiertos.",
                ecosystems: "Es crucial identificar los ecosistemas que su iniciativa está restaurando. La Tipología Global de Ecosistemas 2.0 de la UICN es el resultado de una revisión crítica y la contribución de una extensa red internacional de científicos de ecosistemas, que contiene perfiles para 5 reinos y sus combinaciones, 25 biomas y 108 grupos funcionales de ecosistemas (Keith et al.2022). {infoButton}",
            },
        },
        info: {
            realmsTitle: "Reinos",
            biomesTitle: "Biomas",
            ecosystemGroupsTitle: "Grupos funcionales de ecosistemas",
            realms: "{realms} son los cinco componentes principales de la biosfera que difieren fundamentalmente en la organización y función del ecosistema: terrestre, agua dulce, marino, subterráneo y atmosférico.",
            biomes: "{biomes} son componentes de un reino unidos por uno o algunos grandes impulsores ecológicos comunes que regulan las principales funciones del ecosistema y los procesos ecológicos.",
            ecosystemGroups: "{ecosystemGroups} son un grupo de ecosistemas relacionados dentro de un bioma que comparten impulsores ecológicos comunes que promueven la convergencia de las propiedades del ecosistema que caracterizan al grupo.",
            spatialInfo: "Si se proporciona información espacial explícita sobre un área y representa la totalidad del área en restauración (es decir, se proporcionan puntos o polígonos de las áreas), el botón \"obtener biomas en esta área\" se puede usar para generar automáticamente una superposición de mapa que indique los biomas potenciales que pueden estar bajo restauración en el área. El usuario deberá revisar los biomas seleccionados automáticamente y asegurarse de que los biomas seleccionados sean realmente los que están bajo restauración. Si solo se proporciona información tabular de un área, le pedimos amablemente que seleccione los ecosistemas correspondientes utilizando los biomas de la Tipología Global de Ecosistemas de la UICN 2.0 (Keith et al., 2022).",
        },
        area: "Área",
        alerts: {
            areaUnitsChanged: "Ha cambiado las unidades del área objetivo. Tenga en cuenta que las áreas que haya definido no se convertirán a las nuevas unidades. Revise todas las áreas que haya definido.",
            areaUnitsSet: "Ha establecido las unidades del área objetivo para todo el proyecto. Tenga en cuenta que todas las áreas deberán ingresarse en las mismas unidades.",
            selectEcosystems: "Por favor seleccione ecosistemas para la primera área primero.",
            applyEcosystemsToAll: "¿Está seguro de que desea aplicar este ecosistema a todas las áreas? Sus selecciones actuales serán sobrescritas.",
            gef: {
                uploadPolygons: "Por favor suba un shapefile con la tierra (en ha) reportada en el sistema de información geográfica (datos explícitos espacialmente) si está disponible. De lo contrario, incluya las coordenadas de la ubicación del proyecto.",
                drawOnPlatform: "Utilice la función de dibujo para dibujar la tierra directamente en la plataforma. La función de calculadora calculará la tierra (en ha).",
                selectAdminArea: "Por favor seleccione el área administrativa donde su proyecto está trabajando e ingrese toda la tierra (en ha) del área administrativa o ingrese la tierra (en ha) dentro de un área administrativa donde su proyecto está trabajando."
            }
        },
        countriesInfo: "Los países se seleccionan automáticamente en función de los polígonos cargados y las áreas administrativas seleccionadas. También puedes editarlos manualmente.",
        deleteAllAreas: "Eliminar todas las áreas",
        deleteAllAreasConfirm: {
            main: "¿Está seguro de que desea eliminar todas las áreas del proyecto? Esta acción solo eliminará las áreas temporalmente en su sesión actual. {saveProject}",
            saveProject: "Para aplicar permanentemente este cambio, deberá guardar el proyecto después",
        },
        areaEcosystems: {
            title: "Tipología Global de Ecosistemas 2.0 de la UICN - Biomas",
            getBiomes: "Obtener biomas en esta área",
            confirmOverwrite: "¿Está seguro de que desea sobrescribir los ecosistemas seleccionados para esta área?",
        },
        paAndTraditionalTerritories: {
            theRestorationAreaHas: "El área de restauración tiene",
            protectedAreaOrOECM: "{units} de Área Protegida (PA) o de Otras Medidas Eficaces de Conservación Basadas en Áreas (OECM)",
            indigenousAndTraditionalTerritory: "{units} de Territorio Indígena y Tradicional (ITT)",
            gef: {
                title: "Área Protegida (PA), Otras Medidas Eficaces de Conservación Basadas en Áreas (OECM) y Territorio Indígena y Tradicional (ITT)"
            },
        },
        areaByEcosystem: {
            totalPercentage: "Porcentaje total:",
            title: "Área por {country} ecosistema",
            countryAnd: "país y",
            validation: {
                percentageCheck: "El porcentaje total debe ser igual al 100%, pero actualmente suma {totalPercentage}%",
            },
        },
        gef: {
            landCommitted: {
                info: {
                    title: "Información sobre la tierra comprometida en los Indicadores Centrales del FMAM (datos tabulares)",
                    text: "{title} La tierra comprometida en los Indicadores Centrales del FMAM incluye las ha comprometidas en los Indicadores Centrales del FMAM 1-5 e Indicador 2 del Fondo para los Países Menos Adelantados.",
                },
                label: "Desglose del compromiso por indicador central [Hectáreas]",
                description: "Área de tierra comprometida por indicador central",
                coreIndicator1: {
                    main: "Indicador Central 1 {info}",
                    description: "Áreas protegidas terrestres creadas o bajo mejoramiento de la gestión",
                },
                coreIndicator2: {
                    main: "Indicador Central 2 {info}",
                    description: "Áreas protegidas marinas creadas o bajo mejoramiento de la gestión",
                },
                coreIndicator3: {
                    main: "Indicador Central 3 {info}",
                    description: "Área de tierra y ecosistemas en restauración",
                },
                coreIndicator4: {
                    main: "Indicador Central 4 {info}",
                    description: "Área de paisajes bajo prácticas mejoradas",
                },
                coreIndicator5: {
                    main: "Indicador Central 5 {info}",
                    description: "Área de hábitat marino bajo prácticas mejoradas para beneficiar la biodiversidad",
                },
                coreIndicator2LDCF: {
                    main: "ICF LDCF 2 {info}",
                    description: "Área de tierra gestionada para la resiliencia climática",
                },
            },
            restorationPlans: {
                info: {
                    title: "Información sobre Planes de Restauración/Planes de Manejo (datos tabulares).",
                    text: "{title} El plan debe incluir al menos una descripción de las actividades de restauración o manejo de tierras y la extensión del área de intervención.",
                },
                upload: {
                    label: "Por favor suba Planes de Restauración/Planes de Manejo",
                    info: "Por favor suba los Planes de Restauración/Planes de Manejo con la descripción de las actividades de restauración / manejo de tierras e información de línea base del territorio, incluyendo imágenes.",
                },
            },
            geographicAreas: {
                info: {
                    identifyArea: "Las áreas pueden identificarse en base a diferentes opciones:",
                    title: "Información sobre Áreas Geográficas (datos explícitos espacialmente).",
                    text: "{title} Los datos deben tener los siguientes {requirementsLink} y la tabla de características a subir la siguiente {structureLink}.",
                    requirements: "requisitos",
                    structure: "estructura",
                },
                totalArea: {
                    label: "Área total de tierra lograda (formato explícito espacialmente)",
                    info: "El total de la tierra (en ha) será calculado por la plataforma en base a la información explícita espacialmente proporcionada.",
                },
            },
        },
    },
    fr: {
        title: "Zone et Écosystèmes",
        description: {
            main: "L'identification des zones géographiques en cours de restauration des écosystèmes est essentielle pour les applications géospatiales et pour suivre l'efficacité de la restauration, qui est l'objectif principal de {target2} du Cadre mondial de la biodiversité de Kunming-Montréal. Une initiative peut mettre en œuvre la restauration des écosystèmes dans une ou plusieurs zones géographiques. Les activités, indicateurs, caractérisations des écosystèmes et résultats seront fournis pour chaque zone. Les zones géographiques peuvent être identifiées sur la base de différentes options:",
            target2: "Cible 2",
            selectAdminAreas: "Sélectionner des zones administratives",
            uploadPolygons: "Télécharger des polygones/vecteurs",
            drawOnPlatform: "Dessiner directement sur la plateforme",
            typology2: "Il est crucial d'identifier les écosystèmes que votre initiative restaure. La Typologie mondiale des écosystèmes 2.0 de l'UICN est le fruit d'une revue critique et de la contribution d'un vaste réseau international de scientifiques des écosystèmes, contenant des profils pour 5 royaumes et leurs combinaisons, 25 biomes et 108 groupes fonctionnels d'écosystèmes (Keith et al. 2022). {infoButton}",
            moreInformation: "Plus d'informations",
            gef: {
                main: "Dans cet onglet, des informations sur les zones du projet et les écosystèmes sont nécessaires sous forme tabulaire et géospatiale. Vous devrez fournir des détails sur les terres engagées dans les Indicateurs centraux du FEM 1-5, et des informations sur les Plans de Restauration/Plans de Gestion avec l'extension de la zone d'intervention ainsi que les informations géospatiales des zones couvertes par les écosystèmes.",
                ecosystems: "Il est crucial d'identifier les écosystèmes que votre initiative restaure. La Typologie mondiale des écosystèmes 2.0 de l'UICN est le fruit d'une revue critique et de la contribution d'un vaste réseau international de scientifiques des écosystèmes, contenant des profils pour 5 royaumes et leurs combinaisons, 25 biomes et 108 groupes fonctionnels d'écosystèmes (Keith et al.2022). {infoButton}",
            },
        },
        info: {
            realmsTitle: "Royaumes",
            biomesTitle: "Biomes",
            ecosystemGroupsTitle: "Groupes fonctionnels d'écosystèmes",
            realms: "{realms} sont les cinq principaux composants de la biosphère qui diffèrent fondamentalement dans l'organisation et la fonction des écosystèmes : terrestre, eau douce, marin, souterrain et atmosphérique.",
            biomes: "{biomes} sont des composants d'un royaume unis par un ou plusieurs grands moteurs écologiques communs qui régulent les principales fonctions et processus écologiques des écosystèmes.",
            ecosystemGroups: "{ecosystemGroups} sont un groupe d'écosystèmes liés au sein d'un biome partageant des moteurs écologiques communs favorisant la convergence des propriétés des écosystèmes qui caractérisent le groupe.",
            spatialInfo: "Si des informations spatiales explicites sur une zone sont fournies et représentent l'intégralité de la zone en cours de restauration (c'est-à-dire que des points ou des polygones des zones sont fournis), le bouton \"obtenir les biomes dans cette zone\" peut être utilisé pour générer automatiquement une superposition de carte indiquant les biomes potentiels pouvant être restaurés dans la zone. L'utilisateur devra examiner les biomes sélectionnés automatiquement et s'assurer que les biomes sélectionnés sont bien ceux en cours de restauration. Si seules des données tabulaires d'une zone sont fournies, nous vous demandons de bien vouloir sélectionner les écosystèmes correspondants en utilisant les biomes de la Typologie Mondiale des Écosystèmes de l'UICN 2.0 (Keith et al., 2022).",
        },
        area: "Zone",
        alerts: {
            areaUnitsChanged: "Vous avez modifié les unités de l'aire cible. Veuillez noter que les aires que vous avez définies ne seront pas converties dans les nouvelles unités. Veuillez vérifier toutes les aires que vous avez définies.",
            areaUnitsSet: "Vous avez défini les unités de l'aire cible pour l'ensemble du projet. Veuillez noter que toutes les aires devront être saisies dans les mêmes unités.",
            selectEcosystems: "Veuillez sélectionner des écosystèmes pour la première zone en premier.",
            applyEcosystemsToAll: "Êtes-vous sûr de vouloir appliquer cet écosystème à toutes les zones ? Vos sélections actuelles seront écrasées.",
            gef: {
                uploadPolygons: "Veuillez télécharger un shapefile avec les terres (en ha) rapportées dans le système d'information géographique (données explicitement spatiales) si disponible. Sinon, veuillez inclure les coordonnées de l'emplacement du projet.",
                drawOnPlatform: "Veuillez utiliser la fonction de dessin pour dessiner les terres directement sur la plateforme. La fonction de calculatrice calculera les terres (en ha).",
                selectAdminArea: "Veuillez sélectionner la zone administrative où votre projet travaille et entrer toutes les terres (en ha) de la zone administrative ou entrer les terres (en ha) dans une zone administrative où votre projet travaille."
            }
        },
        countriesInfo: "Les pays sont sélectionnés automatiquement en fonction de vos polygones téléchargés et des zones administratives sélectionnées. Vous pouvez également les modifier manuellement.",
        deleteAllAreas: "Supprimer toutes les zones",
        deleteAllAreasConfirm: {
            main: "Êtes-vous sûr de vouloir supprimer toutes les zones du projet ? Cette action ne supprimera les zones que temporairement dans votre session actuelle. {saveProject}",
            saveProject: "Pour appliquer ce changement de manière permanente, vous devez enregistrer le projet par la suite",
        },
        areaEcosystems: {
            title: "Typologie mondiale des écosystèmes 2.0 de l'UICN - Biomes",
            getBiomes: "Obtenir les biomes dans cette zone",
            confirmOverwrite: "Êtes-vous sûr de vouloir écraser les écosystèmes sélectionnés pour cette zone ?",
        },
        paAndTraditionalTerritories: {
            theRestorationAreaHas: "La zone de restauration a",
            protectedAreaOrOECM: "{units} d'Aire Protégée (AP) ou d'autres Mesures de Conservation Basées sur les Aires (OECM)",
            indigenousAndTraditionalTerritory: "{units} de Territoire Autochtone et Traditionnel (TAT)",
            gef: {
                title: "Aire Protégée (AP), Autres Mesures de Conservation Basées sur les Aires (OECM) et Territoire Autochtone et Traditionnel (TAT)"
            },
        },
        areaByEcosystem: {
            totalPercentage: "Pourcentage total:",
            title: "Zone par {country} écosystème",
            countryAnd: "pays et",
            validation: {
                percentageCheck: "Le pourcentage total doit être égal à 100 %, mais il s'élève actuellement à {totalPercentage}%",
            },
        },
        gef: {
            landCommitted: {
                info: {
                    title: "Informations sur les terres engagées dans les Indicateurs centraux du FEM (données tabulaires)",
                    text: "{title} Les terres engagées dans les Indicateurs centraux du FEM comprennent les ha engagés dans les Indicateurs centraux du FEM 1-5 et l'Indicateur 2 du Fonds pour les pays les moins avancés.",
                },
                label: "Répartition de l'engagement par indicateur central [Hectares]",
                description: "Superficie de terres engagées par indicateur central",
                coreIndicator1: {
                    main: "Indicateur central 1 {info}",
                    description: "Aires protégées terrestres créées ou sous amélioration de la gestion",
                },
                coreIndicator2: {
                    main: "Indicateur central 2 {info}",
                    description: "Aires protégées marines créées ou sous amélioration de la gestion",
                },
                coreIndicator3: {
                    main: "Indicateur central 3 {info}",
                    description: "Superficie de terres et d'écosystèmes en restauration",
                },
                coreIndicator4: {
                    main: "Indicateur central 4 {info}",
                    description: "Superficie de paysages sous pratiques améliorées",
                },
                coreIndicator5: {
                    main: "Indicateur central 5 {info}",
                    description: "Superficie d'habitat marin sous pratiques améliorées pour bénéficier de la biodiversité",
                },
                coreIndicator2LDCF: {
                    main: "ICF LDCF 2 {info}",
                    description: "Superficie de terres gérées pour la résilience climatique",
                },
            },
            restorationPlans: {
                info: {
                    title: "Informations sur les Plans de Restauration/Plans de Gestion (données tabulaires).",
                    text: "{title} Le plan doit inclure au moins une description des activités de restauration ou de gestion des terres et l'extension de la zone d'intervention.",
                },
                upload: {
                    label: "Veuillez télécharger les Plans de Restauration/Plans de Gestion",
                    info: "Veuillez télécharger les Plans de Restauration/Plans de Gestion avec la description des activités de restauration / gestion des terres et les informations de base du territoire, y compris des images.",
                },
            },
            geographicAreas: {
                info: {
                    identifyArea: "Les zones peuvent être identifiées sur la base de différentes options:",
                    title: "Informations sur les Zones Géographiques (données explicitement spatiales).",
                    text: "{title} Les données doivent avoir les {requirementsLink} suivantes et la table des entités à télécharger la {structureLink} suivante.",
                    requirements: "exigences",
                    structure: "structure",
                },
                totalArea: {
                    label: "Superficie totale de terres réalisées (format explicitement spatial)",
                    info: "Le total des terres (en ha) sera calculé par la plateforme en fonction des informations explicitement spatiales fournies.",
                },
            },
        },
    },
}
