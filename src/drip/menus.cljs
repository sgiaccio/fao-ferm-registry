(ns drip.menus)

;; (defonce status-items [[:accepted          "Accepted"]
;;                        [:completed         "Completed"]
;;                        [:deprecated        "Deprecated"]
;;                        [:final             "Final"]
;;                        [:historicalArchive "Historical archive"]
;;                        [:notAccepted       "Not Accepted"]
;;                        [:obsolete          "Obsolete"]
;;                        [:onGoing           "On going"]
;;                        [:pending           "Pending"]
;;                        [:planned           "Planned"]
;;                        [:proposed          "Proposed"]
;;                        [:required          "Required"]
;;                        [:retired           "Retired"]
;;                        [:superseded        "Superseded"]
;;                        [:tentative         "Tentative"]
;;                        [:underDevelopment  "Under development"]
;;                        [:valid             "Valid"]
;;                        [:withdrawn         "Withdrawn"]])

(defonce date-types [
                    ;;  [:adopted         "Adopted"]
                     [:creation        "Creation"]
                    ;;  [:deprecated      "Deprecated"]
                    ;;  [:distribution    "Distribution"]
                    ;;  [:expiry          "Expiry"]
                    ;;  [:inForce         "In Force"]
                    ;;  [:lastRevision    "Last Revision"]
                    ;;  [:lastUpdate      "Last Update"]
                    ;;  [:nextUpdate      "Next Update"]
                     [:publication     "Publication"]
                    ;;  [:released        "Released"]
                     [:revision        "Revision"]
                    ;;  [:superseded      "Superseded"]
                    ;;  [:unavailable     "Unavailable"]
                    ;;  [:validityBegins  "Validity Begins"]
                    ;;  [:validityExpires "Validity Expires"]
                     ])

