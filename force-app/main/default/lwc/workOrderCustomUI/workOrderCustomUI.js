import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import WO_ID_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.Id';
import WO_NAME_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.Name';
import WO_STATUS_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Order_Status__c';
import WO_PRIORITY_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Priority__c';
import WO_COMPANY_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Company__r.Name';
import WO_COMPANY_FIELD_ID from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Company__c';
import WO_CONTACT_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Contact__r.LastName';
import WO_CONTACT_FIELD_ID from '@salesforce/schema/SVMXC__Service_Order__c.SVMXC__Contact__c';
import WO_CONTACT_PHONE_FIELD from '@salesforce/schema/SVMXC__Service_Order__c.Contact_Phone__c';
//added as a part of to get lines 
import getWorkDetailList from '@salesforce/apex/WorkDetailsManager.fetchWd';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class WorkOrderCustomUI extends NavigationMixin(LightningElement) {
    isLoading =false;
    @api recordId;
    @api objectApiName;
    @track prorityPicklist;
    @track WDListToDisplayOnUi;
    accountIDRelatedToWorkOrder;
    ListToRefreshApex;
    lastSavedData;
    @track draftValues = [];
    //conditional rerendering of line Data 
    ChildLinesFound;
    @track contactPhone; //hold the Contact Phone 
    contactNameBackend;
    contactChanged = false;
    UpdatedContactId;
    closeIconClicked =false ;
    loadingForChildLines =true;

    @wire(getRecord, {
        recordId: '$recordId', fields: [WO_NAME_FIELD
            , WO_STATUS_FIELD
            , WO_PRIORITY_FIELD
            , WO_COMPANY_FIELD
            , WO_COMPANY_FIELD_ID
            , WO_CONTACT_FIELD
            , WO_CONTACT_FIELD_ID
            , WO_CONTACT_PHONE_FIELD
        ]
    }) workOrder;//data error 

    //added as Part of  to get lines 
    connectedCallback() {
        this.columns = [
            { label: 'Name', fieldName: 'Name' },
            //added as a part of Modification Check_Attachment__c
            { label: 'check Attachment', fieldName: 'Check_Attachment__c', editable: true,type : 'boolean' },
            { label: 'Line Quantity', fieldName: 'SVMXC__Actual_Quantity2__c', editable: true },
            {
                label: 'Line Type ', fieldName: 'SVMXC__Line_Type__c', wrapText: true, type: 'picklist', typeAttributes: {
                    placeholder: 'Choose Type', options: [
                        { label: 'Parts', value: 'Parts' },
                        { label: 'Expenses', value: 'Expenses' },
                        { label: 'Labor', value: 'Labor' },
                        { label: 'Travel', value: 'Travel' },
                    ] // list of all picklist options
                    , value: { fieldName: 'SVMXC__Line_Type__c' } // default value for picklist
                    , context: { fieldName: 'Id' } // binding wd Id with context variable to be returned back
                }
            }
        ];
    }
    //get all WD 
    @wire(getWorkDetailList, { WoId: '$recordId' }) WDList(result) //Note :- Must use wire function 
    {
        
         this.ListToRefreshApex = result;
        if (result.data) {
            //if length === 0 don't show child lines 
            if (result.data.length == 0) {
                this.isLoading =true; //if no lines found then show header instead of spinner 
                this.ChildLinesFound = false;
            }
            else {
                this.isLoading =true; //if lines found then show header and lines both instead of spinner 
                this.ChildLinesFound = true;
                this.WDListToDisplayOnUi = result.data;
                this.lastSavedData = JSON.parse(JSON.stringify(this.WDListToDisplayOnUi));
            }


        }
        else if (result.error) {
            this.ChildLinesFound = false;
            this.WDListToDisplayOnUi = undefined;
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA', //if no recordType then pass some random value 
        fieldApiName: WO_PRIORITY_FIELD
    }) workOrderPickListValue({ data, error }) {
        if (data) {
            // alert(data.values[0].label);
            console.log('data picklist', data.values); //array of label and value 
            this.prorityPicklist = data.values; //value here is in form of label and value 
        }
        if (error) {
            this.getPicklistValues = undefined;
        }
    }
    //saved Contact And Phone populated on the UI 
    get contactName() {
        const seletedContact = getFieldValue(this.workOrder.data, WO_CONTACT_FIELD)
        if (seletedContact && seletedContact !== undefined) {

            // 
            this.contactPhone = getFieldValue(this.workOrder.data, WO_CONTACT_PHONE_FIELD);
            this.contactNameBackend = getFieldValue(this.workOrder.data, WO_CONTACT_FIELD_ID);
            return seletedContact;
        }
        else {
            return '';
        }
    }
    get woNumber() {
        return 'Edit ' + getFieldValue(this.workOrder.data, WO_NAME_FIELD);
    }
    get WOname() {
        return getFieldValue(this.workOrder.data, WO_NAME_FIELD);
    }
    get WOstatus() {
        return getFieldValue(this.workOrder.data, WO_STATUS_FIELD);
    }
    get WOpriority() {
        return getFieldValue(this.workOrder.data, WO_PRIORITY_FIELD);
    }
    get AccountName() {
        if (this.workOrder.data) {
            this.accountIDRelatedToWorkOrder = getFieldValue(this.workOrder.data, WO_COMPANY_FIELD_ID);

            return getFieldValue(this.workOrder.data, WO_COMPANY_FIELD);
        }

    }
    get AccountId() {
        if (this.workOrder.data) {
            return getFieldValue(this.workOrder.data, WO_COMPANY_FIELD_ID);
        }
    }
    storeWoPriority(event) {
        
    }
    //contact selected Id will be received in below mehtod
    contactSelectedFromDropDown(event) {
        //this will ensure that contact Seleted Again 
        this.closeIconClicked =false;


        this.contactChanged = true;
        this.UpdatedContactId = event.detail.id;
        console.log('Updated Phone 1',event.detail.Phone);
        this.contactPhone = event.detail.Phone;
        console.log('Updated Phone 2', this.contactPhone);
    }
    cancelAndNavigationToOldPage() {
        console.log('cancel button clicked Navigate to record Page ');
        this[NavigationMixin.Navigate](
            {
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.recordId,
                    objectApiName: 'SVMXC__Service_Order__c',
                    actionName: 'view'
                }
            }
        );
    }
    saveDataToDatabase() {
     /*code to update Header and Child updated as feedBack 
     child Update and Header Update should Happen in One Click 
     */
     var  errorOcurredInChildUpdate = false;
     var  errorOcurredInHeaderUpdate =false;

     if(this.ChildLinesFound){ //child line exist Or not 
 
     //code to get All draft Value in dataTable component 
     let draftVal = this.template.querySelector('c-extended-data-table').draftValues;
     console.log('all Updated Value  ',draftVal);

     //code added for the Validation of child line Type 
     //reduce Method 
     //get All line types in A collection from the draft Value
     var allTypesCollect = draftVal.map(item => item["SVMXC__Line_Type__c"]);
     console.log('check all lines ',allTypesCollect);
     //includes method return true if given argument is Present in Array
     var partsFound = allTypesCollect.includes('Parts')
     console.log('check all lines boolean ',partsFound);
     if(partsFound)
     {
        //throw notification 
        //show notification one One Or more Error and don't allow  navigate 
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error Occured ',
                message: 'Page Contains One or More Error ',
                variant: 'error'
            })
        );
        return ''; //just to stop the execution 

     }
     //validation end if found Parts execution stop 
     // Convert datatable draft values into record objects
      const records = draftVal.slice().map((draftValue) => {
        const fields = Object.assign({}, draftValue);
        return { fields };
      });

       //Use tryCatch to Update Child record 
      try {
        // Update all records in parallel thanks to the UI API
        const recordUpdatePromises = records.map((record) =>
            updateRecord(record)
        );
         Promise.all(recordUpdatePromises).then(record  => {
            refreshApex(this.ListToRefreshApex);
           
            errorOcurredInChildUpdate =false;
       
          });
         

    } catch (error) {
        //if this Block executes then updated value have some error 
        errorOcurredInChildUpdate =true;
        
    } 

     } //child lines if end 


    //code to Update Header Record start
    const Picklist = this.template.querySelector("lightning-combobox").value;
    const ContactPhoneUpdated = this.template.querySelectorAll("lightning-input")[3].value;
    const woId = this.recordId;
    //use ternaray Operator to get latest contact seclected 
    // contactChanged === TRUE ,Means dataBase Value Changed 
    const contactID = this.contactChanged === true ? this.UpdatedContactId : this.contactNameBackend;

    console.log('save button clicked check picklist  ',Picklist)
    console.log('save button clicked check phone ',ContactPhoneUpdated)
    console.log('save button clicked check  workOrdeId  ',woId)
    console.log('save button clicked  check contcat ',contactID)

         const fields = {};
         fields[WO_ID_FIELD.fieldApiName] = woId;
         fields[WO_PRIORITY_FIELD.fieldApiName] = Picklist;
         fields[WO_CONTACT_FIELD_ID.fieldApiName] =  this.closeIconClicked ===true ? null : contactID ; //if value not changed then it will give older val 
         fields[WO_CONTACT_PHONE_FIELD.fieldApiName] = this.closeIconClicked ===true ? null : ContactPhoneUpdated ;          // ContactPhoneUpdated;

         console.log('fields to Update ',fields);
         const recordInput = { fields };
         updateRecord(recordInput).then(() =>{
         //boolean will tell no error occured while Updating Parent record 
         errorOcurredInHeaderUpdate  =false;

          }).catch(() =>{
         //boolean will tell error occured while Updating Parent record 
         errorOcurredInHeaderUpdate =true;

           }) 

     //code to Update Header Record end 

     //navigate and notification end
     console.log('tell about child ',errorOcurredInChildUpdate);
     console.log('tell about header ',errorOcurredInHeaderUpdate);
     if(!errorOcurredInHeaderUpdate && !errorOcurredInChildUpdate)
     {
         //if both are false  then allow to navigate and show success notification 
         //notification 
         this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: `Record  ${this.recordId} updated Successfully `,
                variant: 'success'
            })
        );
        //navigation 
        this[NavigationMixin.Navigate](
            {
                type : 'standard__recordPage',
                attributes : {
                 recordId : this.recordId,
                 objectApiName :'SVMXC__Service_Order__c',
                 actionName :'view'
                }
             }
            );


     }
     else if(errorOcurredInHeaderUpdate && errorOcurredInChildUpdate )
     {
         //show notification one One Or more Error //don't navigate 
         this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while updating or refreshing records',
                message: 'error occured',
                variant: 'error'
            })
        );
     }
     else if(errorOcurredInHeaderUpdate)
     {
          //show errror occured in Parent //don't allow to naviagte 
          this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while updating or refreshing header  records',
                message: 'error occured',
                variant: 'error'
            })
        );

     }
     else if(errorOcurredInChildUpdate)
     {
           //show errror occured in child  //don't allow to naviagte 
           this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while updating or refreshing child records',
                message: 'error occured',
                variant: 'error'
            })
        );
     }
     //navigate and notification end
    }
    //methods added for chid dataTable Actions 
    handleSelection() {
    }
    updateDraftValues(updateItem) {
        console.log(this.draftValues);
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });

        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem]; //it will add the updateItem in the deaft Value  
        }
    }
    picklistChanged(event) {
        event.stopPropagation(); //it use to stop the Propogation that bubble from the child 

        let dataRecieved = event.detail.data; //it will return a Object with attributes : ID in Context and Priority in Value ,
        let updatedItem = { Id: dataRecieved.context, SVMXC__Line_Type__c: dataRecieved.value }; //Rating to Priority 
        //handle Error here 
        this.updateDraftValues(updatedItem); //Update the dreaft Value send the argument as Object 
    }
    handleCellChange(event) {
        this.updateDraftValues(event.detail.draftValues[0]);
    }
    clearPhoneField(event) {
        console.log('clear Phone field and contact ');
        this.closeIconClicked =true;
        this.contactPhone = ' ';
    }

}