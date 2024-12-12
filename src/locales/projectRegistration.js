export default {
    en: {
        description: `In this tab, you can provide basic information about your restoration initiative. The title and a summary of the aims and expected results of the initiative can be provided in the description section. Further information can be provided such as when the initiative is expected to start and end, the restoration status, web links or documentation that you find relevant, responsible organisms and the contact person who can provide further technical details of the restoration initiative.`,
        fields: {
            title: {
                label: 'Title',
                description: 'Title of the initiative as stated in the official initiative document',
            },
            description: {
                label: 'Description',
                description: 'Short description of the initiative',
                info: 'In this tab, you can provide basic information about your initiative. The title and a summary of the aims and expected results of the initiative can be provided in the description section. Further information can be provided such as when the initiative is expected to start and end, web links or documentation that you find relevant, responsible organisms and the contact person who can provide further technical details of the initiative.',
                gef: {
                    info: `Provide a short context of the initiative in terms of actors and partners leading it, a short background, main management or restoration activities that will be implemented, expected results of the initiative.`,
                }
            },

            website: {
                label: 'Website',
                description: 'Website of the initiative',
            },
            startingYear: {
                label: 'Starting year',
            },
            endingYear: {
                label: 'Ending year',
            },
            restorationStatus: {
                label: 'Restoration status',
                info: {
                    intro: `Provides an indication of whether the restoration area can be counted towards a reporting period. Restoration status is broken down into four components and an area specifies one of the components to represent its status. Each restoration status is characterized by a temporal component, which includes the start year of the restoration activities and end year, if applicable.`,
                    references: {
                        title: `References:`,
                        linkText: `https://www.post-2020indicators.org/metadata/headline/2-2`,
                        linkHref: `https://www.post-2020indicators.org/metadata/headline/2-2`,
                    },
                },
                options: {
                    preparation: `In preparation`,
                    progress: `In progress`,
                    monitoring: `Post-completion monitoring`,
                },
                descriptions: {
                    preparation: `It is considered that the initiative is enabled, has been launched, has the necessary funds committed or the restoration areas have been officially gazetted. Still, the activities have not started in the field and the effect of restoration may not yet be measurable.`,
                    progress: `Restoration activities have started in the site and depending on the time that the activities have been ongoing, impacts may start to be measurable.`,
                    monitoring: `Restoration activities have finished and the focus is now on monitoring results. It is acknowledged that an area will not be restored as soon as activities are completed, therefore, post-completion assessments on the restoration status shall be made periodically.`,
                },
            },
            restorationTypes: {
                label: 'Restoration types',
                info: 'The possible values are ecological restoration and rehabilitation. This can be determined by analyzing the current and target ecosystem (natural or transformed). Examples of transformed ecosystems are: farmlands, forest plantation, urban ecosystems. As a useful rule of thumb, if the target ecosystem is natural, the restoration will be ecological restoration. If the target ecosystem is transformed, the restoration will be rehabilitation.',
                gef: {
                    label: 'Intervention/restoration types',
                }
            },
            tenureStatuses: {
                label: 'Tenure statuses',

            },
            contributionToSdg: {
                label: 'Contribution to SDG goals',
            },
            uploadInitiativeDocument: {
                label: 'Upload one initiative document',
                gef: {
                    label: 'Upload the GEF project document',
                }
            },
            pointsOfContact: {
                label: 'Points of contact',
            },
            keywords: {
                label: 'Keywords',
            },
            organizations: {
                label: 'Organizations',
                description: 'Organizations that implement the project/initiative',
            },
            initiativePhotos: {
                label: 'Initiative photos',
                description: {
                    line1: 'Please upload photos of the initiative.',
                    line2: 'Images that are bigger than 1MB will be resized.',
                    line3: 'You can then choose one as a cover photo by clicking on it.',
                },
            },
            objectives: {
                label: 'Objectives',
                description: `Please select the primary aim(s) of the restoration initiative.`,
                reference: 'Reference:',
                referenceLink: 'https://gbf-indicators.org/metadata/headline/2-2',
                otherObjectives: 'Other objectives:',
                additionalInfo: {
                    intro: `Please explain how your project contributes to the selected objectives.`,
                    details: `If applicable, please provide for each objective selected:
                        specific objectives, description of the project's impacts, and other relevant information.`,
                    example: `Example: The project aims to restore local biodiversity by reintroducing species that play key roles
                        in ecosystem functioning and enhancing conditions that support the return and increase of migratory species populations.
                        30 wolves were reintroduced in a previously wolf-free area to control deer populations. Additionally,
                        15 species of migratory birds were observed in a wetland area.`,
                },
                placeholder: 'Please specify',
                notAvailable: 'Not available',
            },
            gef: {
                implementingAgencies: {
                    label: 'GEF implementing agencies',
                },
                faoSymbol: {
                    label: 'GEF project symbol',
                },
                investmentType: {
                    label: 'GEF investment type',
                },
                gefCycle: {
                    label: 'GEF cycle',
                },
                focalAreas: {
                    label: 'GEF standalone projects (focal areas)',
                },
                gefProgram: {
                    label: 'GEF programmes',
                },
            }
        },

        gef: {
            description: `In this tab, you can provide basic information about your initiative. The title and a summary of the aims and expected results of the initiative can be provided in the description section. Further information can be provided such as when the initiative is expected to start and end, web links or documentation that you find relevant, responsible organisms and the contact person who can provide further technical details of the initiative.`,
        },
    },







    fr: {
        description: `Dans cet onglet, vous pouvez fournir des informations de base sur votre initiative de restauration. Le titre et un résumé des objectifs et des résultats attendus de l'initiative peuvent être fournis dans la section description. Des informations supplémentaires peuvent être fournies, telles que la date de début et de fin prévue de l'initiative, le statut de la restauration, des liens Web ou de la documentation que vous jugez pertinents, les organismes responsables et la personne de contact qui peut fournir d'autres détails techniques de l'initiative de restauration.`,
        fields: {
            title: {
                label: 'Titre',
                description: "Titre de l'initiative tel qu'indiqué dans le document officiel de l'initiative",
            },
            description: {
                label: 'Description',
                description: "Brève description de l'initiative",
                info: `Dans cet onglet, vous pouvez fournir des informations de base sur votre initiative. Le titre et un résumé des objectifs et des résultats attendus de l'initiative peuvent être fournis dans la section description. Des informations supplémentaires peuvent être fournies, telles que la date de début et de fin prévue de l'initiative, des liens Web ou de la documentation que vous jugez pertinents, les organismes responsables et la personne de contact qui peut fournir d'autres détails techniques de l'initiative.`,
                gef: {
                    info: `Fournissez un contexte court de l'initiative en termes d'acteurs et de partenaires la dirigeant, un bref historique, les principales activités de gestion ou de restauration qui seront mises en œuvre, ainsi que les résultats attendus de l'initiative.`,
                }
            },
            website: {
                label: 'Site Web',
                description: "Site Web de l'initiative",
            },
            startingYear: {
                label: 'Année de début',
            },
            endingYear: {
                label: 'Année de fin',
            },
            restorationStatus: {
                label: 'Statut de la restauration',
            },
            contributionToSdg: {
                label: 'Contribution aux objectifs de développement durable (ODD)',
            },
            uploadInitiativeDocument: {
                label: 'Téléchargez un document de l’initiative',
                gef: {
                    label: 'Téléchargez le document du projet GEF',
                }
            },
            pointsOfContact: {
                label: 'Points de contact',
            },
            keywords: {
                label: 'Mots-clés',
            },
            organizations: {
                label: 'Organismes',
                description: "Organismes qui mettent en œuvre le projet/l'initiative",
            },
            gef: {
                implementingAgencies: {
                    label: "Agences d'exécution du GEF",
                },
                faoSymbol: {
                    label: 'Symbole du projet GEF',
                },
                investmentType: {
                    label: "Type d'investissement du GEF",
                },
                gefCycle: {
                    label: 'Cycle du GEF',
                },
                focalAreas: {
                    label: 'Projets autonomes du GEF (domaines prioritaires)',
                },
                gefProgram: {
                    label: 'Programmes du GEF',
                },
            }
        },
        gef: {
            description: `Dans cet onglet, vous pouvez fournir des informations de base sur votre initiative. Le titre et un résumé des objectifs et des résultats attendus de l'initiative peuvent être fournis dans la section description. Des informations supplémentaires peuvent être fournies, telles que la date de début et de fin prévue de l'initiative, des liens Web ou de la documentation que vous jugez pertinents, les organismes responsables et la personne de contact qui peut fournir d'autres détails techniques de l'initiative.`,
        }
    },
    es: {
        description: `En esta pestaña, puede proporcionar información básica sobre su iniciativa de restauración. El título y un resumen de los objetivos y resultados esperados de la iniciativa se pueden proporcionar en la sección de descripción. Se pueden proporcionar más información, como cuándo se espera que comience y termine la iniciativa, el estado de la restauración, enlaces web o documentación que considere relevantes, organismos responsables y la persona de contacto que puede proporcionar más detalles técnicos de la iniciativa de restauración.`,
        fields: {
            title: {
                label: 'Título',
                description: 'Título de la iniciativa tal como se indica en el documento oficial de la iniciativa',
            },
            description: {
                label: 'Descripción',
                description: 'Breve descripción de la iniciativa',
                info: `En esta pestaña, puede proporcionar información básica sobre su iniciativa. El título y un resumen de los objetivos y resultados esperados de la iniciativa se pueden proporcionar en la sección de descripción. Se pueden proporcionar más información, como cuándo se espera que comience y termine la iniciativa, enlaces web o documentación que considere relevantes, organismos responsables y la persona de contacto que puede proporcionar más detalles técnicos de la iniciativa.`,
                gef: {
                    info: `Proporcione un breve contexto de la iniciativa en términos de actores y socios que la lideran, un breve historial, las principales actividades de gestión o restauración que se implementarán y los resultados esperados de la iniciativa.`,
                }
            },
            website: {
                label: 'Sitio web',
                description: 'Sitio web de la iniciativa',
            },
            startingYear: {
                label: 'Año de inicio',
            },
            endingYear: {
                label: 'Año de finalización',
            },
            restorationStatus: {
                label: 'Estado de la restauración',
            },
            contributionToSdg: {
                label: 'Contribución a los objetivos de desarrollo sostenible (ODS)',
            },
            uploadInitiativeDocument: {
                label: 'Cargar un documento de la iniciativa',
                gef: {
                    label: 'Cargar el documento del proyecto GEF',
                }
            },
            pointsOfContact: {
                label: 'Puntos de contacto',
            },
            keywords: {
                label: 'Palabras clave',
            },
            organizations: {
                label: 'Organismos',
                description: 'Organismos que implementan el proyecto/iniciativa',
            },
            gef: {
                implementingAgencies: {
                    label: 'Agencias implementadoras del GEF',
                },
                faoSymbol: {
                    label: 'Símbolo del proyecto GEF',
                },
                investmentType: {
                    label: 'Tipo de inversión del GEF',
                },
                gefCycle: {
                    label: 'Ciclo del GEF',
                },
                focalAreas: {
                    label: 'Proyectos autónomos del GEF (áreas focales)',
                },
                gefProgram: {
                    label: 'Programas del GEF',
                },
            }
        },
        gef: {
            description: `En esta pestaña, puede proporcionar información básica sobre su iniciativa. El título y un resumen de los objetivos y resultados esperados de la iniciativa se pueden proporcionar en la sección de descripción. Se pueden proporcionar más información, como cuándo se espera que comience y termine la iniciativa, enlaces web o documentación que considere relevantes, organismos responsables y la persona de contacto que puede proporcionar más detalles técnicos de la iniciativa.`,
        }
    }



}