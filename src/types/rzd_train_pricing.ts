export interface RzdTrainPricing {
    OriginStationCode:             string;
    DestinationStationCode:        string;
    Trains:                        Train[];
    ClientFeeCalculation:          null;
    AgentFeeCalculation:           null;
    OriginCode:                    string;
    OriginStationInfo:             StationInfo;
    OriginTimeZoneDifference:      number;
    DestinationCode:               string;
    DestinationStationInfo:        StationInfo;
    DestinationTimeZoneDifference: number;
    RoutePolicy:                   string;
    DepartureTimeDescription:      string;
    ArrivalTimeDescription:        string;
    IsFromUkrain:                  boolean;
    NotAllTrainsReturned:          boolean;
    BookingSystem:                 string;
    Id:                            number;
    DestinationStationName:        string;
    OriginStationName:             string;
    MoscowDateTime:                Date;
}

export interface StationInfo {
    StationName: string;
    StationCode: string;
    CnsiCode:    null | string;
    RegionName:  null | string;
    IsoCode:     null | string;
}

export interface Train {
    CarGroups:                         CarGroup[];
    IsFromSchedule:                    boolean;
    IsTourPackagePossible:             boolean;
    CarTransportationsFreePlacesCount: null;
    ActualMovement:                    null;
    CategoryId:                        null;
    ScheduleId:                        null;
    BaggageCarsThreads:                string[] | null;
    CarTransportationCoachesThreads:   null;
    Provider:                          string;
    IsWaitListAvailable:               boolean;
    HasElectronicRegistration:         boolean | null;
    HasCarTransportationCoaches:       boolean;
    HasDynamicPricingCars:             boolean;
    HasTwoStoreyCars:                  boolean;
    HasSpecialSaleMode:                boolean;
    Carriers:                          Carrier[];
    CarrierDisplayNames:               Carrier[];
    Id:                                number;
    IsBranded:                         boolean;
    TrainNumber:                       string;
    TrainNumberToGetRoute:             string;
    DisplayTrainNumber:                string;
    TrainDescription:                  null | string;
    TrainName:                         string;
    TrainNameEn:                       null | string;
    TransportType:                     string;
    OriginName:                        null | string;
    InitialStationName:                string;
    OriginStationCode:                 string;
    OriginStationInfo:                 StationInfo;
    InitialTrainStationInfo:           StationInfo;
    InitialTrainStationCode:           string;
    InitialTrainStationCnsiCode:       string;
    DestinationName:                   string;
    FinalStationName:                  string;
    DestinationStationCode:            string;
    DestinationStationInfo:            StationInfo;
    FinalTrainStationInfo:             StationInfo;
    FinalTrainStationCode:             string;
    FinalTrainStationCnsiCode:         string;
    DestinationNames:                  string[];
    FinalStationNames:                 string[];
    DepartureDateTime:                 Date;
    LocalDepartureDateTime:            Date;
    ArrivalDateTime:                   Date;
    LocalArrivalDateTime:              Date;
    ArrivalDateTimes:                  Date[];
    LocalArrivalDateTimes:             Date[];
    DepartureDateFromFormingStation:   Date;
    DepartureStopTime:                 number;
    ArrivalStopTime:                   number;
    TripDuration:                      number;
    TripDistance:                      number;
    IsSuburban:                        boolean;
    IsComponent:                       boolean;
    CarServices:                       CarService[];
    IsSaleForbidden:                   boolean;
    IsTicketPrintRequiredForBoarding:  boolean;
    BookingSystem:                     string;
    IsVrStorageSystem:                 boolean;
    PlacesStorageType:                 string;
    BoardingSystemTypes:               BoardingSystemType[] | null;
    TrainBrandCode:                    null | string;
    TrainClassNames:                   string[] | null;
    ServiceProvider:                   string;
    DestinationStationName:            string;
    OriginStationName:                 string;
    IsPlaceRangeAllowed:               boolean;
    IsTrainRouteAllowed:               boolean;
    notification?:                     Notification;
}

export enum BoardingSystemType {
    NoValue = "NoValue",
    PassengerBoardingControl = "PassengerBoardingControl",
}

