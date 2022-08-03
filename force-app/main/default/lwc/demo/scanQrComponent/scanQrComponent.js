import { LightningElement } from 'lwc';

export default class ScanQrComponent extends LightningElement {
  
//Ip property getting from Barcode
SerialNumberScannerFromBarCode;

IpId;   

//Wo field Value holder Property
Status;
IpInstalledDate;
AccountId;




connectedCallback()
{
    this.title='QR code Scanner';
}


}