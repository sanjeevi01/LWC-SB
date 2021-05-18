import BoatMessageChannel from "@salesforce/messageChannel/BoatMessageChannel__c";
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { wire, LightningElement, api } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
//import RECORD_ID from "@salesforce/schema/Boat__c.Id";
//import LONGITUDE_FIELD from "@salesforce/schema/Boat__c.Geolocation__Longitude__s";
//import LATITUDE_FIELD from "@salesforce/schema/Boat__c.Geolocation__Latitude__s";
import { APPLICATION_SCOPE, createMessageContext, MessageContext, publish, releaseMessageContext, subscribe, unsubscribe } from 'lightning/messageService';
const LONGITUDE_FIELD = "Boat__c.Geolocation__Longitude__s";
const LATITUDE_FIELD = "Boat__c.Geolocation__Latitude__s";
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
export default class BoatMap extends LightningElement {
    // private 
    subscription = null;
    boatId;
    /*BOAT_FIELDS = [
      RECORD_ID,
      LONGITUDE_FIELD,
      LATITUDE_FIELD
  ];*/
    // Getter and Setter to allow for logic to run on recordId change
    // this getter must be public
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }
    //public
    error = undefined;
    mapMarkers = [];
    // Initialize messageContext for Message Service
    @wire(MessageContext)
    messageContext;
    // Getting record's location to construct map markers using recordId
    // Wire the getRecord method using ('$boatId')
    @wire(getRecord, {
        recordId: "$recordId",
        fields: BOAT_FIELDS
    })
    wiredRecord({ error, data }) {
        // Error handling
        if (data) {
            this.error = undefined;
            const longitude = data.fields.Geolocation__Longitude__s.value;
            const latitude = data.fields.Geolocation__Latitude__s.value;
            this.updateMap(longitude, latitude);
        } else if (error) {
            this.error = error;
            this.boatId = undefined;
            this.mapMarkers = [];
        }
    }
    // Runs when component is connected, subscribes to BoatMC
    connectedCallback() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
        this.subscribeMC();
    }

    subscribeMC() {
        let subscription = subscribe(this.messageContext, BOATMC, (message) => { this.boatId = message.recordId }, { scope: APPLICATION_SCOPE });
    }
    handleMessage(message) {
        this.boatId = message.recordId;
    }
    // Creates the map markers array with the current boat's location for the map.
    updateMap(Longitude, Latitude) {
        this.mapMarkers = [Longitude, Latitude];
    }
    // Getter method for displaying the map component, or a helper method.
    get showMap() {
        return this.mapMarkers.length > 0;
    }
}