(defonce currencies [[:AED "AED - UAE Dirham"]
                     [:AFN "AFN - Afghani"]
                     [:ALL "ALL - Lek"]
                     [:AMD "AMD - Armenian Dram"]
                     [:ANG "ANG - Netherlands Antillian Guilder"]
                     [:AOA "AOA - Kwanza"]
                     [:ARS "ARS - Argentine Peso"]
                     [:AUD "AUD - Australian Dollar"]
                     [:AWG "AWG - Aruban Guilder"]
                     [:AZN "AZN - Azerbaijanian Manat"]
                     [:BAM "BAM - Convertible Marks"]
                     [:BBD "BBD - Barbados Dollar"]
                     [:BDT "BDT - Taka"]
                     [:BGN "BGN - Bulgarian Lev"]
                     [:BHD "BHD - Bahraini Dinar"]
                     [:BIF "BIF - Burundi Franc"]
                     [:BMD "BMD - Bermudian Dollar"]
                     [:BND "BND - Brunei Dollar"]
                     [:BOB "BOB - Boliviano"]
                     [:BOV "BOV - Mvdol"]
                     [:BRL "BRL - Brazilian Real"]
                     [:BSD "BSD - Bahamian Dollar"]
                     [:BTN "BTN - Ngultrum"]
                     [:BWP "BWP - Pula"]
                     [:BYR "BYR - Belarussian Ruble"]
                     [:BYN "BYN - Belarussian Ruble"]
                     [:BZD "BZD - Belize Dollar"]
                     [:CAD "CAD - Canadian Dollar"]
                     [:CDF "CDF - Congolese Franc"]
                     [:CHF "CHF - Swiss Franc"]
                     [:CLF "CLF - Unidades de fomento"]
                     [:CLP "CLP - Chilean Peso"]
                     [:CNY "CNY - Yuan Renminbi"]
                     [:COP "COP - Colombian Peso"]
                     [:COU "COU - Unidad de Valor Real"]
                     [:CRC "CRC - Costa Rican Colon"]
                     [:CUC "CUC - Peso Convertible"]
                     [:CUP "CUP - Cuban Peso"]
                     [:CVE "CVE - Cape Verde Escudo"]
                     [:CZK "CZK - Czech Koruna"]
                     [:DJF "DJF - Djibouti Franc"]
                     [:DKK "DKK - Danish Krone"]
                     [:DOP "DOP - Dominican Peso"]
                     [:DZD "DZD - Algerian Dinar"]
                     [:EEK "EEK - Kroon"]
                     [:EGP "EGP - Egyptian Pound"]
                     [:ERN "ERN - Nakfa"]
                     [:ETB "ETB - Ethiopian Birr"]
                     [:EUR "EUR - Euro"]
                     [:FJD "FJD - Fiji Dollar"]
                     [:FKP "FKP - Falkland Islands Pound"]
                     [:GBP "GBP - Pound Sterling"]
                     [:GEL "GEL - Lari"]
                     [:GHS "GHS - Cedi"]
                     [:GIP "GIP - Gibraltar Pound"]
                     [:GMD "GMD - Dalasi"]
                     [:GNF "GNF - Guinea Franc"]
                     [:GTQ "GTQ - Quetzal"]
                     [:GYD "GYD - Guyana Dollar"]
                     [:HKD "HKD - Hong Kong Dollar"]
                     [:HNL "HNL - Lempira"]
                     [:HRK "HRK - Kuna"]
                     [:HTG "HTG - Gourde"]
                     [:HUF "HUF - Forint"]
                     [:IDR "IDR - Rupiah"]
                     [:ILS "ILS - New Israeli Sheqel"]
                     [:INR "INR - Indian Rupee"]
                     [:IQD "IQD - Iraqi Dinar"]
                     [:IRR "IRR - Iranian Rial"]
                     [:ISK "ISK - Iceland Krona"]
                     [:JMD "JMD - Jamaican Dollar"]
                     [:JOD "JOD - Jordanian Dinar"]
                     [:JPY "JPY - Yen"]
                     [:KES "KES - Kenyan Shilling"]
                     [:KGS "KGS - Som"]
                     [:KHR "KHR - Riel"]
                     [:KMF "KMF - Comoro Franc"]
                     [:KPW "KPW - North Korean Won"]
                     [:KRW "KRW - Won"]
                     [:KWD "KWD - Kuwaiti Dinar"]
                     [:KYD "KYD - Cayman Islands Dollar"]
                     [:KZT "KZT - Tenge"]
                     [:LAK "LAK - Kip"]
                     [:LBP "LBP - Lebanese Pound"]
                     [:LKR "LKR - Sri Lanka Rupee"]
                     [:LRD "LRD - Liberian Dollar"]
                     [:LSL "LSL - Loti"]
                     [:LTL "LTL - Lithuanian Litas"]
                     [:LVL "LVL - Latvian Lats"]
                     [:LYD "LYD - Libyan Dinar"]
                     [:MAD "MAD - Moroccan Dirham"]
                     [:MDL "MDL - Moldovan Leu"]
                     [:MGA "MGA - Malagasy Ariary"]
                     [:MKD "MKD - Denar"]
                     [:MMK "MMK - Kyat"]
                     [:MNT "MNT - Tugrik"]
                     [:MOP "MOP - Pataca"]
                     [:MRO "MRO - Ouguiya"]
                     [:MRU "MRU - Ouguiya"]
                     [:MUR "MUR - Mauritius Rupee"]
                     [:MVR "MVR - Rufiyaa"]
                     [:MWK "MWK - Malawi Kwacha"]
                     [:MXN "MXN - Mexican Peso"]
                     [:MXV "MXV - Mexican Unidad de Inversion (UDI)"]
                     [:MYR "MYR - Malaysian Ringgit"]
                     [:MZN "MZN - Metical"]
                     [:NAD "NAD - Namibia Dollar"]
                     [:NGN "NGN - Naira"]
                     [:NIO "NIO - Cordoba Oro"]
                     [:NOK "NOK - Norwegian Krone"]
                     [:NPR "NPR - Nepalese Rupee"]
                     [:NZD "NZD - New Zealand Dollar"]
                     [:OMR "OMR - Rial Omani"]
                     [:PAB "PAB - Balboa"]
                     [:PEN "PEN - Nuevo Sol"]
                     [:PGK "PGK - Kina"]
                     [:PHP "PHP - Philippine Peso"]
                     [:PKR "PKR - Pakistan Rupee"]
                     [:PLN "PLN - Zloty"]
                     [:PYG "PYG - Guarani"]
                     [:QAR "QAR - Qatari Rial"]
                     [:RON "RON - Romanian Leu"]
                     [:RSD "RSD - Serbian Dinar"]
                     [:RUB "RUB - Russian Ruble"]
                     [:RWF "RWF - Rwanda Franc"]
                     [:SAR "SAR - Saudi Riyal"]
                     [:SBD "SBD - Solomon Islands Dollar"]
                     [:SCR "SCR - Seychelles Rupee"]
                     [:SDG "SDG - Sudanese Pound"]
                     [:SEK "SEK - Swedish Krona"]
                     [:SGD "SGD - Singapore Dollar"]
                     [:SHP "SHP - Saint Helena Pound"]
                     [:SLL "SLL - Leone"]
                     [:SOS "SOS - Somali Shilling"]
                     [:SSP "SSP - South Sudanese Pound"]
                     [:SRD "SRD - Surinam Dollar"]
                     [:STD "STD - Dobra"]
                     [:STN "STN - Dobra"]
                     [:SVC "SVC - El Salvador Colon"]
                     [:SYP "SYP - Syrian Pound"]
                     [:SZL "SZL - Lilangeni"]
                     [:THB "THB - Baht"]
                     [:TJS "TJS - Somoni"]
                     [:TMT "TMT - Manat"]
                     [:TND "TND - Tunisian Dinar"]
                     [:TOP "TOP - Paanga"]
                     [:TRY "TRY - Turkish Lira"]
                     [:TTD "TTD - Trinidad and Tobago Dollar"]
                     [:TWD "TWD - New Taiwan Dollar"]
                     [:TZS "TZS - Tanzanian Shilling"]
                     [:UAH "UAH - Hryvnia"]
                     [:UGX "UGX - Uganda Shilling"]
                     [:USD "USD - US Dollar"]
                     [:USN "USN - US Dollar (Next day)"]
                     [:USS "USS - US Dollar (Same day)"]
                     [:UYI "UYI - Uruguay Peso en Unidades Indexadas"]
                     [:UYU "UYU - Peso Uruguayo"]
                     [:UZS "UZS - Uzbekistan Sum"]
                     [:VEF "VEF - Bolivar"]
                     [:VES "VES - Bolivar Soberano"]
                     [:VND "VND - Dong"]
                     [:VUV "VUV - Vatu"]
                     [:WST "WST - Tala"]
                     [:XAF "XAF - CFA Franc BEAC"]
                     [:XBT "XBT - Bitcoin"]
                     [:XCD "XCD - East Caribbean Dollar"]
                     [:XDR "XDR - International Monetary Fund (IMF) Special Drawing Right (SDR)"]
                     [:XOF "XOF - CFA Franc BCEAO"]
                     [:XPF "XPF - CFP Franc"]
                     [:YER "YER - Yemeni Rial"]
                     [:ZAR "ZAR - Rand"]
                     [:ZMK "ZMK - Zambian Kwacha"]
                     [:ZMW "ZMW - Zambian Kwacha"]
                     [:ZWL "ZWL - Zimbabwe Dollar"]])

