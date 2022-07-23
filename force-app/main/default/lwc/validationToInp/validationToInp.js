import { LightningElement } from 'lwc';

export default class ValidationToInp extends LightningElement {

comBoVal ;
errorFoundWithComboBox;

optionsCombo =[
    { label: 'Parts', value: 'Parts' },
    { label: 'Expenses', value: 'Expenses' },
    { label: 'Labor', value: 'Labor' }
]

comBoChange(event)
{
  const comp =this.template.querySelector('lightning-combobox');
  if(comp.value === 'Parts')
  {
         //report validity 
         comp.setCustomValidity("line Type can't be Parts ");
         this.errorFoundWithComboBox =true;
  }
  else
  {
          this.errorFoundWithComboBox =false;
          comp.setCustomValidity("");
  }

  console.log('event',comp.value);


  

}
checkOnSave()
{


    if(this.errorFoundWithComboBox) //error is not there 
    {
        alert('error ');
    
    }
    else 
    {
        const comp =this.template.querySelector('lightning-combobox');
    alert(comp.value);
       
    }
}
}