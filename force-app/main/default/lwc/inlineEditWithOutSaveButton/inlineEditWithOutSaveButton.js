import { LightningElement,wire,track ,api } from 'lwc';
import getWorkDetailList1 from '@salesforce/apex/WorkDetailsManager.fetchWd';

export default class InlineEditWithOutSaveButton extends LightningElement {
@track WDListToDisplayOnUi ;
 @track draftValues = [];
@api recordId;
ChildLinesFound ;
 
    connectedCallback() {
        this.columns = [
            { label: 'Name', fieldName: 'Name' },
            //added as a part of Modification Check_Attachment__c
            { label: 'check Attachment', fieldName: 'Check_Attachment__c', editable: true,type : 'boolean' },
            { label: 'Line Quantity', fieldName: 'SVMXC__Actual_Quantity2__c', editable: true },
          
        ];
    }
    @wire(getWorkDetailList1, { WoId: '$recordId' }) WDList(result) //Note :- Must use wire function 
    {    
        console.log('chjeck result ',result.data)
       //  this.ListToRefreshApex = result;
        if (result.data) {
            //if length === 0 don't show child lines 
            if (result.data.length == 0) {
                this.ChildLinesFound = false;
            }
            else {

                this.ChildLinesFound = true;
                this.WDListToDisplayOnUi = result.data;
            }


        }
        else if (result.error) {
            this.ChildLinesFound = false;
            this.WDListToDisplayOnUi = undefined;
        }
    }

    updateDraftValues(updateItem) {
       
            console.log('updated Object',updateItem);
       // this.draftValues = [... this.draftValues, updateItem];
      //  this.draftValues.push(updateItem);

        
        let draftValueChanged = false;
        console.log('draft Value',this.draftValues);
        let copyDraftValues = [...this.draftValues];
        console.log('draft Value',copyDraftValues);
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
    handleCellChange(event) {
        console.log('cell chnaged ',event.detail.draftValues[0]);
      
        this.updateDraftValues(event.detail.draftValues[0]);
    }

    handleSave()
    {
        let draftVal = this.template.querySelector('lightning-datatable').draftValues;
        console.log(draftVal);
         console.log('save button cliked ',this.draftValues);
    }












}