(defonce poc-roles [[:author               "Author"]
                    ;; [:coAuthor              "Co-author"]
                    ;; [:collaborator          "Collaborator"]
                    ;; [:contributor           "Contributor"]
                    [:custodian             "Custodian"]
                    [:distributor           "Distributor"]
                    ;; [:editor                "Editor"]
                    ;; [:funder                "Funder"]
                    ;; [:mediator              "Mediator"]
                    [:originator            "Originator"]
                    [:owner                 "Owner"]
                    [:pointOfContact        "Point of contact"]
                    [:principalInvestigator "Principal investigator"]
                    [:processor             "Processor"]
                    [:publisher             "Publisher"]
                    [:resourceProvider      "Resource provider"]
                    ;; [:rightsHolder          "Rights holder"]
                    ;; [:sponsor               "Sponsor"]
                    ;; [:stakeholder           "Stakeholder"]
                    [:user                  "User"]])


(defonce keyword-types [
                        ;; [:dataCentre "Data centre"]
                        [:discipline "Discipline"]
                        ;; [:featureType "Feature type"]
                        ;; [:instrument "Instrument"]
                        [:place "Place"]
                        ;; [:platform "Platform"]
                        ;; [:process "Process"]
                        ;; [:product "Product"]
                        ;; [:project "Project"]
                        ;; [:service "Service"]
                        [:stratum "Stratum"]
                        ;; [:subTopicCategory "Sub-Topic Category"]
                        ;; [:taxon "Taxon"]
                        [:temporal "Temporal"]
                        [:theme "Theme"]])

