import { LightningElement,api  } from 'lwc';

export default class ExtendedDataTableChildPickList extends LightningElement {

 //below are the values forwarded by the parent template 
 @api label;
 @api placeholder;
 @api options;
 @api value;
 @api context;

 //modification to addError 
 badComboboxValueFound ;

//method will be fired we end user change the value in drop dowm 
 handleChange(event) {
    console.log(event.target.value);
     console.log('value sent ftom drop down',event.target.value+''+this.context);
    
    //modification 
    //add error below the comboBox 
    //it will only add the error msg can't stop execution 
    const comp =this.template.querySelector('lightning-combobox');
     if(comp.value === 'Parts')
     {
        comp.setCustomValidity("line Type can't be Parts ");
     }
     else{
        //if line type is soome thing else don't add any message 
        comp.setCustomValidity("");
     }
     
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