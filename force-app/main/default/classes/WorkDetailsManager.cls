public with sharing class WorkDetailsManager {
    @AuraEnabled(cacheable=true)
    public static List<SVMXC__Service_Order_Line__c> fetchWd(String WoId){
        return [select id,Name,
                 SVMXC__Actual_Quantity2__c,
                 SVMXC__Line_Type__c,
                 Check_Attachment__c
                 from 
                 SVMXC__Service_Order_Line__c where 
                 SVMXC__Service_Order__c =:WoId];
    }
}