(defonce topic-categories [["Biota"]
                           ["Boundaries "]
                           ["Climatology, meteorology, atmosphere"]
                           ["Economy"]
                           ["Elevation"]
                           ["Environment"]
                           ["Farming"]
                           ["Geoscientific information"]
                           ["Health"]
                           ["Imagery, base, maps, earth cover"]
                           ["Inland waters"]
                           ["Intelligence military"]
                           ["Location"]
                           ["Oceans"]
                           ["Planning cadastre"]
                           ["Society"]
                           ["Structure"]
                           ["Transportation"]
                           ["Utilities, communication"]])

(defonce reporting-processes [[:ferm "FERM"]
                              [:drip "DRIP"]])

;; (defonce agencies [[:fao "FAO"]
;;                    [:ifad "IFAD"]
;;                    [:wfp "WFP"]])
(defonce agencies [[:fao  "FAO"]
                   [:gef  "GEF"]
                   [:ifad "IFAD"]
                   [:wfp  "WFP"]
                   [:zfc  "Zimbabwe Forestry Commission"]
                   [:eu   "European Union"]])


(defonce agency-roles [[1 "Funding" "The government or organisation which provides funds to the activity"]
                       [2 "Accountable" "An organisation responsible for oversight of the activity and its outcomes"]
                       [3 "Extending" "An organisation that manages the budget and direction of an activity on behalf of the funding organisation"]
                       [4 "Implementing" "The organisation that physically carries out the activity or intervention"]
                       [5 "Monitoring & evaluation" nil]
                       [6 "Auditing" nil]])

(defonce project-statuses
  [[1 "Pipeline/identification"]
   [2 "Implementation"]
   [3 "Finalisation"]
   [4 "Closed"]
   [5 "Cancelled"]
   [6 "Suspended"]])

