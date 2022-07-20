@isTest 
private class WorkDetailsManagerUT {

    static testMethod void catchWDClassMethod() {
        Id recordTypeId = Schema.SObjectType.SVMXC__Service_Order__c.getRecordTypeInfosByName().get('Support Case').getRecordTypeId();
        SVMXC__Service_Order__c wo =new SVMXC__Service_Order__c();
        wo.RecordTypeId = recordTypeId;
        insert wo;

        SVMXC__Service_Order_Line__c wd =new SVMXC__Service_Order_Line__c();
        wd.SVMXC__Line_Type__c ='Parts';
        wd.SVMXC__Service_Order__c =wo.id;
        insert wd;


        Account acc =new Account();
        acc.Name ='Gaurav Account ';
        insert acc;

        Contact con =new Contact();
        con.LastName ='Gaurav';
        con.AccountId =acc.id;
        insert con;


        test.startTest();
        WorkDetailsManager.fetchWd(wo.id);
        ContactManager.getContactAllList(con.id);
        test.stopTest();

    }
}