export interface CarGroup {
    Carriers:                          Carrier[];
    CarrierDisplayNames:               Carrier[];
    ServiceClasses:                    string[];
    MinPrice:                          number;
    MaxPrice:                          number;
    CarType:                           CarType;
    CarTypeName:                       CarTypeName;
    PlaceQuantity:                     number;
    LowerPlaceQuantity:                number;
    UpperPlaceQuantity:                number;
    LowerSidePlaceQuantity:            number;
    UpperSidePlaceQuantity:            number;
    MalePlaceQuantity:                 number;
    FemalePlaceQuantity:               number;
    EmptyCabinQuantity:                number;
    MixedCabinQuantity:                number;
    IsSaleForbidden:                   boolean;
    AvailabilityIndication:            AvailabilityIndication;
    CarDescriptions:                   Array<null | string>;
    ServiceClassNameRu:                null;
    ServiceClassNameEn:                null;
    InternationalServiceClasses:       string[];
    ServiceCosts:                      number[];
    IsBeddingSelectionPossible:        boolean;
    BoardingSystemTypes:               BoardingSystemType[];
    HasElectronicRegistration:         boolean;
    HasGenderCabins:                   boolean;
    HasPlaceNumeration:                boolean;
    HasPlacesNearPlayground:           boolean;
    HasPlacesNearPets:                 boolean;
    HasPlacesForDisabledPersons:       boolean;
    HasPlacesNearBabies:               boolean;
    AvailableBaggageTypes:             AvailableBaggageType[];
    HasNonRefundableTariff:            boolean;
    Discounts:                         Discount[];
    AllowedTariffs:                    any[];
    InfoRequestSchema:                 InfoRequestSchema;
    TotalPlaceQuantity:                number;
    PlaceReservationTypes:             PlaceReservationType[];
    IsThreeHoursReservationAvailable:  boolean;
    IsMealOptionPossible:              boolean;
    IsAdditionalMealOptionPossible:    boolean;
    IsOnRequestMealOptionPossible:     boolean;
    IsTransitDocumentRequired:         boolean;
    IsInterstate:                      boolean;
    ClientFeeCalculation:              null;
    AgentFeeCalculation:               null;
    HasNonBrandedCars:                 boolean;
    TripPointQuantity:                 number;
    HasPlacesForBusinessTravelBooking: boolean;
    IsCarTransportationCoaches:        boolean;
    IsGroupTransportaionAvailable:     null;
    ServiceClassName:                  string;
    HasFssBenefit:                     boolean;
}

export enum AvailabilityIndication {
    Available = "Available",
}

export interface AvailableBaggageType {
    Type:           Type;
    Name:           Name;
    Description:    null;
    CarBaggageInfo: null;
}

export enum Name {
    БагажВСпециальноОборудованныхКупе = "Багаж в специально оборудованных купе",
    НегабаритныйБагаж = "Негабаритный багаж",
    РучнаяКладь = "Ручная кладь",
}

export enum Type {
    HandLuggage = "HandLuggage",
    LuggageInBaggageRoom = "LuggageInBaggageRoom",
    OversizedLuggage = "OversizedLuggage",
}

export enum CarType {
    Baggage = "Baggage",
    Compartment = "Compartment",
    Luxury = "Luxury",
    ReservedSeat = "ReservedSeat",
    Sedentary = "Sedentary",
    Soft = "Soft",
}

export enum CarTypeName {
    Багаж = "БАГАЖ",
    Купе = "КУПЕ",
    Люкс = "ЛЮКС",
    Плац = "ПЛАЦ",
    Св = "СВ",
    Сид = "СИД",
}

export type Carrier = string;

export interface Discount {
    DiscountType: DiscountType;
    Description:  string;
}

export enum DiscountType {
    Birthday = "Birthday",
    BirthdayAccompanying = "BirthdayAccompanying",
    BusinessTravelCard = "BusinessTravelCard",
    Pupil = "Pupil",
    RoundTrip = "RoundTrip",
    Single = "Single",
    UniversalCard = "UniversalCard",
}

export enum InfoRequestSchema {
    StandardIncludingInvalids = "StandardIncludingInvalids",
}

export enum PlaceReservationType {
    TwoPlacesAtOnce = "TwoPlacesAtOnce",
    Usual = "Usual",
}

export enum CarService {
    Bedclothes = "Bedclothes",
    InfotainmentService = "InfotainmentService",
    Meal = "Meal",
    RestaurantCarOrBuffet = "RestaurantCarOrBuffet",
}

export interface Notification {
    color:   number;
    header:  string;
    body:    string;
    url:     string;
    urlText: string;
}