(defonce funding-sources
  [[:1 "GNI: Gross National Income"]
   [:110 "Standard grant"]
   [:1100 "Guarantees/insurance"]
   [:111 "Subsidies to national private investors"]
   [:2 "ODA % GNI"]
   [:210 "Interest subsidy"]
   [:211 "Interest subsidy to national private exporters"]
   [:3 "Total Flows % GNI"]
   [:310 "Capital subscription on deposit basis"]
   [:311 "Capital subscription on encashment basis"]
   [:4 "Population"]
   [:410 "Aid loan excluding debt reorganisation"]
   [:411 "Investment-related loan to developing countries"]
   [:412 "Loan in a joint venture with the recipient"]
   [:413 "Loan to national private investor"]
   [:414 "Loan to national private exporter"]
   [:421 "Standard loan"]
   [:422 "Reimbursable grant"]
   [:423 "Bonds"]
   [:424 "Asset-backed securities"]
   [:425 "Other debt securities"]
   [:431 "Subordinated loan"]
   [:432 "Preferred equity"]
   [:433 "Other hybrid instruments"]
   [:451 "Non-banks guaranteed export credits"]
   [:452 "Non-banks non-guaranteed portions of guaranteed export credits"]
   [:453 "Bank export credits"]
   [:510 "Common equity"]
   [:511 "Acquisition of equity not part of joint venture in developing countries"]
   [:512 "Other acquisition of equity"]
   [:520 "Shares in collective investment vehicles"]
   [:530 "Reinvested earnings"]
   [:610 "Debt forgiveness:  ODA claims (P)"]
   [:611 "Debt forgiveness: ODA claims (I)"]
   [:612 "Debt forgiveness: OOF claims (P)"]
   [:613 "Debt forgiveness: OOF claims (I)"]
   [:614 "Debt forgiveness:  Private claims (P)"]
   [:615 "Debt forgiveness:  Private claims (I)"]
   [:616 "Debt forgiveness: OOF claims (DSR)"]
   [:617 "Debt forgiveness:  Private claims (DSR)"]
   [:618 "Debt forgiveness: Other"]
   [:620 "Debt rescheduling: ODA claims (P)"]
   [:621 "Debt rescheduling: ODA claims (I)"]
   [:622 "Debt rescheduling: OOF claims (P)"]
   [:623 "Debt rescheduling: OOF claims (I)"]
   [:624 "Debt rescheduling:  Private claims (P)"]
   [:625 "Debt rescheduling:  Private claims (I)"]
   [:626 "Debt rescheduling: OOF claims (DSR)"]
   [:627 "Debt rescheduling:  Private claims (DSR)"]
   [:630 "Debt rescheduling: OOF claim (DSR \u2013 original loan principal)"]
   [:631 "Debt rescheduling: OOF claim (DSR \u2013 original loan interest)"]
   [:632 "Debt rescheduling: Private claim (DSR \u2013 original loan principal)"]
   [:633 "Debt forgiveness/conversion: export credit claims (P)"]
   [:634 "Debt forgiveness/conversion:  export credit claims (I)"]
   [:635 "Debt forgiveness:  export credit claims (DSR)"]
   [:636 "Debt rescheduling:  export credit claims (P)"]
   [:637 "Debt rescheduling:  export credit claims (I)"]
   [:638 "Debt rescheduling:  export credit claims (DSR)"]
   [:639 "Debt rescheduling:  export credit claim (DSR \u2013 original loan principal)"]
   [:710 "Foreign direct investment, new capital outflow (includes reinvested earnings if separate identification not available)"]
   [:711 "Other foreign direct investment, including reinvested earnings"]
   [:712 "Foreign direct investment, reinvested earnings"]
   [:810 "Bank bonds"]
   [:811 "Non-bank  bonds"]
   [:910 "Other bank securities/claims"]
   [:911 "Other non-bank securities/claims"]
   [:912 "Purchase of securities from issuing agencies"]
   [:913 "Securities and other instruments originally issued by multilateral agencies"]])

(defonce document-formats
  [[:pdf "PDF"]
   [:word "Microsoft Word"]])

