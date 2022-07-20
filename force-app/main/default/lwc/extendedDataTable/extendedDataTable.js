import LightningDatatable from 'lightning/datatable';
import DatatablePicklistTemplate from './extendedDataTableCustomTemplate.html';
import {
    loadStyle
} from 'lightning/platformResourceLoader';
import CustomDataTableResource from '@salesforce/resourceUrl/dataSty';

export default class ExtendedDataTable extends LightningDatatable {

    static customTypes = {
        picklist: {
            template: DatatablePicklistTemplate,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context'],
        },
       
    };

    constructor() {
        super();
        Promise.all([
            loadStyle(this, CustomDataTableResource),
        ]).then(() => {})
    }




}