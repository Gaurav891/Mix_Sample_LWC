import { LightningElement,api  } from 'lwc';

export default class ExtendedDataTableChildPickList extends LightningElement {

 //below are the values forwarded by the parent template 
 @api label;
 @api placeholder;
 @api options;
 @api value;
 @api context;

//method will be fired we end user change the value in drop dowm 
 handleChange(event) {
     console.log('value sent ftom drop down',event.target.value+''+this.context);
     //fire the event so that the grandParent Can handle and take required Value 
     const eventPick = new CustomEvent('picklistchanged', {
         bubbles : true,
        composed : true,
         cancelable : true,
         detail: {
             data : {
                 value : event.target.value,
                 context : this.context
             }
         }
     })
     this.dispatchEvent(eventPick);



}
}