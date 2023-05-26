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

(defonce date-types [;;  [:adopted         "Adopted"]
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

;; (defonce currencies [[:AED "AED - UAE Dirham"]
;;                      [:AFN "AFN - Afghani"]
;;                      [:ALL "ALL - Lek"]
;;                      [:AMD "AMD - Armenian Dram"]
;;                      [:ANG "ANG - Netherlands Antillian Guilder"]
;;                      [:AOA "AOA - Kwanza"]
;;                      [:ARS "ARS - Argentine Peso"]
;;                      [:AUD "AUD - Australian Dollar"]
;;                      [:AWG "AWG - Aruban Guilder"]
;;                      [:AZN "AZN - Azerbaijanian Manat"]
;;                      [:BAM "BAM - Convertible Marks"]
;;                      [:BBD "BBD - Barbados Dollar"]
;;                      [:BDT "BDT - Taka"]
;;                      [:BGN "BGN - Bulgarian Lev"]
;;                      [:BHD "BHD - Bahraini Dinar"]
;;                      [:BIF "BIF - Burundi Franc"]
;;                      [:BMD "BMD - Bermudian Dollar"]
;;                      [:BND "BND - Brunei Dollar"]
;;                      [:BOB "BOB - Boliviano"]
;;                      [:BOV "BOV - Mvdol"]
;;                      [:BRL "BRL - Brazilian Real"]
;;                      [:BSD "BSD - Bahamian Dollar"]
;;                      [:BTN "BTN - Ngultrum"]
;;                      [:BWP "BWP - Pula"]
;;                      [:BYR "BYR - Belarussian Ruble"]
;;                      [:BYN "BYN - Belarussian Ruble"]
;;                      [:BZD "BZD - Belize Dollar"]
;;                      [:CAD "CAD - Canadian Dollar"]
;;                      [:CDF "CDF - Congolese Franc"]
;;                      [:CHF "CHF - Swiss Franc"]
;;                      [:CLF "CLF - Unidades de fomento"]
;;                      [:CLP "CLP - Chilean Peso"]
;;                      [:CNY "CNY - Yuan Renminbi"]
;;                      [:COP "COP - Colombian Peso"]
;;                      [:COU "COU - Unidad de Valor Real"]
;;                      [:CRC "CRC - Costa Rican Colon"]
;;                      [:CUC "CUC - Peso Convertible"]
;;                      [:CUP "CUP - Cuban Peso"]
;;                      [:CVE "CVE - Cape Verde Escudo"]
;;                      [:CZK "CZK - Czech Koruna"]
;;                      [:DJF "DJF - Djibouti Franc"]
;;                      [:DKK "DKK - Danish Krone"]
;;                      [:DOP "DOP - Dominican Peso"]
;;                      [:DZD "DZD - Algerian Dinar"]
;;                      [:EEK "EEK - Kroon"]
;;                      [:EGP "EGP - Egyptian Pound"]
;;                      [:ERN "ERN - Nakfa"]
;;                      [:ETB "ETB - Ethiopian Birr"]
;;                      [:EUR "EUR - Euro"]
;;                      [:FJD "FJD - Fiji Dollar"]
;;                      [:FKP "FKP - Falkland Islands Pound"]
;;                      [:GBP "GBP - Pound Sterling"]
;;                      [:GEL "GEL - Lari"]
;;                      [:GHS "GHS - Cedi"]
;;                      [:GIP "GIP - Gibraltar Pound"]
;;                      [:GMD "GMD - Dalasi"]
;;                      [:GNF "GNF - Guinea Franc"]
;;                      [:GTQ "GTQ - Quetzal"]
;;                      [:GYD "GYD - Guyana Dollar"]
;;                      [:HKD "HKD - Hong Kong Dollar"]
;;                      [:HNL "HNL - Lempira"]
;;                      [:HRK "HRK - Kuna"]
;;                      [:HTG "HTG - Gourde"]
;;                      [:HUF "HUF - Forint"]
;;                      [:IDR "IDR - Rupiah"]
;;                      [:ILS "ILS - New Israeli Sheqel"]
;;                      [:INR "INR - Indian Rupee"]
;;                      [:IQD "IQD - Iraqi Dinar"]
;;                      [:IRR "IRR - Iranian Rial"]
;;                      [:ISK "ISK - Iceland Krona"]
;;                      [:JMD "JMD - Jamaican Dollar"]
;;                      [:JOD "JOD - Jordanian Dinar"]
;;                      [:JPY "JPY - Yen"]
;;                      [:KES "KES - Kenyan Shilling"]
;;                      [:KGS "KGS - Som"]
;;                      [:KHR "KHR - Riel"]
;;                      [:KMF "KMF - Comoro Franc"]
;;                      [:KPW "KPW - North Korean Won"]
;;                      [:KRW "KRW - Won"]
;;                      [:KWD "KWD - Kuwaiti Dinar"]
;;                      [:KYD "KYD - Cayman Islands Dollar"]
;;                      [:KZT "KZT - Tenge"]
;;                      [:LAK "LAK - Kip"]
;;                      [:LBP "LBP - Lebanese Pound"]
;;                      [:LKR "LKR - Sri Lanka Rupee"]
;;                      [:LRD "LRD - Liberian Dollar"]
;;                      [:LSL "LSL - Loti"]
;;                      [:LTL "LTL - Lithuanian Litas"]
;;                      [:LVL "LVL - Latvian Lats"]
;;                      [:LYD "LYD - Libyan Dinar"]
;;                      [:MAD "MAD - Moroccan Dirham"]
;;                      [:MDL "MDL - Moldovan Leu"]
;;                      [:MGA "MGA - Malagasy Ariary"]
;;                      [:MKD "MKD - Denar"]
;;                      [:MMK "MMK - Kyat"]
;;                      [:MNT "MNT - Tugrik"]
;;                      [:MOP "MOP - Pataca"]
;;                      [:MRO "MRO - Ouguiya"]
;;                      [:MRU "MRU - Ouguiya"]
;;                      [:MUR "MUR - Mauritius Rupee"]
;;                      [:MVR "MVR - Rufiyaa"]
;;                      [:MWK "MWK - Malawi Kwacha"]
;;                      [:MXN "MXN - Mexican Peso"]
;;                      [:MXV "MXV - Mexican Unidad de Inversion (UDI)"]
;;                      [:MYR "MYR - Malaysian Ringgit"]
;;                      [:MZN "MZN - Metical"]
;;                      [:NAD "NAD - Namibia Dollar"]
;;                      [:NGN "NGN - Naira"]
;;                      [:NIO "NIO - Cordoba Oro"]
;;                      [:NOK "NOK - Norwegian Krone"]
;;                      [:NPR "NPR - Nepalese Rupee"]
;;                      [:NZD "NZD - New Zealand Dollar"]
;;                      [:OMR "OMR - Rial Omani"]
;;                      [:PAB "PAB - Balboa"]
;;                      [:PEN "PEN - Nuevo Sol"]
;;                      [:PGK "PGK - Kina"]
;;                      [:PHP "PHP - Philippine Peso"]
;;                      [:PKR "PKR - Pakistan Rupee"]
;;                      [:PLN "PLN - Zloty"]
;;                      [:PYG "PYG - Guarani"]
;;                      [:QAR "QAR - Qatari Rial"]
;;                      [:RON "RON - Romanian Leu"]
;;                      [:RSD "RSD - Serbian Dinar"]
;;                      [:RUB "RUB - Russian Ruble"]
;;                      [:RWF "RWF - Rwanda Franc"]
;;                      [:SAR "SAR - Saudi Riyal"]
;;                      [:SBD "SBD - Solomon Islands Dollar"]
;;                      [:SCR "SCR - Seychelles Rupee"]
;;                      [:SDG "SDG - Sudanese Pound"]
;;                      [:SEK "SEK - Swedish Krona"]
;;                      [:SGD "SGD - Singapore Dollar"]
;;                      [:SHP "SHP - Saint Helena Pound"]
;;                      [:SLL "SLL - Leone"]
;;                      [:SOS "SOS - Somali Shilling"]
;;                      [:SSP "SSP - South Sudanese Pound"]
;;                      [:SRD "SRD - Surinam Dollar"]
;;                      [:STD "STD - Dobra"]
;;                      [:STN "STN - Dobra"]
;;                      [:SVC "SVC - El Salvador Colon"]
;;                      [:SYP "SYP - Syrian Pound"]
;;                      [:SZL "SZL - Lilangeni"]
;;                      [:THB "THB - Baht"]
;;                      [:TJS "TJS - Somoni"]
;;                      [:TMT "TMT - Manat"]
;;                      [:TND "TND - Tunisian Dinar"]
;;                      [:TOP "TOP - Paanga"]
;;                      [:TRY "TRY - Turkish Lira"]
;;                      [:TTD "TTD - Trinidad and Tobago Dollar"]
;;                      [:TWD "TWD - New Taiwan Dollar"]
;;                      [:TZS "TZS - Tanzanian Shilling"]
;;                      [:UAH "UAH - Hryvnia"]
;;                      [:UGX "UGX - Uganda Shilling"]
;;                      [:USD "USD - US Dollar"]
;;                      [:USN "USN - US Dollar (Next day)"]
;;                      [:USS "USS - US Dollar (Same day)"]
;;                      [:UYI "UYI - Uruguay Peso en Unidades Indexadas"]
;;                      [:UYU "UYU - Peso Uruguayo"]
;;                      [:UZS "UZS - Uzbekistan Sum"]
;;                      [:VEF "VEF - Bolivar"]
;;                      [:VES "VES - Bolivar Soberano"]
;;                      [:VND "VND - Dong"]
;;                      [:VUV "VUV - Vatu"]
;;                      [:WST "WST - Tala"]
;;                      [:XAF "XAF - CFA Franc BEAC"]
;;                      [:XBT "XBT - Bitcoin"]
;;                      [:XCD "XCD - East Caribbean Dollar"]
;;                      [:XDR "XDR - International Monetary Fund (IMF) Special Drawing Right (SDR)"]
;;                      [:XOF "XOF - CFA Franc BCEAO"]
;;                      [:XPF "XPF - CFP Franc"]
;;                      [:YER "YER - Yemeni Rial"]
;;                      [:ZAR "ZAR - Rand"]
;;                      [:ZMK "ZMK - Zambian Kwacha"]
;;                      [:ZMW "ZMW - Zambian Kwacha"]
;;                      [:ZWL "ZWL - Zimbabwe Dollar"]])

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


(defonce keyword-types [;; [:dataCentre "Data centre"]
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
(defonce agencies [[:eu   "European Union"]
                   [:fao  "FAO"]
                   [:gef  "GEF"]
                   [:ifad "IFAD"]
                   [:international-ngo "International NGO"]
                   [:wfp  "WFP"]
                   [:zfc  "Zimbabwe Forestry Commission"]])


(defonce agency-roles [[1 "Funding" "The government or organisation which provides funds to the activity"]
                       [2 "Accountable" "An organisation responsible for oversight of the activity and its outcomes"]
                       [3 "Extending" "An organisation that manages the budget and direction of an activity on behalf of the funding organisation"]
                       [4 "Implementing" "The organisation that physically carries out the activity or intervention"]
                       [5 "Monitoring & evaluation" nil]
                       [6 "Auditing" nil]])

;; (defonce project-statuses
;;   [[1 "Pipeline/identification"]
;;    [2 "Implementation"]
;;    [3 "Finalisation"]
;;    [4 "Closed"]
;;    [5 "Cancelled"]
;;    [6 "Suspended"]])

;; (defonce funding-sources
;;   [[:1 "GNI: Gross National Income"]
;;    [:110 "Standard grant"]
;;    [:1100 "Guarantees/insurance"]
;;    [:111 "Subsidies to national private investors"]
;;    [:2 "ODA % GNI"]
;;    [:210 "Interest subsidy"]
;;    [:211 "Interest subsidy to national private exporters"]
;;    [:3 "Total Flows % GNI"]
;;    [:310 "Capital subscription on deposit basis"]
;;    [:311 "Capital subscription on encashment basis"]
;;    [:4 "Population"]
;;    [:410 "Aid loan excluding debt reorganisation"]
;;    [:411 "Investment-related loan to developing countries"]
;;    [:412 "Loan in a joint venture with the recipient"]
;;    [:413 "Loan to national private investor"]
;;    [:414 "Loan to national private exporter"]
;;    [:421 "Standard loan"]
;;    [:422 "Reimbursable grant"]
;;    [:423 "Bonds"]
;;    [:424 "Asset-backed securities"]
;;    [:425 "Other debt securities"]
;;    [:431 "Subordinated loan"]
;;    [:432 "Preferred equity"]
;;    [:433 "Other hybrid instruments"]
;;    [:451 "Non-banks guaranteed export credits"]
;;    [:452 "Non-banks non-guaranteed portions of guaranteed export credits"]
;;    [:453 "Bank export credits"]
;;    [:510 "Common equity"]
;;    [:511 "Acquisition of equity not part of joint venture in developing countries"]
;;    [:512 "Other acquisition of equity"]
;;    [:520 "Shares in collective investment vehicles"]
;;    [:530 "Reinvested earnings"]
;;    [:610 "Debt forgiveness:  ODA claims (P)"]
;;    [:611 "Debt forgiveness: ODA claims (I)"]
;;    [:612 "Debt forgiveness: OOF claims (P)"]
;;    [:613 "Debt forgiveness: OOF claims (I)"]
;;    [:614 "Debt forgiveness:  Private claims (P)"]
;;    [:615 "Debt forgiveness:  Private claims (I)"]
;;    [:616 "Debt forgiveness: OOF claims (DSR)"]
;;    [:617 "Debt forgiveness:  Private claims (DSR)"]
;;    [:618 "Debt forgiveness: Other"]
;;    [:620 "Debt rescheduling: ODA claims (P)"]
;;    [:621 "Debt rescheduling: ODA claims (I)"]
;;    [:622 "Debt rescheduling: OOF claims (P)"]
;;    [:623 "Debt rescheduling: OOF claims (I)"]
;;    [:624 "Debt rescheduling:  Private claims (P)"]
;;    [:625 "Debt rescheduling:  Private claims (I)"]
;;    [:626 "Debt rescheduling: OOF claims (DSR)"]
;;    [:627 "Debt rescheduling:  Private claims (DSR)"]
;;    [:630 "Debt rescheduling: OOF claim (DSR \u2013 original loan principal)"]
;;    [:631 "Debt rescheduling: OOF claim (DSR \u2013 original loan interest)"]
;;    [:632 "Debt rescheduling: Private claim (DSR \u2013 original loan principal)"]
;;    [:633 "Debt forgiveness/conversion: export credit claims (P)"]
;;    [:634 "Debt forgiveness/conversion:  export credit claims (I)"]
;;    [:635 "Debt forgiveness:  export credit claims (DSR)"]
;;    [:636 "Debt rescheduling:  export credit claims (P)"]
;;    [:637 "Debt rescheduling:  export credit claims (I)"]
;;    [:638 "Debt rescheduling:  export credit claims (DSR)"]
;;    [:639 "Debt rescheduling:  export credit claim (DSR \u2013 original loan principal)"]
;;    [:710 "Foreign direct investment, new capital outflow (includes reinvested earnings if separate identification not available)"]
;;    [:711 "Other foreign direct investment, including reinvested earnings"]
;;    [:712 "Foreign direct investment, reinvested earnings"]
;;    [:810 "Bank bonds"]
;;    [:811 "Non-bank  bonds"]
;;    [:910 "Other bank securities/claims"]
;;    [:911 "Other non-bank securities/claims"]
;;    [:912 "Purchase of securities from issuing agencies"]
;;    [:913 "Securities and other instruments originally issued by multilateral agencies"]])

;; (defonce document-formats
;;   [[:pdf "PDF"]
;;    [:word "Microsoft Word"]])

;; (defonce sdg-contributions
;;   [[:1 "Goal 1. End poverty in all its forms everywhere"]
;;    [:2 "Goal 2. End hunger, achieve food security and improved nutrition and promote sustainable agriculture"]
;;    [:3 "Goal 3. Ensure healthy lives and promote well-being for all at all ages"]
;;    [:4 "Goal 4. Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all"]
;;    [:5 "Goal 5. Achieve gender equality and empower all women and girls"]
;;    [:6 "Goal 6. Ensure availability and sustainable management of water and sanitation for all"]
;;    [:7 "Goal 7. Ensure access to affordable, reliable, sustainable and modern energy for all"]
;;    [:8 "Goal 8. Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all"]
;;    [:9 "Goal 9. Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation"]
;;    [:10 "Goal 10. Reduce inequality within and among countries"]
;;    [:11 "Goal 11. Make cities and human settlements inclusive, safe, resilient and sustainable"]
;;    [:12 "Goal 12. Ensure sustainable consumption and production patterns"]
;;    [:13 "Goal 13. Take urgent action to combat climate change and its impacts"]
;;    [:14 "Goal 14. Conserve and sustainably use the oceans, seas and marine resources for sustainable development"]
;;    [:15 "Goal 15. Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss"]
;;    [:16 "Goal 16. Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels"]
;;    [:17 "Goal 17. Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development"]])

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
   [:17 "Wildfire"]
   [:18 "Cyclone"]
   [:19 "Hurricane"]])

(defonce ecosystem-degradation-types
  [[:1 "soil erosion by water "]
   [:2 "soil erosion by wind "]
   [:3 "chemical soil deterioration "]
   [:4 "physical soil deterioration "]
   [:5 "biological degradation "]
   [:6 "water degradation "]
   [:7 "other"]])

;; (defonce ecosystem-degradation-degree
;;   [[:1 "Light"]
;;    [:2 "Moderate"]
;;    [:3 "Strong"]
;;    [:4 "Extreme"]])

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

;; (defonce bool
;;   [[:1 "Yes"]
;;    [:0 "No"]])

;; (defonce land-use
;;   [[:1 "Subsistence agriculture"]
;;    [:2 "Intensive agriculture"]
;;    [:3 "Grazing"]
;;    [:4 "Collection of non-wood forest products"]
;;    [:5 "Fuelwood, Timber"]
;;    [:6 "Mining"]
;;    [:7 "Waste disposal"]
;;    [:8 "Settlements, urban area, infrastructures"]
;;    [:9 "Nature conservation"]
;;    [:10 "Recreation"]
;;    [:11 "Spiritual (i.e. sacred forests"]
;;    [:12 "Other"]])

;; (defonce land-tenure
;;   [[:1 "Ownership private individual"]
;;    [:2 "Ownership private communal"]
;;    [:3 "Ownership public"]
;;    [:4 "Ownership titled"]
;;    [:5 "Ownership untitled"]
;;    [:6 "Use individual"]
;;    [:7 "Use communal"]
;;    [:8 "Use titled"]
;;    [:9 "Use untitled"]])

;; (defonce stakeholder-engagement
;;   [[:1 "Design and Planning"]
;;    [:2 "Coordination"]
;;    [:3 "Capacity development"]
;;    [:4 "Technical supervision"]
;;    [:5 "Plant production"]
;;    [:6 "Site selection"]
;;    [:7 "Planting"]
;;    [:8 "Plant maintenance"]
;;    [:9 "Site surveillance"]
;;    [:10 "Monitoring of LDN indicators"]
;;    [:11 "Monitoring of project success"]
;;    [:12 "Communication"]])

;; (defonce gender-mainstreaming-activities
;;   [[:1 "Yes"]
;;    [:2 "No"]
;;    [:3 "Planned"]])

(defonce activities
  [{:code :1
    :name "Biophysical"
    :children [{:code :1
                :name "Land use type"
                :children [{:code :b_01 :name "Cropland"}
                           {:code :b_02 :name "Grazing land"}
                           {:code :b_03 :name "Forest/woodlands"}
                           {:code :b_04 :name "Settlements/infrastructure"}
                           {:code :b_05 :name "Waterways, waterbodies, wetlands"}
                           {:code :b_06 :name "Mines, extractive industries"}
                           {:code :b_07 :name "Unproductive land"}
                           {:code :b_08 :name "Other"}]}
               {:code :2
                :name "SLM measures"
                :children [{:code :b_09 :name "Agronomic"}
                           {:code :b_10 :name "Vegetative"}
                           {:code :b_11 :name "Structural"}
                           {:code :b_12 :name "Management"}
                           {:code :b_13 :name "Other"}]}
               {:code :3
                :name "SLM group"
                :children [{:code :b_14 :name "Agroforestry"}
                           {:code :b_15 :name "Area closure (stop use, support restoration)"}
                           {:code :b_16 :name "Beekeeping, fishfarming etc."}
                           {:code :b_17 :name "Cross-slope measure"}
                           {:code :b_18 :name "Ecosystem-based disaster risk reduction"}
                           {:code :b_19 :name "Energy efficiency"}
                           {:code :b_20 :name "Forest plantation management"}
                           {:code :b_21 :name "Groundwater management"}
                           {:code :b_22 :name "Home gardens"}
                           {:code :b_23 :name "Improved ground/ vegetation cover"}
                           {:code :b_24 :name "Improved plant varieties, animal breeds"}
                           {:code :b_25 :name "Integrated crop–livestock management"}
                           {:code :b_26 :name "Integrated pest and disease management (incl. organic agriculture)"}
                           {:code :b_27 :name "Integrated soil fertility management"}
                           {:code :b_28 :name "Irrigation management (incl. water supply, drainage)"}
                           {:code :b_29 :name "Minimal soil disturbance"}
                           {:code :b_30 :name "Natural and semi-natural forest management"}
                           {:code :b_31 :name "Pastoralism and grazing land management"}
                           {:code :b_32 :name "Post-harvest measures"}
                           {:code :b_33 :name "Rotational system (crop rotation, fallows, shifting cultivation)"}
                           {:code :b_34 :name "Surface water management (spring, river, lakes, sea)"}
                           {:code :b_35 :name "Water diversion and drainage"}
                           {:code :b_36 :name "Water harvesting"}
                           {:code :b_37 :name "Wetland Protection/Management"}
                           {:code :b_38 :name "Windbreak/Shelterbelt"}
                           {:code :b_39 :name "Waste management/ waste water management"}]}
               {:code :4
                :name "main purpose of the technology"
                :children [{:code :b_40 :name "Improve production"}
                           {:code :b_41 :name "Reduce, prevent, restore land degradation"}
                           {:code :b_42 :name "Conserve ecosystem"}
                           {:code :b_43 :name "Protect a watershed/ downstream areas – in combination with other Technologies"}
                           {:code :b_44 :name "Preserve/ improve biodiversity"}
                           {:code :b_45 :name "Reduce risk of disasters"}
                           {:code :b_46 :name "Adapt to climate change/ extremes and its impacts "}
                           {:code :b_47 :name "Mitigate climate change and its impacts"}
                           {:code :b_48 :name "Create beneficial economic impact"}
                           {:code :b_49 :name "Create beneficial social impact"}]}
               {:code :5
                :name "Goal of the technology with regards to land degradation"
                :children [{:code :b_50 :name "Prevent land degradation"}
                           {:code :b_51 :name "Reduce land degradation"}
                           {:code :b_52 :name "Restore/ rehabilitate severely degraded land"}
                           {:code :b_53 :name "Adapt to land degradation"}
                           {:code :b_54 :name "Not applicable"}]}]}
   {:code :2
    :name "Enabling"
    :children [{:code :6
                :name "Legal and rights-based instruments"
                :children [{:code :e_01 :name "Land-use planning (national, regional, local)"}
                           {:code :e_02 :name "Social and environmental impact assessments"}
                           {:code :e_03 :name "Incentives for sustainable land-use practices"}
                           {:code :e_04 :name "Establishment of protected areas"}
                           {:code :e_05 :name "Private and community-based conservation"}
                           {:code :e_06 :name "Improvements to land tenure security"}
                           {:code :e_07 :name "Clarification of natural resource-use rights"}]}
               {:code :7
                :name "Social and cultural instruments"
                :children [{:code :e_08 :name "Promotion of indigenous and local knowledge-based traditional use"}
                           {:code :e_09 :name "Participatory natural resource management and governance"}
                           {:code :e_10 :name "Eco-certification"}
                           {:code :e_11 :name "Promotion of corporate social responsibility"}
                           {:code :e_12 :name "Community consultations"}]}
               {:code :8
                :name "Capacity-building, skills and knowledge development"
                :children [{:code :e_13 :name "On-site trainings"}
                           {:code :e_14 :name "Online trainings"}
                           {:code :e_15 :name "Development of guidance and course materials"}
                           {:code :e_16 :name "Training of trainers"}]}
               {:code :9
                :name "Integrated landscape planning"
                :children [{:code :e_17 :name "Land/water degradation assessment and mapping"}
                           {:code :e_18 :name "Integrated planning and management"}
                           {:code :e_19 :name "Zoning"}
                           {:code :e_20 :name "Assessment of climate change vulnerability and adaptation needs"}
                           {:code :e_21 :name "Assessment of natural areas with high carbon stores (e.g., peatlands, old-growth forests, mangroves)"}]}]}
   {:code :3
    :name "Not applicable"
    :children [{:code :10
                :name "Not applicable"
                :children [{:code :na :name "Not applicable"}]}]}
   {:code :4
    :name "Other"
    :children [{:code :11
                :name "Other"
                :children [{:code :ot :name "Other"}]}]}])

;; (defonce activities_
;;   [{:code :1
;;     :name "Restore/improve forest land"
;;     :children [{:code :1 :name "Reduce/halt deforestation and conversion of forest to other land cover types (includes conserving forest land)"}
;;                {:code :2 :name "Restore forest land"}
;;                {:code :3 :name "Increase land productivity in forest areas"}
;;                {:code :4 :name "Improve forest management e.g. fire management"}]}

;;    {:code :2
;;     :name "Increase forest land"
;;     :children [{:code :5 :name "Increase forest land (net gain) e.g. plantations"}]}
;;    {:code :3
;;     :name "Restore/improve cropland"
;;     :children [{:code :6 :name "Increase land productivity in agricultural areas"}
;;                {:code :7 :name "Rehabilitate bare or degraded land for crop production"}
;;                {:code :8 :name "Improve water use for irrigation"}
;;                {:code :9 :name "Halt/reduce conversion of cropland to other land cover types"}
;;                {:code :10 :name "Sustainable Land Management"}]}
;;    {:code :4
;;     :name "Restore/improve grassland and savannah"
;;     :children [{:code :11 :name "Restore and improve pastures"}
;;                {:code :12 :name "Improve land productivity in grassland/savannah"}
;;                {:code :13 :name "Restore rangeland (e.g. by controlling livestock and wildfires)"}
;;                {:code :14 :name "Halt/reduce conversion of grassland to other land cover types"}]}
;;    {:code :5
;;     :name "Restore/improve wetlands (including peatlands and mangroves)"
;;     :children [{:code :15 :name "Halt/reduce wetland conversion to other land uses (includes conserving wetlands)"}
;;                {:code :16 :name "Restore/preserve wetlands and reduce degradation of wetlands"}]}
;;    {:code :6
;;     :name "Increase soil fertility and carbon stock"
;;     :children [{:code :17 :name "Rehabilitate bare land and/or restore degraded land"}
;;                {:code :18 :name "Increase carbon stock and reduce soil/land degradation"}
;;                {:code :19 :name "Maintain current level of SOC"}
;;                {:code :20 :name "Reduce soil erosion"}
;;                {:code :21 :name "Reduce sand encroachment"}
;;                {:code :22 :name "Improve watershed/landscape management"}]}
;;    {:code :7
;;     :name "Manage artificial area and mining"
;;     :children [{:code :23 :name "Restore degraded mining areas"}
;;                {:code :24 :name "Halt illegal mining and/or reduce mining area"}
;;                {:code :25 :name "Improve land productivity in artificial areas"}
;;                {:code :26 :name "Halt/reduce/regulate expansion of urban/artificial area"}]}
;;    {:code :8
;;     :name "Restore /improve protected areas"
;;     :children [{:code :27 :name "Restore protected areas"}
;;                {:code :28 :name "Improve management of protected areas"}]}
;;    {:code :9
;;     :name "Increase protected areas"
;;     :children [{:code :29 :name "Increase protected areas"}]}
;;    {:code :10
;;     :name "Improve coastal management"
;;     :children [{:code :30 :name "Reduce coastal erosion"}
;;                {:code :31 :name "Reduce saline water intrusion in coastal zone"}]}
;;    {:code :11
;;     :name "Other/General/Unspecified"
;;     :children [{:code :32 :name "Avoid/Prevent/ halt degradation (of degraded lands)"}
;;                {:code :33 :name "Restore vegetation cover (unspecified land use)"}
;;                {:code :34 :name "Achieve LDN"}
;;                {:code :35 :name "Improve land productivity (unspecified land use)"}
;;                {:code :36 :name "Other/General/Unspecified"}]}
;;    {:code :12
;;     :name "Instrument"
;;     :children [{:code :37 :name "General instrument (e.g. policies, economic incentives)"}]}
;;    {:code :13
;;     :name "Restore/improve multiple land use"
;;     :children [{:code :38 :name "Forest and grassland"}
;;                {:code :39 :name "Cropland and grassland"}
;;                {:code :40 :name "Forest and wetlands"}
;;                {:code :41 :name "Forest, cropland and grassland"}
;;                {:code :42 :name "Protected area and forest"}
;;                {:code :43 :name "Other"}
;;                {:code :44 :name "All land uses"}]}
;;    {:code :14
;;     :name "Reduce/halt conversion of multiple land uses"
;;     :children [{:code :45 :name "Forest and grassland"}
;;                {:code :46 :name "Cropland and grassland"}
;;                {:code :47 :name "Forest and wetlands"}
;;                {:code :48 :name "Forest, cropland and grassland"}
;;                {:code :49 :name "Protected area and forest"}
;;                {:code :50 :name "Other"}
;;                {:code :51 :name "All land uses"}]}
;;    {:code :15
;;     :name "Restore/improve multiple functions"
;;     :children [{:code :52 :name "Productivity and carbon stock"}
;;                {:code :53 :name "Other"}
;;                {:code :54 :name "Multiple functions"}]}
;;    {:code :16
;;     :name "Restore/improve multiple functions in multiple land uses"
;;     :children [{:code :55 :name "Improve productivity and SOC stock in croplands and grasslands"}
;;                {:code :50 :name "Other"}]}])


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


;; (defonce years
;;   (->> (partition 2 
;;                   (interleave (map (comp keyword str) (range 2015 2201))
;;                               (map str (range 2015 2201))))
;;        (map #(into [] %)) (into [])))


(defonce achieving-targets
  [[:1 "Reforest degraded lands"]
   [:2 "Improve soil health"]
   [:3 "Increase food and products production"]
   [:4 "Improve biodiversity"]
   [:5 "Contribute to climate change adaptation and mitigation"]
   [:6 "Improve water availability and quality"]
   [:7 "Improving livelihoods"]
   [:8 "Improve access to energy"]
   [:9 "Rights and culture"]
   [:10 "Ensure sustainability of restoration practices"]])

;; (defonce indicators
;;   [[:1 "Area of forest [square meters, % of total area]"]
;;    [:6 "GHGs emissions/removals [CO2/GHGs eq kg ]"]
;;    [:13 "Area of degraded land [square meters, % of total area]"]
;;    [:14 "Rate of species loss [Species richness gain/loss in the last N years?]"]
;;    [:15 "Established Ramsar sites [Number of Ramsar sites/administrative boundary]"]
;;    [:16 "Quantity of organic fertilizer [kg/m2]"]
;;    [:17 "Soil Organic carbon [Depends on IPCC Tier selected]"]
;;    [:19 "Agricultural productivity  [ ratio of annual output to the number of working days in one year]"]
;;    [:21 "Area covered with protected areas [square meters, % of total area]"]
;;    [:22 "Concentration of HFE and HFC  [ppm]"]
;;    [:24 "production practices enforcing agrobiodiversity [practices identified in the AGBI framework]"]
;;    [:28 "Quantity of managed solid waste [kg]"]
;;    [:33 "Adoption of early warning systems [yes/no]"]
;;    [:36 "Species-genetic diversity/species richness [Species richness]"]
;;    [:41 "Area of land/water restored [square meters, % of total area]"]
;;    [:44 "Rate of migrant smuggling [% of total]"]])

(defonce indicators_
  [{:code :1
    :name "Goal 1. End poverty in all its forms everywhere"
    :children [{:code :1
                :name "Target 1.1: By 2030, eradicate extreme poverty for all people everywhere, currently measured as people living on less than $1.25 a day"
                :children [{:code :SDG_I_1.1.1
                            :name "Proportion of the population living below the international poverty line by sex age employment status and geographic location urban rural [%]"}]}
               {:code :2
                :name "Target 1.2: By 2030, reduce at least by half the proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions"
                :children [{:code :SDG_I_1.2.1
                            :name "Proportion of population living below the national poverty line by sex and age [%]"}
                           {:code :SDG_I_1.2.2
                            :name "Proportion of men women and children of all ages living in poverty in all its dimensions according to national definitions [%]"}]}
              ;;  {:code :3
              ;;   :name "Target 1.3: Implement nationally appropriate social protection systems and measures for all, including floors, and by 2030 achieve substantial coverage of the poor and the vulnerable"
              ;;   :children [{:code :SDG_I_1.3.1
              ;;               :name "Proportion of population covered by social protection floors systems by sex distinguishing children unemployed persons older persons persons with disabilities pregnant women newborns work-injury victims and the poor and the vulnerable [%]"}]}
               {:code :4
                :name "Target 1.4: By 2030, ensure that all men and women, in particular the poor and the vulnerable, have equal rights to economic resources, as well as access to basic services, ownership and control over land and other forms of property, inheritance, natural resources, appropriate new technology and financial services, including microfinance"
                :children [{:code :SDG_I_1.4.1
                            :name "Proportion of population living in households with access to basic services [%]"}
                           {:code :SDG_I_1.4.2
                            :name "Proportion of total adult population with secure tenure rights to land a with legally recognized documentation and b who perceive their rights to land as secure by sex and type of tenure [%]"}]}
              ;;  {:code :5
              ;;   :name "Target 1.5: By 2030, build the resilience of the poor and those in vulnerable situations and reduce their exposure and vulnerability to climate-related extreme events and other economic, social and environmental shocks and disasters"
              ;;   :children [{:code :SDG_I_1.5.1
              ;;               :name "Number of deaths missing persons and directly affected persons attributed to disasters per 100000 population [nb]"}
              ;;              {:code :SDG_I_1.5.2
              ;;               :name "Direct economic loss attributed to disasters in relation to global gross domestic product GDP [USD,%]"}
              ;;              {:code :SDG_I_1.5.3
              ;;               :name "Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015–2030 [nb]"}
              ;;              {:code :SDG_I_1.5.4
              ;;               :name "Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies [%]"}]}
              ;;  {:code :6
              ;;   :name "Target 1.a: Ensure significant mobilization of resources from a variety of sources, including through enhanced development cooperation, in order to provide adequate and predictable means for developing countries, in particular least developed countries, to implement programmes and policies to end poverty in all its dimensions"
              ;;   :children [{:code :SDG_I_1.a.1
              ;;               :name "Total official development assistance grants from all donors that focus on poverty reduction as a share of the recipient country’s gross national income [USD]"}
              ;;              {:code :SDG_I_1.a.2
              ;;               :name "Proportion of total government spending on essential services education health and social protection [%]"}]}
              ;;  {:code :7
              ;;   :name "Target 1.b: Create sound policy frameworks at the national, regional and international levels, based on pro-poor and gender-sensitive development strategies, to support accelerated investment in poverty eradication actions"
              ;;   :children [{:code :SDG_I_1.b.1
              ;;               :name "Pro-poor public social spending [USD]"}]}
               ]}
   {:code :2
    :name "Goal 2. End hunger, achieve food security and improved nutrition and promote sustainable agriculture"
    :children [{:code :8
                :name "Target 2.1: By 2030, end hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, to safe, nutritious and sufficient food all year round"
                :children [{:code :SDG_I_2.1.1
                            :name "Prevalence of undernourishment [%,nb]"}
                           {:code :SDG_I_2.1.2
                            :name "Prevalence of moderate or severe food insecurity in the population based on the Food Insecurity Experience Scale FIES [%,nb]"}]}
               {:code :9
                :name "Target 2.2: By 2030, end all forms of malnutrition, including achieving, by 2025, the internationally agreed targets on stunting and wasting in children under 5 years of age, and address the nutritional needs of adolescent girls, pregnant and lactating women and older persons"
                :children [{:code :SDG_I_2.2.1
                            :name "Prevalence of stunting height for age <-2 standard deviation from the median of the World Health Organization WHO Child Growth Standards among children under 5 years of age [nb,%]"}
                          ;;  {:code :SDG_I_2.2.2
                          ;;   :name "Prevalence of malnutrition weight for height >+2 or <-2 standard deviation from the median of the WHO Child Growth Standards among children under 5 years of age by type wasting and overweight [%,nb]"}
                          ;;  {:code :SDG_I_2.2.3
                          ;;   :name "Prevalence of anaemia in women aged 15 to 49 years by pregnancy status percentage [%]"}
                           ]}
               {:code :10
                :name "Target 2.3: By 2030, double the agricultural productivity and incomes of small-scale food producers, in particular women, indigenous peoples, family farmers, pastoralists and fishers, including through secure and equal access to land, other productive resources and inputs, knowledge, financial services, markets and opportunities for value addition and non-farm employment"
                :children [{:code :SDG_I_2.3.1
                            :name "Volume of production per labour unit by classes of farming pastoral forestry enterprise size [USD]"}
                           {:code :SDG_I_2.3.2
                            :name "Average income of small-scale food producers by sex and indigenous status [USD]"}]}
               {:code :11
                :name "Target 2.4: By 2030, ensure sustainable food production systems and implement resilient agricultural practices that increase productivity and production, that help maintain ecosystems, that strengthen capacity for adaptation to climate change, extreme weather, drought, flooding and other disasters and that progressively improve land and soil quality"
                :children [{:code :SDG_I_2.4.1
                            :name "Proportion of agricultural area under productive and sustainable agriculture [%]"}
                           {:code :SDG_I_2.4.1-1
                            :name "Farm output value per hectare [ha]"}
                           {:code :SDG_I_2.4.1-2
                            :name "Net farm income [USD]"}
                           {:code :SDG_I_2.4.1-3
                            :name "Risk mitigation mechanisms [unknown]"}
                           {:code :SDG_I_2.4.1-4
                            :name "Prevalence of soil degradation [unknown]"}
                           {:code :SDG_I_2.4.1-5
                            :name "Variation in water availability [unknown]"}
                           {:code :SDG_I_2.4.1-6
                            :name "Management of fertilizers [unknown]"}
                           {:code :SDG_I_2.4.1-7
                            :name "Management of pesticides [unknown]"}
                           {:code :SDG_I_2.4.1-8
                            :name "Use of agro-biodiversity-supportive practices [unknown]"}
                           {:code :SDG_I_2.4.1-9
                            :name "Wage rate in agriculture [unknown]"}
                           {:code :SDG_I_2.4.1-10
                            :name "Food Insecurity Experience Scale FIES [unknown]"}
                           {:code :SDG_I_2.4.1-11
                            :name "Secure tenure rights to land [unknown]"}]}
               {:code :12
                :name "Target 2.5: By 2020, maintain the genetic diversity of seeds, cultivated plants and farmed and domesticated animals and their related wild species, including through soundly managed and diversified seed and plant banks at the national, regional and international levels, and promote access to and fair and equitable sharing of benefits arising from the utilization of genetic resources and associated traditional knowledge, as internationally agreed"
                :children [{:code :SDG_I_2.5.1
                            :name "Number of plant and animal genetic resources for food and agriculture secured in either medium- or long-term conservation facilities [nb]"}
                          ;;  {:code :SDG_I_2.5.2
                          ;;   :name "Proportion of local breeds classified as being at risk of extinction [%]"}
                           ]}
               {:code :13
                :name "Target 2.a: Increase investment, including through enhanced international cooperation, in rural infrastructure, agricultural research and extension services, technology development and plant and livestock gene banks in order to enhance agricultural productive capacity in developing countries, in particular least developed countries"
                :children [;;  {:code :SDG_I_2.a.1
                          ;;   :name "The agriculture orientation index for government expenditures [nb; %]"}
                           {:code :SDG_I_2.a.2
                            :name "Total official flows official development assistance plus other official flows to the agriculture sector [millions USD (2018)]"}]}
              ;;  {:code :14
              ;;   :name "Target 2.b: Correct and prevent trade restrictions and distortions in world agricultural markets, including through the parallel elimination of all forms of agricultural export subsidies and all export measures with equivalent effect, in accordance with the mandate of the Doha Development Round"
              ;;   :children [{:code :SDG_I_2.b.1
              ;;               :name "Agricultural export subsidies [millions USD]"}]}
              ;;  {:code :15
              ;;   :name "Target 2.c: Adopt measures to ensure the proper functioning of food commodity markets and their derivatives and facilitate timely access to market information, including on food reserves, in order to help limit extreme food price volatility"
              ;;   :children [{:code :SDG_I_2.c.1
              ;;               :name "Indicator of food price anomalies [nb]"}]}
               ]}
   {:code :3
    :name "Goal 3. Ensure healthy lives and promote well-being for all at all ages"
    :children [;;  {:code :16
              ;;   :name "Target 3.1: By 2030, reduce the global maternal mortality ratio to less than 70 per 100,000 live births"
              ;;   :children [{:code :SDG_I_3.1.1
              ;;               :name "Maternal mortality ratio [ratio]"}
              ;;              {:code :SDG_I_3.1.2
              ;;               :name "Proportion of births attended by skilled health personnel [%]"}]}
               {:code :17
                :name "Target 3.2: By 2030, end preventable deaths of newborns and children under 5 years of age, with all countries aiming to reduce neonatal mortality to at least as low as 12 per 1,000 live births and under-5 mortality to at least as low as 25 per 1,000 live births"
                :children [{:code :SDG_I_3.2.1
                            :name "Under‑5 mortality rate [%]"}
                          ;;  {:code :SDG_I_3.2.2
                          ;;   :name "Neonatal mortality rate [%]"}
                           ]}
               {:code :18
                :name "Target 3.3: By 2030, end the epidemics of AIDS, tuberculosis, malaria and neglected tropical diseases and combat hepatitis, water-borne diseases and other communicable diseases"
                :children [;;  {:code :SDG_I_3.3.1
                          ;;   :name "Number of new HIV infections per 1000 uninfected population by sex age and key populations [nb]"}
                          ;;  {:code :SDG_I_3.3.2
                          ;;   :name "Tuberculosis incidence per 100000 population [pcm]"}
                           {:code :SDG_I_3.3.3
                            :name "Malaria incidence per 1000 population [%]"}
                          ;;  {:code :SDG_I_3.3.4
                          ;;   :name "Hepatitis B incidence per 100000 population [pcm]"}
                           {:code :SDG_I_3.3.5
                            :name "Number of people requiring interventions against neglected tropical diseases [nb]"}]}
              ;;  {:code :19
              ;;   :name "Target 3.4: By 2030, reduce by one third premature mortality from non-communicable diseases through prevention and treatment and promote mental health and well-being"
              ;;   :children [{:code :SDG_I_3.4.1
              ;;               :name "Mortality rate attributed to cardiovascular disease cancer diabetes or chronic respiratory disease [%]"}
              ;;              {:code :SDG_I_3.4.2
              ;;               :name "Suicide mortality rate [%]"}]}
              ;;  {:code :20
              ;;   :name "Target 3.5: Strengthen the prevention and treatment of substance abuse, including narcotic drug abuse and harmful use of alcohol"
              ;;   :children [{:code :SDG_I_3.5.1
              ;;               :name "Coverage of treatment interventions pharmacological psychosocial and rehabilitation and aftercare services for substance use disorders [%]"}
              ;;              {:code :SDG_I_3.5.2
              ;;               :name "Alcohol per capita consumption aged 15 years and older within a calendar year in litres of pure alcohol [litre per year]"}]}
              ;;  {:code :21
              ;;   :name "Target 3.6: By 2020, halve the number of global deaths and injuries from road traffic accidents"
              ;;   :children [{:code :SDG_I_3.6.1
              ;;               :name "Death rate due to road traffic injuries [%]"}]}
              ;;  {:code :22
              ;;   :name "Target 3.7: By 2030, ensure universal access to sexual and reproductive health-care services, including for family planning, information and education, and the integration of reproductive health into national strategies and programmes"
              ;;   :children [{:code :SDG_I_3.7.1
              ;;               :name "Proportion of women of reproductive age aged 15–49 years who have their need for family planning satisfied with modern methods [%]"}
              ;;              {:code :SDG_I_3.7.2
              ;;               :name "Adolescent birth rate aged 10–14 years aged 15–19 years per 1000 women in that age group [%]"}]}
              ;;  {:code :23
              ;;   :name "Target 3.8: Achieve universal health coverage, including financial risk protection, access to quality essential health-care services and access to safe, effective, quality and affordable essential medicines and vaccines for all"
              ;;   :children [{:code :SDG_I_3.8.1
              ;;               :name "Coverage of essential health services [%]"}
              ;;              {:code :SDG_I_3.8.2
              ;;               :name "Proportion of population with large household expenditures on health as a share of total household expenditure or income [%]"}]}
               {:code :24
                :name "Target 3.9: By 2030, substantially reduce the number of deaths and illnesses from hazardous chemicals and air, water and soil pollution and contamination"
                :children [{:code :SDG_I_3.9.1
                            :name "Mortality rate attributed to household and ambient air pollution [nb]"}
                           {:code :SDG_I_3.9.2
                            :name "Mortality rate attributed to unsafe water unsafe sanitation and lack of hygiene exposure to unsafe Water Sanitation and Hygiene for All WASH services [nb]"}
                          ;;  {:code :SDG_I_3.9.3
                          ;;   :name "Mortality rate attributed to unintentional poisoning [nb]"}
                           ]}
              ;;  {:code :25
              ;;   :name "Target 3.a: Strengthen the implementation of the World Health Organization Framework Convention on Tobacco Control in all countries, as appropriate"
              ;;   :children [{:code :SDG_I_3.a.1
              ;;               :name "Age-standardized prevalence of current tobacco use among persons aged 15 years and older [age]"}]}
              ;;  {:code :26
              ;;   :name "Target 3.b: Support the research and development of vaccines and medicines for the communicable and non-communicable diseases that primarily affect developing countries, provide access to affordable essential medicines and vaccines, in accordance with the Doha Declaration on the TRIPS Agreement and Public Health, which affirms the right of developing countries to use to the full the provisions in the Agreement on Trade-Related Aspects of Intellectual Property Rights regarding flexibilities to protect public health, and, in particular, provide access to medicines for all"
              ;;   :children [{:code :SDG_I_3.b.1
              ;;               :name "Proportion of the target population covered by all vaccines included in their national programme [%]"}
              ;;              {:code :SDG_I_3.b.2
              ;;               :name "Total net official development assistance to medical research and basic health sectors [USD]"}
              ;;              {:code :SDG_I_3.b.3
              ;;               :name "Proportion of health facilities that have a core set of relevant essential medicines available and affordable on a sustainable basis [%]"}]}
              ;;  {:code :27
              ;;   :name "Target 3.c: Substantially increase health financing and the recruitment, development, training and retention of the health workforce in developing countries, especially in least developed countries and small island developing States"
              ;;   :children [{:code :SDG_I_3.c.1
              ;;               :name "Health worker density and distribution []"}]}
              ;;  {:code :28
              ;;   :name "Target 3.d: Strengthen the capacity of all countries, in particular developing countries, for early warning, risk reduction and management of national and global health risks"
              ;;   :children [{:code :SDG_I_3.d.1
              ;;               :name "International Health Regulations IHR capacity and health emergency preparedness [%]"}
              ;;              {:code :SDG_I_3.d.2
              ;;               :name "Percentage of bloodstream infections due to selected antimicrobial-resistant organismsi [%]"}]}
               ]}
   {:code :4
    :name "Goal 4. Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all"
    :children [{:code :29
                :name "Target 4.1: By 2030, ensure that all girls and boys complete free, equitable and quality primary and secondary education leading to relevant and effective learning outcomes"
                :children [{:code :SDG_I_4.1.1
                            :name "Proportion of children and young people a in grades 2 3 b at the end of primary and c at the end of lower secondary achieving at least a minimum proficiency level in i reading and ii mathematics by sex [%]"}
                          ;;  {:code :SDG_I_4.1.2
                          ;;   :name "Completion rate primary education lower secondary education upper secondary education [%]"}
                           ]}
              ;;  {:code :30
              ;;   :name "Target 4.2: By 2030, ensure that all girls and boys have access to quality early childhood development, care and pre-primary education so that they are ready for primary education"
              ;;   :children [{:code :SDG_I_4.2.1
              ;;               :name "Proportion of children aged 24-59 months who are developmentally on track in health learning and psychosocial well-being by sex [%]"}
              ;;              {:code :SDG_I_4.2.2
              ;;               :name "Participation rate in organized learning one year before the official primary entry age by sex [%]"}]}
              ;;  {:code :31
              ;;   :name "Target 4.3: By 2030, ensure equal access for all women and men to affordable and quality technical, vocational and tertiary education, including university"
              ;;   :children [{:code :SDG_I_4.3.1
              ;;               :name "Participation rate of youth and adults in formal and non-formal education and training in the previous 12 months by sex [%]"}]}
               {:code :32
                :name "Target 4.4: By 2030, substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment, decent jobs and entrepreneurship"
                :children [{:code :SDG_I_4.4.1
                            :name "Proportion of youth and adults with information and communications technology ICT skills by type of skill [%]"}]}
              ;;  {:code :33
              ;;   :name "Target 4.5: By 2030, eliminate gender disparities in education and ensure equal access to all levels of education and vocational training for the vulnerable, including persons with disabilities, indigenous peoples and children in vulnerable situations"
              ;;   :children [{:code :SDG_I_4.5.1
              ;;               :name "Parity indices female male rural urban bottom top wealth quintile and others such as disability status indigenous peoples and conflict-affected as data become available for all education indicators on this list that can be disaggregated [nb]"}]}
              ;;  {:code :34
              ;;   :name "Target 4.6: By 2030, ensure that all youth and a substantial proportion of adults, both men and women, achieve literacy and numeracy"
              ;;   :children [{:code :SDG_I_4.6.1
              ;;               :name "Proportion of population in a given age group achieving at least a fixed level of proficiency in functional a literacy and b numeracy skills by sex [%]"}]}
              ;;  {:code :35
              ;;   :name "Target 4.7: By 2030, ensure that all learners acquire the knowledge and skills needed to promote sustainable development, including, among others, through education for sustainable development and sustainable lifestyles, human rights, gender equality, promotion of a culture of peace and non-violence, global citizenship and appreciation of cultural diversity and of culture's contribution to sustainable development"
              ;;   :children [{:code :SDG_I_4.7.1
              ;;               :name "Extent to which i global citizenship education and ii education for sustainable development are mainstreamed in a national education policies b curricula c teacher education and d student assessment [unknown]"}]}
              ;;  {:code :36
              ;;   :name "Target 4.a: Build and upgrade education facilities that are child, disability and gender sensitive and provide safe, non-violent, inclusive and effective learning environments for all"
              ;;   :children [{:code :SDG_I_4.a.1
              ;;               :name "Proportion of schools offering basic services by type of service [%]"}]}
              ;;  {:code :37
              ;;   :name "Target 4.b: By 2020, substantially expand globally the number of scholarships available to developing countries, in particular least developed countries, small island developing States and African countries, for enrolment in higher education, including vocational training and information and communications technology, technical, engineering and scientific programmes, in developed countries and other developing countries"
              ;;   :children [{:code :SDG_I_4.b.1
              ;;               :name "Volume of official development assistance flows for scholarships by sector and type of study [millions USD (2018)]"}]}
              ;;  {:code :38
              ;;   :name "Target 4.c: By 2030, substantially increase the supply of qualified teachers, including through international cooperation for teacher training in developing countries, especially least developed countries and small island developing States"
              ;;   :children [{:code :SDG_I_4.c.1
              ;;               :name "Proportion of teachers with the minimum required qualifications by education leveli [%]"}]}
               ]}
   {:code :5
    :name "Goal 5. Achieve gender equality and empower all women and girls"
    :children [{:code :39
                :name "Target 5.1: End all forms of discrimination against all women and girls everywhere"
                :children [{:code :SDG_I_5.1.1
                            :name "Whether or not legal frameworks are in place to promote enforce and monitor equality and non‑discrimination on the basis of sex []"}]}
               {:code :40
                :name "Target 5.2: Eliminate all forms of violence against all women and girls in the public and private spheres, including trafficking and sexual and other types of exploitation"
                :children [{:code :SDG_I_5.2.1
                            :name "Proportion of ever-partnered women and girls aged 15 years and older subjected to physical sexual or psychological violence by a current or former intimate partner in the previous 12 months by form of violence and by age []"}
                          ;;  {:code :SDG_I_5.2.2
                          ;;   :name "Proportion of women and girls aged 15 years and older subjected to sexual violence by persons other than an intimate partner in the previous 12 months by age and place of occurrence []"}
                           ]}
              ;;  {:code :41
              ;;   :name "Target 5.3: Eliminate all harmful practices, such as child, early and forced marriage and female genital mutilation"
              ;;   :children [{:code :SDG_I_5.3.1
              ;;               :name "Proportion of women aged 20–24 years who were married or in a union before age 15 and before age 18 []"}
              ;;              {:code :SDG_I_5.3.2
              ;;               :name "Proportion of girls and women aged 15–49 years who have undergone female genital mutilation cutting by age []"}]}
              ;;  {:code :42
              ;;   :name "Target 5.4: Recognize and value unpaid care and domestic work through the provision of public services, infrastructure and social protection policies and the promotion of shared responsibility within the household and the family as nationally appropriate"
              ;;   :children [{:code :SDG_I_5.4.1
              ;;               :name "Proportion of time spent on unpaid domestic and care work by sex age and location []"}]}
              ;;  {:code :43
              ;;   :name "Target 5.5: Ensure women's full and effective participation and equal opportunities for leadership at all levels of decision-making in political, economic and public life"
              ;;   :children [{:code :SDG_I_5.5.1
              ;;               :name "Proportion of seats held by women in a national parliaments and b local governments [%]"}
              ;;              {:code :SDG_I_5.5.2
              ;;               :name "Proportion of women in managerial positions [%]"}]}
               {:code :44
                :name "Target 5.6: Ensure universal access to sexual and reproductive health and reproductive rights as agreed in accordance with the Programme of Action of the International Conference on Population and Development and the Beijing Platform for Action and the outcome documents of their review conferences"
                :children [{:code :SDG_I_5.6.1
                            :name "Proportion of women aged 15–49 years who make their own informed decisions regarding sexual relations contraceptive use and reproductive health care []"}
                          ;;  {:code :SDG_I_5.6.2
                          ;;   :name "Number of countries with laws and regulations that guarantee full and equal access to women and men aged 15 years and older to sexual and reproductive health care information and education []"}
                           ]}
               {:code :45
                :name "Target 5.a: Undertake reforms to give women equal rights to economic resources, as well as access to ownership and control over land and other forms of property, financial services, inheritance and natural resources, in accordance with national laws"
                :children [{:code :SDG_I_5.a.1
                            :name "a Proportion of total agricultural population with ownership or secure rights over agricultural land by sex and b share of women among owners or rights-bearers of agricultural land by type of tenure [%]"}
                           {:code :SDG_I_5.a.2
                            :name "Proportion of countries where the legal framework including customary law guarantees women’s equal rights to land ownership and or control [nb]"}]}
              ;;  {:code :46
              ;;   :name "Target 5.b: Enhance the use of enabling technology, in particular information and communications technology, to promote the empowerment of women"
              ;;   :children [{:code :SDG_I_5.b.1
              ;;               :name "Proportion of individuals who own a mobile telephone by sex [%]"}]}
              ;;  {:code :47
              ;;   :name "Target 5.c: Adopt and strengthen sound policies and enforceable legislation for the promotion of gender equality and the empowerment of all women and girls at all levels"
              ;;   :children [{:code :SDG_I_5.c.1
              ;;               :name "Proportion of countries with systems to track and make public allocations for gender equality and women’s empowerment [%]"}]}
               ]}
   {:code :6
    :name "Goal 6. Ensure availability and sustainable management of water and sanitation for all"
    :children [{:code :48
                :name "Target 6.1: By 2030, achieve universal and equitable access to safe and affordable drinking water for all"
                :children [{:code :SDG_I_6.1.1
                            :name "Proportion of population using safely managed drinking water services [%]"}]}
               {:code :49
                :name "Target 6.2: By 2030, achieve access to adequate and equitable sanitation and hygiene for all and end open defecation, paying special attention to the needs of women and girls and those in vulnerable situations"
                :children [{:code :SDG_I_6.2.1
                            :name "Spatial extent of water-related ecosystems [ha]"}]}
               {:code :50
                :name "Target 6.3: By 2030, improve water quality by reducing pollution, eliminating dumping and minimizing release of hazardous chemicals and materials, halving the proportion of untreated wastewater and substantially increasing recycling and safe reuse globally"
                :children [;;  {:code :SDG_I_6.3.1
                          ;;   :name "Water quality of lakesand artificial water bodies [%]"}
                           {:code :SDG_I_6.3.2
                            :name "Quantity of water discharge in rivers and estuaries [%]"}]}
               {:code :51
                :name "Target 6.4: By 2030, substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals and supply of freshwater to address water scarcity and substantially reduce the number of people suffering from water scarcity"
                :children [;;  {:code :SDG_I_6.4.1
                          ;;   :name "Quantity of groundwater within aquifers [USD/m3]"}
                           {:code :SDG_I_6.4.2
                            :name "Proportion of population using a safely managed sanitation services and b a hand-washing facility with soap and water [%]"}]}
               {:code :52
                :name "Target 6.5: By 2030, implement integrated water resources management at all levels, including through transboundary cooperation as appropriate"
                :children [{:code :SDG_I_6.5.1
                            :name "Proportion of domestic and industrial wastewater flows safely treated [nb,%]"}
                          ;;  {:code :SDG_I_6.5.2
                          ;;   :name "Proportion of bodies of water with good ambient water quality [%]"}
                           ]}
               {:code :53
                :name "Target 6.6: By 2020, protect and restore water-related ecosystems, including mountains, forests, wetlands, rivers, aquifers and lakes"
                :children [{:code :SDG_I_6.6.1
                            :name "Change in water-use efficiency over time [Mm3/yr, km2,%]"}
                           {:code :SDG_I_6.6.1-1
                            :name "Level of water stress: freshwater withdrawal as a proportion of available freshwater resources [%]"}
                           {:code :SDG_I_6.6.1-2
                            :name "Degree of integrated water resources management [unknown]"}
                           {:code :SDG_I_6.6.1-3
                            :name "Proportion of transboundary basin area with an operational arrangement for water cooperation [%]"}
                           {:code :SDG_I_6.6.1-5
                            :name "Change in the extent of water-related ecosystems over time [%; ha]"}]}
               {:code :54
                :name "Target 6.a: By 2030, expand international cooperation and capacity-building support to developing countries in water- and sanitation-related activities and programmes, including water harvesting, desalination, water efficiency, wastewater treatment, recycling and reuse technologies"
                :children [{:code :SDG_I_6.a.1
                            :name "Amount of water- and sanitation-related official development assistance that is part of a government-coordinated spending plan [millions USD (2018)]"}]}
               {:code :55
                :name "Target 6.b: Support and strengthen the participation of local communities in improving water and sanitation management"
                :children [{:code :SDG_I_6.b.1
                            :name "Proportion of local administrative units with established and operational policies and procedures for participation of local communities in water and sanitation management [%; nb]"}]}]}
   {:code :7
    :name "Goal 7. Ensure access to affordable, reliable, sustainable and modern energy for all"
    :children [{:code :56
                :name "Target 7.1: By 2030, ensure universal access to affordable, reliable and modern energy services"
                :children [{:code :SDG_I_7.1.1
                            :name "Proportion of population with access to electricity [%]"}
                           {:code :SDG_I_7.1.2
                            :name "Proportion of population with primary reliance on clean fuels and technology [%]"}]}
               {:code :57
                :name "Target 7.2: By 2030, increase substantially the share of renewable energy in the global energy mix"
                :children [{:code :SDG_I_7.2.1
                            :name "Renewable energy share in the total final energy consumption [%]"}]}
              ;;  {:code :58
              ;;   :name "Target 7.3: By 2030, double the global rate of improvement in energy efficiency"
              ;;   :children [{:code :SDG_I_7.3.1
              ;;               :name "Energy intensity measured in terms of primary energy and GDP [MJ per constant 2011 purchasing power parity GDP]"}]}
              ;;  {:code :59
              ;;   :name "Target 7.a: By 2030, enhance international cooperation to facilitate access to clean energy research and technology, including renewable energy, energy efficiency and advanced and cleaner fossil-fuel technology, and promote investment in energy infrastructure and clean energy technology"
              ;;   :children [{:code :SDG_I_7.a.1
              ;;               :name "International financial flows to developing countries in support of clean energy research and development and renewable energy production including in hybrid systems [millions USD (2017)]"}
              ;;              {:code :SDG_I_7.b.1
              ;;               :name "Installed renewable energy-generating capacity in developing countries in watts per capita [unknown]"}]}
               ]}
   {:code :8
    :name "Goal 8. Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all"
    :children [{:code :67
                :name "Target 8.1: Sustain per capita economic growth in accordance with national circumstances and, in particular, at least 7 per cent gross domestic product growth per annum in the least developed countries"
                :children [{:code :SDG_I_8.1.1
                            :name "Annual growth rate of real GDP per capita [%]"}
                          ;;  {:code :SDG_I_8.2.1
                          ;;   :name "Annual growth rate of real GDP per employed person [%]"}
                          ;;  {:code :SDG_I_8.3.1
                          ;;   :name "Proportion of informal employment in total employment by sector and sex [%]"}
                           ]}
              ;;  {:code :61
              ;;   :name "Target 8.2: Achieve higher levels of economic productivity through diversification, technological upgrading and innovation, including through a focus on high-value added and labour-intensive sectors"
              ;;   :children [{:code :SDG_I_8.4.1
              ;;               :name "Material footprint material footprint per capita and material footprint per GDP [t; kg per USD (2010); t]"}]}
               {:code :62
                :name "Target 8.3: Promote development-oriented policies that support productive activities, decent job creation, entrepreneurship, creativity and innovation, and encourage the formalization and growth of micro-, small- and medium-sized enterprises, including through access to financial services"
                :children [{:code :SDG_I_8.3.1
                            :name "Proportion of informal employment in total employment by sector and sex [%]"}]}
              ;;  {:code :63
              ;;   :name "Target 8.4: Improve progressively, through 2030, global resource efficiency in consumption and production and endeavour to decouple economic growth from environmental degradation, in accordance with the 10-Year Framework of Programmes on Sustainable Consumption and Production, with developed countries taking the lead"
              ;;   :children [{:code :SDG_I_8.4.2
              ;;               :name "Domestic material consumption domestic material consumption per capita and domestic material consumption per GDP [t; kg per USD (2010); t]"}
               {:code :64
                :name "Target 8.5: By 2030, achieve full and productive employment and decent work for all women and men, including for young people and persons with disabilities, and equal pay for work of equal value"
                :children [;;  {:code :SDG_I_8.5.1
                          ;;   :name "Average hourly earnings of employees by sex age occupation and persons with disabilities [LCU]"}
                           {:code :SDG_I_8.5.2
                            :name "Unemployment rate by sex age and persons with disabilities [%]"}]}
                          ;;  {:code :SDG_I_8.6.1
                          ;;   :name "Proportion of youth aged 15–24 years not in education employment or training [%]"}
              ;;  {:code :65
              ;;   :name "Target 8.6: By 2020, substantially reduce the proportion of youth not in employment, education or training"
              ;;   :children [{:code :SDG_I_8.8.1
              ;;               :name "Fatal and non-fatal occupational injuries per 100000 workers by sex and migrant status [1/100000]"}]}
   {:code :66
    :name "Target 8.7: Take immediate and effective measures to eradicate forced labour, end modern slavery and human trafficking and secure the prohibition and elimination of the worst forms of child labour, including recruitment and use of child soldiers, and by 2025 end child labour in all its forms"
    :children [{:code :SDG_I_8.7.1
                :name "Proportion and number of children aged 5–17 years engaged in child labour by sex and age [%]"}]}
   {:code :68
    :name "Target 8.8: Protect labour rights and promote safe and secure working environments for all workers, including migrant workers, in particular women migrants, and those in precarious employment"
    :children [{:code :SDG_I_8.8.2
                :name "Level of national compliance with labour rights freedom of association and collective bargaining based on International Labour Organization ILO textual sources and national legislation by sex and migrant status [unknown]"}
                          ;;  {:code :SDG_I_8.9.1
                          ;;   :name "Tourism direct GDP as a proportion of total GDP and in growth rate [%]"}
                          ;;  {:code :SDG_I_8.10.1
                          ;;   :name "a Number of commercial bank branches per 100000 adults and b number of automated teller machines ATMs per 100000 adults [1/100000]"}
               ]}
   {:code :69
    :name "Target 8.10: Strengthen the capacity of domestic financial institutions to encourage and expand access to banking, insurance and financial services for all"
    :children [{:code :SDG_I_8.10.2
                :name "Proportion of adults 15 years and older with an account at a bank or other financial institution or with a mobile-money-service provider [%]"}]}
              ;;  {:code :69
              ;;   :name "Target 8.9: By 2030, devise and implement policies to promote sustainable tourism that creates jobs and promotes local culture and products"
              ;;   :children [{:code :SDG_I_8.10.2
              ;;               :name "Proportion of adults 15 years and older with an account at a bank or other financial institution or with a mobile-money-service provider [%]"}]}
              ;;  {:code :71
              ;;   :name "Target 8.a: Increase Aid for Trade support for developing countries, in particular least developed countries, including through the Enhanced Integrated Framework for Trade-related Technical Assistance to Least Developed Countries"
              ;;   :children [{:code :SDG_I_8.a.1
              ;;               :name "Aid for Trade commitments and disbursements [millions USD (2018)]"}]}
   {:code :72
    :name "Target 8.b: By 2020, develop and operationalize a global strategy for youth employment and implement the Global Jobs Pact of the International Labour Organization"
    :children [{:code :SDG_I_8.b.1
                :name "Existence of a developed and operationalized national strategy for youth employment as a distinct strategy or as part of a national employment strategy [unknown]"}]}]}
   {:code :9
    :name "Goal 9. Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation"
    :children [{:code :73
                :name "Target 9.1: Develop quality, reliable, sustainable and resilient infrastructure, including regional and trans-border infrastructure, to support economic development and human well-being, with a focus on affordable and equitable access for all"
                :children [{:code :SDG_I_9.1.1
                            :name "Proportion of the rural population who live within 2 km of an all-season road [%]"}
                           {:code :SDG_I_9.1.2
                            :name "Passenger and freight volumes by mode of transport [(twenty-foot equivalent units; metric tonnes; t/km; passenger km]"}]}
              ;;  {:code :74
              ;;   :name "Target 9.2: Promote inclusive and sustainable industrialization and, by 2030, significantly raise industry's share of employment and gross domestic product, in line with national circumstances, and double its share in least developed countries"
              ;;   :children [{:code :SDG_I_9.2.1
              ;;               :name "Manufacturing value added as a proportion of GDP and per capita [%; millions USD (2015)]"}
              ;;              {:code :SDG_I_9.2.2
              ;;               :name "Manufacturing employment as a proportion of total employment [%]"}]}
              ;;  {:code :75
              ;;   :name "Target 9.3: Increase the access of small-scale industrial and other enterprises, in particular in developing countries, to financial services, including affordable credit, and their integration into value chains and markets"
              ;;   :children [{:code :SDG_I_9.3.1
              ;;               :name "Proportion of small-scale industries in total industry value added [%]"}
              ;;              {:code :SDG_I_9.3.2
              ;;               :name "Proportion of small-scale industries with a loan or line of credit [%]"}]}
              ;;  {:code :76
              ;;   :name "Target 9.4: By 2030, upgrade infrastructure and retrofit industries to make them sustainable, with increased resource-use efficiency and greater adoption of clean and environmentally sound technologies and industrial processes, with all countries taking action in accordance with their respective capabilities"
              ;;   :children [{:code :SDG_I_9.4.1
              ;;               :name "CO2 emission per unit of value added [Mt CO2; kg CO2 / millions USD (2010)]"}]}
              ;;  {:code :77
              ;;   :name "Target 9.5: Enhance scientific research, upgrade the technological capabilities of industrial sectors in all countries, in particular developing countries, including, by 2030, encouraging innovation and substantially increasing the number of research and development workers per 1 million people and public and private research and development spending"
              ;;   :children [{:code :SDG_I_9.5.1
              ;;               :name "Research and development expenditure as a proportion of GDP [%]"}
              ;;              {:code :SDG_I_9.5.2
              ;;               :name "Researchers in full-time equivalent per million inhabitants [FTE/1000000]"}]}
              ;;  {:code :78
              ;;   :name "Target 9.a: Facilitate sustainable and resilient infrastructure development in developing countries through enhanced financial, technological and technical support to African countries, least developed countries, landlocked developing countries and small island developing States"
              ;;   :children [{:code :SDG_I_9.a.1
              ;;               :name "Total official international support official development assistance plus other official flows to infrastructure [millions USD (2018)]"}]}
              ;;  {:code :79
              ;;   :name "Target 9.b: Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities"
              ;;   :children [{:code :SDG_I_9.b.1
              ;;               :name "Proportion of medium and high-tech industry value added in total value added [%]"}]}
               {:code :80
                :name "Target 9.c: Significantly increase access to information and communications technology and strive to provide universal and affordable access to the Internet in least developed countries by 2020"
                :children [{:code :SDG_I_9.c.1
                            :name "Proportion of population covered by a mobile network by technology [%]"}]}]}
   {:code :10
    :name "Goal 10. Reduce inequality within and among countries"
    :children [
              ;;  {:code :81
              ;;   :name "Target 10.1: By 2030, progressively achieve and sustain income growth of the bottom 40 per cent of the population at a rate higher than the national average"
              ;;   :children [{:code :SDG_I_10.1.1
              ;;               :name "Growth rates of household expenditure or income per capita among the bottom 40 per cent of the population and the total population [%]"}]}
               {:code :82
                :name "Target 10.2: By 2030, empower and promote the social, economic and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion or economic or other status"
                :children [{:code :SDG_I_10.2.1
                            :name "Proportion of people living below 50 per cent of median income by sex age and persons with disabilities [%]"}]}
               {:code :83
                :name "Target 10.3: Ensure equal opportunity and reduce inequalities of outcome, including by eliminating discriminatory laws, policies and practices and promoting appropriate legislation, policies and action in this regard"
                :children [{:code :SDG_I_10.3.1
                            :name "Proportion of population reporting having personally felt discriminated against or harassed in the previous 12 months on the basis of a ground of discrimination prohibited under international human rights law []"}]}
              ;;  {:code :84
              ;;   :name "Target 10.4: Adopt policies, especially fiscal, wage and social protection policies, and progressively achieve greater equality"
              ;;   :children [{:code :SDG_I_10.4.1
              ;;               :name "Labour share of GDP [%]"}
              ;;              {:code :SDG_I_10.4.2
              ;;               :name "Redistributive impact of fiscal policy [unknown]"}]}
              ;;  {:code :85
              ;;   :name "Target 10.5: Improve the regulation and monitoring of global financial markets and institutions and strengthen the implementation of such regulations"
              ;;   :children [{:code :SDG_I_10.5.1
              ;;               :name "Financial Soundness Indicators [%]"}]}
              ;;  {:code :86
              ;;   :name "Target 10.6: Ensure enhanced representation and voice for developing countries in decision-making in global international economic and financial institutions in order to deliver more effective, credible, accountable and legitimate institutions"
              ;;   :children [{:code :SDG_I_10.6.1
              ;;               :name "Proportion of members and voting rights of developing countries in international organizations []"}]}
              ;;  {:code :87
              ;;   :name "Target 10.7: Facilitate orderly, safe, regular and responsible migration and mobility of people, including through the implementation of planned and well-managed migration policies"
              ;;   :children [{:code :SDG_I_10.7.1
              ;;               :name "Recruitment cost borne by employee as a proportion of monthly income earned in country of destination []"}
              ;;              {:code :SDG_I_10.7.2
              ;;               :name "Number of countries with migration policies that facilitate orderly safe regular and responsible migration and mobility of people [nb]"}
              ;;              {:code :SDG_I_10.7.3
              ;;               :name "Number of people who died or disappeared in the process of migration towards an international destinationi [nb]"}
              ;;              {:code :SDG_I_10.7.4
              ;;               :name "Proportion of the population who are refugees by country of origin [%]"}]}
              ;;  {:code :88
              ;;   :name "Target 10.a: Implement the principle of special and differential treatment for developing countries, in particular least developed countries, in accordance with World Trade Organization agreements"
              ;;   :children [{:code :SDG_I_10.a.1
              ;;               :name "Proportion of tariff lines applied to imports from least developed countries and developing countries with zero-tariff [%]"}]}
               {:code :89
                :name "Target 10.b: Encourage official development assistance and financial flows, including foreign direct investment, to States where the need is greatest, in particular least developed countries, African countries, small island developing States and landlocked developing countries, in accordance with their national plans and programmes"
                :children [{:code :SDG_I_10.b.1
                            :name "Total resource flows for development by recipient and donor countries and type of flow eg official development assistance foreign direct investment and other flows [millions USD]"}]}
              ;;  {:code :90
              ;;   :name "Target 10.c: By 2030, reduce to less than 3 per cent the transaction costs of migrant remittances and eliminate remittance corridors with costs higher than 5 per cent"
              ;;   :children [{:code :SDG_I_10.c.1
              ;;               :name "Remittance costs as a proportion of the amount remitted [%]"}]}
               ]}
   {:code :11
    :name "Goal 11. Make cities and human settlements inclusive, safe, resilient and sustainable"
    :children [{:code :91
                :name "Target 11.1: By 2030, ensure access for all to adequate, safe and affordable housing and basic services and upgrade slums"
                :children [{:code :SDG_I_11.1.1
                            :name "Proportion of urban population living in slums informal settlements or inadequate housing [%]"}]}
              ;;  {:code :92
              ;;   :name "Target 11.2: By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport, with special attention to the needs of those in vulnerable situations, women, children, persons with disabilities and older persons"
              ;;   :children [{:code :SDG_I_11.2.1
              ;;               :name "Proportion of population that has convenient access to public transport by sex age and persons with disabilities [%]"}]}
               {:code :93
                :name "Target 11.3: By 2030, enhance inclusive and sustainable urbanization and capacity for participatory, integrated and sustainable human settlement planning and management in all countries"
                :children [{:code :SDG_I_11.3.1
                            :name "Ratio of land consumption rate to population growth rate [nb]"}
                          ;;  {:code :SDG_I_11.3.2
                          ;;   :name "Proportion of cities with a direct participation structure of civil society in urban planning and management that operate regularly and democratically [%]"}
                           ]}
               {:code :94
                :name "Target 11.4: Strengthen efforts to protect and safeguard the world's cultural and natural heritage"
                :children [{:code :SDG_I_11.4.1
                            :name "Total per capita expenditure on the preservation protection and conservation of all cultural and natural heritage by source of funding public private type of heritage cultural natural and level of government national regional and local municipal [unknown]"}]}
              ;;  {:code :95
              ;;   :name "Target 11.5: By 2030, significantly reduce the number of deaths and the number of people affected and substantially decrease the direct economic losses relative to global gross domestic product caused by disasters, including water-related disasters, with a focus on protecting the poor and people in vulnerable situations"
              ;;   :children [{:code :SDG_I_11.5.1
              ;;               :name "Number of deaths missing persons and directly affected persons attributed to disasters per 100000 population [1/100000]"}
              ;;              {:code :SDG_I_11.5.2
              ;;               :name "Direct economic loss in relation to global GDP damage to critical infrastructure and number of disruptions to basic services attributed to disasters [USD; %; millions USD; nb]"}]}
               {:code :96
                :name "Target 11.6: By 2030, reduce the adverse per capita environmental impact of cities, including by paying special attention to air quality and municipal and other waste management"
                :children [{:code :SDG_I_11.6.1
                            :name "Proportion of municipal solid waste collected and managed in controlled facilities out of total municipal waste generated by cities [%]"}
                          ;;  {:code :SDG_I_11.6.2
                          ;;   :name "Annual mean levels of fine particulate matter eg PM25 and PM10 in cities population weighted [micro gramme/m3]"}
                           ]}
              ;;  {:code :97
              ;;   :name "Target 11.7: By 2030, provide universal access to safe, inclusive and accessible, green and public spaces, in particular for women and children, older persons and persons with disabilities"
              ;;   :children [{:code :SDG_I_11.7.1
              ;;               :name "Average share of the built-up area of cities that is open space for public use for all by sex age and persons with disabilities [%]"}
              ;;              {:code :SDG_I_11.7.2
              ;;               :name "Proportion of persons victim of physical or sexual harassment by sex age disability status and place of occurrence in the previous 12 months []"}]}
               {:code :98
                :name "Target 11.a: Support positive economic, social and environmental links between urban, peri-urban and rural areas by strengthening national and regional development planning"
                :children [{:code :SDG_I_11.a.1
                            :name "Number of countries that have national urban policies or regional development plans that a respond to population dynamics b ensure balanced territorial development and c increase local fiscal space [nb]"}]}
               {:code :99
                :name "Target 11.b: By 2020, substantially increase the number of cities and human settlements adopting and implementing integrated policies and plans towards inclusion, resource efficiency, mitigation and adaptation to climate change, resilience to disasters, and develop and implement, in line with the Sendai Framework for Disaster Risk Reduction 2015-2030, holistic disaster risk management at all levels"
                :children [{:code :SDG_I_11.b.1
                            :name "Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015–2030 [nb]"}
                          ;;  {:code :SDG_I_11.b.2
                          ;;   :name "Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies [%]"}
                           ]}]}
   {:code :12
    :name "Goal 12. Ensure sustainable consumption and production patterns"
    :children [
              ;;  {:code :101
              ;;   :name "Target 12.1: Implement the 10-Year Framework of Programmes on Sustainable Consumption and Production Patterns, all countries taking action, with developed countries taking the lead, taking into account the development and capabilities of developing countries"
              ;;   :children [{:code :SDG_I_12.1.1
              ;;               :name "Number of countries developing adopting or implementing policy instruments aimed at supporting the shift to sustainable consumption and production [nb]"}]}
              ;;  {:code :102
              ;;   :name "Target 12.2: By 2030, achieve the sustainable management and efficient use of natural resources"
              ;;   :children [{:code :SDG_I_12.2.1
              ;;               :name "Material footprint material footprint per capita and material footprint per GDP [t; kg per USD (2010); t]"}
              ;;              {:code :SDG_I_12.2.2
              ;;               :name "Domestic material consumption domestic material consumption per capita and domestic material consumption per GDP [t; kg per USD (2010); t]"}]}
              ;;  {:code :103
              ;;   :name "Target 12.3: By 2030, halve per capita global food waste at the retail and consumer levels and reduce food losses along production and supply chains, including post-harvest losses"
              ;;   :children [{:code :SDG_I_12.3.1
              ;;               :name "a Food loss index and b food waste index [%]"}]}
              ;;  {:code :104
              ;;   :name "Target 12.4: By 2020, achieve the environmentally sound management of chemicals and all wastes throughout their life cycle, in accordance with agreed international frameworks, and significantly reduce their release to air, water and soil in order to minimize their adverse impacts on human health and the environment"
              ;;   :children [{:code :SDG_I_12.4.1
              ;;               :name "Number of parties to international multilateral environmental agreements on hazardous waste and other chemicals that meet their commitments and obligations in transmitting information as required by each relevant agreement [nb]"}
              ;;              {:code :SDG_I_12.4.2
              ;;               :name "a Hazardous waste generated per capita and b proportion of hazardous waste treated by type of treatment [t; kg; %; kg/USD (2015)]"}]}
              ;;  {:code :105
              ;;   :name "Target 12.5: By 2030, substantially reduce waste generation through prevention, reduction, recycling and reuse"
              ;;   :children [{:code :SDG_I_12.5.1
              ;;               :name "National recycling rate tons of material recycled [t: kg; %]"}]}
              ;;  {:code :106
              ;;   :name "Target 12.6: Encourage companies, especially large and transnational companies, to adopt sustainable practices and to integrate sustainability information into their reporting cycle"
              ;;   :children [{:code :SDG_I_12.6.1
              ;;               :name "Number of companies publishing sustainability reports [nb]"}]}
              ;;  {:code :107
              ;;   :name "Target 12.7: Promote public procurement practices that are sustainable, in accordance with national policies and priorities"
              ;;   :children [{:code :SDG_I_12.7.1
              ;;               :name "Degree of sustainable public procurement policies and action plan implementation [unknown]"}]}
              ;;  {:code :108
              ;;   :name "Target 12.8: By 2030, ensure that people everywhere have the relevant information and awareness for sustainable development and lifestyles in harmony with nature"
              ;;   :children [{:code :SDG_I_12.8.1
              ;;               :name "Extent to which i global citizenship education and ii education for sustainable development are mainstreamed in a national education policies b curricula c teacher education and d student assessment [unknown]"}]}
              ;;  {:code :109
              ;;   :name "Target 12.a: Support developing countries to strengthen their scientific and technological capacity to move towards more sustainable patterns of consumption and production"
              ;;   :children [{:code :SDG_I_12.a.1
              ;;               :name "Installed renewable energy-generating capacity in developing countries in watts per capita [unknown]"}]}
               {:code :110
                :name "Target 12.b: Develop and implement tools to monitor sustainable development impacts for sustainable tourism that creates jobs and promotes local culture and products"
                :children [{:code :SDG_I_12.b.1
                            :name "Implementation of standard accounting tools to monitor the economic and environmental aspects of tourism sustainability [SEEA tables]"}]}
              ;;  {:code :111
              ;;   :name "Target 12.c: Rationalize inefficient fossil-fuel subsidies that encourage wasteful consumption by removing market distortions, in accordance with national circumstances, including by restructuring taxation and phasing out those harmful subsidies, where they exist, to reflect their environmental impacts, taking fully into account the specific needs and conditions of developing countries and minimizing the possible adverse impacts on their development in a manner that protects the poor and the affected communities"
              ;;   :children [{:code :SDG_I_12.c.1
              ;;               :name "Amount of fossil-fuel subsidies per unit of GDP production and consumption [%; USD]"}]}
               ]}
   {:code :13
    :name "Goal 13. Take urgent action to combat climate change and its impacts"
    :children [{:code :112
                :name "Target 13.1: Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries"
                :children [
                          ;;  {:code :SDG_I_13.1.1
                          ;;   :name "Number of deaths missing persons and directly affected persons attributed to disasters per 100000 population [nb]"}
                           {:code :SDG_I_13.1.2
                            :name "Number of countries that adopt and implement national disaster risk reduction strategies in line with the Sendai Framework for Disaster Risk Reduction 2015–2030 [nb]"}
                           {:code :SDG_I_13.1.3
                            :name "Proportion of local governments that adopt and implement local disaster risk reduction strategies in line with national disaster risk reduction strategies [%]"}]}
               {:code :113
                :name "Target 13.2: Integrate climate change measures into national policies, strategies and planning"
                :children [{:code :SDG_I_13.2.1
                            :name "Number of countries with nationally determined contributions long-term strategies national adaptation plans strategies as reported in adaptation communications and national communications [nb]"}
                           {:code :SDG_I_13.2.2
                            :name "Total greenhouse gas emissions per year [unknown]"}]}
              ;;  {:code :114
              ;;   :name "Target 13.3: Improve education, awareness-raising and human and institutional capacity on climate change mitigation, adaptation, impact reduction and early warning"
              ;;   :children [{:code :SDG_I_13.3.1
              ;;               :name "Extent to which i global citizenship education and ii education for sustainable development are mainstreamed in a national education policies b curricula c teacher education and d student assessment [unknown]"}]}
              ;;  {:code :115
              ;;   :name "Target 13.a: Implement the commitment undertaken by developed-country parties to the United Nations Framework Convention on Climate Change to a goal of mobilizing jointly $100 billion annually by 2020 from all sources to address the needs of developing countries in the context of meaningful mitigation actions and transparency on implementation and fully operationalize the Green Climate Fund through its capitalization as soon as possible"
              ;;   :children [{:code :SDG_I_13.a.1
              ;;               :name "Amounts provided and mobilized in United States dollars per year in relation to the continued existing collective mobilization goal of the $100 billion commitment through to 2025 [unknown]"}]}
              ;;  {:code :116
              ;;   :name "Target 13.b: Promote mechanisms for raising capacity for effective climate change-related planning and management in least developed countries and small island developing States, including focusing on women, youth and local and marginalized communities"
              ;;   :children [{:code :SDG_I_13.b.1
              ;;               :name "Number of least developed countries and small island developing States with nationally determined contributions long-term strategies national adaptation plans strategies as reported in adaptation communications and national communications [nb]"}]}
               ]}
   {:code :14
    :name "Goal 14. Conserve and sustainably use the oceans, seas and marine resources for sustainable development"
    :children [{:code :117
                :name "Target 14.1: By 2025, prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution"
                :children [{:code :SDG_I_14.1.1
                            :name "a Index of coastal eutrophication and b plastic debris density [unknown]"}]}
               {:code :118
                :name "Target 14.2: By 2020, sustainably manage and protect marine and coastal ecosystems to avoid significant adverse impacts, including by strengthening their resilience, and take action for their restoration in order to achieve healthy and productive oceans"
                :children [{:code :SDG_I_14.2.1
                            :name "Number of countries using ecosystem-based approaches to managing marine areas [unknown]"}]}
              ;;  {:code :119
              ;;   :name "Target 14.3: Minimize and address the impacts of ocean acidification, including through enhanced scientific cooperation at all levels"
              ;;   :children [{:code :SDG_I_14.3.1
              ;;               :name "Average marine acidity pH measured at agreed suite of representative sampling stations [nb]"}]}
               {:code :120
                :name "Target 14.4: By 2020, effectively regulate harvesting and end overfishing, illegal, unreported and unregulated fishing and destructive fishing practices and implement science-based management plans, in order to restore fish stocks in the shortest time feasible, at least to levels that can produce maximum sustainable yield as determined by their biological characteristics"
                :children [{:code :SDG_I_14.4.1
                            :name "Proportion of fish stocks within biologically sustainable levels [%]"}]}
               {:code :121
                :name "Target 14.5: By 2020, conserve at least 10 per cent of coastal and marine areas, consistent with national and international law and based on the best available scientific information"
                :children [{:code :SDG_I_14.5.1
                            :name "Coverage of protected areas in relation to marine areas [km2, %]"}]}
              ;;  {:code :122
              ;;   :name "Target 14.6: By 2020, prohibit certain forms of fisheries subsidies which contribute to overcapacity and overfishing, eliminate subsidies that contribute to illegal, unreported and unregulated fishing and refrain from introducing new such subsidies, recognizing that appropriate and effective special and differential treatment for developing and least developed countries should be an integral part of the World Trade Organization fisheries subsidies negotiation [c]"
              ;;   :children [{:code :SDG_I_14.6.1
              ;;               :name "Degree of implementation of international instruments aiming to combat illegal unreported and unregulated fishing [nb]"}]}
              ;;  {:code :123
              ;;   :name "Target 14.7: By 2030, increase the economic benefits to small island developing States and least developed countries from the sustainable use of marine resources, including through sustainable management of fisheries, aquaculture and tourism"
              ;;   :children [{:code :SDG_I_14.7.1
              ;;               :name "Sustainable fisheries as a proportion of GDP in small island developing States least developed countries and all countries [%]"}]}
              ;;  {:code :124
              ;;   :name "Target 14.a: Increase scientific knowledge, develop research capacity and transfer marine technology, taking into account the Intergovernmental Oceanographic Commission Criteria and Guidelines on the Transfer of Marine Technology, in order to improve ocean health and to enhance the contribution of marine biodiversity to the development of developing countries, in particular small island developing States and least developed countries"
              ;;   :children [{:code :SDG_I_14.a.1
              ;;               :name "Proportion of total research budget allocated to research in the field of marine technology [%]"}]}
               {:code :125
                :name "Target 14.b: Provide access for small-scale artisanal fishers to marine resources and markets"
                :children [{:code :SDG_I_14.b.1
                            :name "Degree of application of a legal regulatory policy institutional framework which recognizes and protects access rights for small-scale fisheries [nb]"}]}
              ;;  {:code :126
              ;;   :name "Target 14.c: Enhance the conservation and sustainable use of oceans and their resources by implementing international law as reflected in the United Nations Convention on the Law of the Sea, which provides the legal framework for the conservation and sustainable use of oceans and their resources, as recalled in paragraph 158 of 'The future we want'"
              ;;   :children [{:code :SDG_I_14.c.1
              ;;               :name "Number of countries making progress in ratifying accepting and implementing through legal policy and institutional frameworks ocean-related instruments that implement international law as reflected in the United Nations Convention on the Law of the Sea for the conservation and sustainable use of the oceans and their resources [nb]"}]}
               ]}
   {:code :15
    :name "Goal 15. Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss"
    :children [{:code :127
                :name "Target 15.1: By 2020, ensure the conservation, restoration and sustainable use of terrestrial and inland freshwater ecosystems and their services, in particular forests, wetlands, mountains and drylands, in line with obligations under international agreements"
                :children [{:code :SDG_I_15.1.1
                            :name "Forest area as a proportion of total land area [kha, %]"}
                           {:code :SDG_I_15.1.2
                            :name "Proportion of important sites for terrestrial and freshwater biodiversity that are covered by protected areas by ecosystem type [%]"}]}
               {:code :128
                :name "Target 15.2: By 2020, promote the implementation of sustainable management of all types of forests, halt deforestation, restore degraded forests and substantially increase afforestation and reforestation globally"
                :children [{:code :SDG_I_15.2.1
                            :name "Progress towards sustainable forest management [t/ha kha, %]"}
                           {:code :SDG_I_15.2.1-1
                            :name "Forest area annual net change rate [ha]"}
                           {:code :SDG_I_15.2.1-2
                            :name "Above-ground biomass stock in forest [t/ha]"}
                           {:code :SDG_I_15.2.1-3
                            :name "Proportion of forest area located within legally established protected areas [%]"}
                           {:code :SDG_I_15.2.1-4
                            :name "Proportion of forest area under a long-term forest management plan [%]"}
                           {:code :SDG_I_15.2.1-5
                            :name "Forest area under an independently verified forest management certification scheme [ha]"}]}
               {:code :129
                :name "Target 15.3: By 2030, combat desertification, restore degraded land and soil, including land affected by desertification, drought and floods, and strive to achieve a land degradation-neutral world"
                :children [{:code :SDG_I_15.3.1
                            :name "Proportion of land that is degraded over total land area [%]"}
                           {:code :SDG_I_15.3.1-1
                            :name "Trends in Land Cover [unknown]"}
                           {:code :SDG_I_15.3.1-2
                            :name "Trends in Land Productivity [unknown]"}
                           {:code :SDG_I_15.3.1-3
                            :name "Trends in Carbon Stocks [nb, t/ha, Mg/ha]"}]}
               {:code :130
                :name "Target 15.4: By 2030, ensure the conservation of mountain ecosystems, including their biodiversity, in order to enhance their capacity to provide benefits that are essential for sustainable development"
                :children [
                          ;;  {:code :SDG_I_15.4.1
                          ;;   :name "Coverage by protected areas of important sites for mountain biodiversity [%]"}
                           {:code :SDG_I_15.4.2
                            :name "Mountain Green Cover Index [nb, km2]"}]}
               {:code :131
                :name "Target 15.5: Take urgent and significant action to reduce the degradation of natural habitats, halt the loss of biodiversity and, by 2020, protect and prevent the extinction of threatened species"
                :children [{:code :SDG_I_15.5.1
                            :name "Red List Index [nb]"}]}
              ;;  {:code :132
              ;;   :name "Target 15.6: Promote fair and equitable sharing of the benefits arising from the utilization of genetic resources and promote appropriate access to such resources, as internationally agreed"
              ;;   :children [{:code :SDG_I_15.6.1
              ;;               :name "Number of countries that have adopted legislative administrative and policy frameworks to ensure fair and equitable sharing of benefits [nb]"}]}
               {:code :133
                :name "Target 15.7: Take urgent action to end poaching and trafficking of protected species of flora and fauna and address both demand and supply of illegal wildlife products"
                :children [{:code :SDG_I_15.7.1
                            :name "Proportion of traded wildlife that was poached or illicitly trafficked [%]"}]}
              ;;  {:code :134
              ;;   :name "Target 15.8: By 2020, introduce measures to prevent the introduction and significantly reduce the impact of invasive alien species on land and water ecosystems and control or eradicate the priority species"
              ;;   :children [{:code :SDG_I_15.8.1
              ;;               :name "Proportion of countries adopting relevant national legislation and adequately resourcing the prevention or control of invasive alien species [nb]"}
              ;;              {:code :SDG_I_15.8.1-1
              ;;               :name "National adoption of invasive alien species-relevant international policy [nb]"}
              ;;              {:code :SDG_I_15.8.1-2
              ;;               :name "Percentage of countries with national strategies for preventing and controlling invasive alien species [%]"}
              ;;              {:code :SDG_I_15.8.1-3
              ;;               :name "Percentage of countries with national legislation and policy relevant to invasive alien species [%]"}
              ;;              {:code :SDG_I_15.8.1-4
              ;;               :name "National allocation of resources towards the prevention or control of invasive alien species [unknown]"}]}
              ;;  {:code :135
              ;;   :name "Target 15.9: By 2020, integrate ecosystem and biodiversity values into national and local planning, development processes, poverty reduction strategies and accounts"
              ;;   :children [{:code :SDG_I_15.9.1
              ;;               :name "a Number of countries that have established national targets in accordance with or similar to Aichi Biodiversity Target 2 of the Strategic Plan for Biodiversity 2011–2020 in their national biodiversity strategy and action plans and the progress reported towards these targets and b integration of biodiversity into national accounting and reporting systems defined as implementation of the System of Environmental-Economic Accounting [nb]"}]}
              ;;  {:code :136
              ;;   :name "Target 15.a: Mobilize and significantly increase financial resources from all sources to conserve and sustainably use biodiversity and ecosystems"
              ;;   :children [{:code :SDG_I_15.a.1
              ;;               :name "a Official development assistance on conservation and sustainable use of biodiversity and b revenue generated and finance mobilized from biodiversity-relevant economic instruments [millions USD (2017)]"}]}
              ;;  {:code :137
              ;;   :name "Target 15.b: Mobilize significant resources from all sources and at all levels to finance sustainable forest management and provide adequate incentives to developing countries to advance such management, including for conservation and reforestation"
              ;;   :children [{:code :SDG_I_15.b.1
              ;;               :name "a Official development assistance on conservation and sustainable use of biodiversity and b revenue generated and finance mobilized from biodiversity-relevant economic instruments [millions USD (2017)]"}]}
              ;;  {:code :138
              ;;   :name "Target 15.c: Enhance global support for efforts to combat poaching and trafficking of protected species, including by increasing the capacity of local communities to pursue sustainable livelihood opportunities"
              ;;   :children [{:code :SDG_I_15.c.1
              ;;               :name "Proportion of traded wildlife that was poached or illicitly trafficked [%]"}]}
               ]}
   {:code :16
    :name "Goal 16. Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels"
    :children [
              ;;  {:code :139
              ;;   :name "Target 16.1: Significantly reduce all forms of violence and related death rates everywhere"
              ;;   :children [{:code :SDG_I_16.1.1
              ;;               :name "Number of victims of intentional homicide per 100000 population by sex and age []"}
              ;;              {:code :SDG_I_16.1.2
              ;;               :name "Conflict-related deaths per 100000 population by sex age and cause [1/100000]"}
              ;;              {:code :SDG_I_16.1.3
              ;;               :name "Proportion of population subjected to a physical violence b psychological violence and c sexual violence in the previous 12 months []"}
              ;;              {:code :SDG_I_16.1.4
              ;;               :name "Proportion of population that feel safe walking alone around the area they live []"}]}
               {:code :140
                :name "Target 16.2: End abuse, exploitation, trafficking and all forms of violence against and torture of children"
                :children [
                          ;;  {:code :SDG_I_16.2.1
                          ;;   :name "Proportion of children aged 1–17 years who experienced any physical punishment and or psychological aggression by caregivers in the past month []"}
                           {:code :SDG_I_16.2.2
                            :name "Number of victims of human trafficking per 100000 population by sex age and form of exploitation []"}
                          ;;  {:code :SDG_I_16.2.3
                          ;;   :name "Proportion of young women and men aged 18–29 years who experienced sexual violence by age 18 []"}
                           ]}
              ;;  {:code :141
              ;;   :name "Target 16.3: Promote the rule of law at the national and international levels and ensure equal access to justice for all"
              ;;   :children [{:code :SDG_I_16.3.1
              ;;               :name "Proportion of victims of violence in the previous 12 months who reported their victimization to competent authorities or other officially recognized conflict resolution mechanisms []"}
              ;;              {:code :SDG_I_16.3.2
              ;;               :name "Unsentenced detainees as a proportion of overall prison population []"}
              ;;              {:code :SDG_I_16.3.3
              ;;               :name "Proportion of the population who have experienced a dispute in the past two years and who accessed a formal or informal dispute resolution mechanism by type of mechanism []"}]}
              ;;  {:code :142
              ;;   :name "Target 16.4: By 2030, significantly reduce illicit financial and arms flows, strengthen the recovery and return of stolen assets and combat all forms of organized crime"
              ;;   :children [{:code :SDG_I_16.4.1
              ;;               :name "Total value of inward and outward illicit financial flows in current United States dollars []"}
              ;;              {:code :SDG_I_16.4.2
              ;;               :name "Proportion of seized found or surrendered arms whose illicit origin or context has been traced or established by a competent authority in line with international instruments []"}]}
               {:code :143
                :name "Target 16.5: Substantially reduce corruption and bribery in all their forms"
                :children [{:code :SDG_I_16.5.1
                            :name "Proportion of persons who had at least one contact with a public official and who paid a bribe to a public official or were asked for a bribe by those public officials during the previous 12 months []"}
                          ;;  {:code :SDG_I_16.5.2
                          ;;   :name "Proportion of businesses that had at least one contact with a public official and that paid a bribe to a public official or were asked for a bribe by those public officials during the previous 12 months []"}
                           ]}
               {:code :144
                :name "Target 16.6: Develop effective, accountable and transparent institutions at all levels"
                :children [{:code :SDG_I_16.6.1
                            :name "Primary government expenditures as a proportion of original approved budget by sector or by budget codes or similar []"}
                          ;;  {:code :SDG_I_16.6.2
                          ;;   :name "Proportion of population satisfied with their last experience of public services []"}
                           ]}
               {:code :145
                :name "Target 16.7: Ensure responsive, inclusive, participatory and representative decision-making at all levels"
                :children [
                          ;;  {:code :SDG_I_16.7.1
                          ;;   :name "Proportions of positions in national and local institutions including a the legislatures b the public service and c the judiciary compared to national distributions by sex age persons with disabilities and population groups []"}
                           {:code :SDG_I_16.7.2
                            :name "Proportion of population who believe decision-making is inclusive and responsive by sex age disability and population group []"}]}
              ;;  {:code :146
              ;;   :name "Target 16.8: Broaden and strengthen the participation of developing countries in the institutions of global governance"
              ;;   :children [{:code :SDG_I_16.8.1
              ;;               :name "Proportion of members and voting rights of developing countries in international organizations [%]"}]}
              ;;  {:code :147
              ;;   :name "Target 16.9: By 2030, provide legal identity for all, including birth registration"
              ;;   :children [{:code :SDG_I_16.9.1
              ;;               :name "Proportion of children under 5 years of age whose births have been registered with a civil authority by age []"}]}
               {:code :148
                :name "Target 16.10: Ensure public access to information and protect fundamental freedoms, in accordance with national legislation and international agreements"
                :children [
                          ;;  {:code :SDG_I_16.10.1
                          ;;   :name "Number of verified cases of killing kidnapping enforced disappearance arbitrary detention and torture of journalists associated media personnel trade unionists and human rights advocates in the previous 12 months []"}
                           {:code :SDG_I_16.10.2
                            :name "Number of countries that adopt and implement constitutional statutory and or policy guarantees for public access to information [nb]"}]}
              ;;  {:code :149
              ;;   :name "Target 16.a: Strengthen relevant national institutions, including through international cooperation, for building capacity at all levels, in particular in developing countries, to prevent violence and combat terrorism and crime"
              ;;   :children [{:code :SDG_I_16.a.1
              ;;               :name "Existence of independent national human rights institutions in compliance with the Paris Principles []"}]}
              ;;  {:code :150
              ;;   :name "Target 16.b: Promote and enforce non-discriminatory laws and policies for sustainable development"
              ;;   :children [{:code :SDG_I_16.b.1
              ;;               :name "Proportion of population reporting having personally felt discriminated against or harassed in the previous 12 months on the basis of a ground of discrimination prohibited under international human rights law []"}]}
               ]}
   {:code :17
    :name "Goal 17. Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development"
    :children [
              ;;  {:code :151
              ;;   :name "Target 17.1: Strengthen domestic resource mobilization, including through international support to developing countries, to improve domestic capacity for tax and other revenue collection"
              ;;   :children [{:code :SDG_I_17.1.1
              ;;               :name "Total government revenue as a proportion of GDP by source [%: LCU]"}
              ;;              {:code :SDG_I_17.1.2
              ;;               :name "Proportion of domestic budget funded by domestic taxes [%]"}]}
              ;;  {:code :152
              ;;   :name "Target 17.2: Developed countries to implement fully their official development assistance commitments, including the commitment by many developed countries to achieve the target of 0.7 per cent of gross national income for official development assistance (ODA/GNI) to developing countries and 0.15 to 0.20 per cent of ODA/GNI to least developed countries; ODA providers are encouraged to consider setting a target to provide at least 0.20 per cent of ODA/GNI to least developed countries"
              ;;   :children [{:code :SDG_I_17.2.1
              ;;               :name "Net official development assistance total and to least developed countries as a proportion of the Organization for Economic Cooperation and Development OECD Development Assistance Committee donors’ gross national income GNI [%; millions USD (2018)]"}]}
              ;;  {:code :153
              ;;   :name "Target 17.3: Mobilize additional financial resources for developing countries from multiple sources"
              ;;   :children [{:code :SDG_I_17.3.1
              ;;               :name "Foreign direct investment official development assistance and South-South cooperation as a proportion of gross national income [millions USD]"}
              ;;              {:code :SDG_I_17.3.2
              ;;               :name "Volume of remittances in United States dollars as a proportion of total GDP [%]"}]}
              ;;  {:code :154
              ;;   :name "Target 17.4: Assist developing countries in attaining long-term debt sustainability through coordinated policies aimed at fostering debt financing, debt relief and debt restructuring, as appropriate, and address the external debt of highly indebted poor countries to reduce debt distress"
              ;;   :children [{:code :SDG_I_17.4.1
              ;;               :name "Debt service as a proportion of exports of goods and services [%]"}]}
              ;;  {:code :155
              ;;   :name "Target 17.5: Adopt and implement investment promotion regimes for least developed countries"
              ;;   :children [{:code :SDG_I_17.5.1
              ;;               :name "Number of countries that adopt and implement investment promotion regimes for developing countries including the least developed countries [nb]"}]}
              ;;  {:code :156
              ;;   :name "Target 17.6: Enhance North-South, South-South and triangular regional and international cooperation on and access to science, technology and innovation and enhance knowledge-sharing on mutually agreed terms, including through improved coordination among existing mechanisms, in particular at the United Nations level, and through a global technology facilitation mechanism"
              ;;   :children [{:code :SDG_I_17.6.1
              ;;               :name "Fixed Internet broadband subscriptions per 100 inhabitants by speed [%]"}]}
              ;;  {:code :157
              ;;   :name "Target 17.7: Promote the development, transfer, dissemination and diffusion of environmentally sound technologies to developing countries on favourable terms, including on concessional and preferential terms, as mutually agreed"
              ;;   :children [{:code :SDG_I_17.7.1
              ;;               :name "Total amount of funding for developing countries to promote the development transfer dissemination and diffusion of environmentally sound technologies [unknown]"}]}
              ;;  {:code :158
              ;;   :name "Target 17.8: Fully operationalize the technology bank and science, technology and innovation capacity-building mechanism for least developed countries by 2017 and enhance the use of enabling technology, in particular information and communications technology"
              ;;   :children [{:code :SDG_I_17.8.1
              ;;               :name "Proportion of individuals using the Internet [%]"}]}
              ;;  {:code :159
              ;;   :name "Target 17.9: Enhance international support for implementing effective and targeted capacity-building in developing countries to support national plans to implement all the Sustainable Development Goals, including through North-South, South-South and triangular cooperation"
              ;;   :children [{:code :SDG_I_17.9.1
              ;;               :name "Dollar value of financial and technical assistance including through North-South South‑South and triangular cooperation committed to developing countries [millions USD (2017)]"}]}
              ;;  {:code :160
              ;;   :name "Target 17.10: Promote a universal, rules-based, open, non-discriminatory and equitable multilateral trading system under the World Trade Organization, including through the conclusion of negotiations under its Doha Development Agenda"
              ;;   :children [{:code :SDG_I_17.10.1
              ;;               :name "Worldwide weighted tariff-average [%]"}]}
               {:code :161
                :name "Target 17.11: Significantly increase the exports of developing countries, in particular with a view to doubling the least developed countries' share of global exports by 2020"
                :children [{:code :SDG_I_17.11.1
                            :name "Developing countries’ and least developed countries’ share of global exports [%]"}]}
              ;;  {:code :162
              ;;   :name "Target 17.12: Realize timely implementation of duty-free and quota-free market access on a lasting basis for all least developed countries, consistent with World Trade Organization decisions, including by ensuring that preferential rules of origin applicable to imports from least developed countries are transparent and simple, and contribute to facilitating market access"
              ;;   :children [{:code :SDG_I_17.12.1
              ;;               :name "Weighted average tariffs faced by developing countries least developed countries and small island developing States [%]"}]}
              ;;  {:code :163
              ;;   :name "Target 17.13: Enhance global macroeconomic stability, including through policy coordination and policy coherence"
              ;;   :children [{:code :SDG_I_17.13.1
              ;;               :name "Macroeconomic Dashboard [unknown]"}]}
               {:code :164
                :name "Target 17.14: Enhance policy coherence for sustainable development"
                :children [{:code :SDG_I_17.14.1
                            :name "Number of countries with mechanisms in place to enhance policy coherence of sustainable development [millions USD (2017)]"}]}
              ;;  {:code :165
              ;;   :name "Target 17.15: Respect each country's policy space and leadership to establish and implement policies for poverty eradication and sustainable development"
              ;;   :children [{:code :SDG_I_17.15.1
              ;;               :name "Extent of use of country-owned results frameworks and planning tools by providers of development cooperation [%]"}]}
              ;;  {:code :166
              ;;   :name "Target 17.16: Enhance the Global Partnership for Sustainable Development, complemented by multi-stakeholder partnerships that mobilize and share knowledge, expertise, technology and financial resources, to support the achievement of the Sustainable Development Goals in all countries, in particular developing countries"
              ;;   :children [{:code :SDG_I_17.16.1
              ;;               :name "Number of countries reporting progress in multi-stakeholder development effectiveness monitoring frameworks that support the achievement of the sustainable development goals [nb]"}]}
              ;;  {:code :167
              ;;   :name "Target 17.17: Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships"
              ;;   :children [{:code :SDG_I_17.17.1
              ;;               :name "Amount in United States dollars committed to public-private partnerships for infrastructure [unknown]"}]}
              ;;  {:code :168
              ;;   :name "Target 17.18: By 2020, enhance capacity-building support to developing countries, including for least developed countries and small island developing States, to increase significantly the availability of high-quality, timely and reliable data disaggregated by income, gender, age, race, ethnicity, migratory status, disability, geographic location and other characteristics relevant in national contexts"
              ;;   :children [{:code :SDG_I_17.18.1
              ;;               :name "Statistical capacity indicator for Sustainable Development Goal monitoring [unknown]"}
              ;;              {:code :SDG_I_17.18.2
              ;;               :name "Number of countries that have national statistical legislation that complies with the Fundamental Principles of Official Statistics [nb]"}
              ;;              {:code :SDG_I_17.18.3
              ;;               :name "Number of countries with a national statistical plan that is fully funded and under implementation by source of funding [nb]"}]}
               {:code :169
                :name "Target 17.19: By 2030, build on existing initiatives to develop measurements of progress on sustainable development that complement gross domestic product, and support statistical capacity-building in developing countries"
                :children [
                          ;;  {:code :SDG_I_17.19.1
                          ;;   :name "Dollar value of all resources made available to strengthen statistical capacity in developing countries [USD]"}
                           {:code :SDG_I_17.19.2
                            :name "Proportion of countries that a have conducted at least one population and housing census in the last 10 years and b have achieved 100 per cent birth registration and 80 per cent death registration [%]"}]}]}])

(defonce land-cover
  [[:0   "Unknown. No or not enough satellite data available."]
   [:20  "Shrubs. Woody perennial plants with persistent and woody stems and without any defined main stem being less than 5 m tall. The shrub foliage can be either evergreen or deciduous."]
   [:30  "Herbaceous vegetation. Plants without persistent stem or shoots above ground and lacking definite firm structure. Tree and shrub cover is less than 10 %."]
   [:40  "Cultivated and managed vegetation / agriculture. Lands covered with temporary crops followed by harvest and a bare soil period (e.g., single and multiple cropping systems). Note that perennial woody crops will be classified as the appropriate forest or shrub land cover type."]
   [:50  "Urban / built up. Land covered by buildings and other man-made structures."]
   [:60  "Bare / sparse vegetation. Lands with exposed soil, sand, or rocks and never has more than 10 % vegetated cover during any time of the year."]
   [:70  "Snow and ice. Lands under snow or ice cover throughout the year."]
   [:80  "Permanent water bodies. Lakes, reservoirs, and rivers. Can be either fresh or salt-water bodies."]
   [:90  "Herbaceous wetland. Lands with a permanent mixture of water and herbaceous or woody vegetation. The vegetation can be present in either salt, brackish, or fresh water."]
   [:100 "Moss and lichen."]
   [:111 "Closed forest, evergreen needle leaf. Tree canopy >70 %, almost all needle leaf trees remain green all year. Canopy is never without green foliage."]
   [:112 "Closed forest, evergreen broad leaf. Tree canopy >70 %, almost all broadleaf trees remain green year round. Canopy is never without green foliage."]
   [:113 "Closed forest, deciduous needle leaf. Tree canopy >70 %, consists of seasonal needle leaf tree communities with an annual cycle of leaf-on and leaf-off periods."]
   [:114 "Closed forest, deciduous broad leaf. Tree canopy >70 %, consists of seasonal broadleaf tree communities with an annual cycle of leaf-on and leaf-off periods."]
   [:115 "Closed forest, mixed."]
   [:116 "Closed forest, not matching any of the other definitions."]
   [:121 "Open forest, evergreen needle leaf. Top layer- trees 15-70 % and second layer- mixed of shrubs and grassland, almost all needle leaf trees remain green all year. Canopy is never without green foliage."]
   [:122 "Open forest, evergreen broad leaf. Top layer- trees 15-70 % and second layer- mixed of shrubs and grassland, almost all broadleaf trees remain green year round. Canopy is never without green foliage."]
   [:123 "Open forest, deciduous needle leaf. Top layer- trees 15-70 % and second layer- mixed of shrubs and grassland, consists of seasonal needle leaf tree communities with an annual cycle of leaf-on and leaf-off periods."]
   [:124 "Open forest, deciduous broad leaf. Top layer- trees 15-70 % and second layer- mixed of shrubs and grassland, consists of seasonal broadleaf tree communities with an annual cycle of leaf-on and leaf-off periods."]
   [:125 "Open forest, mixed."]
   [:126 "Open forest, not matching any of the other definitions."]
   [:200 "Oceans, seas. Can be either fresh or salt-water bodies."]])