(defonce sdg-contributions
  [[:1 "Goal 1. End poverty in all its forms everywhere"]
   [:2 "Goal 2. End hunger, achieve food security and improved nutrition and promote sustainable agriculture"]
   [:3 "Goal 3. Ensure healthy lives and promote well-being for all at all ages"]
   [:4 "Goal 4. Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all"]
   [:5 "Goal 5. Achieve gender equality and empower all women and girls"]
   [:6 "Goal 6. Ensure availability and sustainable management of water and sanitation for all"]
   [:7 "Goal 7. Ensure access to affordable, reliable, sustainable and modern energy for all"]
   [:8 "Goal 8. Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all"]
   [:9 "Goal 9. Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation"]
   [:10 "Goal 10. Reduce inequality within and among countries"]
   [:11 "Goal 11. Make cities and human settlements inclusive, safe, resilient and sustainable"]
   [:12 "Goal 12. Ensure sustainable consumption and production patterns"]
   [:13 "Goal 13. Take urgent action to combat climate change and its impacts"]
   [:14 "Goal 14. Conserve and sustainably use the oceans, seas and marine resources for sustainable development"]
   [:15 "Goal 15. Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss"]
   [:16 "Goal 16. Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels"]
   [:17 "Goal 17. Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development"]])

(defonce natural-disasters
  [[:1 "Biological"]
   [:2 "Epidemic"]
   [:3 "Insect infestation"]
   [:4 "Animal Stampede"]
   [:5 "Geophysical"]
   [:6 "Earthquake"]
   [:7 "Volcano"]
   [:8 "Mass movement dry (rockfall, landslides, avalanche)"]
   [:9 "Hydrological"]
   [:10 "Flood"]
   [:11 "Mass movement wet (rockfall, landslides, avalanche)"]
   [:12 "Meteorological"]
   [:13 "Storm"]
   [:14 "Climatological"]
   [:15 "Extreme temperature"]
   [:16 "Drought"]
   [:17 "Wildfire"]])

(defonce ecosystem-degradation-types
  [[:1 "soil erosion by water "]
   [:2 "soil erosion by wind "]
   [:3 "chemical soil deterioration "]
   [:4 "physical soil deterioration "]
   [:5 "biological degradation "]
   [:6 "water degradation "]
   [:7 "other"]])

(defonce ecosystem-degradation-degree
  [[:1 "Light"]
   [:2 "Moderate"]
   [:3 "Strong"]
   [:4 "Extreme"]])

(defonce land-degradation-drivers
  [[:1 "Grazing land management"]
   [:2 "Croplands and agroforestry management"]
   [:3 "forests and tree plantation management"]
   [:4 "non-timber natural resource extraction"]
   [:5 "fire regime changes"]
   [:6 "introduction of invasive species"]
   [:7 "extractive industry development"]
   [:8 "infrastructure and industrial development and urbanization"]
   [:9 "DEMOGRAPHIC"]
   [:10 "economic"]
   [:11 "science, knowledge and technology"]
   [:12 "insitutions and governance"]
   [:13 "cultural"]
   [:14 "drainage (wetlands)"]
   [:15 "alteration of vegetation"]])

(defonce bool
  [[:1 "Yes"]
   [:0 "No"]])

(defonce land-use
  [[:1 "Subsistence agriculture"]
   [:2 "Intensive agriculture"]
   [:3 "Grazing"]
   [:4 "Collection of non-wood forest products"]
   [:5 "Fuelwood, Timber"]
   [:6 "Mining"]
   [:7 "Waste disposal"]
   [:8 "Settlements, urban area, infrastructures"]
   [:9 "Nature conservation"]
   [:10 "Recreation"]
   [:11 "Spiritual (i.e. sacred forests"]
   [:12 "Other"]])

(defonce land-tenure
  [[:1 "Ownership private individual"]
   [:2 "Ownership private communal"]
   [:3 "Ownership public"]
   [:4 "Ownership titled"]
   [:5 "Ownership untitled"]
   [:6 "Use individual"]
   [:7 "Use communal"]
   [:8 "Use titled"]
   [:9 "Use untitled"]])

(defonce stakeholder-engagement
  [[:1 "Design and Planning"]
   [:2 "Coordination"]
   [:3 "Capacity development"]
   [:4 "Technical supervision"]
   [:5 "Plant production"]
   [:6 "Site selection"]
   [:7 "Planting"]
   [:8 "Plant maintenance"]
   [:9 "Site surveillance"]
   [:10 "Monitoring of LDN indicators"]
   [:11 "Monitoring of project success"]
   [:12 "Communication"]])

