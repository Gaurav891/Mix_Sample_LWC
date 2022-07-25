import { LightningElement,api ,track,wire  } from 'lwc';
//import getContacts from '@salesforce/apex/ContactManager.getContactList';
import getAllContacts from '@salesforce/apex/ContactManager.getContactAllList';

const COLUMNS = [
    { label: 'LastName', fieldName:'LastName', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
     
  ];
export default class ContactDropDown extends LightningElement {

dynamicIcon ;//='utility:close';
//@api contactexist ;
@api accountId;
@track columns = COLUMNS;
@track recordsList;
@api searchKey ;//='';//value provided in input  
@api keyy ;
noRecordFound ;
noRecordFoundMessage;
allContactList;


//using wire service to Hold all contact data and put that in allContactList
//when ever required filter allContactList
@wire(getAllContacts , { accountId: '$accountId' }) ContcatList(result) //Note :- Must use wire function 
    {
      console.log(result.data);
        if (result.data) {
            //if length === 0 don't show child lines 
            if (result.data.length == 0) {
             this.allContactList =[];
              
            }
            else {
              this.allContactList =result.data;
            }


        }
        else if (result.error) {
         this.allContactList =[];
        }
    }
constructor()
{
  super();
  
 
}
connectedCallback()
{
  //issue not getting value 
  console.log('search key in connectedCall Back  ',this.searchKey);
  
}
renderedCallback()
{
      console.log('search key in renderedCall Back  ',this.searchKey);
      console.log('boolean ',this.searchKey === '');
      // Modification for icon during OnLoad 
      this.dynamicIcon = this.searchKey === '' ? 'utility:search' : 'utility:close' ;

    /*  if(this.searchKey === '' )
      {
        this.dynamicIcon = 'utility:search'
      }
      else{
          this.dynamicIcon = 'utility:close'
      }*/


}
clearSearchBox(event)
{
  console.log('current icon ' ,this.dynamicIcon);

  if(this.dynamicIcon === 'utility:close')
  {
  this.searchKey = '';
  this.dynamicIcon ='utility:search';

  //tell parent  component to clear the Contcat and phone field 

  const contactSelectedfromDropDown =new CustomEvent('contactdeselected',{detail : '' } );
  this.dispatchEvent(contactSelectedfromDropDown);
  }
  else{
    //if search Icon is clicked 
    this.searchBoxEmpty();
  }


}
onLeave()
{   
  setTimeout(() => {  
    this.recordsList = null;  
    }, 300);       
}

searchBoxEmpty()
{
  this.searchKey='';
  this.dynamicIcon ='utility:search';
  this.noRecordFound =true;
  this.recordsList=this.allContactList;
}



handleKeyChange(event)
{
  
    //ToDo : 
    /*
      Use trim() on the SearchKey so that space can be neglected by the Backend code 
    */

    console.log('check Space withOut trim ',event.target.value.length);
    console.log('check Space with trim ',event.target.value.trim().length);
    if(event.target.value.length >0)
    {
     this.searchKey = event.target.value;
      const key= event.target.value.toLowerCase();
      this.dynamicIcon ='utility:close';
      //Perform searching in dataTable
      this.noRecordFound =true;
      const allCon = this.allContactList;
      const contcatListNew = allCon.filter(Contact => Contact.LastName.toLowerCase().includes(key));
     // after filter check The collection ,weather any contact Matches
     if(contcatListNew.length >0)
     {
      this.noRecordFound =true;
      this.recordsList=contcatListNew;
     }
     else
     {
      this.noRecordFound =false;
      this.noRecordFoundMessage='no Contact Found  ';
     }
     
     
      

      
    }
    else //execute this Part when searchBox reduce to empty 
    {
      this.searchBoxEmpty();
    }
}  
handleRowSelection(event)
{

  //inform Parent Contact Got selected 
  //send the data for backend process

    
    var selectedRows=event.detail.selectedRows;
    this.searchKey = selectedRows[0].LastName;
    this.dynamicIcon ='utility:close';
    //JS object have three attributes 
    const ContactSeletedDetail ={
          'id' :selectedRows[0].Id ,
          'LastName' :selectedRows[0].LastName,
          'Phone' : selectedRows[0].Phone

    };
    //fire the event and send the selected contact ID to the parent component 
    const contactSelectedfromDropDown =new CustomEvent('contactselected',{detail : ContactSeletedDetail } );
    this.dispatchEvent(contactSelectedfromDropDown);

    //as soon as contact selected Remove the drop down 
    this.noRecordFound ='';
    this.noRecordFoundMessage ='';


    //inform Parent that Contact Seleted Again end 


}
checkOnclick(event)
{
    //show all the List 
    //added as A Part of Modification 
      this.searchKey = event.target.value;
      const key= event.target.value.toLowerCase();
      this.dynamicIcon ='utility:close';
      //Perform searching in dataTable
      this.noRecordFound =true;
      const allCon = this.allContactList;
      const contcatListNew = allCon.filter(Contact => Contact.LastName.toLowerCase().includes(key));
      this.noRecordFound =true;
      this.recordsList=contcatListNew;
}
}