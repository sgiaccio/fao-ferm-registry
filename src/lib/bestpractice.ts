type Text = string
type TextArea = string
type Select = string | number
type MultiSelect = number[] // TODO fix select

export default interface BestPractice {
    title?: Text
    objectives?: MultiSelect
    objectivesAdditionalInformation?: TextArea
    ecosystems?: MultiSelect
    iucnEcosystems?: MultiSelect
    context?: TextArea
    areas?: MultiSelect
    activities?: MultiSelect
    drivers?: MultiSelect
    driversAdditionalInformation?: TextArea

    description?: TextArea
    implementationSteps?: { step?: { details?: TextArea } }[]
    engagement?: MultiSelect
    stakeholdersInfo?: TextArea
    knowledgeTypes?: MultiSelect
    participatoryApproaches?: TextArea
    scale?: MultiSelect
    replicability?: Select
    specifyReplicability?: TextArea

    keyFactors?: MultiSelect
    specifyKeyFactors?: TextArea
    constraints?: any
    lessonsLearned?: TextArea

    outcomes?: MultiSelect
    positiveImpacts?: TextArea
    negativeImpacts?: TextArea
    validation?: TextArea

    links?: TextArea
    details?: Select
    additionalComments?: TextArea

    status: string
}