(defonce gender-mainstreaming-activities
  [[:1 "Yes"]
   [:2 "No"]
   [:3 "Planned"]])

(defonce activities
  [{:code :1
    :name "Restore/improve forest land"
    :children [{:code :1 :name "Reduce/halt deforestation and conversion of forest to other land cover types (includes conserving forest land)"}
               {:code :2 :name "Restore forest land"}
               {:code :3 :name "Increase land productivity in forest areas"}
               {:code :4 :name "Improve forest management e.g. fire management"}]}

   {:code :2
    :name "Increase forest land"
    :children [{:code :5 :name "Increase forest land (net gain) e.g. plantations"}]}
   {:code :3
    :name "Restore/improve cropland"
    :children [{:code :6 :name "Increase land productivity in agricultural areas"}
               {:code :7 :name "Rehabilitate bare or degraded land for crop production"}
               {:code :8 :name "Improve water use for irrigation"}
               {:code :9 :name "Halt/reduce conversion of cropland to other land cover types"}
               {:code :10 :name "Sustainable Land Management"}]}
   {:code :4
    :name "Restore/improve grassland and savannah"
    :children [{:code :11 :name "Restore and improve pastures"}
               {:code :12 :name "Improve land productivity in grassland/savannah"}
               {:code :13 :name "Restore rangeland (e.g. by controlling livestock and wildfires)"}
               {:code :14 :name "Halt/reduce conversion of grassland to other land cover types"}]}
   {:code :5
    :name "Restore/improve wetlands (including peatlands and mangroves)"
    :children [{:code :15 :name "Halt/reduce wetland conversion to other land uses (includes conserving wetlands)"}
               {:code :16 :name "Restore/preserve wetlands and reduce degradation of wetlands"}]}
   {:code :6
    :name "Increase soil fertility and carbon stock"
    :children [{:code :17 :name "Rehabilitate bare land and/or restore degraded land"}
               {:code :18 :name "Increase carbon stock and reduce soil/land degradation"}
               {:code :19 :name "Maintain current level of SOC"}
               {:code :20 :name "Reduce soil erosion"}
               {:code :21 :name "Reduce sand encroachment"}
               {:code :22 :name "Improve watershed/landscape management"}]}
   {:code :7
    :name "Manage artificial area and mining"
    :children [{:code :23 :name "Restore degraded mining areas"}
               {:code :24 :name "Halt illegal mining and/or reduce mining area"}
               {:code :25 :name "Improve land productivity in artificial areas"}
               {:code :26 :name "Halt/reduce/regulate expansion of urban/artificial area"}]}
   {:code :8
    :name "Restore /improve protected areas"
    :children [{:code :27 :name "Restore protected areas"}
               {:code :28 :name "Improve management of protected areas"}]}
   {:code :9
    :name "Increase protected areas"
    :children [{:code :29 :name "Increase protected areas"}]}
   {:code :10
    :name "Improve coastal management"
    :children [{:code :30 :name "Reduce coastal erosion"}
               {:code :31 :name "Reduce saline water intrusion in coastal zone"}]}
   {:code :11
    :name "Other/General/Unspecified"
    :children [{:code :32 :name "Avoid/Prevent/ halt degradation (of degraded lands)"}
               {:code :33 :name "Restore vegetation cover (unspecified land use)"}
               {:code :34 :name "Achieve LDN"}
               {:code :35 :name "Improve land productivity (unspecified land use)"}
               {:code :36 :name "Other/General/Unspecified"}]}
   {:code :12
    :name "Instrument"
    :children [{:code :37 :name "General instrument (e.g. policies, economic incentives)"}]}
   {:code :13
    :name "Restore/improve multiple land use"
    :children [{:code :38 :name "Forest and grassland"}
               {:code :39 :name "Cropland and grassland"}
               {:code :40 :name "Forest and wetlands"}
               {:code :41 :name "Forest, cropland and grassland"}
               {:code :42 :name "Protected area and forest"}
               {:code :43 :name "Other"}
               {:code :44 :name "All land uses"}]}
   {:code :14
    :name "Reduce/halt conversion of multiple land uses"
    :children [{:code :45 :name "Forest and grassland"}
               {:code :46 :name "Cropland and grassland"}
               {:code :47 :name "Forest and wetlands"}
               {:code :48 :name "Forest, cropland and grassland"}
               {:code :49 :name "Protected area and forest"}
               {:code :50 :name "Other"}
               {:code :51 :name "All land uses"}]}
   {:code :15
    :name "Restore/improve multiple functions"
    :children [{:code :52 :name "Productivity and carbon stock"}
               {:code :53 :name "Other"}
               {:code :54 :name "Multiple functions"}]}
   {:code :16
    :name "Restore/improve multiple functions in multiple land uses"
    :children [{:code :55 :name "Improve productivity and SOC stock in croplands and grasslands"}
               {:code :50 :name "Other"}]}])


(defonce achieved
  [[:1 "Yes"]
   [:3 "Partially"]
   [:2 "No"]])

(defonce partially-achieved-reasons
  [[:3 "Lack of local buy-in"]
   [:4 "Drivers not fully addressed"]
   [:5 "Needs of stakeholder not fully taken into account"]
   [:6 "Natural disasters"]
   [:7 "Seedling failure"]
   [:8 "Seedling not adapted to site"]
   [:9 "Lack of law enforcement"]
   [:10 "Land tenure issues"]
   [:11 "Issues: technical implementation"]
   [:12 "Others"]])

(defonce technologies
  [{:code :A
    :name "Agronomic measures"
    :children [{:code :A1
                :name "Vegetation / soil cover "}
               {:code :A2
                :name "Organic matter / soil fertility"}
               {:code :A3
                :name "Soil surface treatment"}
               {:code :A4
                :name "Subsurface treatment"}
               {:code :A5
                :name "Seed management, improved varieties"}
               {:code :A6
                :name "Residue management"}
               {:code :A7
                :name "Others"}]}
   {:code :V
    :name "Vegetative measures"
    :children [{:code :V1
                :name "Tree and shrub cover"}
               {:code :V2
                :name "Grasses and perennial herbaceous plants"}
               {:code :V3
                :name "Clearing of vegetation Fire breaks, reduced fuel for forest fires"}
               {:code :V4
                :name "Replacement or removal of alien/invasive species"}
               {:code :V5
                :name "Others"}]}
   {:code :S
    :name "Structural measures"
    :children [{:code :S1
                :name "Terraces"}
               {:code :S2
                :name "Bunds, banks"}
               {:code :S3
                :name "Graded ditches, channels, waterways"}
               {:code :S4
                :name "Level ditches, pits"}
               {:code :S5
                :name "Dams, pans, ponds"}
               {:code :S6
                :name "Walls, barriers, palisades, fences"}
               {:code :S7
                :name "Water harvesting/ supply/ irrigation equipment"}
               {:code :S8
                :name "Sanitation/ waste water structures"}
               {:code :S9
                :name "Shelters for plants and animals"}
               {:code :S10
                :name " Energy saving measures"}]}
   {:code :M
    :name "Management measures"
    :children [{:code :M1
                :name "Change in land use type"}
               {:code :M2
                :name "Change in management/ intensity level"}
               {:code :M3
                :name "Layout according to natural and human environment"}
               {:code :M4
                :name "Major change in timing of activities"}
               {:code :M5
                :name "Control/ change in species composition  (if annually or in a rotational sequence as done e.g. on cropland A1)"}
               {:code :M6
                :name "Waste management (recycling, re-use or reduce)"}]}])